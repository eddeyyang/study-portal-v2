# -*- coding: utf-8 -*-
"""
生成「英语单词默写」软件——兄弟各一份，整合两人之前所有英语默写软件/记录里的单词与句子。
基于已跑通的默写引擎（apps/kenton_dictation.html，自动报默3遍+大倒计时+答案对照点红+错词本+档案导出+互译小测，
audio-first 神经真人音、缺失自动回退浏览器TTS）。本脚本只换数据/主题/音频目录，不动引擎逻辑。

输出：
  apps/kenton_english_dictation.html   + audio/kenton_english_dictation/_manifest.json
  apps/eddey_english_dictation.html    + audio/eddey_english_dictation/_manifest.json
数据来源（仓库内已记录在册）：
  哥哥：kenton_english_textbook.html / kenton_dictation.html(牛津四下 M1-M4) + english_m3m4_kenton.json(复习卷M3/M4)
        + 错题/薄弱词(english_errors_kenton, profile_kenton)
  弟弟：eddey_english.html(牛津三下 M1-M4) + dictation_eddey.json/english_eddey.json 真实错词 + english_errors_eddey
音频：本机用 edge-tts 跑 gen_audio_manifest.py 读各自 _manifest.json 批量合成即可；未合成前页面自动用浏览器TTS。
"""
import json, re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, "apps", "kenton_dictation.html")

# ============ 哥哥 数据（牛津四下 M1-M4 + 复习卷M3/M4 + ★易错词/句） ============
KEN_VOCAB = {
 "★ 易错词(重点·先练这个)": [["knife","小刀"],["Friday","星期五"],["Wednesday","星期三"],["Thursday","星期四"],["bedroom","卧室"],["sound","声音"],["nest","鸟巢"],["swan","天鹅"],["drum","鼓"],["triangle","三角铁/三角形"],["rectangle","长方形"],["shoulder","肩膀"],["knee","膝盖"],["foot","脚"]],
 "M1U1 闻与尝": [["a glass of","一杯"],["cherry","樱桃"],["grape","葡萄"],["juice","果汁"],["watermelon","西瓜"],["strawberry","草莓"],["plum","李子"]],
 "M1U2 感觉如何": [["hard","硬的"],["soft","软的"],["rough","粗糙的"],["smooth","光滑的"],["sharp","锋利的"],["blunt","钝的"],["thick","厚的"],["thin","薄的"],["knife","小刀"],["pencil","铅笔"],["pencil case","铅笔盒"]],
 "M1U3 看影子": [["sun","太阳"],["rise","升起"],["go down","落下"],["high","高的"],["at noon","在中午"],["hill","小山"],["lawn","草坪"],["path","小路"],["bench","长椅"],["shadow","影子"]],
 "M2U1 运动": [["sport","运动"],["club","俱乐部"],["join","加入"],["poster","海报"],["play football","踢足球"],["play basketball","打篮球"],["play table tennis","打乒乓球"],["play volleyball","打排球"],["play badminton","打羽毛球"]],
 "M2U2 可爱动物": [["cute","可爱的"],["fish","鱼"],["bone","骨头"],["cat food","猫粮"],["dog food","狗粮"],["parrot","鹦鹉"],["tortoise","乌龟"]],
 "M2U3 家庭生活": [["bedroom","卧室"],["bathroom","浴室"],["kitchen","厨房"],["living room","客厅"],["dinner","晚餐"],["homework","家庭作业"],["model plane","飞机模型"],["wash","洗"],["watch TV","看电视"]],
 "M3U1 声音": [["sound","声音"],["noisy","吵闹的"],["quiet","安静的"],["loud","响亮的"],["bell","铃"],["television","电视"]],
 "M3U2 时间": [["seven o'clock","七点钟"],["half past seven","七点半"],["a quarter past seven","七点一刻"],["a quarter to eight","差一刻八点"],["get up","起床"],["brush my teeth","刷牙"],["wash my face","洗脸"],["have breakfast","吃早餐"]],
 "M3U3 星期": [["Monday","星期一"],["Tuesday","星期二"],["Wednesday","星期三"],["Thursday","星期四"],["Friday","星期五"],["Saturday","星期六"],["Sunday","星期日"],["always","总是"],["usually","通常"],["often","经常"],["sometimes","有时"],["never","从不"],["at weekends","在周末"],["Chinese chess","中国象棋"]],
 "M4U1 音乐课": [["music","音乐"],["piano","钢琴"],["violin","小提琴"],["drum","鼓"],["triangle","三角铁"]],
 "M4U2 中国节日": [["festival","节日"],["the Spring Festival","春节"],["the Dragon Boat Festival","端午节"],["the Mid-Autumn Festival","中秋节"],["the Double Ninth Festival","重阳节"],["rice dumpling","粽子"]],
 "M4U3 故事时间": [["duckling","小鸭子"],["swan","天鹅"],["nest","鸟巢"]],
 "复习·Shapes 形状": [["shape","形状"],["circle","圆形"],["square","正方形"],["triangle","三角形"],["rectangle","长方形"],["star","星形"],["side","边"]],
 "复习·Colours 颜色": [["sky","天空"],["sea","海"],["mountain","山"],["river","河流"],["rainbow","彩虹"],["violet","紫罗兰色"]],
 "复习·Seasons 季节": [["season","季节"],["plant a tree","植树"],["have a picnic","野餐"],["ice-skate","滑冰"],["ski","滑雪"],["fly a kite","放风筝"]],
 "复习·My body 身体": [["body","身体"],["head","头"],["shoulder","肩膀"],["arm","手臂"],["hand","手"],["finger","手指"],["leg","腿"],["knee","膝盖"],["foot","脚"]],
 "复习·Children's Day 儿童节": [["park","公园"],["cinema","电影院"],["zoo","动物园"],["photograph","照片"],["the first of June","六月一日"]],
}
KEN_SENT = {
 "★ 易错句(重点·先练这个)": [["Does Alice play basketball?","艾丽斯打篮球吗?"],["He usually watches TV.","他通常看电视。"],["Now he is reading a book.","他现在正在看书。"],["What time is it now?","现在几点了?"],["What are these?","这些是什么?"],["I can play the piano.","我会弹钢琴。"]],
 "M1 句子(五感)": [["Is it a grape or a plum?","它是葡萄还是李子?"],["What's this? It's a knife.","这是什么?是一把小刀。"],["It's hard and smooth.","它又硬又光滑。"],["The sun rises behind the hill.","太阳从小山后面升起。"],["Whose shadow is this? It's Danny's.","这是谁的影子?是丹尼的。"]],
 "M2 句子(爱好/家庭)": [["Does she like playing football?","她喜欢踢足球吗?"],["Yes, she does.","是的,她喜欢。"],["Would you like to join us?","你想加入我们吗?"],["What does it eat? It eats fish.","它吃什么?它吃鱼。"],["What are you doing? I am doing my homework.","你在做什么?我在做作业。"]],
 "M3 句子(时间/星期)": [["What time is it? It's half past seven.","几点了?七点半。"],["It's time for breakfast.","该吃早餐了。"],["I get up at seven o'clock.","我七点钟起床。"],["Peter goes to school from Monday to Friday.","彼得周一到周五上学。"],["I usually watch TV on Sunday.","我通常周日看电视。"]],
 "M4 句子(音乐/节日/故事)": [["What can you play? I can play the piano.","你会演奏什么?我会弹钢琴。"],["What festivals do you like?","你喜欢什么节日?"],["I like the Spring Festival.","我喜欢春节。"],["We eat rice dumplings at the Dragon Boat Festival.","端午节我们吃粽子。"],["The ugly duckling becomes a swan.","丑小鸭变成了天鹅。"]],
}

