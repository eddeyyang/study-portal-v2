# -*- coding: utf-8 -*-
"""
把早上生成的两份「英语期末冲刺卷」(哥哥/弟弟) 做成可点选作答的【复习软件】。
复用已跑通的闯关引擎 apps/eddey_english_redo_grammar.html（点选自动判分+每题讲解+错题回炉+
家长页+记录导出+音效/计时+audio-first回退TTS）。本脚本只替换题库/主题/标题/存储键。
每道题=冲刺卷里孩子之前真错的点：原题给两个选项(他错的 vs 正确的)，答完显示『为什么/记住』。
输出：
  apps/kenton_english_sprint_quiz.html
  apps/eddey_english_sprint_quiz.html
"""
import re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, "apps", "eddey_english_redo_grammar.html")

# ---------------- 弟弟 题库 ----------------
EDD_LEVELS = r'''var LEVELS = [
  {id:"present3",name:"一般现在时·三单关",ico:"⏰",tag:"三单",
   intro:'<div class="rule"><b>第三人称 + 单数</b> 才给动词加 s；<b>I / you / 复数(The boys)</b> 用原形。问/否用 do / does。</div>',
   qs:[
    {kind:"choice",q:"The boys ____ football.",a:"play",opts:["play","plays"],explain:"The boys 是复数 → 动词原形 play（虽是第三人称但不是单数）。",tag:"三单"},
    {kind:"choice",q:"She ____ to school every day.",a:"goes",opts:["goes","go"],explain:"she 三单，go→goes。",tag:"三单"},
    {kind:"choice",q:"____ Alice like apples?",a:"Does",opts:["Does","Do"],explain:"主语 Alice 三单，用 Does。",tag:"三单"},
    {kind:"choice",q:"I ____ English very much.",a:"like",opts:["like","likes"],explain:"主语 I 用原形 like。",tag:"三单"}
   ]},
  {id:"can",name:"情态动词 can 关（老师特别强调）",ico:"💪",tag:"can",
   intro:'<div class="rule">can + <b>动词原形</b>；否定 <b>can\'t</b>；疑问把 <b>Can</b> 提到句首。<b>can 和 does 无关，都不用 do/does！</b></div>',
   qs:[
    {kind:"choice",q:"She can ____ very fast.",a:"swim",opts:["swim","swims"],explain:"can 后用动词原形，不加 s。",tag:"can"},
    {kind:"choice",q:"「她不会做饭」怎么说？",a:"She can't cook.",opts:["She can't cook.","She doesn't can cook."],explain:"can 的否定是 can't，不借 does。",tag:"can"},
    {kind:"choice",q:"「你会游泳吗？」怎么问？",a:"Can you swim?",opts:["Can you swim?","Do you can swim?"],explain:"can 的疑问把 Can 提到句首，不用 do。",tag:"can"}
   ]},
  {id:"three",name:"句子三态关（肯定/否定/疑问）",ico:"🔁",tag:"三态",
   intro:'<div class="rule">有 be 动词(am/is/are)：否定<b>直接加 not</b>；实义动词：否定用 <b>don\'t/doesn\'t</b>。<b>Do you…? 用 do 回答。</b></div>',
   qs:[
    {kind:"choice",q:"改否定：I am fat. →",a:"I am not fat.",opts:["I am not fat.","I don't fat."],explain:"有 be 动词 am，否定直接加 not。",tag:"三态"},
    {kind:"choice",q:"Do you like apples? — ____",a:"Yes, I do.",opts:["Yes, I do.","Yes, I am."],explain:"Do you…? 用 do 回答。",tag:"三态"},
    {kind:"choice",q:"改否定：I like it. →",a:"I don't like it.",opts:["I don't like it.","I not like it."],explain:"实义动词否定用 don't + 原形。",tag:"三态"}
   ]},
  {id:"plural",name:"名词单复数关",ico:"🔢",tag:"单复数",
   intro:'<div class="rule"><b>these/those/are/数字</b> → 复数。辅音字母 + y → <b>去 y 加 ies</b>（strawberry→strawberries）。</div>',
   qs:[
    {kind:"choice",q:"单数改复数：This is a red strawberry. →",a:"These are red strawberries.",opts:["These are red strawberries.","These are red strawberrys."],explain:"This→These、is→are、去 a、strawberry→strawberries。",tag:"单复数"},
    {kind:"choice",q:"草莓的复数：strawberry →",a:"strawberries",opts:["strawberries","strawberrys"],explain:"辅音字母 + y → 去 y 加 ies。",tag:"单复数"},
    {kind:"choice",q:"These ____ my books.",a:"are",opts:["are","is"],explain:"These 是复数，用 are。",tag:"单复数"}
   ]},
  {id:"poss",name:"物主代词 + 对划线提问关",ico:"❓",tag:"物主代词",
   intro:'<div class="rule">名词前用 <b>my/your/his/her…</b>（不用主格 she/he）。对“东西”提问用 <b>What</b>。</div>',
   qs:[
    {kind:"choice",q:"This is Kitty. ____ dress is nice.",a:"Her",opts:["Her","She"],explain:"修饰名词 dress 用 her，不用主格 she。",tag:"物主代词"},
    {kind:"choice",q:"拼写：What can we ____ in summer?（看见）",a:"see",opts:["see","cee"],explain:"是 see 不是 cee。",tag:"拼写"},
    {kind:"choice",q:"对划线提问：We can see <u>flowers</u>. →",a:"What can we see?",opts:["What can we see?","How can we see?"],explain:"对“东西”提问用 What。",tag:"提问"}
   ]},
  {id:"doing",name:"like + doing & 高频拼写关",ico:"✍️",tag:"拼写",
   intro:'<div class="rule">like / enjoy 后动词用 <b>doing</b>。常考拼写：swimming(双 m) / playground / skateboard。</div>',
   qs:[
    {kind:"choice",q:"我喜欢踢足球：I like ____ football.",a:"playing",opts:["playing","play"],explain:"like 后动词用 -ing。",tag:"like+doing"},
    {kind:"choice",q:"滑板：",a:"skateboard",opts:["skateboard","skatboard"],explain:"skate + board，别漏字母。",tag:"拼写"},
    {kind:"choice",q:"游泳池：",a:"swimming pool",opts:["swimming pool","swiming pool"],explain:"swimming 双写 m。",tag:"拼写"},
    {kind:"choice",q:"操场：",a:"playground",opts:["playground","playgroud"],explain:"play + ground，别漏 n。",tag:"拼写"}
   ]},
  {id:"writing",name:"必考作文关（Myself / My day）",ico:"📝",tag:"作文",
   intro:'<div class="rule">用一般现在时介绍自己，套句型：I like… / I can… / I go to school… 写完点“看参考”。</div>',
   qs:[
    {kind:"self",q:"作文《Myself / My day》：介绍你自己（喜欢什么、会做什么、一周做什么），不少于 5 句。先在纸上写，再看参考。",
     a:"Myself\nMy name is Eddey. I am nine.\nI like sports. I can swim and play football.\nI go to school from Monday to Friday.\nI play in the playground with my friends.\nOn Sunday, I swim in the swimming pool.\nI can't cook, but I can ride a bike.\nI am a happy boy!",
     explain:"句首大写；I 用原形、he/she 加 s；can 后用原形；like 后用 doing。",
     checklist:["句首字母大写","I 用原形，he/she 加 s","can 后用原形","like 后用 doing","swimming pool / playground 拼对","句末有句号"],tag:"作文"}
   ]},
  {id:"huilu",name:"错题回炉关",ico:"🔥",tag:"",dynamic:true,
   intro:'<div class="rule">这一关收集你<b>刚才做错的题</b>，再练一遍！</div>'}
];'''

