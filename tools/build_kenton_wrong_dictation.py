# -*- coding: utf-8 -*-
"""
哥哥·只默错的（错词专默）：内容只放他之前默错的词/句，连续默对2次自动从错词本消失。
复用默写助手引擎 apps/kenton_dictation.html（自动报默+大倒计时+答案对照点红+错词本+导出）。
错词来源：data/learning/dictation_kenton_review_2026-06-19.json（家长核对的真错，剔除误标窟窿/爆炸）。
输出：apps/kenton_wrong_dictation.html
"""
import re, os, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 用 git 历史里的『原始』默写引擎(未注入错词本前)做底，避免与已注入版重复
BASE = "/tmp/kenton_dictation_orig.html"
if not os.path.exists(BASE):
    BASE = os.path.join(ROOT, "apps", "kenton_dictation.html")

# 错词（词语/成语）
CN = {"错词·词语(默错过的)": ["柔嫩","奢侈","贤惠","悲戚","临危不惧","焦躁不安","心急如焚","维持","悬梁刺股","凿壁偷光"]}
# 错句（古诗/名言）——用句子模式：读2遍、时间更长
GUSHI = {"错句·古诗名言(默错过的)": [
  ["欲将轻骑逐，大雪满弓刀。","塞下曲·卢纶","欲将轻骑逐，大雪满弓刀。"],
  ["不怨天，不尤人。","《论语》","不怨天，不尤人。"]]}
MINGYAN = {}

def js(o): return json.dumps(o, ensure_ascii=False)
h = open(BASE, encoding="utf-8").read()

# 1) 数据
h = re.sub(r'const CN=\{[\s\S]*?\n\};', 'const CN='+js(CN)+';', h, count=1)
h = re.sub(r'const EN_VOCAB=\{[\s\S]*?\n\};', 'const EN_VOCAB={};\nconst GUSHI='+js(GUSHI)+';\nconst MINGYAN='+js(MINGYAN)+';', h, count=1)
h = re.sub(r'const EN_SENT=\{[\s\S]*?\n\};', 'const EN_SENT={};', h, count=1)
h = re.sub(r'const CN_QUIZ=\{[\s\S]*?\n\};', 'const CN_QUIZ={};', h, count=1)

# 2) startDict：S.times + gushi/mingyan
old_sd = """  if(mode==='cn'){S.items=CN[key].map(w=>({t:w,hint:'',say:w}));S.lang='zh';}
  else if(mode==='env'){S.items=EN_VOCAB[key].map(p=>({t:p[0],hint:p[1],say:p[0]}));S.lang='en';}
  else{S.items=EN_SENT[key].map(p=>({t:p[0],hint:p[1],say:p[0]}));S.lang='en';}"""
new_sd = """  S.times=3;
  if(mode==='cn'){S.items=CN[key].map(w=>({t:w,hint:'',say:w}));S.lang='zh';}
  else if(mode==='gushi'){S.items=GUSHI[key].map(p=>({t:p[0],hint:p[1],say:p[2]||p[0]}));S.lang='zh';S.times=2;}
  else if(mode==='mingyan'){S.items=MINGYAN[key].map(p=>({t:p[0],hint:p[1],say:p[2]||p[0]}));S.lang='zh';S.times=2;}
  else{S.items=CN[key].map(w=>({t:w,hint:'',say:w}));S.lang='zh';}"""
assert old_sd in h
h = h.replace(old_sd, new_sd)
h = h.replace("speakTimes(it.say,S.lang,3,null);", "speakTimes(it.say,S.lang,(S.times||3),null);")

# 3) wordSec：句子更长
h = re.sub(r'function wordSec\(it\)\{[\s\S]*?\n\}\n',
"""function wordSec(it){
  const w=it.t; const n=[...w].length;
  if(S.mode==='gushi'||S.mode==='mingyan'){ return round05(clamp(8+n*2.2,16,70)); }
  return round05(clamp(5.5+n*2,9.5,18));
}
""", h, count=1)

# 4) 统一返回语文列表 + 归档 subject
h = h.replace("if(S.mode==='cn')showCnList();else showEnList();", "showCnList();")
h = h.replace("subject:(S.mode==='cn'?'cn':'en')", "subject:'cn'")

