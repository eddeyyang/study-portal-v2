/* 听写台 · Claude 设计版（2026-10-24）
   真实流程：选范围 → 看一遍（词全部摆出来） → 按"开始听写"立刻计时、逐词报读（屏幕上看不见词）
   → 孩子在纸上写 → 报完自动停表 → 对答案：每个词点一下标"错" → 结果 → 错词再默一遍。
   朗读只用仓库里预先生成的录音；没有录音的词明示，绝不悄悄换成浏览器语音。
   记录按孩子、学科分开保存在这台设备；?test=1 为家长测试，不计入正式记录。 */
(() => {
'use strict';
const params = new URLSearchParams(location.search);
const DATA_URL = '../../../data/midterm-dictation-20261024.json';
const AUDIO_DIR = '../../audio/v2-dictation/';
const CHILD = { kenton: { label: '哥哥', en: 'Kenton', initial: 'K' }, eddey: { label: '弟弟', en: 'Eddey', initial: 'E' } };
const TEST = ['1', 'true'].includes(params.get('test')) || params.get('mode') === 'test' || ['1', 'true'].includes(params.get('parentTest'));
const PACE = { slow: { label: '慢', k: 1.4 }, mid: { label: '中', k: 1 }, fast: { label: '快', k: 0.75 } };

let who = ['kenton', 'eddey'].includes(params.get('who')) ? params.get('who') : (['kenton', 'eddey'].includes(params.get('child')) ? params.get('child') : 'eddey');
let subject = ['chinese', 'english'].includes(params.get('subject')) ? params.get('subject') : 'chinese';
let data = null, manifest = null, state = null, round = null, storageOK = true;
let audio = null, timer = 0, clockTimer = 0, writingTimer = 0, epoch = 0;

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = () => `sp2.dictation:${who}:${subject}:${TEST ? 'test' : 'formal'}`;
const fnv = s => { let x = 0x811c9dc5; for (const b of new TextEncoder().encode(s)) { x ^= b; x = Math.imul(x, 0x01000193) >>> 0; } return x.toString(16).padStart(8, '0'); };
const lang = () => subject === 'english' ? 'en' : 'zh';
const isEn = () => subject === 'english';
const today = () => new Intl.DateTimeFormat('en-CA').format(new Date());
const fmtClock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const items = () => data.children[who].subjects[subject].items;
const itemMap = () => new Map(items().map(i => [i.id, i]));
const clue = it => isEn() ? (it.meaning || '') : (it.pinyin || '');
const audioOf = it => { const m = manifest?.items?.[`${lang()}|${it.text}`]; return m && m.ok ? AUDIO_DIR + m.file : null; };
const lessonKey = it => `${it.unit}|${it.lesson}`;
const icons = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6M8 12h12"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 6.5 3 3"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10-6.5Z"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-5m5 0V2M4 17h5m-5 0v5M20 7A9 9 0 0 0 4 8m0 9a9 9 0 0 0 16-1"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
};

/* ---------- 记录 ---------- */
function fresh() { return { v: 1, who, subject, mode: TEST ? 'test' : 'formal', settings: { lessons: null, pace: 'mid', enMode: 'en', preview: true }, words: {}, rounds: [] }; }
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY()) || 'null'); if (s && s.v === 1 && s.who === who && s.subject === subject) { state = s; state.settings = Object.assign(fresh().settings, s.settings || {}); return; } } catch (e) { }
  state = fresh();
}
function save() { try { localStorage.setItem(KEY(), JSON.stringify(state)); storageOK = true; } catch (e) { storageOK = false; } }
function wordRec(id) { return state.words[id] || (state.words[id] = { wrong: 0, right: 0, streak: 0, needReview: false, last: null, lastResult: null }); }
function reviewIds() { return items().filter(i => state.words[i.id]?.needReview).map(i => i.id); }