EDD_ADVICE = r'''var TAG_ADVICE = {
  "三单":"第三人称且单数才加 s；The boys 等复数用原形。",
  "can":"can 后用原形，否定 can't、疑问 Can 提前，不用 does。",
  "三态":"be 加 not；实义动词用 don't/doesn't；Do 问就用 do 答。",
  "单复数":"these/are/数字→复数；辅音字母+y→去y加ies。",
  "物主代词":"名词前用 my/your/his/her，不用主格。",
  "提问":"先判断信息类型，再选 What/How/Who…。",
  "like+doing":"like 后动词加 -ing。",
  "拼写":"易错词多写几遍，注意双写字母/别漏字母。",
  "作文":"套模板，检查时态、大小写、拼写、句号。"
};'''

EDD_PARENT = '''        默写/必背：★易错词句、句子三态、一般现在时三单、can 句型、拼写(swimming pool/playground/English)<br>
        重点：三单(第三人称+单数才加s, The boys不加)、can≠does、对划线提问、like+doing<br>
        习作：Myself / My day（用一般现在时, I like…/I can…）'''

# ---------------- 哥哥 题库 ----------------
KEN_LEVELS = r'''var LEVELS = [
  {id:"tense",name:"一般现在时 vs 现在进行时关",ico:"⏰",tag:"时态",
   intro:'<div class="rule"><b>usually/every day</b> → 一般现在时(三单 watches)；<b>now/look!/but now</b> → 现在进行时(<b>be + doing</b>)。</div>',
   qs:[
    {kind:"choice",q:"My father usually ____ TV.",a:"watches",opts:["watches","watch"],explain:"usually + 三单 father → watches。",tag:"时态"},
    {kind:"choice",q:"…but now he ____ a book.",a:"is reading",opts:["is reading","reads"],explain:"but now → 现在进行时 is reading。",tag:"时态"},
    {kind:"choice",q:"Sam ____ bread now.",a:"isn't eating",opts:["isn't eating","doesn't eat"],explain:"now → 现在进行时否定 isn't eating。",tag:"时态"}
   ]},
  {id:"third",name:"三单 s / Does / doesn't 关",ico:"3️⃣",tag:"三单",
   intro:'<div class="rule">He/She/Tom + 动词<b>加 s</b>；疑问/否定提 <b>Does/doesn\'t</b>，动词<b>还原</b>（has→have）。</div>',
   qs:[
    {kind:"choice",q:"____ basketball?（艾丽斯打篮球吗）",a:"Does Alice play",opts:["Does Alice play","Does Alice plays"],explain:"Does 后动词用原形 play。",tag:"三单"},
    {kind:"choice",q:"改一般疑问句：Eddie has breakfast at 7. →",a:"Does Eddie have breakfast at 7?",opts:["Does Eddie have breakfast at 7?","Does Eddie has breakfast at 7?"],explain:"Does 后 has 还原成 have。",tag:"三单"},
    {kind:"choice",q:"He ____ basketball on Sunday.",a:"plays",opts:["plays","play"],explain:"he 三单 → plays。",tag:"三单"}
   ]},
  {id:"plural",name:"名词单复数关",ico:"🔢",tag:"单复数",
   intro:'<div class="rule">f/fe → <b>ves</b>(knife→knives)；foot→<b>feet</b>；可数名词单数不能单用(have <b>picnics</b>)。</div>',
   qs:[
    {kind:"choice",q:"On the table there are some ____ (knife).",a:"knives",opts:["knives","knifes"],explain:"f/fe 结尾 → 去掉加 ves：knife→knives。",tag:"单复数"},
    {kind:"choice",q:"foot 的复数：",a:"feet",opts:["feet","foots"],explain:"foot→feet 是不规则变化。",tag:"单复数"},
    {kind:"choice",q:"We have ____ in the park.（野餐，泛指）",a:"picnics",opts:["picnics","picnic"],explain:"可数名词单数不能单用，用复数 picnics。",tag:"单复数"}
   ]},
  {id:"ask",name:"对划线部分提问关",ico:"❓",tag:"提问",
   intro:'<div class="rule">时间→<b>What time</b>；东西→<b>What</b>；方式/交通→<b>How</b>。只换划线信息，人称 I→you。</div>',
   qs:[
    {kind:"choice",q:"It's <u>a quarter to five</u> now. 对划线提问 →",a:"What time is it now?",opts:["What time is it now?","What is it now?"],explain:"划线是时间 → What time。",tag:"提问"},
    {kind:"choice",q:"<u>These</u> are our pets. 对划线提问 →",a:"What are these?",opts:["What are these?","What is these?"],explain:"these 复数用 are：What are these?",tag:"提问"},
    {kind:"choice",q:"I go to school <u>by bus</u>. 对划线提问 →",a:"How do you go to school?",opts:["How do you go to school?","What do you go to school?"],explain:"交通方式用 How，I→you。",tag:"提问"}
   ]},
  {id:"phrase",name:"固定搭配关",ico:"🧩",tag:"搭配",
   intro:'<div class="rule">Let\'s+原形；play <b>the</b>+乐器；finish+doing；It\'s time <b>for</b>+名词；否定句用 <b>any</b>。</div>',
   qs:[
    {kind:"choice",q:"Let's go and ____ our hands.",a:"wash",opts:["wash","washes"],explain:"Let's 后用动词原形。",tag:"搭配"},
    {kind:"choice",q:"He can play ____ piano.",a:"the piano",opts:["the piano","piano"],explain:"乐器前加 the：play the piano。",tag:"搭配"},
    {kind:"choice",q:"There isn't ____ orange juice.",a:"any",opts:["any","some"],explain:"否定句用 any。",tag:"搭配"},
    {kind:"choice",q:"Can I finish ____ the cartoon?",a:"watching",opts:["watching","to watch"],explain:"finish 后接 doing。",tag:"搭配"},
    {kind:"choice",q:"It's time ____ Music class.",a:"for",opts:["for","to"],explain:"It's time for + 名词。",tag:"搭配"},
    {kind:"choice",q:"Wendy doesn't like football. She ____ plays it.",a:"never",opts:["never","often"],explain:"不喜欢 → 几乎从不 → never。",tag:"搭配"}
   ]},
  {id:"prep",name:"介词关",ico:"📍",tag:"介词",
   intro:'<div class="rule"><b>on</b> + 星期/具体日期/节日；<b>in</b> the morning；<b>at</b> home；<b>for</b> + 名词。</div>',
   qs:[
    {kind:"choice",q:"____ Children's Day（在儿童节）",a:"on",opts:["on","in"],explain:"具体节日/日期用 on。",tag:"介词"},
    {kind:"choice",q:"____ the morning（在早上）",a:"in",opts:["in","on"],explain:"in the morning。",tag:"介词"},
    {kind:"choice",q:"I play football ____ Monday.",a:"on",opts:["on","at"],explain:"星期前用 on。",tag:"介词"}
   ]},
  {id:"writing",name:"必考作文关（My week）",ico:"📝",tag:"作文",
   intro:'<div class="rule">标题写 <b>My week</b>（不是 On my week）；用一般现在时；星期前用 on；句首大写。</div>',
   qs:[
    {kind:"self",q:"作文《My week》：写你一周做的不同事（上学/运动/作业/周末），不少于 40 词。先在纸上写，再看参考。",
     a:"My week\nMy week is busy but happy.\nFrom Monday to Friday, I go to school.\nOn Monday, I play football with my classmates.\nOn Wednesday, I read books in the library.\nOn Saturday morning, I do my homework.\nOn Sunday, I go to the park with my parents.\nI love my week!",
     explain:"标题 My week；写习惯用一般现在时；三单加 s；星期前用 on；句首大写。",
     checklist:["标题 My week（不是 On my week）","句首字母大写","写习惯用一般现在时","三单加 s（He goes…）","星期前用 on","Friday / swimming pool 拼对","句末有句号"],tag:"作文"}
   ]},
  {id:"huilu",name:"错题回炉关",ico:"🔥",tag:"",dynamic:true,
   intro:'<div class="rule">这一关收集你<b>刚才做错的题</b>，再练一遍！</div>'}
];'''

