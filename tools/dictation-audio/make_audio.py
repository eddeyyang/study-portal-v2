#!/usr/bin/env python3
"""给听写词库逐条生成朗读音频（v2 听写台用）。

用法：python3 -I tools/dictation-audio/make_audio.py [--only-missing]

读取 data/midterm-dictation-20261024.json，每个词条生成一个 MP3，
存到 apps/audio/v2-dictation/<hash>.mp3，hash = FNV-1a(UTF-8 of "lang|text")，
与仓库其它页面的 audioHash 约定一致。生成后写 _manifest.json（文本→文件、时长、声线）。

声线（微软神经网络语音，经 edge-tts 取得）：
  中文 zh-CN-XiaoxiaoNeural，英文 en-US-AriaNeural。
只做“生成 + 文件有效 + 时长在合理区间”三项机器检查，不等于已经人耳试听。
"""
import asyncio, json, os, re, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data" / "midterm-dictation-20261024.json"
OUT = ROOT / "apps" / "audio" / "v2-dictation"
VOICES = {"zh": "zh-CN-XiaoxiaoNeural", "en": "en-US-AriaNeural"}
RATE = {"zh": "-12%", "en": "-10%"}
PROXY = os.environ.get("HTTPS_PROXY", "")


def fnv(s: str) -> str:
    x = 0x811c9dc5
    for b in s.encode("utf-8"):
        x ^= b
        x = (x * 0x01000193) & 0xffffffff
    return f"{x:08x}"


def speak_text(text: str, lang: str) -> str:
    """送去朗读的文字：中文读两遍（中间短停），英文读两遍。"""
    t = text.strip()
    if lang == "zh":
        t = re.sub(r"[（(][^）)]*[）)]", "", t).strip() or t
        return f"{t}。 {t}。"
    t = t.replace("…", "")
    t = re.sub(r"\s+", " ", t).strip()
    return f"{t}. {t}."


async def gen(sem, item, lang, dest):
    import edge_tts
    async with sem:
        for attempt in range(3):
            try:
                tts = edge_tts.Communicate(speak_text(item["text"], lang), VOICES[lang], rate=RATE[lang], proxy=PROXY or None)
                await tts.save(str(dest))
                if dest.stat().st_size > 1500:
                    return True
            except Exception as e:  # 网络短暂故障，最多重试三次
                await asyncio.sleep(2 + attempt * 2)
        return False


def duration(p: Path) -> float:
    try:
        out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                             capture_output=True, text=True, timeout=20).stdout.strip()
        return round(float(out), 3)
    except Exception:
        return 0.0


async def main():
    only_missing = "--only-missing" in sys.argv
    data = json.loads(DATA.read_text("utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = {}
    for child, cv in data["children"].items():
        for subj, sv in cv["subjects"].items():
            lang = "en" if subj == "english" else "zh"
            for it in sv["items"]:
                key = f"{lang}|{it['text']}"
                jobs.setdefault(key, {"text": it["text"], "lang": lang, "ids": []})["ids"].append(it["id"])
    sem = asyncio.Semaphore(4)
    tasks = []
    for key, j in jobs.items():
        h = fnv(key)
        dest = OUT / f"{h}.mp3"
        j["file"] = f"{h}.mp3"
        if only_missing and dest.exists() and dest.stat().st_size > 1500:
            continue
        tasks.append(gen(sem, j, j["lang"], dest))
    t0 = time.time()
    results = await asyncio.gather(*tasks)
    manifest = {"generated": time.strftime("%Y-%m-%d"), "voices": VOICES, "rate": RATE,
                "note": "机器检查：文件有效、时长在区间内。未经人耳逐条试听。", "items": {}}
    bad = []
    for key, j in jobs.items():
        p = OUT / j["file"]
        d = duration(p) if p.exists() else 0.0
        ok = 0.8 <= d <= 12.0
        manifest["items"][key] = {"file": j["file"], "text": j["text"], "lang": j["lang"], "seconds": d, "ok": ok}
        if not ok:
            bad.append((key, d))
    (OUT / "_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), "utf-8")
    print(f"items={len(jobs)} generated_now={sum(1 for r in results if r)} failed_now={sum(1 for r in results if not r)} bad={len(bad)} took={time.time()-t0:.0f}s")
    for b in bad[:30]:
        print("BAD", b)


if __name__ == "__main__":
    asyncio.run(main())
