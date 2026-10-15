# -*- coding: utf-8 -*-
"""
按四下语文期末复习索引，提取所有"会默到的东西"，做成专门的【复习默写软件】。
复用已跑通的默写助手引擎 apps/kenton_dictation.html（自动报默读N遍+大倒计时+答案对照点红+
错词档案+一键复制/下载导出）。本脚本只换数据/去英语/加古诗文与名言的"句子默写"模式。
默写内容（来自索引）：
  · 词语表 5~8 单元（按课）+ 人物品质/心情词语 + 读书求学成语
  · 古诗文背默 5 首（按上下联分句）
  · 名言警句 8 句
导出＝家长可见"具体情况"：每次默写的对错、用时、反复错的词句、原始JSON。
输出：apps/kenton_chinese_dictation_review.html
"""
import re, os, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, "apps", "kenton_dictation.html")

# —— 词语（5~8单元课文词语 + 两组主题词；含近期错词所在课）——
CN = {
 "第14课(回炉:凄惨)": ["讨厌","理由","心事","疙瘩","反抗","忠厚","可恶","成绩","警戒","预备","汤圆","凄惨","慈爱"],
 "第15课": ["姿态","高傲","音调","呵斥","叫嚣","局促","京剧","奢侈","一丝不苟","譬如","倘若","从容不迫","侍候","脾气","窥伺","空空如也","供养"],
 "第16课": ["清静","扩大","范围","努力","刹那","夺目","分辨","灿烂"],
 "第17课": ["杜鹃","气势","聚集","拥挤","脚跟","昏暗","挤压","稍微","额角","漆黑","宽广","蜿蜒","石钟乳","石笋","观赏"],
 "第19课": ["芦花","发愣","脊背","劫难","鬼脸","戒指","试探","尸首","防备","慌忙"],
 "第23课": ["战役","战场","持续","占领","轰鸣","射击","突击","枪弹","摧毁","愤怒","注视","光荣","艰巨","炮弹","爆炸","烈火","顽强","不料","规定","惊天动地","消灭"],
 "第24课": ["弥漫","距离","山脉","行驶","起航","葬身","哭泣","混乱","绳索","维持","秩序","岗位","主宰","考虑","灾难"],
 "第26课": ["介绍","声明","妖怪","规矩","胳膊","劈面","龙宫","向日葵"],
 "第27课": ["柔嫩","丰硕","允许","禁止","踪迹","覆盖","呼啸","始终","吼叫","自私","后悔","举动","脸颊","凶狠","拆除","撵走","窟窿"],
 "人物品质·心情词": ["和蔼","谦逊","贤惠","悲戚","临危不惧","彬彬有礼","焦躁不安","心急如焚"],
 "读书求学成语": ["囊萤夜读","悬梁刺股","凿壁偷光","铁杵成针","程门立雪","手不释卷"],
}

# —— 古诗文背默（按上下联/分句；[要写的字, 提示, 报读文本]）——
GUSHI = {
 "芙蓉楼送辛渐": [
  ["寒雨连江夜入吴，平明送客楚山孤。","王昌龄 · 第1句","寒雨连江夜入吴，平明送客楚山孤。"],
  ["洛阳亲友如相问，一片冰心在玉壶。","王昌龄 · 第2句","洛阳亲友如相问，一片冰心在玉壶。"]],
 "塞下曲": [
  ["月黑雁飞高，单于夜遁逃。","卢纶 · 第1句","月黑雁飞高，单于夜遁逃。"],
  ["欲将轻骑逐，大雪满弓刀。","卢纶 · 第2句","欲将轻骑逐，大雪满弓刀。"]],
 "墨梅": [
  ["我家洗砚池头树，朵朵花开淡墨痕。","王冕 · 第1句","我家洗砚池头树，朵朵花开淡墨痕。"],
  ["不要人夸好颜色，只留清气满乾坤。","王冕 · 第2句","不要人夸好颜色，只留清气满乾坤。"]],
 "独坐敬亭山": [
  ["众鸟高飞尽，孤云独去闲。","李白 · 第1句","众鸟高飞尽，孤云独去闲。"],
  ["相看两不厌，只有敬亭山。","李白 · 第2句","相看两不厌，只有敬亭山。"]],
 "囊萤夜读(古文)": [
  ["胤恭勤不倦，博学多通。","《晋书·车胤传》","胤恭勤不倦，博学多通。"],
  ["家贫不常得油，夏月则练囊盛数十萤火以照书，以夜继日焉。","《晋书·车胤传》","家贫不常得油，夏月则练囊盛数十萤火以照书，以夜继日焉。"]],
}