/* ---------- 音频 ---------- */
function stopAudio() { epoch++; clearTimeout(timer); timer = 0; clearInterval(writingTimer); writingTimer = 0; if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; } }
function playFile(src) {
  return new Promise(resolve => {
    const my = ++epoch; const a = new Audio(src); audio = a; let done = false;
    const finish = ok => { if (done) return; done = true; if (my === epoch && audio === a) audio = null; resolve(ok); };
    a.addEventListener('ended', () => finish(true));
    a.addEventListener('error', () => finish(false));
    a.play().catch(() => finish(false));
    setTimeout(() => finish(false), 20000);
  });
}

/* ---------- 路由 ---------- */
function view(name, html) { document.body.dataset.screen = name; $('#app').innerHTML = html; window.scrollTo({ top: 0, behavior: 'instant' }); }
function topbar(title, sub, { back = 'home', right = '' } = {}) {
  return `<header class="topbar"><button class="icon-btn" data-act="${back}" aria-label="返回">${icons.back}</button><div class="crumb"><b>${esc(title)}</b><small>${esc(sub)}</small></div>${TEST ? '<span class="test-chip">测试，不计入</span>' : ''}${right}</header>`;
}
const meChip = () => `<span class="me-chip"><i>${CHILD[who].initial}</i><span class="t">${CHILD[who].label} ${CHILD[who].en}</span></span>`;

/* ---------- 首页：选范围 ---------- */
function unitsOf(list) {
  const units = new Map();
  for (const it of list) { const u = units.get(it.unit) || { unit: it.unit, lessons: new Map() }; const l = u.lessons.get(lessonKey(it)) || { key: lessonKey(it), name: it.lesson, n: 0 }; l.n++; u.lessons.set(l.key, l); units.set(it.unit, u); }
  return [...units.values()].sort((a, b) => a.unit - b.unit);
}
function selectedLessons() { const all = unitsOf(items()).flatMap(u => [...u.lessons.values()].map(l => l.key)); const sel = state.settings.lessons; return sel ? all.filter(k => sel.includes(k)) : all; }
function selectedItems() { const sel = new Set(selectedLessons()); return items().filter(i => sel.has(lessonKey(i))); }
function renderHome() {
  stopAudio(); round = null;
  const list = items(); const units = unitsOf(list); const sel = new Set(selectedLessons()); const chosen = selectedItems();
  const noAudio = chosen.filter(i => !audioOf(i)).length; const review = reviewIds();
  const subj = data.children[who].subjects[subject];
  const unitHtml = units.map(u => `<div class="unit"><div class="unit-head"><b>第 ${u.unit} 单元</b><button data-act="unit" data-unit="${u.unit}">${[...u.lessons.values()].every(l => sel.has(l.key)) ? '清空本单元' : '全选本单元'}</button></div><div class="lessons">${[...u.lessons.values()].map(l => `<button class="chip" data-act="lesson" data-key="${esc(l.key)}" aria-pressed="${sel.has(l.key)}">${esc(l.name)}<small>${l.n}</small></button>`).join('')}</div></div>`).join('');
  view('home', `${topbar('听写台', `${CHILD[who].label} · ${subj.label} · 期中复习`, { back: 'portal', right: meChip() })}
  <div class="hero"><div class="kicker">${esc(data.children[who].grade)} · ${esc(subj.label)}</div><h1>${isEn() ? '英语听写' : '语文听写'}</h1>
    <p>${isEn() ? '先把要默的单词和词组看一遍，再按"开始听写"：马上计时，一个一个报给你听，你在本子上写。' : '先把要默的词语看一遍，再按"开始听写"：马上计时，一个一个报给你听，你在本子上写。'}</p>
    <div class="flow"><span>看一遍</span><i>→</i><span>听写计时</span><i>→</i><span>对答案</span><i>→</i><span>错词再默</span></div>
    <div class="row" style="margin-top:18px"><div class="seg" role="group" aria-label="学科"><button data-act="subject" data-subject="chinese" aria-pressed="${subject === 'chinese'}">语文</button><button data-act="subject" data-subject="english" aria-pressed="${subject === 'english'}">英语</button></div>
    <div class="seg" role="group" aria-label="孩子"><button data-act="who" data-who="kenton" aria-pressed="${who === 'kenton'}">哥哥</button><button data-act="who" data-who="eddey" aria-pressed="${who === 'eddey'}">弟弟</button></div></div>
  </div>
  ${review.length ? `<div class="section"><h2>上次写错的 <small>${review.length} 个</small></h2><div class="row"><button class="btn primary" data-act="start-review">只默错词 ${review.length} 个</button><button class="btn ghost" data-act="show-review">看看是哪些</button></div></div>` : ''}
  <div class="section"><h2>这次默哪几课 <small>已选 ${chosen.length} 个</small></h2><div class="units">${unitHtml}</div><p class="note" style="margin-top:10px">${esc(subj.scopeNote || '')}</p></div>
  <div class="section"><h2>报读方式</h2><div class="options">
    <div class="opt"><div><b>报读节奏</b><small>每个词读两遍，再留写字的时间</small></div><div class="seg">${Object.entries(PACE).map(([k, p]) => `<button data-act="pace" data-pace="${k}" aria-pressed="${state.settings.pace === k}">${p.label}</button>`).join('')}</div></div>
    <div class="opt"><div><b>先看一遍</b><small>关掉就直接报读，当作检验</small></div><label class="toggle" style="box-shadow:none;padding:0"><input type="checkbox" data-act="preview" ${state.settings.preview ? 'checked' : ''}></label></div>
  </div></div>
  ${noAudio ? `<p class="note warn" style="margin-top:16px">所选范围里有 ${noAudio} 个词还没有录音，报到它时会提示家长口报。</p>` : ''}
  <div class="section"><div class="row"><button class="btn quiet small" data-act="parent">记录与设置</button><span class="note">${storageOK ? '记录保存在这台设备' : '这台设备无法保存记录'}</span></div></div>
  <div class="start-bar"><div class="meta">${chosen.length ? `共 ${chosen.length} 个 · 预计 ${Math.ceil(chosen.length * (isEn() ? 9 : 8) * PACE[state.settings.pace].k / 60)} 分钟左右` : '先选一课'}</div><button class="btn primary big" data-act="start" ${chosen.length ? '' : 'disabled'}>${state.settings.preview ? '先看一遍' : '直接开始听写'}</button></div>`);
}

