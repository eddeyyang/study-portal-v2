# -*- coding: utf-8 -*-
"""
哥哥 Kenton · 语文期末冲刺复习软件（错题闯关）。
把四下五~八单元试卷错题做成可点选/默写自评的闯关，重点加量：默写、转述句。
复用已跑通闯关引擎 apps/eddey_english_redo_grammar.html（choice自动判分 / self看答案自评 /
write纸上默写 / 错题回炉 / 家长页 / 记录导出 / 音效计时 / audio-first回退TTS）。
输出：apps/kenton_chinese_sprint_quiz.html
"""
import re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, "apps", "eddey_english_redo_grammar.html")

LEVELS = r'''var LEVELS = [
  {id:"yin",name:"字音关",ico:"🔤",tag:"字音",
   intro:'<div class="rule">先看清加点字，选正确读音。易错：颊jiá、刹chà、传(经传)zhuàn、盛名shèng、差(不差)chà。</div>',
   qs:[
    {kind:"choice",q:"脸颊 的「颊」读：",a:"jiá",opts:["jiá","xiá"],explain:"脸颊 jiá。",tag:"字音"},
    {kind:"choice",q:"刹那间 的「刹」读：",a:"chà",opts:["chà","shà"],explain:"刹那 chà。",tag:"字音"},
    {kind:"choice",q:"不见经传 的「传」读：",a:"zhuàn",opts:["zhuàn","chuán"],explain:"经传(典籍)读 zhuàn；广为流传读 chuán。",tag:"字音"},
    {kind:"choice",q:"盛名 的「盛」读：",a:"shèng",opts:["shèng","chéng"],explain:"盛名(名气大) shèng；盛饭读 chéng。",tag:"字音"},
    {kind:"choice",q:"丝毫不差 的「差」读：",a:"chà",opts:["chà","chā"],explain:"不差(不错) chà。",tag:"字音"},
    {kind:"choice",q:"单于 的「单」读：",a:"chán",opts:["chán","dān"],explain:"单于(匈奴首领) chán。",tag:"字音"},
    {kind:"choice",q:"★加点字注音<b>全对</b>的一组：",a:"广为流传chuán、不见经传zhuàn",opts:["广为流传chuán、不见经传zhuàn","脸颊xiá、负载zǎi"],explain:"颊读jiá、负载读zài，所以另一组错。",tag:"字音"}
   ]},
  {id:"xing",name:"字形关",ico:"✏️",tag:"字形",
   intro:'<div class="rule">选没有错别字的写法。乾坤、不解之谜、壮丽、心悦诚服。</div>',
   qs:[
    {kind:"choice",q:"「只留清气满____」正确的是：",a:"乾坤",opts:["乾坤","钱坤"],explain:"乾坤，不是钱坤。",tag:"字形"},
    {kind:"choice",q:"「不解之____」正确的是：",a:"谜",opts:["谜","迷"],explain:"不解之谜(谜团)。",tag:"字形"},
    {kind:"choice",q:"风景壮观，写作：",a:"壮丽",opts:["壮丽","状丽"],explain:"壮丽，不是状丽。",tag:"字形"},
    {kind:"choice",q:"「心悦____服」正确的是：",a:"诚",opts:["诚","城"],explain:"心悦诚服(真诚)。",tag:"字形"}
   ]},
  {id:"bing",name:"病句关",ico:"🩺",tag:"病句",
   intro:'<div class="rule">改病句四类：成分残缺(滥用『通过…使…』丢主语)、搭配不当(养成习惯≠养成风气)、重复啰嗦(大约≈左右)、语序不当(先做的写前面)。</div>',
   qs:[
    {kind:"choice",q:"没有语病的一句是：",a:"我们要养成爱读书的好习惯。",opts:["我们要养成爱读书的好习惯。","我们要养成爱读书的好风气。"],explain:"养成『习惯』、形成『风气』——搭配不当。",tag:"病句"},
    {kind:"choice",q:"下面哪句<b>有</b>语病？",a:"通过这次活动，使我明白了坚持的意义。",opts:["通过这次活动，使我明白了坚持的意义。","这次活动使我明白了坚持的意义。"],explain:"『通过…使…』丢了主语，删去其一。",tag:"病句"},
    {kind:"choice",q:"没有语病的一句是：",a:"他七点左右到的。",opts:["他七点左右到的。","他大约是七点左右到的。"],explain:"『大约』和『左右』重复，删一个。",tag:"病句"},
    {kind:"self",q:"★修改病句：同学们认真地完成并讨论了这道难题。",a:"同学们认真地讨论并完成了这道难题。",explain:"应先讨论后完成——语序不当。",tag:"病句"}
   ]},
  {id:"mo",name:"默写·古诗文关（重点）",ico:"📜",tag:"默写",
   intro:'<div class="rule">★ 先在<b>纸上默写</b>，写好点「看答案」对照，写错的标红——会进错词/错句回炉。注意易错字。</div>',
   qs:[
    {kind:"write",q:"《囊萤夜读》：胤恭勤不倦，____。家贫不常得油，________，以夜继日焉。",a:"博学多通。\n夏月则练囊盛数十萤火以照书。",explain:"易错字：练囊、盛、萤。",tag:"默写"},
    {kind:"write",q:"《芙蓉楼送辛渐》后两句：洛阳亲友如相问，________。",a:"一片冰心在玉壶。",explain:"易错字：冰心、玉壶。",tag:"默写"},
    {kind:"write",q:"《墨梅》后两句：不要人夸好颜色，________。",a:"只留清气满乾坤。",explain:"易错字：乾坤(非钱坤)。",tag:"默写"},
    {kind:"write",q:"《长歌行》最后两句：________，老大徒伤悲。",a:"少壮不努力，老大徒伤悲。",explain:"易错字：壮、悲。",tag:"默写"},
    {kind:"write",q:"《塞下曲》后两句：欲将轻骑逐，________。",a:"大雪满弓刀。",tag:"默写"},
    {kind:"write",q:"《独坐敬亭山》后两句：相看两不厌，________。",a:"只有敬亭山。",tag:"默写"},
    {kind:"write",q:"韩愈治学名联：________，学海无涯苦作舟。",a:"书山有路勤为径，学海无涯苦作舟。",tag:"默写"},
    {kind:"write",q:"★理解性默写：《芙蓉楼送辛渐》中表明诗人坚守高洁节操、不为世俗所染的句子是____，____。",a:"洛阳亲友如相问，一片冰心在玉壶。",explain:"问的是『高洁节操』，对应『冰心在玉壶』。",tag:"默写"},
    {kind:"write",q:"★理解性默写：《长歌行》中劝人珍惜时间、奋发努力的句子是____，____。",a:"少壮不努力，老大徒伤悲。",explain:"问『珍惜时间努力』，对应这两句。",tag:"默写"},
    {kind:"choice",q:"★鉴赏：《墨梅》借『墨梅』表达诗人怎样的品格？",a:"不慕虚名、坚守高洁",opts:["不慕虚名、坚守高洁","喜爱画画、向往富贵"],explain:"借梅自喻，鄙弃世俗、守清白高洁。",tag:"鉴赏"},
    {kind:"choice",q:"★鉴赏：《塞下曲》『大雪满弓刀』表现将士：",a:"不畏严寒、英勇无畏",opts:["不畏严寒、英勇无畏","害怕风雪、想要回家"],explain:"风雪夜追敌，显将士英勇。",tag:"鉴赏"}
   ]},
  {id:"zhuan",name:"转述句关（重点）",ico:"🔁",tag:"转述句",
   intro:'<div class="rule">★ 改转述三步：①冒号引号→逗号；②「我/我们」→说话人，「你/你们」→听话人；③问句/命令/感叹改陈述语气；时间词 今天→那天、明天→第二天。</div>',
   qs:[
    {kind:"choice",q:"「营参谋长对黄继光说：『我相信你能完成任务。』」改对的是：",a:"营参谋长对黄继光说，他相信黄继光能完成任务。",opts:["营参谋长对黄继光说，他相信黄继光能完成任务。","营参谋长对黄继光说，我相信你能完成任务。"],explain:"我→他(营参谋长)，你→黄继光，去掉冒号引号。",tag:"转述句"},
    {kind:"choice",q:"「妈妈对我说：『你今天要早点回家。』」改对的是：",a:"妈妈对我说，我那天要早点回家。",opts:["妈妈对我说，我那天要早点回家。","妈妈对我说，你今天要早点回家。"],explain:"你→我；今天→那天。",tag:"转述句"},
    {kind:"choice",q:"「父亲对我说：『我明天带你去看双龙洞。』」改对的是：",a:"父亲对我说，他第二天带我去看双龙洞。",opts:["父亲对我说，他第二天带我去看双龙洞。","父亲对我说，他明天带我去看双龙洞。"],explain:"我→他、你→我、明天→第二天。",tag:"转述句"},
    {kind:"choice",q:"「雨来说：『我们爱自己的祖国。』」改对的是：",a:"雨来说，他们爱自己的祖国。",opts:["雨来说，他们爱自己的祖国。","雨来说，我们爱自己的祖国。"],explain:"我们→他们。",tag:"转述句"},
    {kind:"choice",q:"下面哪一句转述<b>改错了</b>？",a:"老师说，我教你做这道题。",opts:["老师说，我教你做这道题。","老师说，他教小明做这道题。"],explain:"转述要把『我、你』改成第三人称——没改的那句错了。",tag:"转述句"},
    {kind:"choice",q:"「同桌对我说：『我把这本书借给你。』」改对的是：",a:"同桌对我说，他把那本书借给我。",opts:["同桌对我说，他把那本书借给我。","同桌对我说，他把这本书借给你。"],explain:"我→他、你→我、这→那。",tag:"转述句"},
    {kind:"self",q:"把引述改转述：黄继光坚定地说：「我一定要拿下零号阵地。」",a:"黄继光坚定地说，他一定要拿下零号阵地。",explain:"我→他。",tag:"转述句"},
    {kind:"self",q:"把引述改转述：哈尔威船长大声吼道：「大家安静，让妇女先走！」",a:"哈尔威船长大声吼道，让大家安静，让妇女先走。",explain:"命令/感叹改成陈述语气，意思不变。",tag:"转述句"},
    {kind:"self",q:"把引述改转述：渔夫对桑娜说：「你看着办吧。」",a:"渔夫对桑娜说，让她看着办。",explain:"你→她。",tag:"转述句"},
    {kind:"self",q:"★反问改陈述：这么重的箱子，难道一个人搬得动吗？",a:"这么重的箱子，一个人搬不动。",explain:"去掉『难道…吗』，意思反过来说(肯定↔否定)。",tag:"转述句"},
    {kind:"self",q:"★缩句：英勇的黄继光顽强地爬向敌人的火力点。",a:"黄继光爬向火力点。",explain:"去掉修饰语，只留主干『谁＋干什么』。",tag:"转述句"},
    {kind:"self",q:"★扩句(至少两处)：战士爬向阵地。",a:"示例：英勇的战士顽强地爬向敌人的阵地。",explain:"在主干上加修饰语，使句子更具体。",tag:"转述句"},
    {kind:"self",q:"★句子排序(填序号)：①后来他成了博学多才的人。②车胤小时候家里很穷。③他捉来萤火虫借光读书。④买不起灯油，晚上没法看书。⑤一个夏夜，他看见点点流萤。",a:"②④⑤③①",explain:"按『家穷→没油→见萤→借光读→成才』顺序。",tag:"排序"}
   ]},
  {id:"wen",name:"文言文关·囊萤夜读",ico:"📖",tag:"文言文",
   intro:'<div class="rule">原文：胤恭勤不倦，博学多通。家贫不常得油，夏月则练囊盛数十萤火以照书，以夜继日焉。文言用『组词法』推字义、看注释、补省略。</div>',
   qs:[
    {kind:"choice",q:"「博学多通」的「通」意思是：",a:"通晓",opts:["通晓","通过"],explain:"通=通晓、精通。",tag:"文言文"},
    {kind:"choice",q:"「练囊盛数十萤火」的「盛」意思是：",a:"装",opts:["装","茂盛"],explain:"盛=装(把萤火虫装进口袋)。",tag:"文言文"},
    {kind:"choice",q:"「练囊」指：",a:"白绢做的口袋",opts:["白绢做的口袋","练习的本子"],explain:"练=白绢，囊=口袋。",tag:"文言文"},
    {kind:"self",q:"★翻译：夏月则练囊盛数十萤火以照书。",a:"夏天就用白绢口袋装上几十只萤火虫，用来照亮书本(读书)。",explain:"逐字落实：夏月=夏天、则=就、以=用来。",tag:"文言文"},
    {kind:"self",q:"★给句子划一处朗读停顿：家贫不常得油。",a:"家贫／不常得油。",explain:"主语『家贫』后停顿。",tag:"文言文"}
   ]},
  {id:"wenxue",name:"文学常识关",ico:"📚",tag:"文学常识",
   intro:'<div class="rule">作者↔作品要记牢。</div>',
   qs:[
    {kind:"choice",q:"《海上日出》的作者是：",a:"巴金",opts:["巴金","叶圣陶"],explain:"巴金《海上日出》。",tag:"文学常识"},
    {kind:"choice",q:"《记金华的双龙洞》的作者是：",a:"叶圣陶",opts:["叶圣陶","巴金"],explain:"叶圣陶《记金华的双龙洞》。",tag:"文学常识"},
    {kind:"choice",q:"《海的女儿》《卖火柴的小女孩》的作者是：",a:"安徒生",opts:["安徒生","王尔德"],explain:"安徒生，被称为「世界童话之王」。",tag:"文学常识"},
    {kind:"choice",q:"安徒生是哪国人？",a:"丹麦",opts:["丹麦","英国"],explain:"安徒生是丹麦人。",tag:"文学常识"},
    {kind:"choice",q:"《诺曼底号遇难记》的作者是：",a:"雨果",opts:["雨果","王尔德"],explain:"雨果(法国)《诺曼底号遇难记》。",tag:"文学常识"}
   ]},
  {id:"zonghe",name:"综合关·比喻/字义/判断",ico:"🧩",tag:"综合",
   intro:'<div class="rule">比喻句要有「本体+像/好似+喻体」；多义字看语境。</div>',
   qs:[
    {kind:"choice",q:"下面<b>不是</b>比喻句的一项：",a:"人们凝视着那尊黑色的雕像徐徐沉入大海。",opts:["人们凝视着那尊黑色的雕像徐徐沉入大海。","子弹像冰雹一样射来。"],explain:"没有「像/好似+喻体」的不是比喻。",tag:"综合"},
    {kind:"choice",q:"「奇观」的「观」意思是：",a:"景象",opts:["景象","看"],explain:"奇观=罕见的景象。",tag:"综合"},
    {kind:"choice",q:"判断：「子弹像冰雹一样射来」用了打比方，写出子弹又多又猛。",a:"对",opts:["对","错"],explain:"是比喻(打比方)，对。",tag:"综合"},
    {kind:"choice",q:"★「密密的稻穗笑弯了腰」用的修辞是：",a:"拟人",opts:["拟人","比喻"],explain:"把稻穗当人写(会『笑』、会『弯腰』)，是拟人。",tag:"综合"}
   ]},
  {id:"biaoda",name:"表达关·阅读答题/仿写",ico:"📝",tag:"表达",
   intro:'<div class="rule">主观题要「按点答」：先写品质词/观点，再举原文事例，至少两点。</div>',
   qs:[
    {kind:"self",q:"小仲马是个怎样的人？结合短文内容写一写(至少两点)。",a:"参考：①自强自立——用笔名投稿、不靠父亲名气；②坚持不懈——面对多次退稿仍坚持创作。",explain:"先写品质词，再举短文里的事例做依据。",checklist:["先写品质词","再举原文事例","至少两点","句子通顺"],tag:"表达"},
    {kind:"self",q:"照样子写一组连续动作(用上3-4个动词)：他抓住窗框，踩着车厢，攀上窗口。",a:"示例：我放下书包，倒了一杯水，坐到书桌前，打开了作业本。",explain:"动词要连贯、写清顺序。",checklist:["3个以上动词","动作连贯有顺序","句子通顺"],tag:"表达"},
    {kind:"self",q:"★口语交际：同桌觉得练字太枯燥想放弃，请你劝劝他(用上一句名言)。",a:"参考：别放弃呀！『书山有路勤为径』，练字也一样，每天坚持练一点，一定能写得越来越好。",explain:"有称呼+讲道理+引名言+鼓励，有礼貌。",checklist:["有称呼","讲清道理","引用一句名言","语气有礼貌"],tag:"口语交际"}
   ]},
  {id:"huilu",name:"错题回炉关",ico:"🔥",tag:"",dynamic:true,
   intro:'<div class="rule">这一关收集你<b>刚才做错的题</b>，再练一遍！</div>'}
];'''

