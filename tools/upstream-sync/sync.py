#!/usr/bin/env python3
"""上游内容同步：公开正式站 study-portal-eta.vercel.app → study-portal-v2。

家长 2026-10-22 的要求：v2 的学习内容和更新要跟正式站保持同步，但 v2 保留 Claude 自己的设计；
设计上的改动只在家长单独交办时做。所以这个工具只搬内容，不碰设计：

  * v2 没改过的文件            → 直接换成上游新版本
  * v2 改过样式的文件（base/ 有旧上游版）→ 三方合并：保留 v2 的设计行，接收上游的内容改动
  * 合并冲突                    → v2 文件不动；把上游新版和旧版放进 conflicts/，交给人（或当班的 Claude）处理
  * 上游新增的文件              → 加进来（页面、数据、图片、音频清单，以及按哈希命名的朗读音频）
  * 上游删掉的文件              → 只报告，不删
  * v2 独有的文件（README、CLAUDE.md、主题样式表、archive/、tools/）→ 不同步

用法：
  python3 -I tools/upstream-sync/sync.py --init REV          # 一次性：以 git 的 REV 为“上游基线”
  python3 -I tools/upstream-sync/sync.py --dry-run           # 只看不改
  python3 -I tools/upstream-sync/sync.py                     # 同步，并在 log/ 留当天记录
  python3 -I tools/upstream-sync/sync.py --verify            # 检查 JSON 可解析、引用的本地文件存在
  python3 -I tools/upstream-sync/sync.py --check-site        # 核对 GitHub Pages 预览站已拿到最近一次同步的文件
  python3 -I tools/upstream-sync/sync.py --resolve PATH      # 手工合并完冲突后登记
  python3 -I tools/upstream-sync/sync.py --mark-custom PATH  # 在 v2 里改一个上游文件之前先登记基线（不登记也会自动从 git 历史找）
"""
import argparse, hashlib, html as htmllib, json, re, struct, subprocess, sys, tempfile, time
import urllib.error, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

UPSTREAM = "https://study-portal-eta.vercel.app/"
SITE = "https://eddeyyang.github.io/study-portal-v2/"
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
STATE = HERE / "state.json"
BASE = HERE / "base"
CONFLICTS = HERE / "conflicts"
LOG = HERE / "log"
LAST = HERE / "last-report.json"

EXCLUDE_FILES = {"README.md", "MISSING.md", "CLAUDE.md", ".gitignore", ".nojekyll",
                 "assets/portal-theme.css", "assets/shell-theme.css"}
EXCLUDE_PREFIXES = ("archive/", "tools/", ".git/", ".github/", "local-data/", "api/")
TEXT_EXT = {".html", ".htm", ".js", ".mjs", ".css", ".json", ".txt", ".svg", ".webmanifest", ".xml", ".md"}
ASSET_EXT = r"(?:html?|m?js|css|json|mp3|wav|m4a|ogg|png|jpe?g|gif|svg|webp|pdf|woff2?|ttf|webmanifest|txt|md)"
REF_RE = re.compile(r"""["'(`]((?:\.\./|\./)?[A-Za-z0-9_\-./%一-鿿·（）()]+?\.""" + ASSET_EXT +
                    r""")(?:[?#][^"'`)\s]*)?["')`]""")
TPL_RE = re.compile(r"""`((?:\.\./|\./)?[A-Za-z0-9_\-./${}.]+?\.""" + ASSET_EXT + r""")(?:[?#][^`]*)?`""")
TPL_CHILD = re.compile(r"\$\{[^}]*(?:kid|child|who)[^}]*\}", re.I)
AUDIO_DIR_RE = re.compile(r"""audio/([A-Za-z0-9_\-.]+)(?=/|["'`])""")
STR_RE = re.compile(r"""(["'`])((?:\\.|(?!\1)[^\\\n])*)\1""")
CHILDREN = ("kenton", "eddey")
MAX_DISCOVER = 4000
MAX_AUDIO_PROBES = 8000          # 每天：新增/变化页面的哈希音频探测上限
MAX_AUDIO_PROBES_WEEKLY = 15000  # 每 30 天一轮：加上线上原本缺音频的页面（到上限只提示，不算错误）
UA = "study-portal-v2-sync/2 (+https://github.com/eddeyyang/study-portal-v2)"