/* ---------- 一轮 ---------- */
function startRound(ids, kind) {
  stopAudio();
  const map = itemMap();
  const list = ids.map(id => map.get(id)).filter(Boolean);
  if (kind === 'review') list.sort(() => Math.random() - .5);
  round = { id: `${today()}-${Date.now().toString(36)}`, kind, ids: list.map(i => i.id), index: 0, seconds: 0, started: null, phase: 'idle', wrong: new Set(), previewed: !!state.settings.preview, pace: state.settings.pace };
  if (state.settings.preview) renderPreview(); else beginDictation();
}
function renderPreview() {
  const map = itemMap(); const list = round.ids.map(id => map.get(id));
  view('preview', `${topbar('看一遍', `${list.length} 个 · 记住怎么写`, { right: `<span class="test-chip" style="background:var(--me-wash);color:var(--me-ink)">${round.kind === 'review' ? '错词' : '第 1 轮'}</span>` })}
  <div class="preview-head"><h1>${round.kind === 'review' ? '上次写错的，再看一遍' : '先看一遍，记住怎么写'}</h1><p>看好了就按下面的按钮：会马上开始计时和报读，报的时候屏幕上不会再出现这些词。</p></div>
  <div class="cards ${isEn() ? 'en' : ''}">${list.map(it => `<div class="card ${isEn() ? 'en' : ''} ${audioOf(it) ? '' : 'noaudio'} ${round.kind === 'review' ? 'wrong' : ''}"><div class="w">${esc(it.text)}</div><div class="s">${esc(clue(it))}</div>${audioOf(it) ? '' : '<div class="n">没有录音，到时家长口报</div>'}</div>`).join('')}</div>
  <div class="start-bar"><div class="meta">按下去就开始计时</div><button class="btn primary big" data-act="begin">${icons.speaker}开始听写</button></div>`);
}
function beginDictation() {
  round.started = Date.now(); round.phase = 'speaking'; round.index = 0;
  renderStage(); startClock(); speakCurrent();
}
function startClock() { clearInterval(clockTimer); let last = performance.now(); clockTimer = setInterval(() => { if (round && round.phase !== 'paused' && round.phase !== 'done') { const now = performance.now(); round.seconds += Math.min(2, (now - last) / 1000); last = now; } else last = performance.now(); const c = $('#clock'); if (c) c.firstChild.textContent = fmtClock(round.seconds); }, 250); }
function gapFor(it) { const n = isEn() ? Math.max(1, it.text.trim().split(/\s+/).length) : it.text.replace(/[^一-鿿]/g, '').length; const base = isEn() ? 5 + n * 2.2 : 3 + n * 1.8; return Math.round(base * PACE[round.pace].k * 10) / 10; }
function renderStage() {
  const map = itemMap(); const it = map.get(round.ids[round.index]); const total = round.ids.length;
  view('stage', `${topbar('听写中', `${CHILD[who].label} · ${isEn() ? '英语' : '语文'}`, { back: 'quit' })}
  <div class="stage" id="stage" data-phase="${round.phase}">
    <div class="clock num" id="clock">${fmtClock(round.seconds)}<small>用时</small></div>
    <div class="progress"><div class="bar"><i id="bar" style="width:${Math.round(round.index / total * 100)}%"></i></div><div class="lbl"><span id="plbl">第 ${round.index + 1} 个 · 共 ${total} 个</span><span>${round.kind === 'review' ? '错词再默' : '第 1 轮'}</span></div></div>
    <div class="speaker" id="speaker">${icons.speaker}</div>
    <div class="phase" id="phase">听好了<small>每个词报两遍</small></div>
    <div class="writing-track"><i id="wtrack"></i></div>
    <div id="reveal" hidden></div>
    <div class="stage-controls">
      <button class="btn quiet" data-act="replay">${icons.repeat}再听一遍</button>
      <button class="btn quiet" data-act="pause" id="pauseBtn">${icons.pause}暂停</button>
      <button class="btn quiet" data-act="skip">${icons.next}下一个</button>
      <button class="btn quiet" data-act="slower">慢一点</button>
      <button class="btn primary big" data-act="finish">写完了，对答案</button>
    </div>
  </div>
  <p class="note" style="margin-top:14px;text-align:center">屏幕上不出现词。写不出来先空着，等对答案的时候再看。</p>`);
}
function setPhase(phase, text, sub) { round.phase = phase; const st = $('#stage'); if (st) st.dataset.phase = phase; const p = $('#phase'); if (p) p.innerHTML = `${esc(text)}<small>${esc(sub || '')}</small>`; const sp = $('#speaker'); if (sp) sp.innerHTML = phase === 'writing' ? icons.pen : phase === 'paused' ? icons.pause : icons.speaker; const pb = $('#pauseBtn'); if (pb) pb.innerHTML = phase === 'paused' ? `${icons.play}继续` : `${icons.pause}暂停`; }
async function speakCurrent(replay = false) {
  if (!round || round.phase === 'done') return;
  stopAudio(); const it = itemMap().get(round.ids[round.index]); const total = round.ids.length;
  const bar = $('#bar'); if (bar) bar.style.width = `${Math.round(round.index / total * 100)}%`; const pl = $('#plbl'); if (pl) pl.textContent = `第 ${round.index + 1} 个 · 共 ${total} 个`;
  const src = audioOf(it); const rv = $('#reveal');
  if (!src) { setPhase('writing', '这个词没有录音', '请家长照下面口报两遍，写完按"下一个"'); if (rv) { rv.hidden = false; rv.className = 'reveal'; rv.innerHTML = `家长口报<b>${esc(it.text)}</b>`; } return; }
  if (rv) rv.hidden = true;
  setPhase('speaking', replay ? '再听一遍' : `第 ${round.index + 1} 个，听好了`, '每个词报两遍');
  const my = epoch + 1; const ok = await playFile(src);
  if (!round || round.phase === 'done' || round.phase === 'paused' || my !== epoch) return;
  if (!ok) { setPhase('writing', '录音没有播出来', '请家长口报，写完按"下一个"'); if (rv) { rv.hidden = false; rv.className = 'reveal'; rv.innerHTML = `家长口报<b>${esc(it.text)}</b>`; } return; }
  const gap = gapFor(it); setPhase('writing', '写下来', `${gap} 秒后报下一个`);
  const t0 = performance.now(); const track = $('#wtrack');
  clearInterval(writingTimer); writingTimer = setInterval(() => { if (track) track.style.width = `${Math.min(100, (performance.now() - t0) / (gap * 1000) * 100)}%`; }, 100);
  timer = setTimeout(() => { clearInterval(writingTimer); if (track) track.style.width = '0'; advance(); }, gap * 1000);
}
function advance() { if (!round || round.phase === 'done') return; if (round.index + 1 >= round.ids.length) { finishDictation(); return; } round.index++; speakCurrent(); }
function finishDictation() { stopAudio(); clearInterval(clockTimer); round.phase = 'done'; renderCheck(); }
function pauseToggle() { if (round.phase === 'paused') { setPhase('speaking', '继续', ''); speakCurrent(true); } else { stopAudio(); setPhase('paused', '暂停了', '按"继续"会把这个词再报一遍'); } }