ADVICE = r'''var TAG_ADVICE = {
  "字音":"多音字放回词语读：传(经传zhuàn/流传chuán)、盛(shèng/chéng)、差(chà/chā)。",
  "字形":"易错字逐个圈部件：乾坤、谜、壮丽、诚。",
  "默写":"每天默写一两首，错字订正两遍，重点盯易错字(乾坤/冰心/练囊/萤)。",
  "转述句":"三步：标点→逗号；我你→第三人称/听话人；问句命令改陈述；时间词today→那天。",
  "文学常识":"作者↔作品做成连线卡片反复记。",
  "综合":"比喻句看有没有『像/好似+喻体』；多义字看语境；拟人=把物当人写。",
  "表达":"主观题先写观点/品质词，再举原文事例，至少两点。",
  "病句":"四看：成分残缺(通过…使…)、搭配不当、重复啰嗦、语序不当。",
  "文言文":"组词法推字义、看注释、补省略；翻译逐字落实。",
  "鉴赏":"抓意象+情感/品格：墨梅=高洁，塞下曲=英勇。",
  "排序":"按事情发展/时间先后理顺序。",
  "口语交际":"有称呼+讲道理+引名言+有礼貌。"
};'''

PARENT = '''        默写/积累：囊萤夜读、芙蓉楼送辛渐、墨梅、长歌行、塞下曲、韩愈名联、文学常识10组<br>
        重点：转述句(人称/标点/语气/时间词)、字音字形、比喻句辨析<br>
        表达：人物品质题按点答(品质词+事例≥2点)、仿写连续动作'''

