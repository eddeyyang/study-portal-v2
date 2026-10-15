# -*- coding: utf-8 -*-
"""
把『持久错词本』作为核心要求，注入所有默写/听写软件（一次错就记、连续答对2次才移出）。
做法与引擎无关：包裹 logEvent（每次默完都经过它）来记录错词；档案页与导出新增『错词本』卡/段；
新增 startWrongbook()『重默错词』。主默写界面外观不变。幂等：已含 startWrongbook 的文件跳过。
"""
import re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APPS = ["eddey_chinese_dictation","eddey_english","eddey_english_dictation",
        "kenton_dictation","kenton_dictation_redo","kenton_english_dictation","kenton_english_textbook"]

def wb_block(key):
    return ("""
/* ===== 错词本(核心要求:默错过一次即记,连续答对2次才移出;外观不变,仅档案/导出新增) ===== */
var WBKEY='%s';
function loadWB(){try{return JSON.parse(localStorage.getItem(WBKEY))||{words:{}};}catch(e){return {words:{}};}}
function saveWB(w){try{localStorage.setItem(WBKEY,JSON.stringify(w));}catch(e){}}
function wbAddWrong(word,hint,lesson,lang){if(!word)return;var wb=loadWB();var w=wb.words[word]||{word:word,hint:hint||'',lesson:lesson||'',lang:lang||'zh',wrong:0,streak:0,mastered:false};w.wrong++;w.streak=0;w.mastered=false;if(lesson)w.lesson=lesson;if(hint)w.hint=hint;if(lang)w.lang=lang;wb.words[word]=w;saveWB(wb);}
function wbAddRight(word){var wb=loadWB();var w=wb.words[word];if(w&&!w.mastered){w.streak++;if(w.streak>=2)w.mastered=true;wb.words[word]=w;saveWB(wb);}}
function wbAll(){var wb=loadWB();return Object.keys(wb.words).map(function(k){return wb.words[k];});}
function wbActive(){return wbAll().filter(function(w){return !w.mastered;});}
function startWrongbook(){var list=wbActive();if(!list.length){alert('错词本是空的，太棒了！');return;}var en=0;list.forEach(function(w){if(/[a-zA-Z]/.test(w.word)&&!/[\\u4e00-\\u9fa5]/.test(w.word))en++;});var isEn=en>list.length/2;S.mode=isEn?'word':'cn';S.key='错词重做';S.idx=0;S.miss=new Set();S.startTime=Date.now();S.perItem=[];S.lang=isEn?'en':'zh';S.times=2;S.items=list.map(function(w){return {t:w.word,hint:w.hint||w.lesson||'',say:w.word};});S.itemStart=Date.now();renderDict();show('dict');setTimeout(function(){runWord();},400);}
(function(){if(typeof logEvent==='function'){var _o=logEvent;logEvent=function(ev){_o(ev);try{if(ev&&ev.type==='dict'&&ev.items){ev.items.forEach(function(it){if(it.ok)wbAddRight(it.word);else wbAddWrong(it.word,it.hint,ev.lesson,(ev.subject==='en')?'en':'zh');});}}catch(e){}};}})();
""" % key)

NEW_ARCH = """(function(){var aw=wbAll();if(!aw.length)return '';var act=aw.filter(function(w){return !w.mastered;});return '<div class="card"><h2 style="color:var(--red)">📕 错词本（错过就记，共'+aw.length+'个）</h2><div class="lead">只要默错过一次就在这里；<b>连续答对2次</b>才算掌握、自动移走。</div><div class="ansgrid">'+aw.map(function(w){return '<div class="answord'+(w.mastered?'':' miss')+'">'+w.word+'<span class="py">'+(w.mastered?'已掌握✓':'错'+w.wrong+'次')+'</span></div>';}).join('')+'</div>'+(act.length?'<div class="row" style="justify-content:flex-start"><button class="btn green sm" onclick="startWrongbook()">🔁 重默错词（'+act.length+'）</button></div>':'<div class="kou">错词都掌握啦，太棒了！</div>')+'</div>';})()+"""
NEW_TXT = ("  var _wb=wbAll();\n"
 "  t+='== 错词本(只要错过一次就记;连续答对2次移出) ==\\n';\n"
 "  t+=_wb.length?_wb.map(function(w){return w.word+(w.lesson?' ['+w.lesson+']':'')+' 错'+w.wrong+'次'+(w.mastered?' 已掌握':'');}).join('\\n'):'(无)';")

ARCH_PAT = re.compile(r"\(repeat\.length\?'<div class=\"card\"><h2 style=\"color:var\(--red\)\">.*?</div></div>':''\)\+", re.S)
TXT_PAT  = re.compile(r"  t\+='== 反复错的词.*?优先复习\)==\\n';\n  t\+=repeat\.length\?repeat\.map\(.*?:'\(无\)';", re.S)

done=[]
for a in APPS:
    p=os.path.join(ROOT,"apps",a+".html")
    h=open(p,encoding="utf-8").read()
    if "function startWrongbook" in h:
        print("跳过(已有):",a); continue
    key="mx_wrongbook_"+a
    # 1) 注入错词本代码块(放到最后一个</script>前)
    i=h.rfind("</script>")
    h=h[:i]+wb_block(key)+"\n"+h[i:]
    # 2) 档案卡
    h,n1=ARCH_PAT.subn(lambda m:NEW_ARCH,h,count=1)
    # 3) 导出段
    h,n2=TXT_PAT.subn(lambda m:NEW_TXT,h,count=1)
    open(p,"w",encoding="utf-8").write(h)
    print("已注入:",a,"| 档案卡%d 导出段%d"%(n1,n2))
    done.append((a,n1,n2))
print("完成",len(done),"个")
