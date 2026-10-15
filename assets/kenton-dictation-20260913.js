/* Kenton's photographed dictation scope. Original photos and marked answers stay private. */
const DICTATION_FORMS = [
  ['small','小',['smaller'],['smallest'],'加词尾','small + er / est',false],
  ['hot','热',['hotter'],['hottest'],'双写','hot → hott + er / est',false],
  ['funny','有趣；滑稽',['funnier'],['funniest'],'改 y','funny → funni + er / est',false],
  ['wide','宽',['wider'],['widest'],'已有 e','wide + r / st',false],
  ['interesting','有趣',['more interesting'],['most interesting'],'前面加','more / most + interesting；原词不变。',true],
  ['ill','生病；病情',['worse'],['worst'],'整组记','ill → worse → worst；这里比较病情。',true],
  ['many','多',['more'],['most'],'整组记','many → more → most；不要按 y 结尾的规则改。',true],
  ['far','远；距离',['farther','further'],['farthest','furthest'],'整组记','far → farther → farthest；距离也可用 further / furthest。',true],
  ['old','年龄大',['older','elder'],['oldest','eldest'],'已有规则，也有家人用法','通常 older / oldest；家人长幼可用 elder / eldest。',false],
  ['popular','受欢迎',['more popular'],['most popular'],'前面加','more / most + popular；原词不变。',true],
  ['big','大',['bigger'],['biggest'],'双写','big → bigg + er / est',false],
  ['happy','开心',['happier'],['happiest'],'改 y','happy → happi + er / est',false],
  ['little','少；数量',['less'],['least'],'整组记','little → less → least；这里是数量少，不是个头小。',true],
  ['bad','坏',['worse'],['worst'],'整组记','bad → worse → worst；与 ill 这一组一起记。',true],
  ['excited','兴奋',['more excited'],['most excited'],'前面加','more / most + excited；原词不变。',true]
];
const DICTATION_ANIMALS = [['bear','熊'],['bat','蝙蝠'],['parrot','鹦鹉'],['kangaroo','袋鼠'],['rabbit','兔子'],['panda','熊猫'],['lion','狮子'],['penguin','企鹅'],['dolphin','海豚'],['whale','鲸'],['cage','笼子']];
const DICTATION_ITEMS = [
  ...DICTATION_FORMS.map((f,i)=>({id:'dict-form-'+f[0],base:f[0],zh:f[1],answers:[f[2],f[3]],tag:f[4],hint:f[5],priority:f[6],kind:'forms',sourceNumber:i+1})),
  ...DICTATION_ANIMALS.map(([base,zh],i)=>({id:'dict-word-'+base,base,zh,answers:[[base]],tag:'拼写',hint:base==='kangaroo'?'kan · ga · roo：中间有 ga，末尾两个 o。':'听清声音，再把字母按顺序写出来。',priority:base==='kangaroo',kind:'word',sourceNumber:i+1}))
];
const dictItem=id=>DICTATION_ITEMS.find(q=>q.id===id);
const dictNormalize=s=>String(s).trim().toLowerCase().replace(/\s+/g,' ');
function makeDictation(){return {schema:1,scope:'focus',mode:'learn',index:0,queue:[],drafts:{},attempts:{},shown:{},review:DICTATION_ITEMS.filter(q=>q.priority).map(q=>q.id),streaks:{},lastPass:{},due:{},submitted:{},roundId:'',finished:false};}
function validDictation(d){
  const object=x=>x&&typeof x==='object'&&!Array.isArray(x), ids=xs=>Array.isArray(xs)&&xs.length<=26&&new Set(xs).size===xs.length&&xs.every(x=>!!dictItem(x));
  return object(d)&&d.schema===1&&['focus','all','forms','animals','review'].includes(d.scope)&&['learn','test'].includes(d.mode)&&Number.isInteger(d.index)&&d.index>=0&&d.index<=26&&ids(d.queue)&&(d.queue.length===0?d.index===0:(d.finished?d.index===d.queue.length:d.index<d.queue.length))&&ids(d.review)&&object(d.drafts)&&Object.entries(d.drafts).every(([id,v])=>dictItem(id)&&Array.isArray(v)&&v.length===dictItem(id).answers.length&&v.every(x=>typeof x==='string'&&x.length<=100))&&['attempts','streaks'].every(k=>object(d[k])&&Object.entries(d[k]).every(([id,n])=>dictItem(id)&&Number.isInteger(n)&&n>=0&&n<10000))&&['shown','lastPass','due'].every(k=>object(d[k])&&Object.entries(d[k]).every(([id,date])=>dictItem(id)&&/^\d{4}-\d{2}-\d{2}$/.test(date)))&&object(d.submitted)&&Object.entries(d.submitted).every(([id,v])=>dictItem(id)&&typeof v==='boolean')&&typeof d.roundId==='string'&&typeof d.finished==='boolean';
}
function dictList(scope){const d=state.dictation;return DICTATION_ITEMS.filter(q=>scope==='all'||(scope==='focus'&&q.priority)||(scope==='forms'&&q.kind==='forms')||(scope==='animals'&&q.kind==='word')||(scope==='review'&&d.review.includes(q.id)));}
function startDictation(scope,mode){stop();const d=state.dictation;Object.assign(d,{scope,mode,index:0,queue:dictList(scope).map(q=>q.id),drafts:{},attempts:{},submitted:{},roundId:uid(),finished:false});goto('dictation');}
function dictReview(id){const d=state.dictation;if(!d.review.includes(id))d.review.push(id);d.streaks[id]=0;d.due[id]=day;}
function dictTomorrow(){const date=new Date(day+'T00:00:00Z');date.setUTCDate(date.getUTCDate()+1);return date.toISOString().slice(0,10);}
function dictNext(expectedId){const d=state.dictation;if(d.queue[d.index]!==expectedId)return;stop();d.index++;d.finished=d.index>=d.queue.length;save();renderDictation();}
function dictReference(q){return q.kind==='word'?q.base:q.answers.map(a=>a.join(' / ')).join(' → ');}
function dictScopeControls(){const d=state.dictation;return `<label class="field"><span>这轮练什么</span><select id="dictScope">${[['focus','重点 9 词'],['forms','15 组词形'],['animals','11 个词'],['all','两页全部'],['review','待复习（'+d.review.length+'）']].map(([v,t])=>`<option value="${v}" ${d.scope===v?'selected':''}>${t}</option>`).join('')}</select></label>`;}
function bindDictScope(){$('#dictScope').onchange=e=>startDictation(e.target.value,state.dictation.mode);}
function renderDictation(){
  stop();const d=state.dictation;if(!d.roundId){d.roundId=uid();d.queue=dictList(d.scope).map(q=>q.id);}save();
  if(d.finished||!d.queue.length){const entries=state.history.filter(h=>h.roundId===d.roundId);const independent=new Set(entries.filter(h=>h.result==='independent-correct').map(h=>h.id)).size;
    $('#stage').innerHTML=shell('recall','这一小轮结束了',`${dictScopeControls()}<div class="panel"><p>本轮首答独立正确：${independent} 词。</p><p>待复习 ${d.review.length} 词。看过答案的，隔天再试。</p><div class="actions"><button id="dictReviewStart" class="primary">再练待复习</button><button id="dictAllStart">完整默写两页</button><button id="dictToHomework">结束并保存学习</button></div></div>`);bindDictScope();$('#dictReviewStart').onclick=()=>startDictation('review','test');$('#dictAllStart').onclick=()=>startDictation('all','test');$('#dictToHomework').onclick=()=>goto('homework');return;
  }
  const q=dictItem(d.queue[d.index]),learn=d.mode==='learn';if(learn)d.shown[q.id]=day;
  $('#stage').innerHTML=shell(learn?'teach':'independent',learn?'看清变化，再自己写':'看提示，自己默写',`${dictScopeControls()}<p class="caption">${d.index+1} / ${d.queue.length} · ${q.kind==='forms'?'词形':'词汇'}第 ${q.sourceNumber} 题</p><div class="progress"><i style="width:${(d.index+1)/d.queue.length*100}%"></i></div><div class="panel">${q.kind==='forms'?`<div class="word" lang="en">${esc(q.base)}</div><p>${esc(q.zh)}</p>`:`<h3>${esc(q.zh)}</h3>`}${learn?`<p class="caption">${esc(q.tag)}</p><div class="family" lang="en">${q.kind==='forms'?`<span>${esc(q.base)}</span> → `:''}${q.answers.map(a=>`<span>${esc(a.join(' / '))}</span>`).join(' → ')}</div>${primary('记住这一处变化。',q.hint,'遮住后，用键盘写出来。')}<div class="actions"><button id="dictListen">${speaker}听一遍</button><button id="dictHide" class="primary">遮住，我来写</button><button id="dictDirect">直接默写这一组</button></div>`:`<p class="caption">${q.kind==='forms'?'各写一种正确形式。':'写出完整英文单词。'}</p>${q.answers.map((a,i)=>`<label class="field"><span>${q.kind==='forms'?(i===0?'比较级':'最高级'):'英文'}</span><input id="dictAnswer${i}" data-dict-answer="${i}" type="text" maxlength="100" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" value="${esc(d.drafts[q.id]?.[i]||'')}"></label>`).join('')}<label class="row caption"><input type="checkbox" id="dictAssisted">我用了提示或语音输入</label><div class="actions"><button id="dictCheck" class="primary">检查</button><button id="dictHelp">教我这一个</button>${q.kind==='word'?`<button id="dictListen">${speaker}听单词</button>`:''}</div><div id="dictFeedback" class="feedback" aria-live="polite"></div>`}</div><p class="caption">今天看过答案，记为练习；隔天无提示再写。已写对的记录会保留。</p>`);
  bindDictScope();if($('#dictListen'))$('#dictListen').onclick=()=>play(q.kind==='forms'?q.base+', '+q.answers.map(a=>a[0]).join(', ')+'.':q.base,.92,!learn);
  if(learn){$('#dictHide').onclick=()=>{d.mode='test';d.drafts[q.id]=q.answers.map(()=>'');save();renderDictation()};$('#dictDirect').onclick=()=>startDictation(d.scope,'test');}
  else{document.querySelectorAll('[data-dict-answer]').forEach(input=>{input.oninput=()=>{d.drafts[q.id]=q.answers.map((_,i)=>$('#dictAnswer'+i).value);save()};input.onkeydown=e=>{if(e.key==='Enter')$('#dictCheck').click()}});$('#dictCheck').onclick=()=>checkDictation(q);$('#dictHelp').onclick=()=>dictHelp(q,true);if(d.submitted[q.id])dictSuccess(q,false);}
  save();
}
function checkDictation(q){
  stop();const d=state.dictation;if(d.submitted[q.id])return;const answers=q.answers.map((_,i)=>$('#dictAnswer'+i).value.trim());d.drafts[q.id]=answers;
  if(answers.every(a=>!a)){$('#dictFeedback').textContent='试着写一个；不会就点“教我这一个”。';return;}
  d.attempts[q.id]=(d.attempts[q.id]||0)+1;const checks=q.answers.map((set,i)=>set.includes(dictNormalize(answers[i]))),ok=checks.every(Boolean),independent=ok&&d.attempts[q.id]===1&&d.shown[q.id]!==day&&!$('#dictAssisted').checked;
  const result=ok?(independent?'independent-correct':'assisted-correct'):'needs-repair';
  record(q.id,answers.join(' | '),result,{roundId:d.roundId,expected:q.answers,fieldCorrect:checks,base:q.base,phase:'independent',inputMode:$('#dictAssisted').checked?'voice-or-assisted':'typed'});
  if(ok){d.submitted[q.id]=true;if(independent){if(d.lastPass[q.id]!==day){d.streaks[q.id]=(d.streaks[q.id]||0)+1;d.lastPass[q.id]=day;}d.due[q.id]=dictTomorrow();if(d.streaks[q.id]>=2)d.review=d.review.filter(id=>id!==q.id);else if(!d.review.includes(q.id))d.review.push(q.id);}else{if(!d.review.includes(q.id))d.review.push(q.id);d.due[q.id]=dictTomorrow();}save();dictSuccess(q,independent);}
  else{dictReview(q.id);d.shown[q.id]=day;save();dictHelp(q,d.attempts[q.id]>=2,checks);}
}
function dictSuccess(q,independent){$('#dictCheck').disabled=true;$('#dictHelp').disabled=true;document.querySelectorAll('[data-dict-answer]').forEach(i=>i.disabled=true);$('#dictFeedback').innerHTML=`<p class="success">${independent?'这次自己写对了。':'这次练习完成了，隔天再独立试。'}</p><div class="actions"><button class="primary" id="dictNext">下一词</button><button id="dictPause">停一下</button></div>`;$('#dictNext').onclick=()=>dictNext(q.id);$('#dictPause').onclick=()=>{clearTimeout(advanceTimer);$('#dictPause').textContent='已停，准备好再继续'};if(independent&&state.auto)advanceTimer=setTimeout(()=>dictNext(q.id),1700);}
function dictHelp(q,reveal,checks=[]){stop();const d=state.dictation;d.shown[q.id]=day;if(!d.review.includes(q.id))d.review.push(q.id);save();const gap=q.kind==='forms'&&checks.some(Boolean)?(checks[0]?'比较级写对了，再看最高级。':'最高级写对了，再看比较级。'):'只看这个词该怎么变。';$('#dictFeedback').innerHTML=`<section class="repair" data-phase="repair">${primary(gap,q.hint,'回到这一题，再自己写。')}<button id="dictReturn" data-return-to-question="true">回原题再写</button>${reveal?`<div data-learning-escape="answer-and-continue"><p data-reference-answer lang="en" class="word">${esc(dictReference(q))}</p><button id="dictEscape" class="primary" data-continue-after-reveal>记为待复习并继续</button></div>`:''}</section>`;$('#dictReturn').onclick=()=>{$('#dictFeedback').innerHTML='';$('#dictAnswer0').focus()};if(reveal)$('#dictEscape').onclick=()=>{record(q.id,(d.drafts[q.id]||[]).join(' | '),'reference-shown-review-needed',{roundId:d.roundId,expected:q.answers,base:q.base});dictNext(q.id)};}
function dictationReport(){const d=state.dictation;return {scope:'15组词形和11个词',priorityWords:DICTATION_ITEMS.filter(q=>q.priority).map(q=>q.base),review:d.review.map(id=>dictItem(id).base),nextReview:d.due,consecutiveIndependentDays:d.streaks,mastery:'待隔天独立复测；软件制作和原件录入不是孩子完成记录'};}