# ============ 弟弟 数据（牛津三下 M1-M4 + 真实错词/句 + ★） ============
EDD_VOCAB = {
 "★ 易错词(重点·先练这个)": [["rough","粗糙的"],["smooth","光滑的"],["coffee","咖啡"],["giraffe","长颈鹿"],["panda","熊猫"],["teddy bear","泰迪熊"],["favourite","最喜欢的"],["trousers","裤子"],["socks","袜子"],["triangle","三角形"],["round","圆的"],["nest","鸟巢"],["swan","天鹅"],["ugly","丑的"],["skateboard","滑板"],["strawberry","草莓"],["swimming pool","游泳池"],["playground","操场"]],
 "M1U1 看与听": [["see","看见"],["hear","听见"],["look","看"],["listen","听"],["eye","眼睛"],["ear","耳朵"],["bird","鸟"],["plane","飞机"],["train","火车"],["loud","响亮的"]],
 "M1U2 触摸与感觉": [["touch","触摸"],["feel","感觉"],["hard","硬的"],["soft","软的"],["rough","粗糙的"],["smooth","光滑的"],["warm","温暖的"],["cold","冷的"]],
 "M1U3 尝与闻": [["taste","尝"],["smell","闻"],["sweet","甜的"],["sour","酸的"],["salty","咸的"],["bitter","苦的"],["lemon","柠檬"],["sugar","糖"],["coffee","咖啡"]],
 "M2U1 动物": [["animal","动物"],["tiger","老虎"],["lion","狮子"],["monkey","猴子"],["elephant","大象"],["panda","熊猫"],["zebra","斑马"],["giraffe","长颈鹿"],["tall","高的"],["fat","胖的"]],
 "M2U2 玩具": [["toy","玩具"],["doll","洋娃娃"],["ball","球"],["kite","风筝"],["car","小汽车"],["robot","机器人"],["train","火车"],["teddy bear","泰迪熊"],["favourite","最喜欢的"]],
 "M2U3 衣服": [["clothes","衣服"],["shirt","衬衫"],["T-shirt","T恤衫"],["dress","连衣裙"],["skirt","短裙"],["trousers","裤子"],["shoes","鞋子"],["socks","袜子"],["cap","帽子"],["coat","外套"]],
 "M3U1 形状": [["shape","形状"],["circle","圆形"],["square","正方形"],["triangle","三角形"],["rectangle","长方形"],["star","星形"],["round","圆的"]],
 "M3U2 颜色": [["colour","颜色"],["red","红色"],["yellow","黄色"],["blue","蓝色"],["green","绿色"],["orange","橙色"],["purple","紫色"],["pink","粉色"],["brown","棕色"],["black","黑色"],["white","白色"]],
 "M3U3 季节": [["season","季节"],["spring","春天"],["summer","夏天"],["autumn","秋天"],["winter","冬天"],["warm","温暖的"],["hot","炎热的"],["cool","凉爽的"],["cold","寒冷的"]],
 "M4U1 身体": [["body","身体"],["head","头"],["hair","头发"],["face","脸"],["mouth","嘴"],["neck","脖子"],["shoulder","肩膀"],["arm","手臂"],["hand","手"],["leg","腿"],["foot","脚"],["knee","膝盖"]],
 "M4U2 儿童节": [["present","礼物"],["party","聚会"],["balloon","气球"],["card","卡片"],["sing","唱歌"],["dance","跳舞"],["play","玩"],["happy","高兴的"]],
 "M4U3 故事时间": [["story","故事"],["duck","鸭子"],["duckling","小鸭子"],["swan","天鹅"],["nest","鸟巢"],["egg","蛋"],["ugly","丑的"],["beautiful","美丽的"]],
}
EDD_SENT = {
 "★ 易错句(重点·先练这个)": [["There are lots of fun things to do.","有很多好玩的事可以做。"],["I like swimming in the pool.","我喜欢在泳池里游泳。"],["I take English classes every week.","我每周上英语课。"],["These are red strawberries.","这些是红草莓。"],["She can swim. She can't cook.","她会游泳。她不会做饭。"],["I like playing football.","我喜欢踢足球。"]],
 "M1 句子(五感)": [["I can see a bird.","我能看见一只鸟。"],["I can hear a plane.","我能听见一架飞机。"],["Touch it. How does it feel?","摸一摸,它感觉怎么样?"],["It is soft and smooth.","它又软又滑。"],["What can you taste? It tastes sweet.","你能尝到什么?它尝起来是甜的。"]],
 "M2 句子(喜好/衣物)": [["Do you like tigers? Yes, I do.","你喜欢老虎吗?是的我喜欢。"],["What is your favourite toy?","你最喜欢的玩具是什么?"],["This is her dress.","这是她的连衣裙。"],["I like the red T-shirt.","我喜欢这件红色T恤。"],["Put on your coat.","穿上你的外套。"]],
 "M3 句子(形状/颜色/季节)": [["What shape is it? It is a circle.","它是什么形状?它是一个圆形。"],["What colour is it? It is red.","它是什么颜色?它是红色的。"],["What colour are they? They are blue.","它们是什么颜色?是蓝色的。"],["Which season do you like? I like summer.","你喜欢哪个季节?我喜欢夏天。"],["It is hot in summer.","夏天很热。"]],
 "M4 句子(身体/节日/故事)": [["Touch your head.","摸摸你的头。"],["My feet are big.","我的脚很大。"],["Happy Children's Day!","儿童节快乐!"],["The ugly duckling becomes a swan.","丑小鸭变成了天鹅。"],["It is beautiful.","它很美丽。"]],
}