# 5) showCnList：只显示有内容的分区
h = re.sub(r'function showCnList\(\)\{[\s\S]*?\n\}\n',
"""function showCnList(){
  const b=document.getElementById('cnlist');
  const tiles=(obj,mode,unit)=>Object.keys(obj).map(k=>`<div class="lesson" onclick="startDict('${mode}','${esc(k)}')"><div class="t">${k}</div><div class="n">${obj[k].length} ${unit}</div></div>`).join('');
  let html=`<button class="back" onclick="goHome()">← 返回</button>`;
  if(Object.keys(CN).length) html+=`<div class="card"><h2>📝 错词·词语</h2><div class="lead">只默你之前<b>默错过</b>的；每词读三遍。默对一次还不够，<b>连续默对2次</b>才从错词本消失。</div><div class="list">${tiles(CN,'cn','个词')}</div></div>`;
  if(Object.keys(GUSHI).length) html+=`<div class="card"><h2>📜 错句·古诗名言</h2><div class="lead">读两遍、时间更长，写整句。注意易错字。</div><div class="list">${tiles(GUSHI,'gushi','句')}</div></div>`;
  if(Object.keys(MINGYAN).length) html+=`<div class="card"><h2>🏛️ 名言</h2><div class="list">${tiles(MINGYAN,'mingyan','句')}</div></div>`;
  b.innerHTML=html;
  show('cnlist');
}
""", h, count=1)

# 6) 标题/副标题/狮子/首页/档案键
h = h.replace("<title>哥哥默写助手 · 语文+英语</title>", "<title>哥哥 · 只默错的（错词专默）</title>")
h = h.replace('<div style="flex:1"><h1>默写助手</h1><div class="sub">语文词语 · 英语考纲 · 全自动报默</div></div>',
              '<div style="flex:1"><h1>只默错的 · 错词专默</h1><div class="sub">只默你之前默错的词/句 · 连续默对2次自动消失</div></div>')
h = h.replace('<div class="lion"><div class="face">🦁</div><div class="bubble">默写规则:每个词<b>边听边写</b>(读三遍),时间到自动下一个。一课默完看答案对照——<b>写错的点一下标红,在书上圈出来</b>!另外可以做🧠理解小测,检查是不是真懂。</div></div>',
              '<div class="lion"><div class="face">🦁</div><div class="bubble">这里<b>只放你之前默错的</b>。我报默给你听,你边听边写;默完<b>对答案、写错的点红</b>。一个词<b>连续默对2次</b>才算真掌握、自动消失;还错就一直留着,直到拿下它!</div></div>')
h = h.replace('''    <div class="bigmenu">
      <div class="bigtile cn" onclick="showCnList()"><div class="ic">📖</div><div class="nm">语文默写</div><div class="ds">12 课词语 + 理解小测</div></div>
      <div class="bigtile en" onclick="showEnList()"><div class="ic">🔤</div><div class="nm">英语默写</div><div class="ds">单词+句子+中英互译</div></div>
    </div>''',
'''    <div class="bigmenu">
      <div class="bigtile cn" onclick="showCnList()" style="grid-column:1/3"><div class="ic">🎯</div><div class="nm">开始默错词</div><div class="ds">只默你之前默错的词和句</div></div>
    </div>''')
h = h.replace("const AKEY='mx_archive_'+CHILD;", "const AKEY='mx_archive_kenton_wrong';")

