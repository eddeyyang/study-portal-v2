# -*- coding: utf-8 -*-
"""
哥哥 Kenton · 语文一课一练·增强版（四下 五~八单元 冲刺）· 加难版。
标准（CLAUDE.md「出题难度与格式标准」）：对标《一课一练·增强版》，讲练合一。
本版在上一版基础上再加难：新增 病句修改、句子排序、扩句、古诗鉴赏、
课内文言文阅读《囊萤夜读》(字义/翻译/断句/启示)、口语交际，并保留理解性默写、转述句进阶。
每板块：【方法点拨】→【例·带解析】→【练：基础→巩固→拔高★】；末页答案与解析。
输出：papers/语文期末冲刺卷_哥哥Kenton.pdf
"""
import fitz, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "papers")

CSS = """
* { font-family: sans-serif; }
body { font-size: 10.6pt; line-height: 1.6; color:#1a1a1a; }
h1 { font-size: 17pt; margin: 0 0 2pt 0; }
.sub { color:#555; font-size:9.2pt; margin:0 0 6pt 0; }
.lead { font-size:9.2pt; color:#444; background:#eef3f9; border:1px solid #d6e3f0; border-radius:6px; padding:5pt 9pt; margin:3pt 0 7pt 0; }
h2 { font-size: 12.5pt; margin: 12pt 0 4pt 0; padding:4pt 9pt; color:#fff; background:#2f6fb3; border-radius:6px; }
h2.ans { background:#7a7a7a; }
.method { background:#fff8e8; border:1px solid #f0dca8; border-radius:6px; padding:5pt 9pt; margin:4pt 0; font-size:9.4pt; }
.method b { color:#a8730a; }
.eg { background:#eef7ef; border:1px solid #cce6d2; border-radius:6px; padding:5pt 9pt; margin:4pt 0; font-size:9.6pt; }
.eg .l { font-weight:bold; color:#1a7f37; }
.wen { background:#f6f1fb; border:1px solid #ddcdec; border-radius:6px; padding:6pt 10pt; margin:4pt 0; font-size:10pt; line-height:1.9; }
.q { margin:6pt 0; }
.qn { font-weight:bold; color:#2f6fb3; }
.star { color:#d4380d; font-weight:bold; }
ol { margin:3pt 0; padding-left:20pt; }
li { margin:5pt 0; }
.ans-body { font-size:9.4pt; color:#333; }
.lab { font-weight:bold; color:#b35900; }
"""
L = "＿＿＿＿＿＿＿＿＿＿＿＿"
LL = "＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿"

def render(html, path):
    story = fitz.Story(html=html, user_css=CSS)
    MED = fitz.paper_rect("a4"); where = MED + (40, 36, -40, -40)
    w = fitz.DocumentWriter(path); more = 1
    while more:
        dev = w.begin_page(MED); more, _ = story.place(where); story.draw(dev); w.end_page()
    w.close()
    d = fitz.open(path); n = d.page_count; d.close(); return n

S = '<span class="star">★拔高</span>'
h = []
h.append('<h1>哥哥 Kenton · 语文一课一练 · 增强版（加难）</h1>')
h.append('<p class="sub">四年级下 · 五~八单元冲刺 ｜ 讲练合一 · 基础→巩固→拔高★ ｜ 姓名：____ 日期：____ 得分：____</p>')
h.append('<div class="lead">用法：每板块先看<b>【方法点拨】【例·解析】</b>，再做<b>【练】</b>（★为拔高/拓展题）。独立完成，再用末页<b>「答案与解析」</b>订正，错题订正两遍。本卷按《一课一练·增强版》难度命题，含病句、排序、文言文阅读、古诗鉴赏等综合题型。</div>')