KEN_ADVICE = r'''var TAG_ADVICE = {
  "时态":"看标志词：usually→一般现在时；now/but now→现在进行时(be+doing)。",
  "三单":"He/Tom 加 s；Does/doesn't 后动词还原(has→have)。",
  "单复数":"f/fe→ves(knives)；foot→feet；可数名词单数不单用。",
  "提问":"时间 What time、东西 What、方式 How；人称 I→you。",
  "搭配":"Let's/play the/finish doing/It's time for/否定 any。",
  "介词":"on 星期日期节日、in the morning、at home、for+名词。",
  "作文":"My week 起步，检查时态、三单、介词、大小写、拼写。"
};'''

KEN_PARENT = '''        重点错点：一般现在时 vs 现在进行时、三单 s/Does(has→have)、名词单复数(knives/feet)<br>
        句型：对划线提问(What time/What/How)、固定搭配(Let's/play the/finish doing/It's time for/any)、介词 on/in/at/for<br>
        习作：My week（My week is busy…，用一般现在时, 星期前 on, 句首大写）'''

KEN_THEME = [
 ("--eddey:#ff8a5b;--eddeyd:#e8643a;--eddeybg:#fff0e6;", "--eddey:#3170B5;--eddeyd:#225182;--eddeybg:#e8f0fa;"),
 ("radial-gradient(circle at 12% 6%,#ffe1cc 0,transparent 42%),radial-gradient(circle at 90% 96%,#ffe9c8 0,transparent 42%)",
  "radial-gradient(circle at 12% 6%,#cfe2f6 0,transparent 42%),radial-gradient(circle at 90% 96%,#dbeafe 0,transparent 42%)"),
 ("box-shadow:0 6px 0 #f3e2d6", "box-shadow:0 6px 0 #d6e4f3"),
 ("box-shadow:0 5px 0 #f3e2d6", "box-shadow:0 5px 0 #d6e4f3"),
 ("box-shadow:0 4px 0 #f3e2d6", "box-shadow:0 4px 0 #d6e4f3"),
 ("box-shadow:0 3px 0 #f0d8c8", "box-shadow:0 3px 0 #c8dbf0"),
]