def js(obj):
    return json.dumps(obj, ensure_ascii=False)

def replace_const(html, name, new_literal):
    pat = re.compile(r'const ' + name + r'=\{.*?\n\};', re.S)
    new = 'const %s=%s;' % (name, new_literal)
    out, n = pat.subn(lambda m: new, html, count=1)
    assert n == 1, "未替换 %s (n=%d)" % (name, n)
    return out

def build(child, badge, vocab, sent, audio_dir, title, theme=None):
    h = open(BASE, encoding="utf-8").read()
    # 数据
    h = replace_const(h, "CN", "{}")
    h = replace_const(h, "CN_QUIZ", "{}")
    h = replace_const(h, "EN_VOCAB", js(vocab))
    h = replace_const(h, "EN_SENT", js(sent))
    # 配置
    h = h.replace('const AUDIO_DIR="audio/kenton_dictation/";', 'const AUDIO_DIR="%s";' % audio_dir)
    h = h.replace("const CHILD='哥哥';", "const CHILD='%s';" % child)
    h = h.replace("<title>哥哥默写助手 · 语文+英语</title>", "<title>%s</title>" % title)
    h = h.replace('<div class="badge">哥哥</div>', '<div class="badge">%s</div>' % badge)
    h = h.replace('<div style="flex:1"><h1>默写助手</h1><div class="sub">语文词语 · 英语考纲 · 全自动报默</div></div>',
                  '<div style="flex:1"><h1>英语单词默写</h1><div class="sub">单词 · 句子 · 全自动报默(读3遍)</div></div>')
    # 首页：去掉语文，英语直达
    h = h.replace(
        '''    <div class="bigmenu">
      <div class="bigtile cn" onclick="showCnList()"><div class="ic">📖</div><div class="nm">语文默写</div><div class="ds">12 课词语 + 理解小测</div></div>
      <div class="bigtile en" onclick="showEnList()"><div class="ic">🔤</div><div class="nm">英语默写</div><div class="ds">单词+句子+中英互译</div></div>
    </div>''',
        '''    <div class="bigmenu">
      <div class="bigtile en" onclick="showEnList()" style="grid-column:1/3"><div class="ic">🔤</div><div class="nm">开始英语默写</div><div class="ds">★易错词 · 单词 · 句子 · 中英互译小测</div></div>
    </div>''')
    # 狮子提示语（去掉语文措辞）
    h = h.replace(
        '默写规则:每个词<b>边听边写</b>(读三遍),时间到自动下一个。一课默完看答案对照——<b>写错的点一下标红,在书上圈出来</b>!另外可以做🧠理解小测,检查是不是真懂。',
        '英语默写:每个词/句<b>边听边写</b>(自动读三遍),时间到自动下一个,<b>不显示中文、不偷看</b>。默完看答案对照——<b>写错的点一下标红,在书上圈出来</b>!先练最上面的 ★易错词。')
    # 问候语
    h = h.replace("'你好哥哥,我是默写助手。'", "'你好%s,我们来默写英语。'" % child)
    # 主题色（弟弟换珊瑚橙）
    if theme:
        for a, b in theme:
            h = h.replace(a, b)
    return h

