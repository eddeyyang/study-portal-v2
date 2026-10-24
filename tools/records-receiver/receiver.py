#!/usr/bin/env python3
"""v2 学习记录接收站（放在家长自己的服务器上；2026-10-24）

只做三件事：
  POST /record        收一条记录（JSON），按编号去重，追加写到 data/<formal|test>/<日期>.jsonl
  GET  /records?since=2026-10-24&token=…   给 Claude 读：返回某天起的正式记录（需要读取口令）
  GET  /health        活着就返回 ok

没有数据库，没有依赖，只用 Python 3 标准库。文件按天一个，直接可看、可备份。
环境变量：
  RECORDS_DIR     存放目录（默认 ./data）
  READ_TOKEN      读取口令（必填；只用于 GET /records，页面上报不需要口令）
  PORT            监听端口（默认 8788，只监听本机，由外层 HTTPS 反代转进来）
"""
import json, os, re, sys, time, threading
from datetime import datetime, timezone, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.abspath(os.environ.get("RECORDS_DIR", os.path.join(os.path.dirname(__file__), "data")))
TOKEN = os.environ.get("READ_TOKEN", "")
PORT = int(os.environ.get("PORT", "8788"))
MAX_BODY = 64 * 1024
TZ = timezone(timedelta(hours=8))
ALLOWED_ORIGINS = ("https://eddeyyang.github.io", "http://localhost:8000", "http://127.0.0.1:8000")
lock = threading.Lock()
seen = set()


def day_of(rec):
    try:
        return datetime.fromisoformat(rec["at"].replace("Z", "+00:00")).astimezone(TZ).strftime("%Y-%m-%d")
    except Exception:
        return datetime.now(TZ).strftime("%Y-%m-%d")


def load_seen():
    for mode in ("formal", "test"):
        d = os.path.join(ROOT, mode)
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d))[-60:]:
            try:
                with open(os.path.join(d, name), encoding="utf-8") as f:
                    for line in f:
                        try:
                            seen.add(json.loads(line)["id"])
                        except Exception:
                            pass
            except Exception:
                pass


def valid(rec):
    return (isinstance(rec, dict) and isinstance(rec.get("id"), str) and 8 <= len(rec["id"]) <= 64
            and rec.get("app") in ("dictation", "math-mistakes", "drone")
            and rec.get("who") in ("kenton", "eddey") and rec.get("mode") in ("formal", "test"))


class H(BaseHTTPRequestHandler):
    server_version = "v2-records/1"

    def cors(self):
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")

    def reply(self, code, body=b"ok", ctype="text/plain; charset=utf-8"):
        self.send_response(code)
        self.cors()
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204); self.cors(); self.end_headers()

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/health":
            return self.reply(200, b"ok")
        if u.path == "/records":
            q = parse_qs(u.query)
            if not TOKEN or q.get("token", [""])[0] != TOKEN:
                return self.reply(403, b"forbidden")
            since = q.get("since", ["1970-01-01"])[0]
            mode = q.get("mode", ["formal"])[0]
            if mode not in ("formal", "test") or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", since):
                return self.reply(400, b"bad request")
            out = []
            d = os.path.join(ROOT, mode)
            if os.path.isdir(d):
                for name in sorted(os.listdir(d)):
                    if name.endswith(".jsonl") and name[:-6] >= since:
                        with open(os.path.join(d, name), encoding="utf-8") as f:
                            out.extend(line.rstrip("\n") for line in f if line.strip())
            body = ("[" + ",".join(out) + "]").encode("utf-8")
            return self.reply(200, body, "application/json; charset=utf-8")
        return self.reply(404, b"not found")

    def do_POST(self):
        if urlparse(self.path).path != "/record":
            return self.reply(404, b"not found")
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0 or n > MAX_BODY:
            return self.reply(413, b"too large")
        try:
            rec = json.loads(self.rfile.read(n).decode("utf-8"))
        except Exception:
            return self.reply(400, b"bad json")
        if not valid(rec):
            return self.reply(400, b"bad record")
        rec["received_at"] = datetime.now(timezone.utc).isoformat()
        with lock:
            if rec["id"] in seen:
                return self.reply(200, b"dup")
            d = os.path.join(ROOT, rec["mode"]); os.makedirs(d, exist_ok=True)
            with open(os.path.join(d, day_of(rec) + ".jsonl"), "a", encoding="utf-8") as f:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            seen.add(rec["id"])
        return self.reply(200, b"ok")

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (datetime.now(TZ).strftime("%m-%d %H:%M:%S"), fmt % args))


if __name__ == "__main__":
    if not TOKEN:
        print("READ_TOKEN 未设置：GET /records 将一律拒绝。", file=sys.stderr)
    os.makedirs(ROOT, exist_ok=True)
    load_seen()
    print(f"v2 records receiver on 127.0.0.1:{PORT}, data in {ROOT}, {len(seen)} ids loaded", file=sys.stderr)
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