def build(levels, advice, parent_html, title, badge, h1, store_key, audio_dir, child, eb_kid, theme=None):
    h = open(BASE, encoding="utf-8").read()
    h = re.sub(r'var LEVELS = \[.*?\n\];', lambda m: levels, h, count=1, flags=re.S)
    h = re.sub(r'var TAG_ADVICE = \{.*?\n\};', lambda m: advice, h, count=1, flags=re.S)
    h = h.replace('<title>弟弟英语错点专项</title>', '<title>%s</title>' % title)
    h = h.replace('<span class="badge">英语错点</span>', '<span class="badge">%s</span>' % badge)
    h = h.replace('<h1 id="topTitle">弟弟英语错点专项</h1>', '<h1 id="topTitle">%s</h1>' % h1)
    h = h.replace('英语错点专项练 🎯（6.15老师讲评）', h1 + ' 🎯')
    h = h.replace('把老师讲评的5个点练熟：单复数标志词、一般现在时、oo短音、after class/school、运动不+play。<b>点选为主</b>，每题有讲解。',
                  '把早上冲刺卷里你<b>最常错的点</b>逐题练熟：每题先选答案、自动判分，再看『为什么错 / 怎么改』。错的会自动进“错题回炉关”。')
    h = h.replace('''        默写：词语表(P122-123)、《溪边》、《火烧云》3-6段、日积月累(P84/P96/P115)<br>
        知识点：多音字、仿写词句、加点词、写具体、有趣开头、寻物启事、拟声词、有趣题目、转述句<br>
        习作：写人记事 + 想象作文（约350字）''', parent_html)
    h = h.replace('var STORE_KEY="eddey_en_redo_v1";', 'var STORE_KEY="%s";' % store_key)
    h = h.replace('var AUDIO_DIR="audio/eddey_chinese/";', 'var AUDIO_DIR="%s";' % audio_dir)
    h = h.replace('lines.push("【弟弟英语错点专项档案】导出时间:"+fmt(Date.now()));',
                  'lines.push("【%s档案】导出时间:"+fmt(Date.now()));' % h1)
    h = h.replace('lines.push(JSON.stringify({child:"弟弟",subject:"英语错点专项",events:s.events}));',
                  'lines.push(JSON.stringify({child:"%s",subject:"英语期末冲刺复习",events:s.events}));' % child)
    h = h.replace('a.download="弟弟英语错点记录_"+stamp()+".txt";', 'a.download="%s记录_"+stamp()+".txt";' % h1)
    h = h.replace('var EB_KID="eddey"; /* 本App为「弟弟」→ eddey */', 'var EB_KID="%s";' % eb_kid)
    h = h.replace('var EB_SUBJECT="语文"; /* 全语文App,内部 cn → 语文 */', 'var EB_SUBJECT="英语";')
    if theme:
        for a, b in theme:
            assert a in h, "theme anchor missing: " + a[:30]
            h = h.replace(a, b)
    return h

if __name__ == "__main__":
    apps = os.path.join(ROOT, "apps")
    eh = build(EDD_LEVELS, EDD_ADVICE, EDD_PARENT, "弟弟英语期末冲刺复习", "期末冲刺",
               "弟弟英语期末冲刺", "eddey_en_sprint_v1", "audio/eddey_en_sprint/", "弟弟", "eddey")
    open(os.path.join(apps, "eddey_english_sprint_quiz.html"), "w", encoding="utf-8").write(eh)
    kh = build(KEN_LEVELS, KEN_ADVICE, KEN_PARENT, "哥哥英语期末冲刺复习", "期末冲刺",
               "哥哥英语期末冲刺", "kenton_en_sprint_v1", "audio/kenton_en_sprint/", "哥哥", "kenton", KEN_THEME)
    open(os.path.join(apps, "kenton_english_sprint_quiz.html"), "w", encoding="utf-8").write(kh)
    import re as _re
    def cnt(s): return len(_re.findall(r'kind:"', s))
    print("弟弟: %d 题 / 8 关" % cnt(EDD_LEVELS))
    print("哥哥: %d 题 / 8 关" % cnt(KEN_LEVELS))