/* ---------- 对答案 ---------- */
function renderCheck() {
  const map = itemMap(); const list = round.ids.map(id => map.get(id)); const wrong = round.wrong;
  view('check', `${topbar('对答案', `用时 ${fmtClock(round.seconds)} · ${list.length} 个`, { back: 'home' })}
  <div class="check-head"><div><h1>对答案</h1><p>照着本子核对：写错的、没写出来的，点一下那一行标成"错"。</p></div><div class="score num"><b id="wrongCount">${wrong.size}</b>个错</div></div>
  <div class="checks">${list.map((it, i) => `<button class="check ${isEn() ? 'en' : ''} ${wrong.has(it.id) ? 'wrong' : ''}" data-act="mark" data-id="${esc(it.id)}" aria-pressed="${wrong.has(it.id)}"><span class="n">${i + 1}</span><span><span class="w">${esc(it.text)}</span><br><span class="s">${esc(clue(it))}</span></span><span class="mark">${wrong.has(it.id) ? icons.x + '错' : icons.check + '对'}</span></button>`).join('')}</div>
  <div class="check-bar"><div class="meta">全部对完再按</div><button class="btn primary big" data-act="done">记下来，看结果</button></div>`);
}
function toggleMark(id) { if (round.wrong.has(id)) round.wrong.delete(id); else round.wrong.add(id); const b = $(`[data-act="mark"][data-id="${CSS.escape(id)}"]`); const w = round.wrong.has(id); b.classList.toggle('wrong', w); b.setAttribute('aria-pressed', w); b.querySelector('.mark').innerHTML = w ? icons.x + '错' : icons.check + '对'; $('#wrongCount').textContent = round.wrong.size; }
function commitRound() {
  const at = new Date().toISOString(); const results = [];
  for (const id of round.ids) { const r = wordRec(id); const w = round.wrong.has(id); r.last = at; r.lastResult = w ? 'wrong' : (round.previewed ? 'right-after-preview' : 'right-independent'); if (w) { r.wrong++; r.streak = 0; r.needReview = true; } else { r.right++; r.streak++; if (r.streak >= 2) r.needReview = false; } results.push({ id, wrong: w }); }
  state.rounds.push({ id: round.id, at, kind: round.kind, previewed: round.previewed, pace: round.pace, seconds: Math.round(round.seconds), total: round.ids.length, wrong: [...round.wrong], lessons: round.kind === 'review' ? ['review'] : selectedLessons() });
  save(); report(); renderResult();
}
function reportText() {
  const map = itemMap(); const wrong = [...round.wrong].map(id => map.get(id)?.text || id);
  return `${CHILD[who].label}${isEn() ? '英语' : '语文'}听写 ${today()}${TEST ? '（测试）' : ''}\n范围：${round.kind === 'review' ? '错词再默' : selectedLessons().map(k => k.split('|')[1]).join('、')}\n${round.previewed ? '看后默写' : '直接默写'} ${round.ids.length} 个，用时 ${fmtClock(round.seconds)}，错 ${wrong.length} 个${wrong.length ? '：' + wrong.join('、') : ''}`;
}
function report() {
  if (!window.V2Records) return;
  const map = itemMap();
  try { window.V2Records.enqueue({ app: 'dictation', who, subject, mode: TEST ? 'test' : 'formal', roundId: round.id, kind: round.kind, previewed: round.previewed, pace: round.pace, seconds: Math.round(round.seconds), total: round.ids.length, lessons: round.kind === 'review' ? ['review'] : selectedLessons(), wrong: [...round.wrong].map(id => ({ id, text: map.get(id)?.text || '' })), text: reportText() }); } catch (e) { }
}
function renderResult() {
  const map = itemMap(); const wrong = [...round.wrong].map(id => map.get(id)); const total = round.ids.length; const right = total - wrong.length;
  view('result', `${topbar('结果', `${CHILD[who].label} · ${isEn() ? '英语' : '语文'}`, { back: 'home' })}
  <div class="result"><h1>${wrong.length === 0 ? '全部写对了' : wrong.length <= 3 ? `还差 ${wrong.length} 个` : `有 ${wrong.length} 个要再练`}</h1>
    <div class="big-num"><div class="ok"><b class="num">${right}</b><small>写对</small></div><div class="no"><b class="num">${wrong.length}</b><small>写错</small></div><div><b class="num">${fmtClock(round.seconds)}</b><small>用时</small></div></div>
    ${wrong.length ? `<div class="wrong-list">${wrong.map(it => `<span>${esc(it.text)}</span>`).join('')}</div><p>先把这几个在本子上再写两遍，然后把它们再默一遍。连续两轮默对，才算过关。</p>` : `<p>${round.previewed ? '这一轮是看过一遍之后默的。下次可以关掉"先看一遍"，直接报读检验一次。' : '这是没看答案直接默对的，算数。'}</p>`}
    <div class="actions">${wrong.length ? `<button class="btn primary big" data-act="redo-wrong">${icons.repeat}错词再默一遍</button>` : ''}<button class="btn quiet" data-act="share">发给爸爸</button><button class="btn quiet" data-act="home">回到选课页</button>${storageOK ? '' : '<p class="note bad">这台设备无法保存记录，本轮结果只在当前页面。</p>'}</div>
  </div>`);
}