# 一、字音字形
h.append('<h2>一、字音字形</h2>')
h.append('<div class="method"><b>【方法点拨】</b>多音字"音随义变"：传 chuán(流传)/zhuàn(经传)；盛 shèng(盛名)/chéng(盛饭)；差 chà(不差)/chā(差别)/chāi(出差)；载 zài(负载)/zǎi(记载)。形近同音字看部首与义：乾坤(乾 qián)≠钱；谜(言字旁)≠迷。</div>')
h.append('<div class="q"><span class="qn">1.（基础）</span>用「√」选读音：脸颊(jiá／xiá)　刹那(chà／shà)　倔强(jué／juè)　单于(dān／chán)</div>')
h.append('<div class="q"><span class="qn">2.（巩固）</span>加点字注音<b>全对</b>的一组是（　）　A. 脸颊(xiá) 刹那(chà)　B. 倔强(juè) 单于(chán)　C. 负载(zǎi) 盛名(chéng)　D. 广为流传(chuán) 不见经传(zhuàn)</div>')
h.append('<div class="q"><span class="qn">3.（' + S + '）</span>下面句子有两个注音错误，圈出并改正：<br>这件事广为流传(zhuàn)，他却不见经传(chuán)；面对盛名(chéng)，他丝毫不差(chà)。　改正：____</div>')

# 二、词语·积累运用（含病句）
h.append('<h2>二、词语 · 积累运用</h2>')
h.append('<div class="method"><b>【方法点拨】</b>近义词看"程度＋搭配"；关联词先判关系。<b>改病句</b>常见四类：成分残缺(滥用"通过…使…"丢主语)、搭配不当(养成习惯≠养成风气)、重复啰嗦(大约≈左右)、语序不当(先做的写在前)。</div>')
h.append('<div class="q"><span class="qn">1.（基础）</span>改错别字：钱坤(　)　不解之迷(　)　状丽(　)　心悦城服(　)</div>')
h.append('<div class="q"><span class="qn">2.（巩固）</span>选词填空（焦躁不安／心急如焚）：①离交卷只剩两分钟，他还有一题没写，____。　②等不到孩子消息，妈妈在屋里走来走去，____。</div>')
h.append('<div class="q"><span class="qn">3.（巩固）</span>填关联词：①（　）明天下雨，运动会（　）改期。　②（　）他平时肯下功夫，（　）成绩名列前茅。</div>')
h.append('<div class="q"><span class="qn">4.（' + S + '）</span>修改病句（在原句上改）：<br>'
 '①我们要养成爱读书的好风气。' + L + '<br>'
 '②通过这次活动，使我明白了坚持的意义。' + L + '<br>'
 '③同学们认真地完成并讨论了这道难题。' + L + '</div>')

# 三、古诗文·理解性默写 + 鉴赏
h.append('<h2>三、古诗文 · 理解性默写 + 鉴赏（重点）</h2>')
h.append('<div class="method"><b>【方法点拨】</b>理解性默写＝按"提示语境"填句，抓主旨句/诗眼；写完查易错字(乾坤/冰心/萤/练囊/悲)。鉴赏题：抓<b>意象＋情感/品格</b>。</div>')
h.append('<div class="eg"><span class="l">【例】</span>《墨梅》借梅花表明不慕虚名、只求高洁的句子是：____，____。<b>解析：</b>不要人夸好颜色，只留清气满乾坤。</div>')
h.append('<ol>'
 '<li>《芙蓉楼送辛渐》中表明诗人坚守高洁节操、不为世俗所染的句子：____，____。</li>'
 '<li>《长歌行》中劝人珍惜时间、奋发努力的句子：____，____。</li>'
 '<li>《塞下曲》中表现将士顶风冒雪、英勇追敌的句子：____，____。</li>'
 '<li>《独坐敬亭山》中以山为伴、写出诗人孤独又超脱的句子：____，____。</li>'
 '<li>治学名联（韩愈）：____，学海无涯苦作舟。</li>'
 '<li>文学常识：《海上日出》—(　)；《记金华的双龙洞》—(　)；《诺曼底号遇难记》—(　)；《海的女儿》—(　)，(　)国，称"____"。</li>'
 '<li>（' + S + '·鉴赏）《墨梅》借"墨梅"表达了诗人怎样的志向品格？____</li>'
 '<li>（' + S + '·鉴赏）《塞下曲》"大雪满弓刀"描绘了怎样的画面、表现将士怎样的形象？____</li>'
 '</ol>')