# —— 名言警句 8 句（[句子, 出处提示, 报读]）——
MINGYAN = {
 "名言警句(8句)": [
  ["天行健，君子以自强不息。","《周易》","天行健，君子以自强不息。"],
  ["胜人者有力，自胜者强。","《老子》","胜人者有力，自胜者强。"],
  ["不怨天，不尤人。","《论语》","不怨天，不尤人。"],
  ["生于忧患而死于安乐。","《孟子》","生于忧患而死于安乐。"],
  ["少年不知勤学苦，老来方知读书迟。","劝学","少年不知勤学苦，老来方知读书迟。"],
  ["一日读书一日功，一日不读十日空。","劝学","一日读书一日功，一日不读十日空。"],
  ["学习不怕根底浅，只要迈步终不迟。","劝学","学习不怕根底浅，只要迈步终不迟。"],
  ["书山有路勤为径，学海无涯苦作舟。","韩愈","书山有路勤为径，学海无涯苦作舟。"],
 ],
}

def js(o): return json.dumps(o, ensure_ascii=False)

h = open(BASE, encoding="utf-8").read()

# 1) 数据替换
h = re.sub(r'const CN=\{[\s\S]*?\n\};', 'const CN='+js(CN)+';', h, count=1)
h = re.sub(r'const EN_VOCAB=\{[\s\S]*?\n\};', 'const EN_VOCAB={};\nconst GUSHI='+js(GUSHI)+';\nconst MINGYAN='+js(MINGYAN)+';', h, count=1)
h = re.sub(r'const EN_SENT=\{[\s\S]*?\n\};', 'const EN_SENT={};', h, count=1)
h = re.sub(r'const CN_QUIZ=\{[\s\S]*?\n\};', 'const CN_QUIZ={};', h, count=1)

# 2) startDict：加 S.times，加 gushi/mingyan 模式
old_sd = """  if(mode==='cn'){S.items=CN[key].map(w=>({t:w,hint:'',say:w}));S.lang='zh';}
  else if(mode==='env'){S.items=EN_VOCAB[key].map(p=>({t:p[0],hint:p[1],say:p[0]}));S.lang='en';}
  else{S.items=EN_SENT[key].map(p=>({t:p[0],hint:p[1],say:p[0]}));S.lang='en';}"""
new_sd = """  S.times=3;
  if(mode==='cn'){S.items=CN[key].map(w=>({t:w,hint:'',say:w}));S.lang='zh';}
  else if(mode==='gushi'){S.items=GUSHI[key].map(p=>({t:p[0],hint:p[1],say:p[2]||p[0]}));S.lang='zh';S.times=2;}
  else if(mode==='mingyan'){S.items=MINGYAN[key].map(p=>({t:p[0],hint:p[1],say:p[2]||p[0]}));S.lang='zh';S.times=2;}
  else{S.items=CN[key].map(w=>({t:w,hint:'',say:w}));S.lang='zh';}"""
assert old_sd in h, "startDict 块未匹配"
h = h.replace(old_sd, new_sd)

# 3) runWord：读 S.times 遍
assert "speakTimes(it.say,S.lang,3,null);" in h
h = h.replace("speakTimes(it.say,S.lang,3,null);", "speakTimes(it.say,S.lang,(S.times||3),null);")

# 4) wordSec：句子（古诗/名言）给更长时间
h = re.sub(r'function wordSec\(it\)\{[\s\S]*?\n\}\n',
"""function wordSec(it){
  const w=it.t; const n=[...w].length;
  if(S.mode==='gushi'||S.mode==='mingyan'){ return round05(clamp(8+n*2.2,16,70)); } // 句子:按字数,16~70秒
  return round05(clamp(5.5+n*2,9.5,18)); // 词语
}
""", h, count=1)

# 5) confirmQuit / 归档 subject 统一为语文
h = h.replace("if(S.mode==='cn')showCnList();else showEnList();", "showCnList();")
h = h.replace("subject:(S.mode==='cn'?'cn':'en')", "subject:'cn'")