def manifest(vocab, sent):
    items, seen = [], set()
    def add(lang, text):
        k = lang + "|" + text
        if k not in seen:
            seen.add(k); items.append({"lang": lang, "text": text})
    for groups in (vocab, sent):
        for arr in groups.values():
            for pair in arr:
                add("en", pair[0])
    return {"enRate": "-10%", "zhRate": "-10%", "items": items}

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(content)

# 弟弟主题：把哥哥红色系替换为珊瑚橙
EDD_THEME = [
 ("--red:#D63A2E;", "--red:#E8642F;"),
 ("--redd:#A82A20;", "--redd:#C24E20;"),
]

if __name__ == "__main__":
    apps = os.path.join(ROOT, "apps")
    audio = os.path.join(apps, "audio")
    # 哥哥
    kh = build("哥哥", "哥哥", KEN_VOCAB, KEN_SENT, "audio/kenton_english_dictation/", "哥哥英语单词默写")
    write(os.path.join(apps, "kenton_english_dictation.html"), kh)
    write(os.path.join(audio, "kenton_english_dictation", "_manifest.json"),
          json.dumps(manifest(KEN_VOCAB, KEN_SENT), ensure_ascii=False, indent=1))
    # 弟弟
    eh = build("弟弟", "弟弟", EDD_VOCAB, EDD_SENT, "audio/eddey_english_dictation/", "弟弟英语单词默写", EDD_THEME)
    write(os.path.join(apps, "eddey_english_dictation.html"), eh)
    write(os.path.join(audio, "eddey_english_dictation", "_manifest.json"),
          json.dumps(manifest(EDD_VOCAB, EDD_SENT), ensure_ascii=False, indent=1))

    def stat(v, s):
        return sum(len(x) for x in v.values()), sum(len(x) for x in s.values())
    kw, ks = stat(KEN_VOCAB, KEN_SENT); ew, es = stat(EDD_VOCAB, EDD_SENT)
    print("哥哥: %d词 / %d句, 共%d课词+%d组句" % (kw, ks, len(KEN_VOCAB), len(KEN_SENT)))
    print("弟弟: %d词 / %d句, 共%d课词+%d组句" % (ew, es, len(EDD_VOCAB), len(EDD_SENT)))
    print("manifest 词条: 哥哥%d, 弟弟%d" % (len(manifest(KEN_VOCAB,KEN_SENT)["items"]), len(manifest(EDD_VOCAB,EDD_SENT)["items"])))
