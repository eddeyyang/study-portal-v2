#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
离线神经真人音合成器（云端会话可直接跑，不依赖 edge-tts 在线服务）
=================================================================

用途
----
为 apps/ 下带朗读的软件批量预合成神经真人音 MP3。命名规则与网页里的
`audioHash()` 完全一致：对 (lang+"|"+text) 的 UTF-8 字节做 FNV-1a，输出 8 位
十六进制，存到 apps/audio/<软件名>/<hash>.mp3。和 data/*.json 一样属于在
"生产层"生成、随仓库发布的静态资源——页面仍是零依赖纯静态。

为什么有这个脚本
----------------
爸爸电脑上的 gen_audio_manifest.py 用 edge-tts（微软在线神经音，音色
zh-CN-XiaoxiaoNeural）。但 Claude Code 云端会话的网络策略会封掉 edge-tts 的
WebSocket 端点（403）和 HuggingFace（403），在线合成跑不通。本脚本改用
**离线**神经 TTS（sherpa-onnx + MeloTTS 中文模型，模型从 GitHub Releases 拉取，
不走被封的源），因此在云端也能把音频合成出来。

音色说明（重要）
----------------
本脚本用的是离线 MeloTTS 女声，和 edge-tts 的小晓**不是同一把声音**（都自然，
但音色不同）。文件名只按内容哈希命名、与音色无关，所以：
  - 想统一成小晓：回爸爸电脑跑 edge-tts 版脚本，会按同名自动覆盖、无冲突。
  - 只是想云端补齐能用的真人音：用本脚本即可。

依赖（云端会话里一次性装好）
----------------------------
    pip install sherpa-onnx numpy
    apt-get install -y ffmpeg          # WAV->MP3 编码
模型会在首次运行时自动下载到 /tmp（约 160MB，来自 GitHub Releases）。

用法
----
    # 合成指定软件（一个或多个，传 apps/audio/ 下的子目录名）
    python3 tools/gen_audio_offline.py eddey_chinese_dictation eddey_chinese_review

    # 不传参数 = 扫描 apps/audio/ 下所有含 _manifest.json 的目录
    python3 tools/gen_audio_offline.py

每个软件目录需有 _manifest.json，格式：
    { "zhRate": "-10%", "enRate": "-10%",
      "items": [ {"lang":"zh","text":"裁缝"}, {"lang":"en","text":"Hello"} ] }
已存在的 MP3 自动跳过；zhRate/enRate 控制语速（-10% 即放慢 10%，适合默写）。

拼音朗读项的特殊处理
--------------------
默写软件的"🔤读拼音"按钮会朗读拼音串（如 "cái féng"）。直接合成罗马拼音会被
读成字母乱码，所以本脚本会从对应的 apps/<软件名>.html 里解析 [词,拼音] 配对，
把拼音项**替换成对应汉字词的发音**再合成。无 HTML 或无配对时原样合成。
"""
import os, re, sys, json, wave, subprocess, urllib.request, tarfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_ROOT = os.path.join(REPO, "apps", "audio")
MODEL_DIR = "/tmp/vits-melo-tts-zh_en"
MODEL_URL = ("https://github.com/k2-fsa/sherpa-onnx/releases/download/"
             "tts-models/vits-melo-tts-zh_en.tar.bz2")


def fnv(s: str) -> str:
    """与网页 audioHash() 一致：对 UTF-8 字节做 FNV-1a，输出 8 位十六进制。"""
    x = 0x811c9dc5
    for b in s.encode("utf-8"):
        x ^= b
        x = (x * 0x01000193) & 0xFFFFFFFF
    return "%08x" % x


def has_cjk(s: str) -> bool:
    return bool(re.search(r"[一-鿿]", s))


def ensure_model():
    """模型不在就从 GitHub Releases 下载并解压到 /tmp。"""
    if os.path.exists(os.path.join(MODEL_DIR, "model.onnx")):
        return
    print("首次运行，下载离线中文神经模型（约 160MB，来自 GitHub）...")
    tar = "/tmp/vits-melo-tts-zh_en.tar.bz2"
    urllib.request.urlretrieve(MODEL_URL, tar)
    with tarfile.open(tar, "r:bz2") as t:
        t.extractall("/tmp")
    print("模型就绪。")


def build_pinyin_map(app_name: str) -> dict:
    """从 apps/<app_name>.html 解析 [词,拼音] 配对，返回 {拼音: 词}。"""
    html_path = os.path.join(REPO, "apps", app_name + ".html")
    if not os.path.exists(html_path):
        return {}
    html = open(html_path, encoding="utf-8").read()
    py2word = {}
    for word, py in re.findall(r'\["([^"]+)","([^"]+)"\]', html):
        if py and not has_cjk(py):  # py 是罗马拼音才算
            py2word.setdefault(py, word)
    return py2word


def rate2speed(rate) -> float:
    """edge-tts 风格的 "-10%" -> sherpa speed 0.90（<1 更慢）。"""
    try:
        return 1.0 + float(str(rate).replace("%", "")) / 100.0
    except Exception:
        return 1.0


def main(argv):
    import numpy as np
    import sherpa_onnx

    ensure_model()
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=f"{MODEL_DIR}/model.onnx",
                lexicon=f"{MODEL_DIR}/lexicon.txt",
                tokens=f"{MODEL_DIR}/tokens.txt",
                dict_dir=f"{MODEL_DIR}/dict"),
            num_threads=4, provider="cpu"),
        rule_fsts=f"{MODEL_DIR}/date.fst,{MODEL_DIR}/number.fst,{MODEL_DIR}/phone.fst",
        max_num_sentences=1))

    def synth(text, speed, outpath):
        a = tts.generate(text, sid=0, speed=speed)
        pcm = (np.clip(np.array(a.samples), -1, 1) * 32767).astype("<i2")
        wav = "/tmp/_gen_audio_tmp.wav"
        with wave.open(wav, "wb") as w:
            w.setnchannels(1); w.setsampwidth(2)
            w.setframerate(a.sample_rate); w.writeframes(pcm.tobytes())
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav,
                        "-codec:a", "libmp3lame", "-b:a", "64k", outpath], check=True)

    # 决定要处理哪些软件目录
    apps = argv or sorted(
        d for d in os.listdir(AUDIO_ROOT)
        if os.path.exists(os.path.join(AUDIO_ROOT, d, "_manifest.json")))

    grand_new = 0
    for app in apps:
        d = os.path.join(AUDIO_ROOT, app)
        mpath = os.path.join(d, "_manifest.json")
        if not os.path.exists(mpath):
            print(f"跳过 {app}：无 _manifest.json"); continue
        man = json.load(open(mpath, encoding="utf-8"))
        zh_speed = rate2speed(man.get("zhRate", "-10%"))
        en_speed = rate2speed(man.get("enRate", "0%"))
        py2word = build_pinyin_map(app)
        new = skip = 0
        for it in man["items"]:
            lang, text = it["lang"], it["text"]
            out = os.path.join(d, fnv(lang + "|" + text) + ".mp3")
            if os.path.exists(out):
                skip += 1; continue
            say = text
            if lang == "zh" and not has_cjk(text) and text in py2word:
                say = py2word[text]            # 拼音项 -> 读对应汉字词
            try:
                synth(say, zh_speed if lang == "zh" else en_speed, out)
                new += 1
                if new % 50 == 0:
                    print(f"  {app}: 已生成 {new} ...")
            except Exception as e:
                print(f"  失败 [{text}]: {repr(e)[:120]}")
        print(f"{app}: 新生成 {new}, 跳过已有 {skip}")
        grand_new += new
    print(f"完成，总新增 {grand_new} 个 MP3。记得 git add/commit/push。")


if __name__ == "__main__":
    main(sys.argv[1:])
