# -*- coding: utf-8 -*-
"""
生成「英语期末冲刺卷」——两兄弟各一份 PDF（放入 papers/）。
每份内容：
  一、大概率考点预测（综合错题+老师分析+教材考点）
  二、错题重现 · 错在哪 · 怎么改（核心：原题→他写错的→✗错因→✓正确→★记住，红/星多）
  三、语法专项讲解（针对最易错的点讲透）
  四、必考作文准备（模板+评分要点+自检清单）

数据来源（仓库内，已记录在册）：
  data/learning/english_errors_kenton_2026-06-16.json（哥哥错题）
  data/learning/english_m3m4_kenton.json（哥哥M3/M4考点）
  data/learning/english_errors_eddey_2026-06-13.json（弟弟错题）
  data/learning/lesson_eddey_2026-06-16.json（弟弟老师6.16总结）
依赖：PyMuPDF（fitz），自带 CJK 回退字体。内容均为通用英语知识点+小名，无身份信息。
"""
import fitz, os

KEN = "#2f6fb3"   # 哥哥 青蓝
EDD = "#e8642f"   # 弟弟 珊瑚橙
RED = "#c0392b"
GRN = "#1a7f37"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "papers")

CSS = """
* { font-family: sans-serif; }
body { font-size: 10.5pt; line-height: 1.45; color:#222; }
h1 { font-size: 18pt; margin: 0 0 2pt 0; }
h2 { font-size: 13.5pt; margin: 12pt 0 5pt 0; padding:4pt 9pt; color:#fff; border-radius:6px; }
h3 { font-size: 11pt; margin: 9pt 0 3pt 0; }
.sub { color:#666; font-size:9pt; margin:0 0 8pt 0; }
.intro { font-size:9.5pt; background:#f4f6f8; border:1px solid #dde3e8; border-radius:6px; padding:6pt 9pt; margin:4pt 0 8pt 0; }
ul { margin:2pt 0 4pt 0; padding-left:16pt; }
li { margin:2pt 0; }
table { border-collapse:collapse; width:100%; margin:4pt 0 7pt 0; font-size:9.5pt; }
td,th { border:1px solid #cdd5dd; padding:3pt 6pt; text-align:left; vertical-align:top; }
th { background:#eef2f6; }
.star { color:#d4380d; font-weight:bold; }
.pri { color:#d4380d; font-weight:bold; }
.card { border:1px solid #e3e7ec; border-left:5px solid #c0392b; border-radius:7px; padding:6pt 10pt; margin:7pt 0; }
.qnum { display:inline; font-weight:bold; color:#333; }
.q { font-weight:bold; margin:0 0 3pt 0; }
.wrong { color:#c0392b; font-weight:bold; }
.rowx { background:#fdecea; border-radius:4px; padding:2pt 6pt; margin:2pt 0; }
.rowok { background:#eaf7ee; border-radius:4px; padding:2pt 6pt; margin:2pt 0; }
.rowrem { background:#fff8e1; border-radius:4px; padding:2pt 6pt; margin:2pt 0; }
.lx { color:#c0392b; font-weight:bold; }
.lo { color:#1a7f37; font-weight:bold; }
.lr { color:#ad6800; font-weight:bold; }
.eg { color:#1a6f3c; }
.box { border:2px solid; border-radius:8px; padding:6pt 10pt; margin:6pt 0; }
.tip { font-size:9pt; color:#555; }
.gram { background:#f7faff; border:1px solid #dbe7f6; border-radius:7px; padding:6pt 10pt; margin:6pt 0; }
"""

def render(html, path):
    story = fitz.Story(html=html, user_css=CSS)
    MED = fitz.paper_rect("a4")
    where = MED + (40, 36, -40, -40)
    writer = fitz.DocumentWriter(path)
    more = 1
    while more:
        dev = writer.begin_page(MED)
        more, _ = story.place(where)
        story.draw(dev)
        writer.end_page()
    writer.close()
    d = fitz.open(path); n = d.page_count; d.close()
    return n