/* ---------- 家长记录 ---------- */
function renderParent() {
  const map = itemMap(); const review = reviewIds().map(id => map.get(id));
  const rounds = [...state.rounds].reverse().slice(0, 30);
  view('parent', `${topbar('记录与设置', `${CHILD[who].label} · ${isEn() ? '英语' : '语文'} · ${TEST ? '测试记录' : '正式记录'}`, { back: 'home' })}
  <div class="sheet">
    <h2>待复查的词 <small style="font-size:13px;color:var(--muted)">${review.length} 个</small></h2>
    ${review.length ? `<div class="wrong-list" style="justify-content:flex-start">${review.map(it => `<span>${esc(it.text)}<small style="font-weight:600;margin-left:6px;font-size:12px">×${state.words[it.id].wrong}</small></span>`).join('')}</div>` : '<p class="note">没有待复查的词。</p>'}
    <p class="note">看一遍后默对记为"看后默对"；关掉"先看一遍"直接报读默对记为"独立默对"。错词要在之后两轮都默对才移出待复查。纸笔结果由孩子或家长自己核对。</p>
    <h2>最近几轮</h2>
    ${rounds.length ? `<table class="table"><thead><tr><th>日期</th><th>范围</th><th>个数</th><th>用时</th><th>错</th></tr></thead><tbody>${rounds.map(r => `<tr><td class="num">${r.at.slice(5, 10)}</td><td>${r.kind === 'review' ? '错词' : (r.previewed ? '看后默' : '直接默')}</td><td class="num">${r.total}</td><td class="num">${fmtClock(r.seconds)}</td><td>${r.wrong.length ? `<span class="tag no">${r.wrong.length}</span>` : '<span class="tag ok">0</span>'}</td></tr>`).join('')}</tbody></table>` : '<p class="note">还没有记录。</p>'}
    <h2>导出与导入</h2>
    <div class="row"><button class="btn quiet small" data-act="export-md">导出文字记录</button><button class="btn quiet small" data-act="export-json">导出备份</button><label class="btn quiet small file-btn">导入备份<input type="file" accept="application/json" data-act="import"></label></div>
    <p class="status" id="status"></p>
    <h2>清除</h2>
    <div class="row"><button class="btn quiet small" data-act="clear-review">清空待复查</button><button class="btn quiet small" data-act="clear-all">清空这个学科的全部记录</button></div>
    <p class="note">家长测试请在网址后加 <code>?test=1</code>，测试记录与正式记录分开保存。</p>
  </div>`);
}
function download(name, content, type) { const b = new Blob([content], { type }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 30000); }
function exportMd() {
  const map = itemMap();
  const lines = [`# ${CHILD[who].label} · ${isEn() ? '英语' : '语文'}听写记录（${TEST ? '测试' : '正式'}）`, '', '| 日期 | 范围 | 个数 | 用时 | 错词 |', '| --- | --- | --- | --- | --- |', ...state.rounds.map(r => `| ${r.at.slice(0, 10)} | ${r.kind === 'review' ? '错词再默' : (r.previewed ? '看后默写' : '直接默写')} | ${r.total} | ${fmtClock(r.seconds)} | ${r.wrong.map(id => map.get(id)?.text || id).join('、') || '—'} |`), '', `待复查：${reviewIds().map(id => map.get(id)?.text).join('、') || '无'}`];
  download(`${who}-${subject}-听写记录-${today()}.md`, lines.join('\n'), 'text/markdown;charset=utf-8');
}
async function importJson(file) {
  try { const s = JSON.parse(await file.text()); if (!s || s.v !== 1 || s.who !== who || s.subject !== subject) throw new Error('不是这个孩子、这个学科的备份'); const ids = new Set(state.rounds.map(r => r.id)); for (const r of s.rounds || []) if (!ids.has(r.id)) state.rounds.push(r); for (const [id, w] of Object.entries(s.words || {})) { if (!state.words[id] || (w.last || '') > (state.words[id].last || '')) state.words[id] = w; } state.rounds.sort((a, b) => a.at.localeCompare(b.at)); save(); $('#status').textContent = '已合并导入。'; } catch (e) { $('#status').textContent = '没有导入：' + e.message; }
}

