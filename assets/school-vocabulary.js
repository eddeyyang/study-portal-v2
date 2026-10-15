import * as Core from './school-vocabulary-core.js';

const child = document.body.dataset.child;
const appId = child + '_school_vocabulary_20261012';
const key = 'study:' + child + ':school-vocabulary:v1';
const $ = id => document.getElementById(id);
const Sync = window.DDLearningSync;
const testing = () => !Sync || Sync.isTest();
const mode = () => testing() ? 'test' : 'production';
const leaseKey = key + ':lease:' + mode();
const tabId = crypto.randomUUID();
let data, state, day, session, active = false, lastTick = 0, storageOK = true, loadBlocked = false;
let view = 'home', composing = false;
const labels = {school:'学校朗读纸',classroom:'课本主题词 / 课堂原页',textbook:'电子课本词表',reference:'教辅对照'};

function text(id, value) { $(id).textContent = value; }
function show(name) {
  if (name !== 'practice') pause();
  view = name;
  for (const node of document.querySelectorAll('[data-screen]')) node.hidden = node.dataset.screen !== name;
  $('topBack').hidden = name === 'home';
  if (name !== 'practice') window.scrollTo({top:0, behavior:'instant'});
}
function notice(message) { text('notice', message); $('notice').hidden = !message; }
function persist() {
  if (loadBlocked) return false;
  try { localStorage.setItem(key, JSON.stringify(state)); return true; }
  catch { storageOK = false; pause(false); notice('本机保存暂不可用。先导出记录，再继续；关闭页面可能丢失进度。'); return false; }
}
function getLease() { try { return JSON.parse(localStorage.getItem(leaseKey) || 'null'); } catch { return null; } }
function renewLease() { try { localStorage.setItem(leaseKey, JSON.stringify({tabId, at:Date.now()})); } catch { /* persist reports storage errors */ } }
function releaseLease() { try { if (getLease()?.tabId === tabId) localStorage.removeItem(leaseKey); } catch { /* no-op */ } }
function pause(save = true) {
  if (active) tick();
  active = false; releaseLease();
  if (save && state) persist();
}
function clock() {
  if (!session) return;
  const left = Math.ceil(Core.remaining(session));
  text('clock', `${Math.floor(left / 60)}:${String(left % 60).padStart(2,'0')}`);
}
function tick() {
  if (!active || !session) return;
  const now = performance.now();
  Core.addTime(session, (now - lastTick) / 1000); lastTick = now;
  clock();
  if (Core.dayKey() !== day) {
    active = false; releaseLease(); persist(); notice('新的一天到了。今天这次已保存，刷新后开始新的安排。'); renderSummary(); return;
  }
  if (!Core.remaining(session)) {
    active = false; releaseLease(); persist(); renderSummary(); return;
  }
}
function renderHome() {
  const sum = Core.summary(session), list = Core.eligible(data, state);
  text('planLine', `${session.newCount} 个新词 · ${session.reviewCount} 个到期复习`);
  text('homeProgress', sum.completed ? `今天已练 ${sum.completed} 项，独立写对 ${sum.independent} 项。` : '看中文，写英文。想不起来就看一眼。');
  text('scopeLine', `当前先练 Unit 1–${state.throughUnit}，共 ${list.length} 项。`);
  text('catalogCount', `10 个单元 · ${data.counts.scheduled} 项课本与学校词汇`);
  text('start', session.closed ? '查看今天的记录' : session.seconds || sum.completed ? '继续今天' : '开始今天');
  $('start').disabled = loadBlocked;
  $('throughUnit').value = String(state.throughUnit);
  const variations = window.DAILY_SURPRISES;
  const stable = window.dailySurpriseKey(appId, child, day);
  let hash = 0; for (const c of stable) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  text('dailyNote', variations[hash % variations.length]);
  show('home'); clock();
}
function start() {
  if (session.closed) return renderSummary();
  const lease = getLease();
  if (lease && lease.tabId !== tabId && Date.now() - lease.at < 8000) return notice('另一个页面正在练习。请先暂停那一页，再继续。');
  if (!storageOK || loadBlocked) return notice('请先导出记录并解决保存问题，再开始练习。');
  notice(''); renewLease(); active = true; lastTick = performance.now(); show('practice'); renderQuestion();
}
function currentItem() { return data.items.find(x => x.id === Core.currentQuestion(session)?.id); }
function renderQuestion() {
  const q = Core.currentQuestion(session), item = currentItem();
  if (!q || session.closed) return renderSummary();
  const unit = data.units.find(u => u.id === item.unit);
  text('unitLine', `UNIT ${item.unit} · ${unit.title}`);
  text('questionCount', `${session.index + 1} / ${session.queue.length}`);
  text('questionMode', q.mode === 'recall' ? '隔一会儿，再想想' : q.mode === 'review' ? '复习一个旧词' : '试写一个新词');
  text('meaning', item.zh);
  text('inputHelp', item.promptNote || (item.kind === 'phrase' ? '这是一个词组，记得词与词之间留空格。' : '写在下面，按回车检查。'));
  $('answer').value = q.draft;
  $('answer').readOnly = q.done;
  $('answerForm').hidden = q.stage === 'answer';
  $('repair').hidden = q.stage !== 'answer';
  $('success').hidden = q.stage !== 'correct';
  $('reveal').hidden = q.done;
  text('check', q.done ? '下一词 →' : '检查');
  $('practiceCard').dataset.phase = q.mode === 'recall' ? 'transfer' : q.mode === 'review' ? 'recall' : 'independent';
  if (q.stage === 'answer') {
    text('original', q.original || q.draft || '还没有写');
    text('reference', item.en);
    text('repairReason', '看清字母，再遮住它试一次。');
    $('retry').hidden = q.attempts >= 2;
    $('letterDiff').replaceChildren();
    const typed = Core.normalize(q.original || q.draft), answer = Core.normalize(item.en);
    [...item.en].forEach((c, i) => {
      const span = document.createElement('span'); span.textContent = c;
      if (typed && typed[i] !== answer[i]) span.className = 'different-letter';
      $('letterDiff').appendChild(span);
    });
  }
  if (q.stage === 'correct') {
    text('correctWord', item.en);
    text('successMessage', q.independent ? '这次独立写对了。' : '这次练对了，明天再独立试试。');
  }
  text('practiceProgress', `已练 ${Core.summary(session).completed} 项`);
  clock();
  if (q.stage === 'question') $('answer').focus({preventScroll:true});
  else if (q.stage === 'correct') $('check').focus({preventScroll:true});
  else $('retry').hidden ? $('skip').focus({preventScroll:true}) : $('retry').focus({preventScroll:true});
}
function answer() {
  if (!active || composing) return;
  tick(); if (session.closed) return;
  const q = Core.currentQuestion(session);
  if (q.done) Core.advance(session);
  else {
    const result = Core.submit(data, state, day, $('answer').value);
    if (result.empty) { text('inputHelp', '先写一个答案，或点“看一眼”。'); return; }
  }
  persist(); renderQuestion();
}
function reveal() {
  if (!active) return;
  tick(); if (session.closed) return;
  const q = Core.currentQuestion(session); q.draft = $('answer').value.slice(0,150);
  Core.reveal(session); persist(); renderQuestion();
}
function retry() {
  const q = Core.currentQuestion(session);
  if (!active || q.attempts >= 2) return;
  q.stage = 'question'; q.draft = ''; persist(); renderQuestion();
}
function skip() {
  if (!active) return;
  tick(); if (session.closed) return;
  Core.skip(state, day); persist(); renderQuestion();
}
function renderSummary() {
  pause();
  const sum = Core.summary(session);
  text('summaryTitle', Core.remaining(session) <= 0 ? '15 分钟到了，收好。' : sum.completed ? '今天又记住一点。' : '今天先到这里。');
  text('summaryNumbers', `${sum.completed} 项已练 · ${sum.independent} 项独立写对`);
  text('summaryTime', `今天用时 ${Math.floor(sum.seconds/60)} 分 ${sum.seconds%60} 秒。${sum.pending ? `还有 ${sum.pending} 项没练，之后按每天的小份量继续。` : '今天的这一小份完成了。'}`);
  text('summaryReview', sum.review.length ? '明天优先再练：' + sum.review.map(id => data.items.find(x => x.id === id).en).join('、') : '到期词会在以后的小份量里再出现。');
  text('syncStatus', testing() ? '家长测试中，记录与孩子分开，不上传。' : session.syncStatus === 'synced' ? '本次记录已同步。' : session.syncStatus === 'queued' ? '本机已保存；同步队列待发送，可重试。' : '已保存在这台设备。');
  $('sync').disabled = testing() || !sum.completed || session.syncStatus === 'synced';
  text('sync', session.syncStatus === 'queued' ? '重试同步' : '完成并同步');
  $('resume').hidden = session.closed || Core.remaining(session) <= 0;
  show('summary');
}
async function sync() {
  if (testing() || !Core.summary(session).completed) return;
  session.closed = true; session.finishId ||= `school-vocabulary:${child}:${day}`;
  const sum = Core.summary(session);
  if (session.syncStatus !== 'queued') {
    const accepted = Sync.complete({kid:child,subject:'英语',topic:'校内每日单词',source:`apps/${appId}.html`,client_event_id:session.finishId,
      payload:{appId,version:1,date:day,duration_seconds:sum.seconds,attemptCount:sum.completed,independentCount:sum.independent,review:sum.review,pending:sum.pending}});
    if (!accepted) { renderSummary(); text('syncStatus','记录未加入同步队列，本机进度还在。'); return; }
    session.syncStatus = 'queued'; persist();
  }
  $('sync').disabled = true; text('syncStatus','正在同步…');
  try {
    const result = await Sync.flush();
    // The shared layer may already have delivered an authorized queue on reload.
    if (!result.queued && !result.pending && (result.ok || Sync.queueSize() === 0)) session.syncStatus = 'synced';
    persist(); renderSummary();
  } catch { persist(); renderSummary(); }
}
function renderCatalog() {
  const search = Core.normalize($('search').value), unit = Number($('filterUnit').value), kind = $('filterKind').value;
  const filtered = data.items.filter(x => (!unit || x.unit === unit) && (!kind || x.kind === kind) && (!search || Core.normalize(x.en + ' ' + x.zh).includes(search)));
  const now = data.items.filter(x => x.schedule && x.unit <= state.throughUnit).length;
  text('catalogSummary', `本学期 ${data.counts.scheduled} 项：当前范围 ${now} 项，后续 ${data.counts.scheduled-now} 项；另有 ${data.counts.all-data.counts.scheduled} 项对照词暂不排入。`);
  text('resultCount', `显示 ${filtered.length} 项（同一词出现在不同单元时分别列出）`);
  const root = $('wordList'); root.replaceChildren();
  for (const u of data.units) {
    const items = filtered.filter(x => x.unit === u.id); if (!items.length) continue;
    const section = document.createElement('section'); section.className='unit-list';
    const h = document.createElement('h3'); h.textContent=`Unit ${u.id} · ${u.title}`; section.appendChild(h);
    const p = document.createElement('p'); p.className='muted small'; p.textContent=`${items.filter(x=>x.kind==='word').length} 个单词 · ${items.filter(x=>x.kind==='phrase').length} 个词组`; section.appendChild(p);
    for (const item of items) {
      const row = document.createElement('details'); row.className = 'word-row';
      const summary = document.createElement('summary');
      const title = document.createElement('strong'); title.lang='en'; title.textContent=item.en;
      const meaning = document.createElement('span'); meaning.textContent=item.zh;
      const tag = document.createElement('small'); tag.className='tag'; tag.textContent=!item.schedule?'对照 · 暂不排入':item.unit>state.throughUnit?'后续单元':labels[item.tier];
      summary.append(title,meaning,tag); row.appendChild(summary);
      const sources = document.createElement('p'); sources.textContent=item.sources.map(s=>s.label).join('；') + (item.note?'。'+item.note:''); row.appendChild(sources);
      const progress = document.createElement('p'); const record=state.words[item.id];
      progress.textContent=record?`已练过；不同日期独立写对 ${record.successes} 次，下次复习 ${record.due}。`:'还没有本机练习记录。'; row.appendChild(progress); section.appendChild(row);
    }
    root.appendChild(section);
  }
}
function download(content, name, type) {
  const blob = new Blob([content],{type}), url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href=url; a.download=name; a.hidden=true; document.body.appendChild(a); a.click(); a.remove();
  // Give mobile browsers time to hand the file to their download manager.
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function exportWords() {
  const quote = s => '"' + String(s).replaceAll('"','""') + '"';
  const rows = [['单元','类型','英文','中文','范围','出处'],...data.items.map(x=>['U'+x.unit,x.kind==='word'?'单词':'词组',x.en,x.zh,!x.schedule?'暂不排入':x.unit<=state.throughUnit?'当前范围':'后续单元',x.sources.map(s=>s.label).join('；')])];
  download('\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n'),child+'-2026秋季校内词表.csv','text/csv;charset=utf-8');
}
async function importRecords(event) {
  pause(); const file=event.target.files[0]; if (!file) return;
  try {
    if (file.size>2*1024*1024) throw new Error('记录文件过大。');
    const incoming=JSON.parse(await file.text());
    if (incoming.appId!==appId || incoming.mode!==mode()) throw new Error('请选择这个孩子、同一模式导出的记录。测试记录不能导入正式练习。');
    const merged=Core.mergeState(state,incoming.state,data);
    state=merged; loadBlocked=false; session=Core.planDay(data,state,day); persist(); text('parentStatus','记录已合并；已有用时和进度已保留。');
  } catch(error) { text('parentStatus','没有导入：'+error.message); }
  event.target.value='';
}
async function boot() {
  try {
    const response=await fetch(`../data/school-vocabulary/${child}.json`);
    if (!response.ok) throw new Error('词表未能加载');
    data=await response.json(); if (data.child!==child) throw new Error('词表身份不匹配');
    state=Core.freshState(child,data.defaultThroughUnit); day=Core.dayKey();
    const raw=localStorage.getItem(key);
    if (raw) {
      try { state=Core.validateState(JSON.parse(raw),data); }
      catch { loadBlocked=true; notice('原有本机记录无法读取，已保留原文件。请在家长页导出原记录后核对，暂不覆盖。'); }
    }
    session=Core.planDay(data,state,day);
    for (const u of data.units) {
      for (const id of ['filterUnit','throughUnit']) {
        const option=document.createElement('option');option.value=u.id;option.textContent='Unit '+u.id+' · '+u.title;$(id).appendChild(option);
      }
    }
    text('sourcePolicy',data.sourcePolicy);
    text('parentCounts',`哥哥或弟弟各有独立记录。本页 ${data.counts.all} 项：${data.counts.word} 个单词、${data.counts.phrase} 个词组；其中 ${data.counts.scheduled} 项可安排，其余 ${data.counts.all-data.counts.scheduled} 项只作版本对照。`);
    text('testToggle',testing()?'退出家长测试':'进入家长测试'); $('testToggle').disabled=Sync?.isAutomaticTest();
    $('start').onclick=start; $('answerForm').onsubmit=e=>{e.preventDefault();answer();};
    $('answer').oncompositionstart=()=>{composing=true;}; $('answer').oncompositionend=()=>{composing=false;};
    $('answer').oninput=()=>{ const q=Core.currentQuestion(session);if(q&&!q.done){q.draft=$('answer').value.slice(0,150);persist();} };
    $('reveal').onclick=reveal; $('retry').onclick=retry; $('skip').onclick=skip;
    $('pause').onclick=renderHome; $('stop').onclick=()=>{pause();session.closed=true;persist();renderSummary();};
    $('resume').onclick=start; $('sync').onclick=sync;
    $('catalog').onclick=()=>{renderCatalog();show('catalog');};
    $('parent').onclick=()=>{text('parentStatus','');show('parent');};
    $('topBack').onclick=renderHome; $('homeAgain').onclick=renderHome;
    for(const id of ['search','filterUnit','filterKind']) $(id).addEventListener('input',renderCatalog);
    $('exportWords').onclick=exportWords;
    $('saveProgress').onclick=()=>{
      state.throughUnit=Number($('throughUnit').value);
      if (!session.seconds && !session.queue.some(q=>q.attempts||q.revealed)) {delete state.days[day];session=Core.planDay(data,state,day);}
      persist();text('parentStatus',`已设为 Unit 1–${state.throughUnit}。已开始的今日小份量保持原样，新范围从下一份生效。`);
    };
    $('exportRecords').onclick=()=>download(loadBlocked?localStorage.getItem(key):JSON.stringify({appId,mode:mode(),exportedAt:new Date().toISOString(),state},null,2),child+'-背词记录-'+day+'.json','application/json');
    $('importRecords').onchange=importRecords;
    $('testToggle').onclick=()=>{pause();if(testing())Sync?.stopTest();else Sync?.startTest();location.reload();};
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)renderHome();});
    window.addEventListener('pagehide',()=>pause());
    window.addEventListener('storage',e=>{if(e.key===key&&e.newValue){active=false;releaseLease();try{state=Core.validateState(JSON.parse(e.newValue),data);session=Core.planDay(data,state,day);renderHome();notice('另一页更新了进度，已暂停并读入最新记录。');}catch{notice('另一页的记录需要核对，本页已暂停。');}}});
    setInterval(()=>{if(active){tick();if(active){renewLease();persist();}}},1000);
    renderHome(); $('loading').hidden=true;
  } catch(error) { text('loading',error.message+'。请刷新重试。'); }
}
boot();