def card(num, q, wrong, why, right, rem):
    """错题卡：原题 / 他写错的 / ✗错在哪 / ✓正确 / ★记住"""
    h = '<div class="card">'
    h += '<div class="q"><span class="qnum">%s</span> %s</div>' % (num, q)
    if wrong:
        h += '<div class="rowx"><span class="lx">【他写】</span> <span class="wrong"><s>%s</s></span></div>' % wrong
    h += '<div class="rowx"><span class="lx">✗ 错在哪：</span>%s</div>' % why
    h += '<div class="rowok"><span class="lo">✓ 正确：</span>%s</div>' % right
    h += '<div class="rowrem"><span class="lr">★ 记住：</span>%s</div>' % rem
    h += '</div>'
    return h

def pri_list(items):
    """考点预测：★数表示重要度"""
    h = '<table><tr><th>大概率考点</th><th>重要度</th><th>为什么（你/老师）</th></tr>'
    for name, stars, why in items:
        h += '<tr><td>%s</td><td class="pri">%s</td><td>%s</td></tr>' % (name, stars, why)
    h += '</table>'
    return h

# ============================================================
# 哥哥 Kenton
# ============================================================
def kenton():
    h = ['<h1>哥哥 Kenton · 英语期末冲刺卷</h1>',
         '<p class="sub">四年级下 Module 3–4 | 综合你的错题 + 老师重点 + 教材考点 | 2026-06-16 考前</p>',
         '<div class="intro">用法：① 先看「考点预测」知道考什么；② 重点啃「错题重现」——看清你<b>之前错在哪</b>、<b>怎么改</b>（红字=错、绿字=对、<span class="star">★</span>=必记）；③ 再读「语法讲解」把规则弄懂；④ 背「作文模板」。</div>']

    h.append('<h2 style="background:%s">一、大概率考点预测</h2>' % KEN)
    h.append(pri_list([
        ("一般现在时 vs 现在进行时", "★★★", "你期末卷栽在这（watches/is reading），必考填空。"),
        ("第三人称单数 s / Does / doesn't", "★★★", "He plays、Does…play、has→have，年年考。"),
        ("名词单复数（knife→knives, foot→feet, a 不可省）", "★★★", "你错过 knives；M4 foot→feet 是考点。"),
        ("对划线部分提问（What/What time/How/What colour…）", "★★★", "你错过 4 题；句型转换大题必考。"),
        ("改一般疑问句 / 否定句", "★★", "Does Eddie have…?、isn't eating。"),
        ("固定搭配 can/like/go+doing、Let's+原形、play the+乐器、It's time for", "★★", "选择题高频，你错过多处。"),
        ("介词 on 日期/in/at/for/with", "★★", "M4U2 on Children's Day；作文也用。"),
        ("单元核心句型 What shape/colour is/are…? What season…?", "★★", "M3/M4 课文原句。"),
        ("作文 My week / My favourite season / My body", "★★★", "你 My week 被整段红改，必考。"),
    ]))

    h.append('<h2 style="background:%s">二、错题重现 · 错在哪 · 怎么改</h2>' % KEN)
    h.append('<p class="tip">下面每一题都是你<b>之前真的做错</b>的（期末复习卷）。盖住绿字，先自己改一遍。</p>')
    cards = [
        ("错题1.", "On the table there are some ___ (knife).",
         "knifes", "f / fe 结尾的名词变复数，不能直接加 s。",
         "knives", "去掉 f/fe 再加 <b>ves</b>：knife→knives, leaf→leaves。（但 foot→feet, tooth→teeth 是不规则）"),
        ("错题2.", "___ Alice ___ (play) basketball?",
         "Does Alice plays", "已经用了 Does，后面动词必须<b>还原成原形</b>，s 只能出现一次。",
         "Does Alice play", "Does / doesn't + 动词原形。"),
        ("错题3.", "My father usually ___ (watch) TV, but now he ___ (read) in the room.",
         "My father usually watch TV, but now he reads", "usually=一般现在时（他是三单→watches）；but now=现在进行时（be+doing→is reading）。两个时态没切换、三单也漏了。",
         "watches … is reading", "<b>usually/every day</b>→一般现在时；<b>now/look!/but now</b>→be+doing。"),
        ("错题4.", "Sam ___ (not eat) bread now.",
         "Sam doesn't eat bread now", "句末有 now → 现在进行时，否定要用 isn't + doing。",
         "isn't eating", "now 句的否定 = am/is/are + not + doing。"),
        ("错题5.", "Wendy doesn't like playing football. She ___ plays it. (often / never / always)",
         "often", "前句说“不喜欢踢”，后句应是“几乎从不踢”。",
         "never", "读懂句意再选频率词：not like → never。"),
        ("错题6.", "Let's go and ___ (wash) our hands.",
         "Let's go and washes our hands", "Let's 后面永远跟<b>动词原形</b>。",
         "wash", "Let's (=Let us) + 动词原形。"),
        ("错题7.", "Tom can play ___ volleyball but he can't play ___ piano.",
         "play the volleyball … play piano", "球类运动前<b>不加 the</b>；乐器前<b>要加 the</b>。",
         "play volleyball … play the piano", "play + 球类(不加the)；play the + 乐器(加the)。"),
        ("错题8.", "There isn't ___ orange juice. (some / any)",
         "some", "否定句、疑问句用 any；some 只用在肯定句。",
         "any", "肯定 some，否定/疑问 any。"),
        ("错题9.", "Can I finish ___ (watch) the cartoon? / It's time ___ Music class.",
         "to watch … It's time to Music", "finish 后接 doing；It's time <b>for</b> + 名词。",
         "watching … for", "finish doing；It's time for + 名词（It's time to + 动词原形）。"),
        ("错题10.", "It's <u>a quarter to five</u> now.（对划线部分提问）",
         "What is it now?", "划线的是<b>时间</b>，要用 What time 提问。",
         "What time is it now?", "时间→What time；地点→Where；人→Who。"),
        ("错题11.", "<u>These</u> are <u>our pets</u>.（对划线部分提问）",
         "What is these?", "these 是复数，be 动词用 are；对“东西”提问用 What。",
         "What are these?", "复数主语配 are：What are these?"),
        ("错题12.", "Eddie always <u>has breakfast at 7</u>.（改一般疑问句）",
         "Does Eddie has breakfast at 7?", "用了 Does，has 必须<b>还原成 have</b>。",
         "Does Eddie have breakfast at 7 o'clock?", "Do/Does/doesn't 后动词还原：has→have, goes→go。"),
        ("错题13.", "I go to school <u>by bus</u>.（对划线部分提问）",
         "How I go to school?", "对“交通方式”提问用 How；还要把 I 换成 you、加 do。",
         "How do you go to school?", "方式/交通→How；提问时 I→you、加 do/does。"),
        ("错题14.", "People like ___ (watch) the boats racing.（语篇选词）",
         "watch", "like 后面接动词要用 -ing。",
         "watching", "like + doing（喜欢做某事）。"),
        ("错题15.", "作文《My week》开头",
         "On my week, I am very happy. … On Frisay …",
         "① 标题/开头不能写 <b>On my week</b>；② Frisay 拼错；③ 句首字母没大写；④ 星期前少了介词 on。",
         "My week is busy but happy. … On Friday …",
         "标题写 <b>My week</b>；on + 星期(on Friday)；句首大写；用一般现在时写每周习惯。"),
    ]
    for c in cards:
        h.append(card(*c))

    h.append('<h2 style="background:%s">三、语法专项讲解（你特别要注意）</h2>' % KEN)
    h.append('<div class="gram"><h3>A. 一般现在时 vs 现在进行时（你最常错，必弄懂）</h3>'
             '<table><tr><th></th><th>一般现在时</th><th>现在进行时</th></tr>'
             '<tr><td>表示</td><td>经常/习惯</td><td>此刻正在做</td></tr>'
             '<tr><td>标志词</td><td class="lx">usually, often, every day, always</td><td class="lx">now, look!, listen!, but now</td></tr>'
             '<tr><td>动词</td><td>原形 / 三单加s</td><td>be(am/is/are) + 动词ing</td></tr>'
             '<tr><td>否定</td><td>don\'t / doesn\'t + 原形</td><td>be + not + doing</td></tr>'
             '<tr><td>例</td><td>He usually <b>watches</b> TV.</td><td>Now he <b>is reading</b>.</td></tr></table></div>')
    h.append('<div class="gram"><h3>B. 三单动词怎么变（背规则）</h3><ul>'
             '<li>一般直接加 s：play→plays, like→likes</li>'
             '<li>以 s/x/ch/sh 结尾加 es：watch→watch<b>es</b>, go→go<b>es</b>, do→do<b>es</b></li>'
             '<li>辅音字母 + y → 去 y 加 ies：study→stud<b>ies</b>, fly→fl<b>ies</b></li>'
             '<li>特殊：have→<b>has</b></li></ul></div>')
    h.append('<div class="gram"><h3>C. 对划线部分提问 · 五步法</h3>'
             '<ul><li>① 看划线是什么信息 → ② 选疑问词 → ③ 剩下变疑问句语序 → ④ 人称 I/we/my 换成 you/your → ⑤ 动词还原(加 do/does)。</li></ul>'
             '<table><tr><th>划线信息</th><th>疑问词</th></tr>'
             '<tr><td>时间(几点)</td><td>What time / When</td></tr>'
             '<tr><td>地点</td><td>Where</td></tr><tr><td>人</td><td>Who</td></tr>'
             '<tr><td>东西/做什么</td><td>What</td></tr><tr><td>方式/交通</td><td>How</td></tr>'
             '<tr><td>颜色 / 形状</td><td>What colour / What shape</td></tr>'
             '<tr><td>数量</td><td>How many</td></tr></table></div>')

    h.append('<h2 style="background:%s">四、必考作文准备</h2>' % KEN)
    h.append('<div class="box" style="border-color:%s"><h3>模板 A：My week（你上次失分，重点背）</h3>'
             '<p class="eg">My week<br>My week is busy but happy.<br>'
             'From Monday to Friday, I go to school.<br>'
             'On Monday, I play football with my classmates.<br>'
             'On Wednesday, I read books in the library.<br>'
             'On Saturday morning, I do my homework.<br>'
             'On Sunday, I go to the park with my parents.<br>I love my week!</p></div>' % KEN)
    h.append('<div class="box" style="border-color:%s"><h3>模板 B：My favourite season（备用，套 M3U3）</h3>'
             '<p class="eg">My favourite season is summer.<br>It\'s hot and sunny. The days are long.<br>'
             'I can swim and have picnics in the park.<br>I can make sandcastles on the beach.<br>I like summer best!</p></div>' % KEN)
    h.append('<div class="box" style="border-color:%s"><h3>★ 作文自检清单（写完逐项打勾）</h3><ul>'
             '<li>标题对吗？（My week，不是 On my week）</li><li>每句句首字母大写了吗？</li>'
             '<li>时态对吗？（写习惯用一般现在时）</li><li>三单 s 漏了吗？（He goes…）</li>'
             '<li>星期/日期前用 on 了吗？</li><li>单词拼对了吗？（Friday, swimming pool, playground）</li>'
             '<li>句末有句号吗？</li></ul></div>' % KEN)
    return "\n".join(h)