# 6) showCnList：分区——词语 / 古诗文 / 名言
h = re.sub(r'function showCnList\(\)\{[\s\S]*?\n\}\n',
"""function showCnList(){
  const b=document.getElementById('cnlist');
  const tiles=(obj,mode,unit)=>Object.keys(obj).map(k=>`<div class="lesson" onclick="startDict('${mode}','${esc(k)}')"><div class="t">${k}</div><div class="n">${obj[k].length} ${unit}</div></div>`).join('');
  b.innerHTML=`<button class="back" onclick="goHome()">← 返回</button>
    <div class="card"><h2>📝 词语默写 · 选一课</h2>
    <div class="lead">听一个写一个，每词<b>读三遍</b>、有大倒计时。一课默完<b>对答案：写错的点一下标红</b>，自动进错词本。</div>
    <div class="list">${tiles(CN,'cn','个词')}</div></div>
    <div class="card"><h2>📜 古诗文背默</h2>
    <div class="lead">按句报读（读两遍、时间更长）。写整句，<b>注意易错字</b>。</div>
    <div class="list">${tiles(GUSHI,'gushi','句')}</div></div>
    <div class="card"><h2>🏛️ 名言警句默写</h2>
    <div class="lead">8 句名言，听一句写一句。对答案时记下出处。</div>
    <div class="list">${tiles(MINGYAN,'mingyan','句')}</div></div>`;
  show('cnlist');
}
""", h, count=1)

# 7) 标题/副标题/狮子提示/首页菜单/档案键
h = h.replace("<title>哥哥默写助手 · 语文+英语</title>", "<title>哥哥语文复习默写 · 报默+记录</title>")
h = h.replace('<div style="flex:1"><h1>默写助手</h1><div class="sub">语文词语 · 英语考纲 · 全自动报默</div></div>',
              '<div style="flex:1"><h1>语文复习默写</h1><div class="sub">四下期末索引 · 词语+古诗文+名言 · 全自动报默</div></div>')
h = h.replace('<div class="lion"><div class="face">🦁</div><div class="bubble">默写规则:每个词<b>边听边写</b>(读三遍),时间到自动下一个。一课默完看答案对照——<b>写错的点一下标红,在书上圈出来</b>!另外可以做🧠理解小测,检查是不是真懂。</div></div>',
              '<div class="lion"><div class="face">🦁</div><div class="bubble">我会<b>报默</b>给你听:每个词/句自动读几遍、有大倒计时,时间到自动下一个,<b>不显示答案、不偷看</b>。默完<b>对答案、写错的点红</b>,自动进错词本。爸爸在「学习档案」里能看到你<b>每次默写的具体对错</b>。</div></div>')
h = h.replace('''    <div class="bigmenu">
      <div class="bigtile cn" onclick="showCnList()"><div class="ic">📖</div><div class="nm">语文默写</div><div class="ds">12 课词语 + 理解小测</div></div>
      <div class="bigtile en" onclick="showEnList()"><div class="ic">🔤</div><div class="nm">英语默写</div><div class="ds">单词+句子+中英互译</div></div>
    </div>''',
'''    <div class="bigmenu">
      <div class="bigtile cn" onclick="showCnList()" style="grid-column:1/3"><div class="ic">📝</div><div class="nm">开始默写</div><div class="ds">词语 · 古诗文 · 名言警句（点进去选）</div></div>
    </div>''')
h = h.replace("const AKEY='mx_archive_'+CHILD;", "const AKEY='mx_archive_哥哥_review';")

# 8) 持久『错词本』：只要错过一次就记、连续答对2次才移出；并预置家长确认的8个错字。外观不变(仅档案页/导出新增)
WB_FUNCS = r'''function logEvent(ev){const a=loadArchive();a.events.push(ev);saveArchive(a);cloudUpload(ev);}
/* ===== 错词本(持久):只要错过一次就记,连续答对2次才移出 ===== */
var WBKEY='mx_wrongbook_哥哥_review';
function loadWB(){try{return JSON.parse(localStorage.getItem(WBKEY))||{words:{}};}catch(e){return {words:{}};}}
function saveWB(w){try{localStorage.setItem(WBKEY,JSON.stringify(w));}catch(e){}}
function wbAddWrong(word,hint,lesson){if(!word)return;var wb=loadWB();var w=wb.words[word]||{word:word,hint:hint||'',lesson:lesson||'',wrong:0,streak:0,mastered:false};w.wrong++;w.streak=0;w.mastered=false;if(lesson)w.lesson=lesson;if(hint)w.hint=hint;wb.words[word]=w;saveWB(wb);}
function wbAddRight(word){var wb=loadWB();var w=wb.words[word];if(w&&!w.mastered){w.streak++;if(w.streak>=2)w.mastered=true;wb.words[word]=w;saveWB(wb);}}
function wbAll(){var wb=loadWB();return Object.keys(wb.words).map(function(k){return wb.words[k];});}
function wbActive(){return wbAll().filter(function(w){return !w.mastered;});}
(function(){var seed=[['柔嫩','第27课'],['奢侈','第15课'],['贤惠','人物品质·心情词'],['悲戚','人物品质·心情词'],['临危不惧','人物品质·心情词'],['焦躁不安','人物品质·心情词'],['心急如焚','人物品质·心情词'],['维持','第24课']];var wb=loadWB();var ch=false;seed.forEach(function(s){if(!wb.words[s[0]]){wb.words[s[0]]={word:s[0],hint:'',lesson:s[1],wrong:1,streak:0,mastered:false};ch=true;}});if(ch)saveWB(wb);})();
function startWrongbook(){var list=wbActive();if(!list.length){alert('错词本是空的，太棒了！');return;}S.mode='wb';S.key='错词重做';S.idx=0;S.miss=new Set();S.startTime=Date.now();S.perItem=[];S.times=2;S.lang='zh';S.items=list.map(function(w){return {t:w.word,hint:w.hint||w.lesson||'',say:w.word};});S.itemStart=Date.now();renderDict();show('dict');setTimeout(function(){runWord();},400);}'''
assert "function logEvent(ev){const a=loadArchive();a.events.push(ev);saveArchive(a);cloudUpload(ev);}" in h
h = h.replace("function logEvent(ev){const a=loadArchive();a.events.push(ev);saveArchive(a);cloudUpload(ev);}", WB_FUNCS, 1)