# ---------- 小工具 ----------
def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def fnv_utf8(s: str) -> str:            # 页面里 audioHash(s)：对 UTF-8 字节做 FNV-1a
    x = 0x811c9dc5
    for b in s.encode("utf-8"):
        x ^= b; x = (x * 0x01000193) & 0xffffffff
    return f"{x:08x}"


def fnv_utf16(s: str) -> str:           # 另一种写法 audioHash(lang,text)：对 charCodeAt 做 FNV-1a
    x = 0x811c9dc5
    raw = s.encode("utf-16-le")
    for cu in struct.unpack("<%dH" % (len(raw) // 2), raw):
        x ^= cu; x = (x * 0x01000193) & 0xffffffff
    return f"{x:08x}"


def is_excluded(p: str) -> bool:
    return p in EXCLUDE_FILES or p.startswith(EXCLUDE_PREFIXES)


def is_text(p: str) -> bool:
    return PurePosixPath(p).suffix.lower() in TEXT_EXT


def git(*args, check=True):
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, check=check).stdout.decode("utf-8", "replace")


def git_show(rev: str, path: str):
    r = subprocess.run(["git", "-C", str(ROOT), "show", f"{rev}:{path}"], capture_output=True)
    return r.stdout if r.returncode == 0 else None


def tracked_files():
    return [p for p in git("ls-files", "-z").split("\0") if p and not is_excluded(p)]


def load_state():
    if not STATE.exists():
        sys.exit("还没有 state.json：先运行 --init REV 建立基线。")
    return json.loads(STATE.read_text("utf-8"))


def save_state(st):
    st["files"] = dict(sorted(st["files"].items()))
    STATE.write_text(json.dumps(st, ensure_ascii=False, indent=0) + "\n", "utf-8")


def fetch(path, etag=None, method="GET", base=UPSTREAM):
    url = base + urllib.parse.quote(path, safe="/._-~")
    hdrs = {"User-Agent": UA}
    if etag:
        hdrs["If-None-Match"] = etag
    for attempt in range(3):                      # 只对短暂故障重试，最多三次
        try:
            req = urllib.request.Request(url, headers=hdrs, method=method)
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.status, (b"" if method == "HEAD" else r.read()), r.headers.get("ETag")
        except urllib.error.HTTPError as e:
            if e.code == 304:
                return 304, None, etag
            if e.code in (404, 410, 403, 405):
                return e.code, None, None
            if e.code >= 500 and attempt < 2:
                time.sleep(3 * (attempt + 1)); continue
            return e.code, None, None
        except Exception as e:
            if attempt < 2:
                time.sleep(3 * (attempt + 1)); continue
            return -1, str(e).encode(), None


def norm_path(src_path, ref):
    """把页面里的相对引用变成仓库内路径；越出仓库或指向接口的丢掉。"""
    ref = urllib.parse.unquote(ref.split("?")[0].split("#")[0])
    if ref.startswith(("http:", "https:", "//", "data:", "mailto:", "javascript:")):
        return []
    out = []
    for b in (PurePosixPath(src_path).parent, PurePosixPath(".")):
        p = PurePosixPath(ref.lstrip("/")) if ref.startswith("/") else b / ref
        parts = []
        for seg in p.parts:
            if seg == "..":
                if parts: parts.pop()
            elif seg not in (".", ""):
                parts.append(seg)
        if parts and not any(ch in "".join(parts) for ch in "\\\0"):
            out.append("/".join(parts))
    return [x for x in dict.fromkeys(out) if not is_excluded(x)]


def refs_in(path, body):
    """返回 (引用到的仓库文件, 引用到的音频目录)。"""
    if not is_text(path):
        return set(), set()
    text = body.decode("utf-8", "replace")
    files = set()
    for m in REF_RE.finditer(text):
        files.update(norm_path(path, m.group(1)))
    for m in TPL_RE.finditer(text):                # `../data/x/${child}.json` 这种按孩子拼出来的路径
        tpl = m.group(1)
        if TPL_CHILD.search(tpl):
            for kid in CHILDREN:
                cand = TPL_CHILD.sub(kid, tpl)
                if "${" not in cand:
                    files.update(norm_path(path, cand))
    dirs = {d for d in AUDIO_DIR_RE.findall(text) if "YYYY" not in d and "${" not in d}
    return files, dirs


def manifest_files(doc):
    """音频清单里列出的文件名。清单有两种格式：items 是记录列表，或 items 是按编号索引的字典（另带 files 列表）。"""
    names = []
    if not isinstance(doc, dict):
        return names
    items = doc.get("items")
    recs = items.values() if isinstance(items, dict) else (items if isinstance(items, list) else [])
    for it in recs:
        if isinstance(it, dict) and it.get("file"):
            names.append(it["file"])
    for f in doc.get("files") or []:
        if isinstance(f, str):
            names.append(f)
        elif isinstance(f, dict) and f.get("file"):
            names.append(f["file"])
    return list(dict.fromkeys(names))


def unescape_js(s):
    return re.sub(r"\\(.)", lambda m: {"n": "\n", "t": "\t"}.get(m.group(1), m.group(1)), s)


def spoken_candidates(text):
    """页面里所有可能被朗读的文字：字符串字面量、可见文本节点、data- 属性。"""
    out = set()
    for q, body in STR_RE.findall(text):
        if q == "`" and "${" in body:
            continue
        s = unescape_js(body)
        if 0 < len(s) <= 300 and "\n" not in s:
            out.update((s, s.strip(), htmllib.unescape(s), s.replace("’", "'")))
    for m in re.finditer(r">([^<>{}]{1,200})<", text):
        s = htmllib.unescape(m.group(1)).strip()
        if s:
            out.add(s)
    for m in re.finditer(r'data-[a-z-]+="([^"]{1,300})"', text):
        out.add(htmllib.unescape(m.group(1)))
    return {s for s in out if s and not looks_like_code(s)}


CODE_HINTS = ("{", "}", ";", "=", "<", ">", "://", "function", ".html", ".js", ".css", ".json", ".mp3",
              ".png", ".svg", ".webp", "--", "px", "rgba", "#", "\\", "||", "&&", "[", "]")


def looks_like_code(s: str) -> bool:
    """明显不是朗读文字的字符串：代码、选择器、路径、纯数字等。"""
    if any(h in s for h in CODE_HINTS):
        return True
    if re.fullmatch(r"[0-9a-fA-F.%:/_-]+", s):
        return True
    if "_" in s and " " not in s:
        return True
    return False


def audio_prefixes(text):
    """根据页面怎样调用 audioHash 判断前缀；拿不准就全试。"""
    pre = set()
    if re.search(r"""['"]en\|['"]""", text): pre.add("en|")
    if re.search(r"""['"]zh\|['"]""", text): pre.add("zh|")
    if re.search(r"""lang\s*\+\s*['"]\|['"]""", text) or "audioHash(lang," in text.replace(" ", ""):
        pre.update({"en|", "zh|"})
        if "en-US" in text: pre.add("en-US|")
        if "zh-CN" in text: pre.add("zh-CN|")
    if re.search(r"""audioHash\(\s*['"]en-US['"]\s*,""", text): pre.add("en-US|")
    if not pre:
        pre = {"en|", "zh|", "en-US|", "zh-CN|", ""}
    return pre


def merge3(cur: bytes, base: bytes, new: bytes):
    with tempfile.TemporaryDirectory() as td:
        a, o, b = (Path(td) / n for n in ("cur", "base", "new"))
        a.write_bytes(cur); o.write_bytes(base); b.write_bytes(new)
        r = subprocess.run(["git", "merge-file", "-p", "-L", "v2", "-L", "base", "-L", "upstream",
                            str(a), str(o), str(b)], capture_output=True)
        return r.returncode == 0, r.stdout


def history_base(path, want_sha):
    """在 git 历史里找回某个文件的旧上游版本（按 sha256 认）。"""
    if not want_sha:
        return None
    for rev in git("log", "--format=%H", "-n", "80", "--", path, check=False).split():
        b = git_show(rev, path)
        if b is not None and sha(b) == want_sha:
            return b
    return None


def write_log(rep):
    LOG.mkdir(exist_ok=True)
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    (LOG / f"{day}.json").write_text(json.dumps(rep, ensure_ascii=False, indent=1) + "\n", "utf-8")
    LAST.write_text(json.dumps(rep, ensure_ascii=False, indent=1) + "\n", "utf-8")


def summarize(rep):
    s = {k: (len(v) if isinstance(v, list) else v) for k, v in rep.items()}
    d = {k: v[:80] for k, v in rep.items() if isinstance(v, list) and v}
    print(json.dumps({"summary": s, "detail": d}, ensure_ascii=False, indent=1))


# ---------- 子命令 ----------
def cmd_init(rev):
    files, custom = {}, []
    for p in tracked_files():
        cur = (ROOT / p).read_bytes()
        base = git_show(rev, p)
        base = cur if base is None else base
        if base != cur:
            (BASE / p).parent.mkdir(parents=True, exist_ok=True)
            (BASE / p).write_bytes(base)
            custom.append(p)
        files[p] = {"sha": sha(base), "etag": None, "upstream": None}
    save_state({"upstream": UPSTREAM, "initialized_from": rev, "last_sync": None, "files": files})
    print(json.dumps({"tracked": len(files), "restyled_files_with_base": custom}, ensure_ascii=False, indent=1))


def cmd_sync(dry, force_backfill=False):
    st = load_state()
    F = st["files"]
    rep = {k: [] for k in ("updated", "merged", "added", "conflicts", "removed_upstream", "errors",
                           "new_root_pages", "audio_dirs_without_manifest", "audio_added",
                           "hash_apps_without_audio", "customized_without_base")}
    rep.update(unchanged=0, not_on_upstream=0, discovery_fetches=0, audio_probes=0)
    new_text = {}

    # 0. v2 改过但还没登记基线的文件：从 git 历史自动补上基线
    for p, e in F.items():
        loc = ROOT / p
        if loc.exists() and not (BASE / p).exists() and sha(loc.read_bytes()) != e["sha"]:
            b = history_base(p, e["sha"])
            if b is None:
                rep["customized_without_base"].append(p)
            elif not dry:
                (BASE / p).parent.mkdir(parents=True, exist_ok=True); (BASE / p).write_bytes(b)

    def apply(p, body, is_new):
        loc = ROOT / p
        if is_new and not loc.exists():
            if not dry:
                loc.parent.mkdir(parents=True, exist_ok=True); loc.write_bytes(body)
            rep["added"].append(p)
            if "/" not in p and p.endswith(".html"):
                rep["new_root_pages"].append(p)
            return True
        cur = loc.read_bytes() if loc.exists() else None
        old_sha = F.get(p, {}).get("sha")
        if cur is None or sha(cur) == old_sha:          # v2 没动过：直接换
            if not dry:
                loc.parent.mkdir(parents=True, exist_ok=True); loc.write_bytes(body)
            rep["updated"].append(p)
            return True
        basef = BASE / p
        base = basef.read_bytes() if basef.exists() else history_base(p, old_sha)
        if base is not None and is_text(p):             # v2 改过：三方合并
            ok, merged = merge3(cur, base, body)
            if ok:
                if not dry:
                    loc.write_bytes(merged)
                    basef.parent.mkdir(parents=True, exist_ok=True); basef.write_bytes(body)
                rep["merged"].append(p)
                return True
        if not dry:                                     # 合不上：留给人处理
            (CONFLICTS / p).parent.mkdir(parents=True, exist_ok=True)
            (CONFLICTS / p).write_bytes(body)
            if base is not None:
                (CONFLICTS / (p + ".base")).write_bytes(base)
        rep["conflicts"].append(p)
        return False

    # 节奏：页面、数据、清单每天核；音频文件（mp3，约 1900 个，几乎不变）每 7 天核一次；
    # 线上原本缺的哈希音频每 30 天探一次。--backfill-audio 则这次全做。
    today = datetime.now(timezone.utc)
    def days_since(key):
        v = st.get(key)
        return 10**6 if not v else (today - datetime.strptime(v, "%Y-%m-%d").replace(tzinfo=timezone.utc)).days
    audio_week = force_backfill or days_since("last_audio_check") >= 7
    weekly = force_backfill or days_since("last_audio_backfill") >= 30
    rep["audio_files_checked"] = audio_week
    rep["audio_backfill_round"] = weekly

    # 1. 已跟踪文件：条件请求，变了就取
    def is_audio_file(p):
        return p.startswith("apps/audio/") and p.endswith((".mp3", ".wav", ".m4a", ".ogg"))
    check = [p for p in F if audio_week or not is_audio_file(p)]
    rep["skipped_audio_files"] = len(F) - len(check)
    with ThreadPoolExecutor(12) as ex:
        results = list(ex.map(lambda p: (p, fetch(p, F[p].get("etag"))), check))
    if audio_week and not dry:
        st["last_audio_check"] = today.strftime("%Y-%m-%d")
    for p, (code, body, etag) in results:
        e = F[p]
        if code == 304:
            rep["unchanged"] += 1; e["upstream"] = True
        elif code == 200:
            e["etag"] = etag; e["upstream"] = True
            if sha(body) == e["sha"]:
                rep["unchanged"] += 1
            else:
                if apply(p, body, False):
                    e["sha"] = sha(body)
                new_text[p] = body
        elif code in (404, 410):
            (rep["removed_upstream"].append(p) if e.get("upstream") else None)
            if not e.get("upstream"):
                rep["not_on_upstream"] += 1
            e["upstream"] = False; e["etag"] = None
        else:
            rep["errors"].append(f"{p}: HTTP {code}")

    # 2. 顺着变化了的页面找新文件（页面、数据、图片、音频清单）
    queue, seen, dirs = [], set(F), set()
    for p, b in new_text.items():
        f, d = refs_in(p, b); queue += [x for x in f if x not in seen]; dirs |= d
    for d in sorted(dirs):
        mp = f"apps/audio/{d}/_manifest.json"
        if mp not in F and not (ROOT / mp).exists():
            queue.append(mp)
    while queue and rep["discovery_fetches"] < MAX_DISCOVER:
        batch = list(dict.fromkeys(x for x in queue if x not in seen))[:200]
        queue = [x for x in queue if x not in seen and x not in batch]
        if not batch:
            break
        seen.update(batch)
        with ThreadPoolExecutor(12) as ex:
            got = list(ex.map(lambda x: (x, fetch(x)), batch))
        rep["discovery_fetches"] += len(batch)
        for p, (code, body, etag) in got:
            if code != 200:
                if p.endswith("/_manifest.json"):
                    rep["audio_dirs_without_manifest"].append(p.split("/")[2])
                continue
            if apply(p, body, True):
                F[p] = {"sha": sha(body), "etag": etag, "upstream": True}
                new_text[p] = body
            f, d = refs_in(p, body)
            queue += [x for x in f if x not in seen]
            if p.endswith("/_manifest.json"):
                try:
                    adir = p.rsplit("/", 1)[0]
                    queue += [f"{adir}/{f}" for f in manifest_files(json.loads(body))]
                except Exception:
                    rep["errors"].append(f"{p}: 音频清单读不出文件列表")
            for dd in d:
                mp = f"apps/audio/{dd}/_manifest.json"
                if mp not in seen and mp not in F:
                    queue.append(mp)

    # 2b. 回填：清单里列出、本地却没有的音频（线上后来补录的），每次都查
    todo = []
    for mp in sorted(ROOT.glob("apps/audio/*/_manifest.json")):
        rel = mp.relative_to(ROOT).as_posix()
        try:
            names = manifest_files(json.loads(mp.read_text("utf-8")))
        except Exception:
            rep["errors"].append(f"{rel}: 音频清单读不出文件列表"); continue
        todo += [f"{rel.rsplit('/', 1)[0]}/{n}" for n in names if not (mp.parent / n).exists()]
    todo = list(dict.fromkeys(todo))[:1500]
    if todo:
        with ThreadPoolExecutor(12) as ex:
            got = list(ex.map(lambda x: (x, fetch(x)), todo))
        for ap, (code, body, etag) in got:
            if code == 200 and body and apply(ap, body, True):
                F[ap] = {"sha": sha(body), "etag": etag, "upstream": True}
                rep["audio_added"].append(ap)
        rep["manifest_backfill_checked"] = len(todo)

    # 3. 按哈希命名的朗读音频：对新增/变化的页面，把可能被朗读的文字逐条算哈希去探。
    #    线上本来就缺音频的页面（目录不存在或为空）每 7 天再探一次，看线上有没有补。
    probe_pages = dict(new_text)
    if weekly:
        for hp in sorted(ROOT.glob("apps/*.html")):
            b = hp.read_bytes()
            if b"audioHash" not in b:
                continue
            rel = hp.relative_to(ROOT).as_posix()
            for d in AUDIO_DIR_RE.findall(b.decode("utf-8", "replace")):
                ad = ROOT / "apps/audio" / d
                if "YYYY" in d or "${" in d:
                    continue
                if not ad.is_dir() or not any(x.suffix == ".mp3" for x in ad.iterdir()):
                    probe_pages.setdefault(rel, b); rep.setdefault("audio_backfill_pages", []).append(rel)
        if not dry:
            st["last_audio_backfill"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for p, b in list(probe_pages.items()):
        if not p.endswith((".html", ".js")) or b"audioHash" not in b:
            continue
        text = b.decode("utf-8", "replace")
        adirs = {d for d in AUDIO_DIR_RE.findall(text) if "YYYY" not in d and "${" not in d}
        if not adirs:
            continue
        cands = spoken_candidates(text)
        pre = audio_prefixes(text)
        found_for_page = 0
        for d in sorted(adirs):
            have = set()
            if (ROOT / "apps/audio" / d).is_dir():
                have = {x.name for x in (ROOT / "apps/audio" / d).iterdir()}
            names = set()
            for s in cands:
                for pf in pre:
                    names.add(fnv_utf8(pf + s) + ".mp3")
                    if any(ord(c) > 127 for c in s):
                        names.add(fnv_utf16(pf + s) + ".mp3")
            todo = sorted(n for n in names if n not in have and f"apps/audio/{d}/{n}" not in F)
            found_for_page += len(have)
            room = (MAX_AUDIO_PROBES_WEEKLY if weekly else MAX_AUDIO_PROBES) - rep["audio_probes"]
            if room <= 0:
                rep.setdefault("audio_probe_capped", []).append(f"{p} → {d}"); break
            todo = todo[:room]
            rep["audio_probes"] += len(todo)
            with ThreadPoolExecutor(12) as ex:
                heads = list(ex.map(lambda n: (n, fetch(f"apps/audio/{d}/{n}", method="HEAD")[0]), todo))
            hits = [n for n, code in heads if code == 200]
            with ThreadPoolExecutor(12) as ex:
                got = list(ex.map(lambda n: (n, fetch(f"apps/audio/{d}/{n}")), hits))
            for n, (code, body, etag) in got:
                if code == 200 and body:
                    ap = f"apps/audio/{d}/{n}"
                    if apply(ap, body, True):
                        F[ap] = {"sha": sha(body), "etag": etag, "upstream": True}
                        rep["audio_added"].append(ap)
                        found_for_page += 1
        if found_for_page == 0:
            rep["hash_apps_without_audio"].append(p)

    rep["content_changed"] = bool(rep["updated"] or rep["merged"] or rep["added"])
    rep["checked_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    rep["dry_run"] = dry
    if not dry:
        st["last_sync"] = rep["checked_at"]
        save_state(st)
        write_log(rep)
    summarize(rep)


def cmd_verify():
    rep = {"json_errors": [], "missing_refs": [], "manifest_missing_files": [], "checked_files": 0}
    last = json.loads(LAST.read_text("utf-8")) if LAST.exists() else {}
    changed = set(last.get("updated", []) + last.get("merged", []) + last.get("added", []))
    for p in sorted(ROOT.glob("data/**/*.json")) + sorted(ROOT.glob("apps/audio/*/_manifest.json")):
        rel = p.relative_to(ROOT).as_posix()
        try:
            doc = json.loads(p.read_text("utf-8"))
        except Exception as e:
            rep["json_errors"].append(f"{rel}: {e}"); continue
        if rel.endswith("_manifest.json"):
            for f in manifest_files(doc):
                if not (p.parent / f).exists():
                    rep["manifest_missing_files"].append(f"{rel} → {f}")
    delisted = set()                                    # 正式站主动下架的页面，不算缺
    try:
        nav = json.loads((ROOT / "data/portal-navigation.json").read_text("utf-8"))
        delisted = {str(x).lstrip("./") for x in nav.get("unavailableFiles", [])}
    except Exception:
        pass
    for p in sorted(changed):
        loc = ROOT / p
        if not loc.exists() or not is_text(p):
            continue
        rep["checked_files"] += 1
        text = loc.read_text("utf-8", "replace")
        seen = set()
        for m in REF_RE.finditer(text):
            ref = m.group(1)
            cands = norm_path(p, ref)
            if not cands or ref in seen or any(c in delisted for c in cands):
                continue
            seen.add(ref)
            if not any((ROOT / c).exists() for c in cands):
                rep["missing_refs"].append(f"{p} → {ref}")
    rep["delisted_upstream"] = len(delisted)
    # 清单里有、本地没有的音频：上游也没有的是线上本来的缺口（见 MISSING.md），上游有的才是同步漏了
    rep["manifest_missing_on_upstream_too"], fetchable = [], []
    def probe(entry):
        rel, f = entry.split(" → ")
        return entry, fetch(f"{rel.rsplit('/', 1)[0]}/{f}", method="HEAD")[0]
    with ThreadPoolExecutor(8) as ex:
        for entry, code in ex.map(probe, rep["manifest_missing_files"]):
            (fetchable if code == 200 else rep["manifest_missing_on_upstream_too"]).append(entry)
    rep["manifest_missing_files"] = fetchable
    rep["ok"] = not (rep["json_errors"] or rep["manifest_missing_files"])
    print(json.dumps(rep, ensure_ascii=False, indent=1))


def cmd_check_site():
    last = json.loads(LAST.read_text("utf-8")) if LAST.exists() else {}
    paths = sorted(set(last.get("updated", []) + last.get("merged", []) + last.get("added", [])))[:300]
    paths = ["index.html", "today.html", "data/apps.json"] + [p for p in paths if p not in ("index.html",)]
    rep = {"ok": [], "mismatch": [], "missing": [], "error": []}

    def one(p):
        code, body, _ = fetch(p, base=SITE)
        if code != 200:
            return "missing" if code in (404, 410) else "error", f"{p}: HTTP {code}"
        loc = ROOT / p
        if loc.exists() and sha(loc.read_bytes()) != sha(body):
            return "mismatch", p
        return "ok", p

    with ThreadPoolExecutor(8) as ex:
        for k, v in ex.map(one, paths):
            rep[k].append(v)
    rep["site"] = SITE
    rep["all_ok"] = not (rep["mismatch"] or rep["missing"] or rep["error"])
    print(json.dumps({k: (v if isinstance(v, list) and len(v) <= 40 else (len(v) if isinstance(v, list) else v))
                      for k, v in rep.items()}, ensure_ascii=False, indent=1))


def cmd_resolve(p):
    st = load_state()
    up = CONFLICTS / p
    if not up.exists():
        sys.exit(f"没有 {p} 的冲突副本")
    body = up.read_bytes()
    (BASE / p).parent.mkdir(parents=True, exist_ok=True); (BASE / p).write_bytes(body)
    st["files"].setdefault(p, {"etag": None, "upstream": True})["sha"] = sha(body)
    up.unlink()
    (CONFLICTS / (p + ".base")).unlink(missing_ok=True)
    save_state(st)
    print(f"已登记：{p} 的基线更新为上游当前版本")


def cmd_mark_custom(p):
    st = load_state()
    e = st["files"].get(p)
    if not e:
        sys.exit(f"{p} 不是从上游同步的文件")
    cur = (ROOT / p).read_bytes()
    base = cur if sha(cur) == e["sha"] else history_base(p, e["sha"])
    if base is None:
        sys.exit(f"找不到 {p} 的上游基线")
    (BASE / p).parent.mkdir(parents=True, exist_ok=True); (BASE / p).write_bytes(base)
    print(f"已登记 {p} 的基线；之后上游的改动会合并进来，不会覆盖 v2 的改动")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--init", metavar="REV")
    g.add_argument("--resolve", metavar="PATH")
    g.add_argument("--mark-custom", metavar="PATH")
    g.add_argument("--verify", action="store_true")
    g.add_argument("--check-site", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--backfill-audio", action="store_true", help="不等 7 天，这次就探线上原本缺的哈希音频")
    a = ap.parse_args()
    if a.init: cmd_init(a.init)
    elif a.resolve: cmd_resolve(a.resolve)
    elif a.mark_custom: cmd_mark_custom(a.mark_custom)
    elif a.verify: cmd_verify()
    elif a.check_site: cmd_check_site()
    else: cmd_sync(a.dry_run, a.backfill_audio)
