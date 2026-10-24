(() => {
  'use strict';
  const APP = 'midterm-dictation-20261024', VERSION = 1;
  const $ = id => document.getElementById(id);
  const query = new URLSearchParams(location.search);
  const Sync = window.DDLearningSync;
  const explicitTest = query.get('test') === '1';
  const testing = () => explicitTest || !Sync || Sync.isTest();
  const mode = () => testing() ? 'test' : 'production';
  let child = query.get('child') === 'eddey' || query.get('who') === 'eddey' ? 'eddey' : 'kenton';
  let subject = query.get('subject') === 'english' ? 'english' : 'chinese';
  let data, state, itemMap, screen = 'home', running = false, lastTick = 0, saveBlocked = false, composing = false;
  let audio = null, audioStop = 0, audioEpoch = 0, toastTimer = 0;
  const dateKey = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai'}).format(new Date());
  const storageKey = () => `study:${child}:${APP}:v${VERSION}:${subject}:${mode()}`;
  const text = (id, value) => { $(id).textContent = String(value ?? ''); };
  const subjectData = () => data.children[child].subjects[subject];
  const items = () => subjectData().items;
  const session = () => state.session;
  const question = () => session()?.questions[session().index];
  const currentItem = () => itemMap.get(question()?.id);
  const normalize = value => String(value).normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/[.!?。！？]+$/,'').trim();
  const unique = list => [...new Set(list)];
  const uid = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  const unitLabel = value => subject === 'english' ? `Unit ${value}` : `第 ${value} 单元`;
  function notice(message) { text('notice', message); $('notice').hidden = !message; }
  function freshState() { return {appId:APP,version:VERSION,child,subject,mode:mode(),settings:{units:unique(items().map(x=>String(x.unit))),size:'10',entry:'listen',answer:'paper',shuffle:false,category:'all'},records:{},history:[],session:null,dailySeconds:{},exposures:{}}; }
  function validate(raw) {
    if (!raw || raw.appId !== APP || raw.version !== VERSION || raw.child !== child || raw.subject !== subject || raw.mode !== mode()) throw new Error('孩子、学科、版本或测试模式不匹配。');
    if (!raw.settings || !Array.isArray(raw.settings.units) || !raw.settings.units.every(v=>typeof v === 'string' && items().some(x=>String(x.unit)===v))) throw new Error('单元范围无效。');
    if (!['10','20','all'].includes(raw.settings.size) || !['listen','memory','meaning'].includes(raw.settings.entry) || !['paper','type'].includes(raw.settings.answer)) throw new Error('练习设置无效。');
    if (!raw.records || Array.isArray(raw.records) || !Array.isArray(raw.history) || raw.history.length > 50000 || !raw.dailySeconds || Array.isArray(raw.dailySeconds)) throw new Error('记录格式不完整。');
    for (const [id,r] of Object.entries(raw.records)) if (!itemMap.has(id) || !r || !Number.isInteger(r.wrongCount) || r.wrongCount<0 || !Array.isArray(r.recoveryRounds) || !r.recoveryRounds.every(x=>typeof x==='string') || typeof r.reviewNeeded!=='boolean') throw new Error('词语记录无效。');
    for (const h of raw.history) if (!h || !itemMap.has(h.itemId) || typeof h.id!=='string' || typeof h.roundId!=='string' || typeof h.at!=='string' || !['independent','assisted','wrong','skipped'].includes(h.result) || typeof h.answer!=='string' || h.answer.length>2000) throw new Error('作答历史无效。');
    for (const [day,seconds] of Object.entries(raw.dailySeconds)) if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(seconds) || seconds<0) throw new Error('用时记录无效。');
    if (raw.session) {
      const s=raw.session;
      if (typeof s.id!=='string' || !Array.isArray(s.questions) || s.questions.length>5000 || !Number.isInteger(s.index) || s.index<0 || s.index>s.questions.length || !Number.isFinite(s.seconds) || s.seconds<0 || !['listen','memory','meaning'].includes(s.entry) || !['paper','type'].includes(s.answer)) throw new Error('本轮进度无效。');
      for(const q of s.questions) if(!q || !itemMap.has(q.id) || !['preview','question','answer','repair','success','done'].includes(q.stage) || typeof q.draft!=='string' || q.draft.length>2000 || !Number.isInteger(q.attempts) || q.attempts<0 || q.attempts>2) throw new Error('本轮题目无效。');
    }
    if(raw.exposures&&Object.entries(raw.exposures).some(([id,at])=>!itemMap.has(id)||!Number.isFinite(at)||at<0))throw new Error('提示记录无效。');
    return JSON.parse(JSON.stringify(raw));
  }
  function loadState() {
    itemMap=new Map(items().map(x=>[x.id,x])); state=freshState(); saveBlocked=false;
    try { const saved=localStorage.getItem(storageKey()); if(saved)state=validate(JSON.parse(saved)); }
    catch { saveBlocked=true; notice('这份本机记录暂时无法读取，已保留。可先到“记录与设置”导出，再核对；不会覆盖旧记录。'); }
  }
  function persist() {
    if(saveBlocked)return false;
    try {localStorage.setItem(storageKey(),JSON.stringify(state));return true;}
    catch {running=false;notice('本机保存失败。请先导出记录，避免关闭后丢失。');return false;}
  }
  function stopAudio() { audioEpoch++;clearTimeout(audioStop);audioStop=0;if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}text('audioMessage',''); }
  function audioSource(item) {
    if(!item?.audio?.src)return null;
    try {let path=item.audio.src;if(path.startsWith('apps/')||path.startsWith('assets/'))path='../'+path;const url=new URL(path,location.href);return url.origin===location.origin?url.href:null;}catch{return null;}
  }
  async function play(item=currentItem(),slow=false) {
    stopAudio();const src=audioSource(item);if(!src){text('audioMessage','这个词暂无录音，可看词后遮住默写。');return;}
    const epoch=audioEpoch, track=new Audio(src);audio=track;track.preload='auto';track.playbackRate=slow ? 0.85 : 1;
    const start=Number.isFinite(item.audio.start)?Math.max(0,item.audio.start):0;
    const end=Number.isFinite(item.audio.end)&&item.audio.end>start?item.audio.end:null;
    let stopped=false;
    function finish(){if(stopped)return;stopped=true;clearTimeout(audioStop);track.pause();if(epoch===audioEpoch)text('audioMessage','播放结束，可以再听一次。');}
    track.addEventListener('timeupdate',()=>{if(end!==null&&track.currentTime>=end)finish();});
    track.addEventListener('ended',finish);
    track.addEventListener('error',()=>{if(epoch===audioEpoch)text('audioMessage','录音暂时没有打开。可重试，或看词遮挡默写。');});
    text('audioMessage',slow?'正在慢速报读…':'正在报读…');
    try {
      if(start>0){await new Promise((resolve,reject)=>{track.addEventListener('loadedmetadata',resolve,{once:true});track.addEventListener('error',reject,{once:true});});if(epoch!==audioEpoch)return;track.currentTime=start;await new Promise(resolve=>{track.addEventListener('seeked',resolve,{once:true});setTimeout(resolve,600);});}
      if(epoch!==audioEpoch)return;
      await track.play();
      if(epoch!==audioEpoch){track.pause();return;}
      if(end!==null)audioStop=setTimeout(finish,Math.max(0,(end-track.currentTime)/track.playbackRate*1000));
    } catch {if(epoch===audioEpoch)text('audioMessage','点“报读”再试一次。也可先看词遮挡默写。');}
  }
  function tick() {
    if(!running||!session())return;const now=performance.now(),delta=Math.max(0,Math.min(4,(now-lastTick)/1000));lastTick=now;
    session().seconds+=delta;const day=dateKey();state.dailySeconds[day]=(state.dailySeconds[day]||0)+delta;
    const seconds=Math.floor(session().seconds);text('clock',`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`);
    if(subject==='english'&&state.dailySeconds[day]>=900){pause();notice('今天英语默写已经练了 15 分钟。进度已保存，先休息，明天再接着练。');renderSummary();}
  }
  function pause() {tickWithoutLimit();running=false;stopAudio();if(state)persist();}
  function tickWithoutLimit(){if(running&&session()){const now=performance.now(),delta=Math.max(0,Math.min(4,(now-lastTick)/1000));session().seconds+=delta;const day=dateKey();state.dailySeconds[day]=(state.dailySeconds[day]||0)+delta;lastTick=now;}}
  function show(name){if(name!=='practice')pause();screen=name;document.querySelectorAll('[data-screen]').forEach(node=>node.hidden=node.dataset.screen!==name);$('identityRow').hidden=name==='practice';window.scrollTo({top:0,behavior:'instant'});}
  function category(item){return /背诵|古诗|课文|recitation|poem/i.test(item.type||'')?'recitation':'vocabulary';}
  function expose(item){state.exposures ||= {};state.exposures[item.id]=Date.now();persist();}
  function selectedItems(){return items().filter(x=>state.settings.units.includes(String(x.unit))&&(!state.settings.category||state.settings.category==='all'||x.type===state.settings.category));}
  function reviewItems(){return items().filter(x=>state.records[x.id]?.reviewNeeded);}
  function renderIdentity(){document.body.dataset.child=child;text('gradeLine',`${data.children[child].grade} · ${subjectData().label} · 期中复习`);text('footerIdentity',`${data.children[child].label} · ${subjectData().label}`);document.querySelectorAll('[data-child-choice]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.childChoice===child)));document.querySelectorAll('[data-subject-choice]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.subjectChoice===subject)));$('portalBack').href=`../subject.html?subject=${subject}&who=${child}`;}
  function renderHome(){
    renderIdentity();const list=selectedItems(),available=list.filter(audioSource).length,s=session();
    text('scopeCount',`已选 ${state.settings.units.length} 个单元 · ${list.length} 项`);
    text('homeRange',state.settings.units.length?state.settings.units.map(unitLabel).join(' / '):'先选一个单元');
    text('sampleWord',subject==='english'?'listen · write':'听 · 写 · 记');$('sampleWord').classList.toggle('english',subject==='english');
    text('catalogCount',`${items().length} 项`);text('reviewCount',`${reviewItems().length} 项`);
    text('scopeNote',subjectData().scopeNote||'学校最终考试范围以老师通知为准，按当前资料选择复习单元。');
    text('audioCoverage',`所选范围 ${available}/${list.length} 项有录音；有录音的词可报读。`);
    text('startButton',s&&!s.closed&&s.index<s.questions.length?'继续这一轮 →':'开始这一轮 →');$('startButton').disabled=saveBlocked||!list.length;
    $('practiceType').replaceChildren(new Option('全部词语类别','all'));for(const type of unique(items().map(x=>x.type||'词语')))$('practiceType').append(new Option(typeLabel(type),type));if(state.settings.category&&!unique(items().map(x=>x.type)).includes(state.settings.category))state.settings.category='all';$('practiceType').value=state.settings.category||'all';$('roundSize').value=state.settings.size;$('entryMode').value=state.settings.entry;$('answerMode').value=state.settings.answer;$('shuffle').checked=state.settings.shuffle;
    const units=unique(items().map(x=>String(x.unit)));$('unitChoices').replaceChildren();
    for(const unit of units){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=state.settings.units.includes(unit);input.value=unit;input.onchange=()=>{state.settings.units=input.checked?unique([...state.settings.units,unit]):state.settings.units.filter(v=>v!==unit);persist();renderHome();};label.append(input,document.createTextNode(unitLabel(unit)));$('unitChoices').append(label);}
    let hash=0;for(const c of dailySurpriseKey(child))hash=(hash*31+c.charCodeAt(0))>>>0;text('dailyNote',DAILY_SURPRISES[hash%DAILY_SURPRISES.length]);show('home');
  }
  function changeIdentity(nextChild,nextSubject){pause();child=nextChild;subject=nextSubject;notice('');loadState();const url=new URL(location.href);url.searchParams.set('child',child);url.searchParams.set('subject',subject);history.replaceState(null,'',url);renderHome();}
  function newQuestion(item,entry){return{id:item.id,stage:entry==='memory'?'preview':'question',draft:'',original:'',attempts:0,peeked:entry==='memory'||Date.now()-(state.exposures?.[item.id]||0)<600000,committed:false,done:false,result:null};}
  function start(kind='all'){
    if(saveBlocked)return notice('请先到“记录与设置”保留并核对本机记录。');
    if(subject==='english'&&(state.dailySeconds[dateKey()]||0)>=900)return notice('今天英语默写已练满 15 分钟，明天继续。词库仍可查看。');
    let s=session();
    if(!s||s.closed||s.index>=s.questions.length||s.kind!==kind){
      let list=kind==='review'?reviewItems():selectedItems();if(!list.length)return notice(kind==='review'?'还没有需要复查的错词。':'请先选择一个单元。');
      list=[...list].sort((a,b)=>{const ar=state.records[a.id],br=state.records[b.id];const rank=r=>!r?0:r.reviewNeeded?1:2;return rank(ar)-rank(br)||(ar?.lastAt||'').localeCompare(br?.lastAt||'');});
      const seenWords=new Set();list=list.filter(item=>{const key=normalize(item.text);if(seenWords.has(key))return false;seenWords.add(key);return true;});
      if(kind==='review'||state.settings.shuffle){list=[...list];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}}
      if(state.settings.size!=='all')list=list.slice(0,Number(state.settings.size));
      s={id:uid(),kind,entry:state.settings.entry,answer:state.settings.answer,startedAt:new Date().toISOString(),questions:list.map(x=>newQuestion(x,state.settings.entry)),index:0,seconds:0,closed:false,syncStatus:null};state.session=s;persist();
    }
    running=true;lastTick=performance.now();show('practice');renderQuestion();
  }
  function effectiveClue(item){return subject==='english'?item.meaning||'':item.pinyin||item.meaning||'';}
  function renderQuestion(){
    stopAudio();const s=session(),q=question(),item=currentItem();if(!q||!item)return renderSummary();
    text('questionNumber',`${s.index+1} / ${s.questions.length}`);text('unitLine',unitLabel(item.unit)+(item.lesson?' · '+item.lesson:''));text('typeLine',typeLabel(item.type));$('progressBar').style.width=`${100*s.index/s.questions.length}%`;
    text('clock',`${Math.floor(s.seconds/60)}:${String(Math.floor(s.seconds)%60).padStart(2,'0')}`);
    const noAudio=s.entry==='listen'&&!audioSource(item),noClue=s.entry==='meaning'&&!effectiveClue(item);
    if(q.stage==='question'&&(noAudio||noClue)&&!q.peeked){q.stage='preview';q.peeked=true;persist();}
    $('previewBlock').hidden=q.stage!=='preview';$('questionBlock').hidden=q.stage!=='question';$('answerBlock').hidden=!['answer','repair','success','done'].includes(q.stage);$('repairBlock').hidden=q.stage!=='repair';$('successBlock').hidden=!['success','done'].includes(q.stage);
    if(['preview','answer','repair','success','done'].includes(q.stage))expose(item);
    text('taskLabel',q.stage==='preview'?(noAudio?'这个词暂无录音，先看清再遮住':'看清写法，再遮住试写'):s.answer==='paper'?'听清或看提示，写在纸上':'听清或看提示，独立拼出来');
    text('previewWord',item.text);text('previewMeaning',item.meaning||'');$('previewWord').lang=subject==='english'?'en':'zh';
    text('questionClue',s.entry==='meaning'?effectiveClue(item):s.entry==='memory'?(subject==='english'?item.meaning||'':'把刚才的词写出来'):'');
    $('playButton').disabled=!audioSource(item);$('slowButton').disabled=!audioSource(item);text('audioMessage',noAudio?'这个词暂无录音，可看词后遮住默写。':'');
    $('answerForm').hidden=s.answer!=='type';$('paperDone').hidden=s.answer!=='paper';$('typedAnswer').value=q.draft;
    text('referenceWord',item.text);$('referenceWord').lang=subject==='english'?'en':'zh';text('referenceMeaning',item.meaning||'');$('answerAudio').disabled=!audioSource(item);
    text('originalAnswer',q.original?`你的原答：${q.original}`:q.committed?'请逐字核对纸上的原答。':'这次看过了提示，再遮住练一次。');
    text('answerHint',q.peeked?'看过答案后写对，会记为订正。':s.answer==='paper'?'对照你已经写好的原答，别边看边改。':'先找出不同的字母，再回到原题。');
    $('paperJudgement').hidden=!(q.stage==='answer'&&q.committed&&s.answer==='paper');$('peekRetry').hidden=!(q.stage==='answer'&&!q.committed);
    $('letterCompare').replaceChildren();if(q.original&&s.answer==='type'){const typed=normalize(q.original),expected=normalize(item.text);[...item.text].forEach((c,i)=>{const node=document.createElement(typed[i]===expected[i]?'span':'mark');node.textContent=c;$('letterCompare').append(node);});}
    text('repairReference',item.text);text('repairGap',subject==='english'?'有一处拼写还没记稳。':'有一处写法还没记稳。');
    $('repairRetry').hidden=q.attempts>=2;
    text('successText',q.result==='independent'?(s.answer==='paper'?'这次自查：独立写对了。':'这次独立拼对了。'):q.result==='assisted'?'这次订正好了，下一轮再独立试试。':'已经记入错词，之后再复查。');
    text('nextButton',s.index+1>=s.questions.length?'完成这一轮':'下一个词 →');$('previousButton').disabled=s.index===0;
    $('wordCard').dataset.phase=s.kind==='review'?'transfer':q.stage==='preview'?'guided':q.stage==='repair'?'repair':'independent';
  }
  function typeLabel(type){return ({word:'单词',phrase:'词组',sentence:'句子',character:'会写字',recitation:'背默',poem:'古诗',vocabulary:'词语',词语:'词语',字:'会写字',会写字:'会写字'})[type]||type||'词语';}
  function record(result,answer=''){
    const s=session(),q=question(),item=currentItem();if(!q||q.done)return;
    const r=state.records[item.id]||{wrongCount:0,reviewNeeded:false,recoveryRounds:[],lastAt:null};
    if(result==='wrong'||result==='skipped'||result==='assisted'){r.reviewNeeded=true;r.recoveryRounds=[];if(result==='wrong')r.wrongCount++;}
    if(result==='independent'&&r.reviewNeeded){r.recoveryRounds=unique([...r.recoveryRounds,s.id]);if(r.recoveryRounds.length>=2)r.reviewNeeded=false;}
    r.lastAt=new Date().toISOString();state.records[item.id]=r;
    const entry={id:`${s.id}:${s.index}:${q.id}`,roundId:s.id,itemId:item.id,at:r.lastAt,result,answer:String(answer).slice(0,2000),method:s.answer==='paper'?'paper-self-check':'typed',entryMode:s.entry,peeked:q.peeked,attempts:q.attempts,stage:'final'};
    state.history.push(entry);q.done=true;q.result=result;persist();
  }
  function markWrong(){const q=question();q.attempts=Math.min(2,q.attempts+1);const s=session(),item=currentItem();const r=state.records[item.id]||{wrongCount:0,reviewNeeded:false,recoveryRounds:[],lastAt:null};r.wrongCount++;r.reviewNeeded=true;r.recoveryRounds=[];r.lastAt=new Date().toISOString();state.records[item.id]=r;state.history.push({id:`${s.id}:${s.index}:${q.id}:attempt${q.attempts}`,roundId:s.id,itemId:item.id,at:r.lastAt,result:'wrong',answer:q.draft||'',method:s.answer==='paper'?'paper-self-check':'typed',entryMode:s.entry,peeked:q.peeked,attempts:q.attempts,stage:'attempt'});q.peeked=true;q.stage='repair';q.hadWrong=true;persist();renderQuestion();}
  function submit(){
    if(!running||composing)return;const q=question();if(q.done)return;const value=$('typedAnswer').value.slice(0,2000);if(!value.trim()){text('audioMessage','先写一个答案，或者点“看一眼”。');return;}q.draft=value;q.original ||= value;q.committed=true;
    const item=currentItem();const candidates=[item.text,...(Array.isArray(item.acceptedAnswers)?item.acceptedAnswers:[]),...(Array.isArray(item.accepted)?item.accepted:[])];
    if(candidates.some(a=>normalize(a)===normalize(value))){record(q.peeked?'assisted':'independent',value);q.stage='success';persist();renderQuestion();}else markWrong();
  }
  function peek(){const q=question();q.draft=$('typedAnswer').value.slice(0,2000);q.original ||= q.draft;q.peeked=true;q.committed=false;q.stage='answer';persist();renderQuestion();}
  function retry(){const q=question();q.peeked=true;q.committed=false;q.draft='';q.stage='question';persist();renderQuestion();}
  function next(){const q=question();if(!q.done)record('skipped',q.original);session().index++;persist();if(session().index>=session().questions.length)renderSummary();else renderQuestion();}
  function summary(){const s=session();const list=s?s.questions.filter(q=>q.done||q.hadWrong).map(q=>({itemId:q.id,result:q.result||(q.hadWrong?'wrong':'skipped'),method:s.answer==='paper'?'paper-self-check':'typed',peeked:q.peeked})):[];return {total:list.length,independent:list.filter(h=>h.result==='independent').length,assisted:list.filter(h=>h.result==='assisted').length,pending:list.filter(h=>state.records[h.itemId]?.reviewNeeded).length,list};}
  function renderSummary(){
    show('summary');const s=session(),sum=summary();if(!s){renderHome();return;}
    if(s.index>=s.questions.length)s.closed=true;persist();
    text('summaryTitle',s.index>=s.questions.length?'这一轮，记牢了一点。':'进度已收好。');text('summaryMain',`已练 ${sum.total} / ${s.questions.length} 项`);text('independentCount',sum.independent);text('assistedCount',sum.assisted);text('pendingCount',sum.pending);text('summaryDetails',`用时 ${Math.floor(s.seconds/60)} 分 ${Math.floor(s.seconds%60)} 秒。${s.answer==='paper'?'纸笔结果为你逐项核对后的自查。':'拼打结果依据本轮实际输入。'}错词会保留到后续独立复查。未作答 ${s.questions.length-sum.total} 项不计入本轮完成。`);
    text('syncStatus',testing()?'家长测试中，记录与孩子分开，不上传。':s.syncStatus==='synced'?'本轮已同步。':s.syncStatus==='queued'?'已在本机保存，云端发送待完成。':s.closed?'本轮已保存在这台设备。':'本机进度已保存。先完成本轮，或明确结束本轮后再同步。');$('syncButton').disabled=testing()||sum.total===0||s.syncStatus==='synced'||!s.closed;text('syncButton',s.syncStatus==='queued'?'重试同步':'完成并同步');$('resumeButton').hidden=s.closed||s.index>=s.questions.length;$('endRoundButton').hidden=s.closed||s.index>=s.questions.length;
  }
  async function sync(){
    const s=session(),sum=summary();if(testing()||!sum.total||s.syncStatus==='synced'||!s.closed)return;
    pause();s.eventId ||= `${APP}:${child}:${subject}:${s.id}`;
    if(s.syncStatus!=='queued'){
      const accepted=Sync.complete({kid:child,subject:subject==='english'?'英语':'语文',topic:'期中词语默写',source:`apps/${APP}.html?child=${child}&subject=${subject}`,client_event_id:s.eventId,payload:{appId:APP,version:VERSION,roundId:s.id,unanswered:s.questions.length-sum.total,duration_seconds:Math.floor(s.seconds),completed:sum.total,independent:sum.independent,assisted:sum.assisted,reviewNeeded:reviewItems().map(x=>x.id),method:s.answer==='paper'?'paper-self-check':'typed',results:sum.list.map(h=>({itemId:h.itemId,result:h.result,method:h.method,peeked:h.peeked}))}});
      if(!accepted){persist();renderSummary();text('syncStatus','未加入同步队列；本机记录仍在。');return;}s.syncStatus='queued';persist();
    }
    $('syncButton').disabled=true;text('syncStatus','正在同步…');
    try{const result=await Sync.flush();if(!result.queued&&!result.pending&&(result.ok||Sync.queueSize()===0))s.syncStatus='synced';}catch{/* Retain queued status for a later retry. */}
    persist();renderSummary();
  }
  function sourceText(item){const raw=item.source;let value=Array.isArray(raw)?raw.map(v=>typeof v==='string'?v:v.label||v.title||'').join('；'):typeof raw==='string'?raw:raw?.label||raw?.title||'';if(item.page)value+=` · ${item.page}`;return value||'教材词表与本单元资料';}
  function makeRow(item,review=false){
    const row=document.createElement('details');row.className='word-row';const head=document.createElement('summary'),word=document.createElement('strong'),meaning=document.createElement('span');word.textContent=review?'点击展开答案':item.text;word.lang=subject==='english'?'en':'zh';meaning.textContent=(review?item.meaning||item.pinyin:item.meaning||item.pinyin)||typeLabel(item.type);head.append(word,meaning);row.append(head);if(review){row.addEventListener('toggle',()=>{if(row.open){word.textContent=item.text;expose(item);}else word.textContent='点击展开答案';});}else expose(item);
    const source=document.createElement('p');source.textContent=sourceText(item);row.append(source);
    const status=document.createElement('p'),r=state.records[item.id];status.textContent=r?(r.reviewNeeded?`待复查 · 已在 ${r.recoveryRounds.length} 轮独立写对`:'最近复查已通过，历史记录保留'):'还没有本机练习记录。';row.append(status);
    const controls=document.createElement('div');controls.className='row-controls';const sound=document.createElement('button');sound.className='secondary';sound.textContent=audioSource(item)?'听这个词':'暂无录音';sound.disabled=!audioSource(item);sound.onclick=()=>play(item);const slow=document.createElement('button');slow.className='quiet';slow.textContent='慢速听';slow.disabled=!audioSource(item);slow.onclick=()=>play(item,true);const remember=document.createElement('button');remember.className='quiet';remember.textContent='加入复查';remember.onclick=()=>{const value=state.records[item.id]||{wrongCount:0,reviewNeeded:false,recoveryRounds:[],lastAt:null};value.reviewNeeded=true;value.recoveryRounds=[];state.records[item.id]=value;persist();status.textContent='已加入错词复查。';};controls.append(sound,slow,remember);row.append(controls);
    if(review){const tag=document.createElement('span');tag.className='tag';tag.textContent=unitLabel(item.unit);row.append(tag);}return row;
  }
  function renderCatalog(){
    const search=normalize($('wordSearch').value),unit=$('catalogUnit').value,type=$('catalogType').value;const list=items().filter(item=>(unit==='all'||String(item.unit)===unit)&&(type==='all'||item.type===type)&&(!search||normalize(`${item.text} ${item.meaning||''} ${item.lesson||''}`).includes(search)));
    text('catalogScope',`${data.children[child].label} · ${subjectData().label} · 共 ${items().length} 项。展开词条可听音、查看出处或加入复查。`);text('wordResultCount',`显示 ${list.length} 项`);$('wordList').replaceChildren();
    for(const u of unique(list.map(x=>String(x.unit)))){const section=document.createElement('section');section.className='word-section';const h=document.createElement('h3');h.textContent=unitLabel(u);section.append(h);list.filter(x=>String(x.unit)===u).forEach(item=>section.append(makeRow(item)));$('wordList').append(section);}
    if(!list.length){const p=document.createElement('p');p.className='empty';p.textContent='没有找到这个词，试试换个关键词。';$('wordList').append(p);}
    const recitations=(subjectData().recitations||[]).filter(item=>(unit==='all'||String(item.unit)===unit)&&(!search||normalize(`${item.title||''} ${item.text||''} ${item.lesson||''}`).includes(search)));
    $('recitationChecklist').hidden=!recitations.length;$('recitationList').replaceChildren();
    for(const item of recitations){const row=document.createElement('details');row.className='recitation-row';const summary=document.createElement('summary'),title=document.createElement('strong'),tag=document.createElement('span');title.textContent=item.title||item.lesson||'课文背默';tag.textContent=item.type||'课后要求';tag.className='tag';summary.append(title,tag);const passage=document.createElement('p');passage.className='recitation-text';passage.textContent=item.text;const note=document.createElement('p');note.className='muted';note.textContent=[item.requiredBasis,item.examHint,sourceText(item)].filter(Boolean).join(' · ');row.append(summary,passage,note);$('recitationList').append(row);}
  }
  function openCatalog(){pause();$('catalogUnit').replaceChildren(new Option('全部单元','all'));for(const u of unique(items().map(x=>String(x.unit))))$('catalogUnit').append(new Option(unitLabel(u),u));$('catalogType').replaceChildren(new Option('全部类别','all'));for(const type of unique(items().map(x=>x.type||'词语')))$('catalogType').append(new Option(typeLabel(type),type));$('wordSearch').value='';renderCatalog();show('catalog');}
  function openReview(){const list=reviewItems();$('reviewList').replaceChildren(...list.map(x=>makeRow(x,true)));$('reviewEmpty').hidden=!!list.length;$('startReview').hidden=!list.length;show('review');}
  function openParent(){
    show('parent');text('parentMode',`${data.children[child].label} · ${subjectData().label} · ${testing()?'家长测试记录':'正式练习记录'}`);text('parentScope',subjectData().scopeNote||'根据已读取的教材与当前资料整理，可在首页调整单元。');text('parentStatistics',`本机共 ${state.history.length} 条作答；${reviewItems().length} 项待复查。历史不会因为一次答对而被删除。`);$('historyList').replaceChildren();
    for(const h of state.history.slice(-40).reverse()){const row=document.createElement('div');row.className='history-item';const label=document.createElement('span');label.textContent=`${itemMap.get(h.itemId)?.text||h.itemId} · ${{independent:'独立写对',assisted:'看后订正',wrong:'写错',skipped:'待复习'}[h.result]}`;const small=document.createElement('small');small.textContent=`${h.at.slice(0,10)} · ${h.method==='paper-self-check'?'纸笔自查':'实际拼打'}`;row.append(label,small);$('historyList').append(row);}
    $('testToggle').disabled=!!Sync?.isAutomaticTest();text('testToggle',testing()?'退出家长测试':'进入家长测试');text('parentStatus','');
  }
  function download(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  function exportJson(){pause();download(saveBlocked?localStorage.getItem(storageKey()):JSON.stringify(state,null,2),`${child}-${subject}-期中默写记录-${dateKey()}.json`,'application/json');}
  function exportMarkdown(){pause();const lines=[`# ${data.children[child].label} · ${subjectData().label}期中默写记录`,'',`模式：${testing()?'家长测试':'正式练习'}。纸笔结果为本人自查。`,'','| 日期 | 词语 | 结果 | 方式 |','| --- | --- | --- | --- |',...state.history.map(h=>`| ${h.at.slice(0,10)} | ${String(itemMap.get(h.itemId)?.text||h.itemId).replace(/\|/g,'／')} | ${{independent:'独立写对',assisted:'看后订正',wrong:'写错',skipped:'待复习'}[h.result]} | ${h.method==='paper-self-check'?'纸笔自查':'实际拼打'} |`)];download(lines.join('\n'),`${child}-${subject}-期中默写记录-${dateKey()}.md`,'text/markdown;charset=utf-8');}
  async function importJson(event){pause();const file=event.target.files?.[0];if(!file)return;try{if(file.size>5*1024*1024)throw new Error('记录文件超过 5 MB。');const incoming=validate(JSON.parse(await file.text()));if(saveBlocked)throw new Error('原记录需要先核对，暂不覆盖。');const oldEvents=new Map(state.history.map(h=>[h.id,h]));for(const h of incoming.history)if(oldEvents.has(h.id)&&JSON.stringify(oldEvents.get(h.id))!==JSON.stringify(h))throw new Error('存在同一作答编号但内容不同的记录，已保留原记录。');const historyMap=new Map([...state.history,...incoming.history].map(h=>[h.id,h]));state.history=[...historyMap.values()].sort((a,b)=>a.at.localeCompare(b.at));for(const[id,r]of Object.entries(incoming.records)){if(!state.records[id]||(r.lastAt||'')>(state.records[id].lastAt||''))state.records[id]=r;}for(const[day,s]of Object.entries(incoming.dailySeconds))state.dailySeconds[day]=Math.max(state.dailySeconds[day]||0,s);state.exposures ||= {};for(const[id,at]of Object.entries(incoming.exposures||{}))state.exposures[id]=Math.max(state.exposures[id]||0,at);persist();text('parentStatus','记录已合并。本页正在进行的这一轮保持不变。');}catch(error){text('parentStatus','没有导入：'+error.message);}event.target.value='';}
  function bind(){
    document.querySelectorAll('[data-child-choice]').forEach(n=>n.onclick=()=>changeIdentity(n.dataset.childChoice,subject));document.querySelectorAll('[data-subject-choice]').forEach(n=>n.onclick=()=>changeIdentity(child,n.dataset.subjectChoice));
    $('homeLink').onclick=e=>{e.preventDefault();renderHome();};document.querySelectorAll('[data-home]').forEach(n=>n.onclick=renderHome);$('parentOpen').onclick=openParent;$('catalogOpen').onclick=openCatalog;$('reviewOpen').onclick=openReview;$('startButton').onclick=()=>start(session()&&!session().closed&&session().index<session().questions.length?session().kind:'all');$('startReview').onclick=()=>start('review');
    for(const[id,key]of [['roundSize','size'],['entryMode','entry'],['answerMode','answer'],['practiceType','category']])$(id).onchange=()=>{state.settings[key]=$(id).value;persist();if(key==='category')renderHome();};$('shuffle').onchange=()=>{state.settings.shuffle=$('shuffle').checked;persist();};
    $('pauseButton').onclick=renderHome;$('coverButton').onclick=()=>{question().stage='question';persist();renderQuestion();};$('playButton').onclick=()=>play();$('slowButton').onclick=()=>play(currentItem(),true);$('answerAudio').onclick=()=>play();
    $('answerForm').onsubmit=e=>{e.preventDefault();submit();};$('typedAnswer').oncompositionstart=()=>{composing=true;};$('typedAnswer').oncompositionend=()=>{composing=false;};$('typedAnswer').oninput=()=>{if(question()&&!question().done){question().draft=$('typedAnswer').value.slice(0,2000);persist();}};
    $('paperDone').onclick=()=>{question().committed=true;question().stage='answer';persist();renderQuestion();};$('peekButton').onclick=peek;$('peekRetry').onclick=retry;$('paperCorrect').onclick=()=>{record(question().peeked?'assisted':'independent','');question().stage='success';persist();renderQuestion();};$('paperWrong').onclick=markWrong;$('repairRetry').onclick=retry;$('repairContinue').onclick=()=>{record('skipped',question().original);next();};$('nextButton').onclick=next;
    $('previousButton').onclick=()=>{if(session().index>0){session().index--;const q=question();if(q.done)q.stage='done';persist();renderQuestion();}};$('finishButton').onclick=renderSummary;$('endRoundButton').onclick=()=>{pause();session().closed=true;persist();renderSummary();};$('resumeButton').onclick=()=>start(session().kind);$('syncButton').onclick=sync;
    $('wordSearch').oninput=renderCatalog;$('catalogUnit').onchange=renderCatalog;$('catalogType').onchange=renderCatalog;$('printWords').onclick=()=>{stopAudio();window.print();};$('exportJson').onclick=exportJson;$('exportMarkdown').onclick=exportMarkdown;$('importJson').onchange=importJson;
    $('testToggle').onclick=()=>{pause();if(explicitTest){const url=new URL(location.href);url.searchParams.delete('test');location.href=url;return;}if(Sync?.isTest())Sync.stopTest();else Sync?.startTest();location.reload();};
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){pause();renderHome();}else if(document.hidden)stopAudio();});window.addEventListener('pagehide',pause);
    window.addEventListener('storage',event=>{if(event.key===storageKey()&&event.newValue){running=false;stopAudio();try{state=validate(JSON.parse(event.newValue));saveBlocked=false;renderHome();notice('另一页更新了记录，这里已暂停并读取最新进度。');}catch{saveBlocked=true;notice('另一页更新的记录需要核对，本页已暂停，不覆盖现有记录。');}}});
    setInterval(()=>{if(running){tick();if(running)persist();}},1000);
  }
  async function boot(){try{const response=await fetch('../data/midterm-dictation-20261024.json',{cache:'no-store'});if(!response.ok)throw new Error('词库暂时没有打开');data=await response.json();if(!data.children?.[child]?.subjects?.[subject]?.items?.length)throw new Error('当前孩子的词库尚未准备好');loadState();bind();$('app').hidden=false;$('loading').hidden=true;renderHome();}catch(error){text('loading',error.message+'。请稍后刷新重试。');}}
  boot();
})();