/* ---------- 事件 ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'INPUT') return; const act = b.dataset.act;
  if (act === 'portal') { location.href = `../../../subject.html?subject=${subject}&who=${who}`; return; }
  if (act === 'home') { renderHome(); return; }
  if (act === 'quit') { if (round && round.phase !== 'done' && !confirm('这一轮还没报完，要退出吗？退出不记录。')) return; clearInterval(clockTimer); renderHome(); return; }
  if (act === 'who' || act === 'subject') { if (b.dataset.who) who = b.dataset.who; if (b.dataset.subject) subject = b.dataset.subject; const u = new URL(location.href); u.searchParams.set('who', who); u.searchParams.set('subject', subject); history.replaceState(null, '', u); document.body.dataset.who = who; load(); renderHome(); return; }
  if (act === 'lesson') { const sel = new Set(selectedLessons()); const k = b.dataset.key; if (sel.has(k)) sel.delete(k); else sel.add(k); state.settings.lessons = [...sel]; save(); renderHome(); return; }
  if (act === 'unit') { const u = Number(b.dataset.unit); const keys = [...unitsOf(items()).find(x => x.unit === u).lessons.keys()]; const sel = new Set(selectedLessons()); const all = keys.every(k => sel.has(k)); keys.forEach(k => all ? sel.delete(k) : sel.add(k)); state.settings.lessons = [...sel]; save(); renderHome(); return; }
  if (act === 'pace') { state.settings.pace = b.dataset.pace; save(); if (round) round.pace = state.settings.pace; renderHome(); return; }
  if (act === 'enmode') { state.settings.enMode = b.dataset.mode; save(); renderHome(); return; }
  if (act === 'start') { startRound(selectedItems().map(i => i.id), 'lesson'); return; }
  if (act === 'start-review') { startRound(reviewIds(), 'review'); return; }
  if (act === 'show-review') { renderParent(); return; }
  if (act === 'begin') { beginDictation(); return; }
  if (act === 'replay') { if (round.phase === 'paused') return; speakCurrent(true); return; }
  if (act === 'pause') { pauseToggle(); return; }
  if (act === 'skip') { if (round.phase === 'paused') round.phase = 'speaking'; advance(); return; }
  if (act === 'slower') { const order = ['fast', 'mid', 'slow']; const i = order.indexOf(round.pace); round.pace = order[Math.min(2, i + 1)]; b.textContent = round.pace === 'slow' ? '已经最慢' : '慢一点'; return; }
  if (act === 'finish') { finishDictation(); return; }
  if (act === 'mark') { toggleMark(b.dataset.id); return; }
  if (act === 'done') { commitRound(); return; }
  if (act === 'redo-wrong') { startRound([...round.wrong], 'review'); return; }
  if (act === 'share') { window.V2Records?.share(`${CHILD[who].label}${isEn() ? '英语' : '语文'}听写结果`, reportText()); return; }
  if (act === 'parent') { renderParent(); return; }
  if (act === 'export-md') { exportMd(); return; }
  if (act === 'export-json') { download(`${who}-${subject}-听写备份-${today()}.json`, JSON.stringify(state, null, 2), 'application/json'); return; }
  if (act === 'clear-review') { if (!confirm('把待复查的词全部清空？')) return; for (const w of Object.values(state.words)) { w.needReview = false; } save(); renderParent(); return; }
  if (act === 'clear-all') { if (!confirm('清空这个孩子、这个学科的全部听写记录？不能恢复。')) return; state = fresh(); save(); renderParent(); return; }
});
document.addEventListener('change', e => { const b = e.target.closest('[data-act]'); if (!b) return; if (b.dataset.act === 'preview') { state.settings.preview = b.checked; save(); renderHome(); } if (b.dataset.act === 'import' && b.files?.[0]) importJson(b.files[0]).then(() => { b.value = ''; }); });
document.addEventListener('visibilitychange', () => { if (document.hidden && round && (round.phase === 'speaking' || round.phase === 'writing')) { stopAudio(); setPhase('paused', '暂停了', '回来后按"继续"'); } });

/* ---------- 启动 ---------- */
async function boot() {
  document.body.dataset.who = who;
  try {
    const [d, m] = await Promise.all([fetch(DATA_URL, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('词库没有打开'); return r.json(); }), fetch(AUDIO_DIR + '_manifest.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null)]);
    data = d; manifest = m;
    if (!data.children?.[who]?.subjects?.[subject]?.items?.length) throw new Error('这个孩子的词库还没准备好');
    load(); renderHome();
  } catch (e) { $('#app').innerHTML = `<p class="note bad" style="margin-top:40px">${esc(e.message)}。请稍后刷新。</p>`; }
}
boot();
})();