# finishLesson：每个错词入错词本，答对累计连胜
assert "  speakOnce(S.miss.size?('记下了，错词留着再练。'):'真棒，这一课默完了！','zh');" in h
h = h.replace("  speakOnce(S.miss.size?('记下了，错词留着再练。'):'真棒，这一课默完了！','zh');",
              "  items.forEach(function(it){ if(it.ok) wbAddRight(it.word); else wbAddWrong(it.word,it.hint,S.key); });\n  speakOnce(S.miss.size?('记下了，错词留着再练。'):'真棒，这一课默完了！','zh');", 1)

import re as _re
# 档案页：『反复错(≥2)』卡 → 『错词本(错≥1)』卡 + 重默按钮（正则匹配，避开源码里转义的表情/≥）
NEW_ARCH = """(function(){var aw=wbAll();if(!aw.length)return '';var act=aw.filter(function(w){return !w.mastered;});return '<div class="card"><h2 style="color:var(--red)">📕 错词本（错过就记，共'+aw.length+'个）</h2><div class="lead">只要默错过一次就在这里；<b>连续答对2次</b>才算掌握、自动移走。</div><div class="ansgrid">'+aw.map(function(w){return '<div class="answord'+(w.mastered?'':' miss')+'">'+w.word+'<span class="py">'+(w.mastered?'已掌握✓':'错'+w.wrong+'次')+'</span></div>';}).join('')+'</div>'+(act.length?'<div class="row" style="justify-content:flex-start"><button class="btn green sm" onclick="startWrongbook()">🔁 重默错词（'+act.length+'）</button></div>':'<div class="kou">错词都掌握啦，太棒了！</div>')+'</div>';})()+"""
arch_pat = _re.compile(r"\(repeat\.length\?'<div class=\"card\"><h2 style=\"color:var\(--red\)\">.*?</div></div>':''\)\+", _re.S)
h, _n = arch_pat.subn(lambda m: NEW_ARCH, h, count=1)
assert _n == 1, "showArchive 卡未匹配"

# 导出文本：反复错段 → 错词本段(错≥1)
NEW_TXT = ("  var _wb=wbAll();\n"
 "  t+='== 错词本(只要错过一次就记;连续答对2次移出) ==\\n';\n"
 "  t+=_wb.length?_wb.map(function(w){return w.word+(w.lesson?' ['+w.lesson+']':'')+' 错'+w.wrong+'次'+(w.mastered?' 已掌握':'');}).join('\\n'):'(无)';")
txt_pat = _re.compile(r"  t\+='== 反复错的词.*?优先复习\)==\\n';\n  t\+=repeat\.length\?repeat\.map\(.*?:'\(无\)';", _re.S)
h, _n = txt_pat.subn(lambda m: NEW_TXT, h, count=1)
assert _n == 1, "archiveText 段未匹配"

out = os.path.join(ROOT, "apps", "kenton_chinese_dictation_review.html")
open(out, "w", encoding="utf-8").write(h)
nw = sum(len(v) for v in CN.values())
ns = sum(len(v) for v in GUSHI.values())+sum(len(v) for v in MINGYAN.values())
print("生成:", out)
print("词语 %d 个 / %d 课组；古诗文+名言 %d 句" % (nw, len(CN), ns))