THEME = [
 ("--eddey:#ff8a5b;--eddeyd:#e8643a;--eddeybg:#fff0e6;", "--eddey:#2f6fb3;--eddeyd:#225182;--eddeybg:#e8f0fa;"),
 ("radial-gradient(circle at 12% 6%,#ffe1cc 0,transparent 42%),radial-gradient(circle at 90% 96%,#ffe9c8 0,transparent 42%)",
  "radial-gradient(circle at 12% 6%,#cfe2f6 0,transparent 42%),radial-gradient(circle at 90% 96%,#dbeafe 0,transparent 42%)"),
 ("box-shadow:0 6px 0 #f3e2d6", "box-shadow:0 6px 0 #d6e4f3"),
 ("box-shadow:0 5px 0 #f3e2d6", "box-shadow:0 5px 0 #d6e4f3"),
 ("box-shadow:0 4px 0 #f3e2d6", "box-shadow:0 4px 0 #d6e4f3"),
 ("box-shadow:0 3px 0 #f0d8c8", "box-shadow:0 3px 0 #c8dbf0"),
]

h = open(BASE, encoding="utf-8").read()
h = re.sub(r'var LEVELS = \[.*?\n\];', lambda m: LEVELS, h, count=1, flags=re.S)
h = re.sub(r'var TAG_ADVICE = \{.*?\n\};', lambda m: ADVICE, h, count=1, flags=re.S)
h = h.replace('<title>弟弟英语错点专项</title>', '<title>哥哥语文期末冲刺复习</title>')
h = h.replace('<span class="badge">英语错点</span>', '<span class="badge">语文冲刺</span>')
h = h.replace('<h1 id="topTitle">弟弟英语错点专项</h1>', '<h1 id="topTitle">哥哥语文期末冲刺</h1>')
h = h.replace('英语错点专项练 🎯（6.15老师讲评）', '语文期末冲刺 · 错题闯关 🎯（四下五~八单元）')
h = h.replace('把老师讲评的5个点练熟：单复数标志词、一般现在时、oo短音、after class/school、运动不+play。<b>点选为主</b>，每题有讲解。',
              '把五六七八单元卷里你<b>最常错的点</b>练熟：默写、转述句为重点；选择题自动判分，默写/转述/表达题先做再看答案对照。错的自动进「错题回炉关」。')