# 四、句子·句式变换（转述/反问/缩句/扩句/排序）
h.append('<h2>四、句子 · 句式变换（重点）</h2>')
h.append('<div class="method"><b>【方法点拨】</b>① 改转述三步：标点→逗号；"我/你"→说话人/听话人；问句命令感叹改陈述；指示词变(今天→那天、明天→第二天、这→那)。② 反问改陈述：去"难道…吗/怎么…呢"，意思反着说。③ 缩句留主干"谁＋干什么"；扩句加修饰。</div>')
h.append('<div class="eg"><span class="l">【例】</span>父亲对我说："我明天带你去看双龙洞。"→ 父亲对我说，他第二天带我去看双龙洞。<b>解析：</b>我→他、你→我、明天→第二天。</div>')
h.append('<ol>'
 '<li>营参谋长对黄继光说："我相信你能完成任务。"（改转述）<br>' + LL + '</li>'
 '<li>妈妈对我说："你今天要把作业做完。"（改转述，注意时间词）<br>' + LL + '</li>'
 '<li>哈尔威船长大声吼道："大家安静，让妇女先走！"（改转述）<br>' + LL + '</li>'
 '<li>（反问改陈述）这么重的箱子，难道一个人搬得动吗？<br>' + LL + '</li>'
 '<li>（缩句）英勇的黄继光顽强地爬向敌人的火力点。<br>' + L + '</li>'
 '<li>（' + S + '·扩句，至少两处）战士爬向阵地。<br>' + LL + '</li>'
 '<li>（' + S + '·句子排序）把下列句子排成通顺的一段话，填序号：____<br>'
 '①后来，他成了博学多才的人。②车胤小时候家里很穷。③他捉来萤火虫，借着光读书。④买不起灯油，晚上没法看书。⑤一个夏夜，他看见院子里点点流萤。</li>'
 '</ol>')

# 五、文言文阅读（课内·增强）
h.append('<h2>五、文言文阅读《囊萤夜读》（课内 · 增强）</h2>')
h.append('<div class="method"><b>【方法点拨】</b>文言看注释、用"组词法"推字义、联系上下文；翻译要把每个字落实、补出省略。</div>')
h.append('<div class="wen">胤／恭勤不倦，博学多通。家贫／不常得油，夏月／则练囊盛数十萤火／以照书，以夜继日焉。</div>')
h.append('<ol>'
 '<li>解释加点字：恭勤(　　)　倦(　　)　通(　　)　盛(　　)　练囊(　　　)　以(　　)</li>'
 '<li>用现代汉语翻译句子：夏月则练囊盛数十萤火以照书。<br>' + LL + '</li>'
 '<li>（' + S + '）用"／"给下面句子划一处朗读停顿：家 贫 不 常 得 油。</li>'
 '<li>（' + S + '）车胤"夜以继日"地读书，靠的是什么？这个故事给你什么启示？<br>' + LL + '</li>'
 '</ol>')

# 六、课外阅读（梯度设问）
h.append('<h2>六、课外阅读《萤囊苦读》（梯度设问）</h2>')
h.append('<div class="method"><b>【方法点拨】</b>先读题再读文、回原文圈证据；概括"谁＋做什么＋结果"；赏析点明写法＋作用；开放题＝观点＋理由＋联系自己。</div>')
h.append('<div class="eg">　　东晋的车胤，小时候家里穷，买不起灯油。一个夏夜，他看见院子里点点流萤一闪一闪，忽然想到：把萤火虫装进口袋，不就有了一盏"灯"吗？于是他捉来几十只萤火虫，装进白绢做的小口袋里，借着那微弱的光读书，夜以继日。后来，车胤成了博学多才的人。<u>一只小小的萤火虫，照亮的不只是书页，更是一个不肯向困难低头的少年。</u></div>')
h.append('<ol>'
 '<li>（基础）"夜以继日"在文中的意思是：____。</li>'
 '<li>（巩固·概括）用一句话概括短文主要内容：____。</li>'
 '<li>（巩固·赏析）画线句好在哪里？简要说一说：____。</li>'
 '<li>（' + S + '·开放）结合你的学习，说说车胤的故事给你的启发：<br>' + LL + '</li>'
 '</ol>')