# 7) 错词本（持久）+ 钩子 + 重默 + 预置全部错词
WB = r'''function logEvent(ev){const a=loadArchive();a.events.push(ev);saveArchive(a);cloudUpload(ev);}
/* ===== 错词本(持久):错过一次即记,连续答对2次才移出 ===== */
var WBKEY='mx_wrongbook_kenton_wrong';
function loadWB(){try{return JSON.parse(localStorage.getItem(WBKEY))||{words:{}};}catch(e){return {words:{}};}}
function saveWB(w){try{localStorage.setItem(WBKEY,JSON.stringify(w));}catch(e){}}
function wbAddWrong(word,hint,lesson){if(!word)return;var wb=loadWB();var w=wb.words[word]||{word:word,hint:hint||'',lesson:lesson||'',wrong:0,streak:0,mastered:false};w.wrong++;w.streak=0;w.mastered=false;if(lesson)w.lesson=lesson;if(hint)w.hint=hint;wb.words[word]=w;saveWB(wb);}
function wbAddRight(word){var wb=loadWB();var w=wb.words[word];if(w&&!w.mastered){w.streak++;if(w.streak>=2)w.mastered=true;wb.words[word]=w;saveWB(wb);}}
function wbAll(){var wb=loadWB();return Object.keys(wb.words).map(function(k){return wb.words[k];});}
function wbActive(){return wbAll().filter(function(w){return !w.mastered;});}
(function(){var seed=[['柔嫩','第27课'],['奢侈','第15课'],['贤惠','人物品质'],['悲戚','人物品质'],['临危不惧','人物品质'],['焦躁不安','人物品质'],['心急如焚','人物品质'],['维持','第24课'],['悬梁刺股','读书求学'],['凿壁偷光','读书求学'],['欲将轻骑逐，大雪满弓刀。','塞下曲'],['不怨天，不尤人。','论语']];var wb=loadWB();var ch=false;seed.forEach(function(s){if(!wb.words[s[0]]){wb.words[s[0]]={word:s[0],hint:'',lesson:s[1],wrong:1,streak:0,mastered:false};ch=true;}});if(ch)saveWB(wb);})();
function startWrongbook(){var list=wbActive();if(!list.length){alert('错词本是空的，太棒了！');return;}var en=0;list.forEach(function(w){if(/[a-zA-Z]/.test(w.word)&&!/[一-龥]/.test(w.word))en++;});var isEn=en>list.length/2;S.mode=isEn?'word':'cn';S.key='错词重做';S.idx=0;S.miss=new Set();S.startTime=Date.now();S.perItem=[];S.lang=isEn?'en':'zh';S.times=2;S.items=list.map(function(w){return {t:w.word,hint:w.hint||w.lesson||'',say:w.word};});S.itemStart=Date.now();renderDict();show('dict');setTimeout(function(){runWord();},400);}'''
h = h.replace("function logEvent(ev){const a=loadArchive();a.events.push(ev);saveArchive(a);cloudUpload(ev);}", WB, 1)
h = h.replace("  speakOnce(S.miss.size?('记下了，错词留着再练。'):'真棒，这一课默完了！','zh');",
              "  items.forEach(function(it){ if(it.ok) wbAddRight(it.word); else wbAddWrong(it.word,it.hint,S.key); });\n  speakOnce(S.miss.size?('记下了，错词留着再练。'):'真棒，全部默对啦！','zh');", 1)

NEW_ARCH = """(function(){var aw=wbAll();if(!aw.length)return '';var act=aw.filter(function(w){return !w.mastered;});return '<div class="card"><h2 style="color:var(--red)">📕 错词本（'+act.length+'个待掌握 / 共'+aw.length+'）</h2><div class="lead">连续默对2次才算掌握、自动消失。</div><div class="ansgrid">'+aw.map(function(w){return '<div class="answord'+(w.mastered?'':' miss')+'">'+w.word+'<span class="py">'+(w.mastered?'已掌握✓':'连对'+w.streak+'/2')+'</span></div>';}).join('')+'</div>'+(act.length?'<div class="row" style="justify-content:flex-start"><button class="btn green sm" onclick="startWrongbook()">🔁 重默错词（'+act.length+'）</button></div>':'<div class="kou">错词全部掌握，太棒了！</div>')+'</div>';})()+"""
ARCH_PAT = re.compile(r"\(repeat\.length\?'<div class=\"card\"><h2 style=\"color:var\(--red\)\">.*?</div></div>':''\)\+", re.S)
h, n1 = ARCH_PAT.subn(lambda m: NEW_ARCH, h, count=1)
NEW_TXT = ("  var _wb=wbAll();\n"
 "  t+='== 错词本(错过一次即记;连续答对2次移出) ==\\n';\n"
 "  t+=_wb.length?_wb.map(function(w){return w.word+(w.lesson?' ['+w.lesson+']':'')+' 错'+w.wrong+'次 连对'+w.streak+'/2'+(w.mastered?' 已掌握':'');}).join('\\n'):'(无)';")
TXT_PAT = re.compile(r"  t\+='== 反复错的词.*?优先复习\)==\\n';\n  t\+=repeat\.length\?repeat\.map\(.*?:'\(无\)';", re.S)
h, n2 = TXT_PAT.subn(lambda m: NEW_TXT, h, count=1)
assert n1==1 and n2==1, "档案/导出替换失败 %d %d"%(n1,n2)

out = os.path.join(ROOT, "apps", "kenton_wrong_dictation.html")
open(out, "w", encoding="utf-8").write(h)
print("生成:", out)
print("错词:", sum(len(v) for v in CN.values()), "词 +", sum(len(v) for v in GUSHI.values()), "句")