# ============================================================
# 弟弟 Eddey
# ============================================================
def eddey():
    h = ['<h1>弟弟 Eddey · 英语期末冲刺卷</h1>',
         '<p class="sub">三年级下 | 综合你的错题 + 老师 6.16 重点 + 高频考点 | 2026-06-16 考前</p>',
         '<div class="intro">用法：① 看「考点预测」；② 重点啃「错题重现」——看清你<b>之前错在哪</b>、<b>怎么改</b>（红字=错、绿字=对、<span class="star">★</span>=必记）；③ 读「语法讲解」；④ 背「作文模板」。<br><b>老师特别提醒：</b>这几节课练三单练得多，你现在很敏感；但 <b>can 的句子和 does 无关</b>，是另一个语法，别搞混！</div>']

    h.append('<h2 style="background:%s">一、大概率考点预测</h2>' % EDD)
    h.append(pri_list([
        ("一般现在时三单（第三人称+单数才加s；The boys 复数不加）", "★★★", "老师反复练，必考。"),
        ("情态动词 can（can+原形；can≠does）", "★★★", "老师特别提醒你别和 does 混。"),
        ("句子三态：肯定 / 否定 / 一般疑问及简答", "★★★", "老师作业重点。"),
        ("名词单复数（these/those/are→复数；strawberry→strawberries）", "★★★", "你错过 strawberries、漏标志词。"),
        ("形容词性物主代词（she→her）", "★★", "你错过 Her dress。"),
        ("对划线提问 / 句型转换（单→复、改否定）", "★★", "你错过多题。"),
        ("一般疑问句应答（Do you…? → Yes, I do.）", "★★", "你写成 Yes, I am.。"),
        ("like + doing", "★★", "你写成 I like play football。"),
        ("拼写 swimming pool / playground / English / skateboard", "★★", "老师点名+你漏字母。"),
        ("听力填词（先预测+语法）、阅读细心抄词", "★★", "你听力填词、阅读判断失分。"),
        ("作文 Myself / My day / I can", "★★★", "必考，套句型。"),
    ]))

    h.append('<h2 style="background:%s">二、错题重现 · 错在哪 · 怎么改</h2>' % EDD)
    h.append('<p class="tip">下面每一题都是你<b>之前真的做错</b>的。盖住绿字，先自己改一遍。</p>')
    cards = [
        ("错题1.", "看图写词：滑板",
         "skatboard", "合成长词漏字母（skate + board）。",
         "skateboard", "skateboard = skate + board，慢慢拼。"),
        ("错题2.", "This is Kitty. ___ (She) dress is nice.",
         "She dress", "后面有名词(dress)，要用<b>形容词性物主代词 her</b>，不能用主格 she。",
         "Her dress", "I-my, you-your, he-his, <b>she-her</b>, it-its, we-our, they-their。"),
        ("错题3.", "对划线提问：We can see <u>flowers</u> in summer.",
         "What can we cee in summer?", "① 对东西提问用 What（这步对）；② <b>see 拼成了 cee</b>。",
         "What can we see in summer?", "see 不是 cee；can 句提问 What/疑问词 + can…。"),
        ("错题4.", "单数改复数：This is a red strawberry.",
         "These is red strawberrys", "四处都要变：This→These、is→are、去掉 a、strawberry→strawberries。",
         "These are red strawberries.", "改复数：This→These, is→are, 去 a；辅音+y → 去 y 加 <b>ies</b>。"),
        ("错题5.", "改否定句：I am fat.",
         "I don't fat", "有 be 动词(am)时，否定<b>直接加 not</b>，不用 don't。",
         "I am not fat.", "am/is/are + not；有 be 动词不用 don't。"),
        ("错题6.", "Do you like apples? — ___",
         "Yes, I am.", "Do you…? 要用 do / don't 回答；Are you…? 才用 am。",
         "Yes, I do. / No, I don't.", "Do→do；Are→am；Can→can（问什么用什么答）。"),
        ("错题7.", "阅读判断：短文里两人都说 “I like them(oranges)”。判断“他不喜欢橘子”。",
         "T (对)", "没回原文找细节，原文是“喜欢”。",
         "F (错)", "判断题一定<b>回原文逐句对照</b>再判。"),
        ("错题8.", "阅读问答：Who is happy?",
         "Peters happy", "漏写 is，要用<b>完整句</b>。",
         "Peter is happy.", "回答用完整句，别漏 be 动词(is/am/are)。"),
        ("错题9.", "看图写话：我喜欢踢足球。",
         "I like play football", "like 后面的动词要用 -ing。",
         "I like playing football.", "like + doing（喜欢做某事）。"),
        ("错题10.", "【老师新强调】The boys ___ (play) football.",
         "The boys plays", "The boys 是<b>复数</b>，动词不加 s（虽是第三人称但不是单数）。",
         "The boys play", "★第三人称 <b>且</b> 单数才加 s；复数用原形。"),
        ("错题11.", "【老师新强调】She ___ swim. / 改否定",
         "She cans swim / She doesn't can swim", "① can 后<b>不加 s</b>；② can 的否定是 can't，<b>不用 doesn't</b>。",
         "She can swim. / She can't swim.", "can + 原形；can 的否定/疑问用 can 自己，<b>不借 does</b>。"),
        ("错题12.", "【拼写】游泳池 / 操场",
         "swiming pool / playgroud", "swimming 是双写 m；playground 别漏字母。",
         "swimming pool / playground", "swimming(双m) ；playground = play + ground。"),
    ]
    for c in cards:
        h.append(card(*c))

    h.append('<h2 style="background:%s">三、语法专项讲解（你特别要注意）</h2>' % EDD)
    h.append('<div class="gram"><h3>A. 一般现在时三单（口诀 + 陷阱）</h3>'
             '<ul><li>口诀：<b>第三人称 + 单数</b> 才在动词加 s/es；缺一个就不加。</li>'
             '<li>He / She / It / Tom / 一个人 → 加 s：She <b>goes</b>. Tom <b>likes</b>.</li>'
             '<li><span class="lx">陷阱：The boys / We / They 是复数 → 动词原形</span>：The boys <b>play</b>.</li>'
             '<li>变化：一般+s；s/x/ch/sh+es(watches, goes)；辅音+y→ies(studies)；have→has。</li></ul></div>')
    h.append('<div class="gram"><h3>B. 情态动词 can（和 does 完全无关！）</h3>'
             '<ul><li>can + <b>动词原形</b>：I can swim. She can swim.（can 后<b>永不</b>加 s）</li>'
             '<li>否定：can\'t（=cannot）。疑问：Can 提到句首。<span class="lx">都不用 do/does！</span></li></ul>'
             '<table><tr><th></th><th>can 句</th></tr>'
             '<tr><td>肯定</td><td>I can swim.</td></tr><tr><td>否定</td><td>I can\'t swim.</td></tr>'
             '<tr><td>疑问</td><td>Can you swim?</td></tr><tr><td>简答</td><td>Yes, I can. / No, I can\'t.</td></tr></table></div>')
    h.append('<div class="gram"><h3>C. 句子三态总表（盖住右边自测）</h3>'
             '<table><tr><th></th><th>be 动词</th><th>实义动词</th><th>can</th></tr>'
             '<tr><td>肯定</td><td>I am tall.</td><td>I like it.</td><td>I can swim.</td></tr>'
             '<tr><td>否定</td><td>I am not tall.</td><td>I don\'t like it.</td><td>I can\'t swim.</td></tr>'
             '<tr><td>一般疑问</td><td>Are you tall?</td><td>Do you like it?</td><td>Can you swim?</td></tr>'
             '<tr><td>简答</td><td>Yes, I am./No, I\'m not.</td><td>Yes, I do./No, I don\'t.</td><td>Yes, I can./No, I can\'t.</td></tr></table></div>')
    h.append('<div class="gram"><h3>D. 名词变复数规则</h3><ul>'
             '<li>一般 + s：book→books</li><li>s/x/ch/sh + es：box→boxes, watch→watches</li>'
             '<li>辅音 + y → ies：strawberry→strawberries, baby→babies</li>'
             '<li>f/fe → ves：knife→knives；特殊：foot→feet</li>'
             '<li><span class="lx">看到 these/those/are → 后面名词一定是复数。</span></li></ul></div>')

    h.append('<h2 style="background:%s">四、必考作文准备</h2>' % EDD)
    h.append('<div class="box" style="border-color:%s"><h3>模板：Myself / My day（套这套句型）</h3>'
             '<p class="tip">用一般现在时；拼不出的词换成会拼的；记得 I 用原形、he/she 用三单。</p>'
             '<p class="eg">Myself<br>My name is Eddey. I am nine.<br>'
             'I like sports. I can swim and play football.<br>'
             'I go to school from Monday to Friday.<br>'
             'I play in the playground with my friends.<br>'
             'On Sunday, I swim in the swimming pool.<br>'
             'I can\'t cook, but I can ride a bike.<br>I am a happy boy!</p></div>' % EDD)
    h.append('<div class="box" style="border-color:%s"><h3>★ 作文自检清单（写完逐项打勾）</h3><ul>'
             '<li>句首字母大写了吗？</li><li>I 后面用原形、he/she 用三单 s 了吗？</li>'
             '<li>can 后面用原形了吗？（没加 s）</li><li>like 后面用 doing 了吗？</li>'
             '<li>swimming pool / playground / English 拼对了吗？</li><li>句末有句号吗？</li></ul></div>' % EDD)
    return "\n".join(h)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pk = os.path.join(OUT, "英语期末冲刺卷_哥哥Kenton.pdf")
    pe = os.path.join(OUT, "英语期末冲刺卷_弟弟Eddey.pdf")
    nk = render(kenton(), pk)
    ne = render(eddey(), pe)
    print("哥哥:", pk, nk, "页")
    print("弟弟:", pe, ne, "页")