# 七、语言运用·口语交际+小练笔
h.append('<h2>七、语言运用 · 口语交际 + 小练笔</h2>')
h.append('<div class="method"><b>【方法点拨】</b>口语交际要"有称呼、讲道理、有礼貌"，可引一句名言；写连续动作按顺序、动词准确，可加比喻。</div>')
h.append('<div class="q"><span class="qn">1.（' + S + '·口语交际）</span>同桌觉得练字太枯燥，想放弃。请你劝劝他（用上一句与"坚持/勤奋"有关的名言）：<br>' + LL + '</div>')
h.append('<div class="q"><span class="qn">2.（巩固·仿写）</span>照样子写一组连续动作（≥4个动词）。例：他抓住窗框，踩着车厢，攀上了窗口。<br>我：' + LL + '</div>')
h.append('<div class="q"><span class="qn">3.（' + S + '·小练笔，50字内）</span>用上<b>两个连续动作</b>和<b>一个比喻</b>，写"妈妈下班回家"的片段：<br>' + LL + LL + '</div>')

# 答案与解析
h.append('<h2 class="ans">答案与解析（家长核对用）</h2>')
h.append('<div class="ans-body">')
h.append('<p><span class="lab">一、字音字形</span> 1. jiá/chà/jué/chán。 2. <b>D</b>。 3. 流传应读 chuán、经传应读 zhuàn（句中标反了）；盛名 shèng、不差 chà 正确。</p>')
h.append('<p><span class="lab">二、词语</span> 1. 乾坤/不解之谜/壮丽/心悦诚服。 2. ①心急如焚 ②焦躁不安。 3. ①如果…就… ②因为…所以…。 '
 '4. ①养成爱读书的好<b>习惯</b>（或：形成…好风气）；②删去"通过"或"使"（补出主语）；③认真地<b>讨论并完成</b>了（先讨论后完成，调语序）。</p>')
h.append('<p><span class="lab">三、默写+鉴赏</span> 1. 洛阳亲友如相问，一片冰心在玉壶。 2. 少壮不努力，老大徒伤悲。 3. 欲将轻骑逐，大雪满弓刀。 '
 '4. 相看两不厌，只有敬亭山。 5. 书山有路勤为径。 6. 巴金；叶圣陶；雨果；安徒生，丹麦，"世界童话之王"。 '
 '7. 借梅花自喻，表达不慕虚名、鄙弃世俗、坚守清白高洁的志向。 8. 描绘风雪之夜将士披雪追敌的画面，表现将士不畏严寒、英勇无畏的形象。</p>')
h.append('<p><span class="lab">四、句子</span> 1. 营参谋长对黄继光说，他相信黄继光能完成任务。 2. 妈妈对我说，我那天要把作业做完。 '
 '3. 哈尔威船长大声吼道，让大家安静，让妇女先走。 4. 这么重的箱子，一个人搬不动。 5. 黄继光爬向火力点。 '
 '6. 示例：英勇的战士顽强地爬向敌人的阵地（加修饰即可）。 7. <b>②④⑤③①</b>。</p>')
h.append('<p><span class="lab">五、文言文</span> 1. 恭勤=肃敬勤勉；倦=疲倦；通=通晓；盛=装；练囊=白绢做的口袋；以=用来。 '
 '2. 夏天就用白绢口袋装上几十只萤火虫，用来照亮书本（读书）。 3. 家贫／不常得油。 '
 '4. 靠勤奋好学、肯动脑想办法克服困难；启示：再难也要想办法坚持学习（言之成理）。</p>')
h.append('<p><span class="lab">六、课外阅读</span> 1. 日夜不停。 2. 车胤幼时家贫，借萤火虫的光夜以继日读书，终成博学之人。 '
 '3. 用"不只是…更是…"递进，由"照亮书页"升华到"照亮不肯向困难低头的少年"，点明并赞扬其刻苦不屈的精神。 4. 开放，观点+理由+联系自己。</p>')
h.append('<p><span class="lab">七、语言运用</span> 1. 有称呼+劝说+名言（如"书山有路勤为径"），合理即可。 2. 动词≥4、连贯。 3. 含两个连续动作+一个比喻、通顺即可。</p>')
h.append('</div>')

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    p = os.path.join(OUT, "语文期末冲刺卷_哥哥Kenton.pdf")
    n = render("\n".join(h), p)
    print("生成:", p, n, "页")
