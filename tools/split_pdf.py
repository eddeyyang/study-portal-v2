#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把大 PDF（如整本书的扫描件）按体积拆成若干份，方便绕过聊天附件 30MB 上限分批上传。

用法（爸爸电脑，需先装一次依赖：pip install pypdf）：

    python tools/split_pdf.py 整本书.pdf                 # 默认每份 ≤25MB
    python tools/split_pdf.py 整本书.pdf --max-mb 20     # 自定义每份上限
    python tools/split_pdf.py 整本书.pdf --pages 40      # 或固定每份 40 页

输出到源文件同目录：整本书_part01.pdf、整本书_part02.pdf ……
每份都会实际校验体积，超限自动再对半拆，保证张张能传。
"""

import argparse
import io
import sys
from pathlib import Path

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    sys.exit("缺少依赖：请先运行  pip install pypdf")


def write_range(reader, start, end):
    """把 [start, end) 页写成 PDF 字节，返回 bytes。"""
    writer = PdfWriter()
    for i in range(start, end):
        writer.add_page(reader.pages[i])
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def split_range(reader, start, end, max_bytes):
    """返回若干 (start, end, data)，每段实际体积 ≤ max_bytes；超限对半递归。"""
    data = write_range(reader, start, end)
    if len(data) <= max_bytes or end - start <= 1:
        if len(data) > max_bytes:
            print(f"  ⚠️ 第 {start + 1} 页单页就超过上限（{len(data) / 1e6:.1f}MB），单独成一份，请自行再压缩这一页")
        return [(start, end, data)]
    mid = (start + end) // 2
    return split_range(reader, start, mid, max_bytes) + split_range(reader, mid, end, max_bytes)


def ask_path():
    """双击运行（无参数）时，交互式询问文件路径，支持把文件拖进窗口。"""
    print("=" * 46)
    print(" PDF 拆分小工具：把大 PDF 切成 ≤18MB 的小份")
    print(" 用法：把要拆的 PDF 文件【拖进这个窗口】，按回车")
    print("=" * 46)
    p = input("请拖入 PDF 文件后按回车：").strip().strip('"').strip("'")
    return p


def main():
    ap = argparse.ArgumentParser(description="按体积拆分大 PDF")
    ap.add_argument("pdf", nargs="?", default="", help="要拆分的 PDF 路径（不填则交互式询问，支持双击运行）")
    ap.add_argument("--max-mb", type=float, default=18, help="每份体积上限 MB（默认 18，稳过 30MB 限制）")
    ap.add_argument("--pages", type=int, default=0, help="改为固定每份页数（设了就不按体积估算首切）")
    args = ap.parse_args()

    pdf = args.pdf or ask_path()
    src = Path(pdf)
    if not src.is_file():
        sys.exit(f"找不到文件：{src}")

    max_bytes = int(args.max_mb * 1024 * 1024)
    reader = PdfReader(str(src))
    total_pages = len(reader.pages)
    total_bytes = src.stat().st_size
    print(f"源文件：{src.name}  共 {total_pages} 页，{total_bytes / 1e6:.1f}MB")

    # 先按平均每页体积粗切（留 15% 余量），再逐份实测、超限对半拆
    if args.pages > 0:
        step = args.pages
    else:
        avg = max(total_bytes / total_pages, 1)
        step = max(int(max_bytes / avg * 0.85), 1)

    parts = []
    for start in range(0, total_pages, step):
        parts += split_range(reader, start, min(start + step, total_pages), max_bytes)

    width = max(2, len(str(len(parts))))
    for n, (start, end, data) in enumerate(parts, 1):
        out = src.with_name(f"{src.stem}_part{n:0{width}d}.pdf")
        out.write_bytes(data)
        print(f"  ✅ {out.name}  第 {start + 1}–{end} 页  {len(data) / 1e6:.1f}MB")

    print(f"完成：共 {len(parts)} 份。按顺序分批上传即可（一条消息传一个文件）。")


if __name__ == "__main__":
    try:
        main()
    except SystemExit as e:
        if str(e):
            print(e)
    except Exception as e:
        print(f"出错了：{e}")
    # 双击运行时窗口不自动关闭，方便看结果
    try:
        input("\n按回车键关闭窗口…")
    except EOFError:
        pass