h = h.replace('''        默写：词语表(P122-123)、《溪边》、《火烧云》3-6段、日积月累(P84/P96/P115)<br>
        知识点：多音字、仿写词句、加点词、写具体、有趣开头、寻物启事、拟声词、有趣题目、转述句<br>
        习作：写人记事 + 想象作文（约350字）''', PARENT)
h = h.replace('var STORE_KEY="eddey_en_redo_v1";', 'var STORE_KEY="kenton_cn_sprint_v1";')
h = h.replace('var AUDIO_DIR="audio/eddey_chinese/";', 'var AUDIO_DIR="audio/kenton_chinese_sprint_quiz/";')
h = h.replace('lines.push("【弟弟英语错点专项档案】导出时间:"+fmt(Date.now()));',
              'lines.push("【哥哥语文期末冲刺档案】导出时间:"+fmt(Date.now()));')
h = h.replace('lines.push(JSON.stringify({child:"弟弟",subject:"英语错点专项",events:s.events}));',
              'lines.push(JSON.stringify({child:"哥哥",subject:"语文期末冲刺",events:s.events}));')
h = h.replace('a.download="弟弟英语错点记录_"+stamp()+".txt";', 'a.download="哥哥语文冲刺记录_"+stamp()+".txt";')
h = h.replace('var EB_KID="eddey"; /* 本App为「弟弟」→ eddey */', 'var EB_KID="kenton";')
h = h.replace('var EB_SUBJECT="语文"; /* 全语文App,内部 cn → 语文 */', 'var EB_SUBJECT="语文";')
for a, b in THEME:
    assert a in h, "theme anchor missing: " + a[:30]
    h = h.replace(a, b)

out = os.path.join(ROOT, "apps", "kenton_chinese_sprint_quiz.html")
open(out, "w", encoding="utf-8").write(h)
n = len(re.findall(r'kind:"', LEVELS))
print("生成:", out, "题数", n)
