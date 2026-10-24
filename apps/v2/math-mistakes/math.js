/* 数学错题本 · Claude 设计版（2026-10-24）
   真实目的：把这学期确认错过的题，自己独立再做对。
   一天 10 题 → 一题一屏，先自己做 → 错一次给一个关键关系再试 → 再错就看步骤讲解，然后回原题重做
   → 同一题在不同的两天都独立做对才"过关"。看过讲解后做对只记"订正"，不算独立。
   题库来自正式站同步的 data/learning/<孩子>_math_mistakes_20261024.json；记录按孩子分开存在这台设备。 */
(() => {
'use strict';
const params = new URLSearchParams(location.search);
const CHILD = { kenton: { label: '哥哥', en: 'Kenton', initial: 'K', grade: '五年级' }, eddey: { label: '弟弟', en: 'Eddey', initial: 'E', grade: '四年级' } };
const TEST = ['1', 'true'].includes(params.get('test')) || params.get('mode') === 'test' || ['1', 'true'].includes(params.get('parentTest'));
const SESSION_SIZE = 10;
let who = ['kenton', 'eddey'].includes(params.get('who')) ? params.get('who') : (['kenton', 'eddey'].includes(params.get('child')) ? params.get('child') : 'eddey');
let bank = null, items = [], byId = new Map(), state = null, session = null, storageOK = true;

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = () => `sp2.math-mistakes:${who}:${TEST ? 'test' : 'formal'}`;
const today = () => new Intl.DateTimeFormat('en-CA').format(new Date());
const icons = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6M8 12h12"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.2 1 2.5h6c0-1.3.3-1.9 1-2.5A6 6 0 0 0 12 3Z"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-5m5 0V2M4 17h5m-5 0v5M20 7A9 9 0 0 0 4 8m0 9a9 9 0 0 0 16-1"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10-6.5Z"/></svg>',
};

/* ---------- 记录 ---------- */
function fresh() { return { v: 1, who, mode: TEST ? 'test' : 'formal', items: {}, sessions: [] }; }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY()) || 'null'); if (s && s.v === 1 && s.who === who) { state = s; return; } } catch (e) { } state = fresh(); }
function save() { try { localStorage.setItem(KEY(), JSON.stringify(state)); storageOK = true; } catch (e) { storageOK = false; } }
function rec(id) { return state.items[id] || (state.items[id] = { seen: 0, independent: 0, assisted: 0, wrong: 0, streak: 0, days: [], lastAt: null, lastResult: null, needReview: false, graduated: false }); }
const isGraduated = id => !!state.items[id]?.graduated;
const doneToday = id => (state.items[id]?.lastAt || '').slice(0, 10) === today();

/* ---------- 选题：今天这 10 题 ---------- */
function interleave(list) { const groups = new Map(); for (const it of list) { (groups.get(it.category) || groups.set(it.category, []).get(it.category)).push(it); } const out = []; const qs = [...groups.values()]; let i = 0; while (out.length < list.length) { const q = qs[i % qs.length]; if (q.length) out.push(q.shift()); i++; } return out; }
function pickSession(pool = items, size = SESSION_SIZE) {
  const open = pool.filter(it => it.status === 'ready' && !isGraduated(it.id) && !doneToday(it.id));
  const tier = it => { const r = state.items[it.id]; if (r?.needReview) return 0; const imp = it.priority === 'important' || it.recordType === 'important-review'; if (!r || !r.seen) return imp ? 1 : 2; return r.streak >= 1 ? 3 : 2; };
  const tiers = [[], [], [], []]; for (const it of open) tiers[tier(it)].push(it);
  const out = []; for (const t of tiers) { for (const it of interleave(t)) { if (out.length >= size) break; out.push(it); } if (out.length >= size) break; }
  return out;
}

/* ---------- 判题 ---------- */
const FULL = { '＋': '+', '－': '-', '−': '-', '—': '-', '×': '*', 'x': '*', 'X': '*', '÷': '/', '（': '(', '）': ')', '［': '[', '］': ']', '【': '[', '】': ']', '｛': '{', '｝': '}', '＝': '=', '，': ',', '、': ',', '。': '', '．': '.', '：': ':' };
function normText(s) { return String(s ?? '').trim().replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/./g, c => FULL[c] ?? c).replace(/\s+/g, '').replace(/[{\[]/g, '(').replace(/[}\]]/g, ')').replace(/和/g, ',').replace(/=.*$/, '').toLowerCase(); }
function normNumStr(s) { return String(s ?? '').trim().replace(/[０-９．]/g, c => c === '．' ? '.' : String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[,，\s]/g, '').replace(/[－−—]/g, '-').replace(/[^0-9.\-/]/g, ''); }
function decimalsOf(s) { const m = s.match(/\.(\d+)$/); return m ? m[1].length : 0; }
function numEqual(a, b) { if (a.includes('/') && !b.includes('/')) { const [p, q] = a.split('/').map(Number); return Math.abs(p / q - Number(b)) < 1e-9; } return a !== '' && b !== '' && !isNaN(Number(a)) && !isNaN(Number(b)) && Math.abs(Number(a) - Number(b)) < 1e-9; }
function judge(it, raw) {
  const answers = it.answers || [];
  if (it.kind === 'choice') return answers.map(a => normText(a)).includes(normText(raw));
  if (it.kind === 'number') {
    const got = normNumStr(raw); if (!got) return false;
    for (const a of answers) { const want = normNumStr(a); if (!numEqual(got, want)) continue; const d = it.requiredDecimals; if (d != null && decimalsOf(got) !== d) return false; return true; }
    return false;
  }
  // text：逗号序列 / 算式 / 文字
  const parts = normText(raw).split(',').filter(Boolean);
  for (const a of answers) {
    const want = normText(a).split(',').filter(Boolean);
    if (want.length !== parts.length) continue;
    let ok = true;
    for (let i = 0; i < want.length; i++) {
      const w = want[i], g = parts[i]; const dec = Array.isArray(it.perAnswerDecimals) ? it.perAnswerDecimals[i] : null;
      if (!isNaN(Number(w)) && !isNaN(Number(g)) && w !== '' && g !== '') { if (!numEqual(g, w) || (dec != null && decimalsOf(g) !== dec)) { ok = false; break; } }
      else if (w !== g) { ok = false; break; }
    }
    if (ok) return true;
  }
  return false;
}

/* ---------- 画面 ---------- */
function view(name, html) { document.body.dataset.screen = name; $('#app').innerHTML = html; window.scrollTo({ top: 0, behavior: 'instant' }); }
function topbar(title, sub, { back = 'home', right = '' } = {}) { return `<header class="topbar"><button class="icon-btn" data-act="${back}" aria-label="返回">${icons.back}</button><div class="crumb"><b>${esc(title)}</b><small>${esc(sub)}</small></div>${TEST ? '<span class="test-chip">测试，不计入</span>' : ''}${right}</header>`; }
const meChip = () => `<span class="me-chip"><i>${CHILD[who].initial}</i><span class="t">${CHILD[who].label} ${CHILD[who].en}</span></span>`;
function categories() { const m = new Map(); for (const it of items) { if (it.status !== 'ready') continue; const c = m.get(it.category) || { name: it.category, total: 0, graduated: 0, review: 0, important: 0 }; c.total++; if (isGraduated(it.id)) c.graduated++; if (state.items[it.id]?.needReview) c.review++; if (it.priority === 'important' || it.recordType === 'important-review') c.important++; m.set(it.category, c); } return [...m.values()].sort((a, b) => b.review - a.review || b.total - a.total); }

function renderHome() {
  session = null;
  const ready = items.filter(i => i.status === 'ready'); const grad = ready.filter(i => isGraduated(i.id)).length; const review = ready.filter(i => state.items[i.id]?.needReview).length;
  const todayPick = pickSession(); const doneTodayN = ready.filter(i => doneToday(i.id)).length;
  const cats = categories();
  view('home', `${topbar('数学错题本', `${CHILD[who].label} · ${CHILD[who].grade} · 本学期`, { back: 'portal', right: meChip() })}
  <div class="hero"><div class="kicker">${esc(bank.asOf || '')} 整理 · ${ready.length} 道</div><h1>今天这 ${todayPick.length} 题</h1>
    <p>都是这学期做错过的题。先自己做；做错了只给一个关键关系，再试一次；还错就看步骤，然后回到原题重做。</p>
    <div class="stats"><div class="stat ok"><b class="num">${grad}</b><small>已过关</small></div><div class="stat no"><b class="num">${review}</b><small>上次错的</small></div><div class="stat"><b class="num">${doneTodayN}</b><small>今天做过</small></div></div>
    <div class="row" style="margin-top:16px"><div class="seg" role="group" aria-label="孩子"><button data-act="who" data-who="kenton" aria-pressed="${who === 'kenton'}">哥哥</button><button data-act="who" data-who="eddey" aria-pressed="${who === 'eddey'}">弟弟</button></div></div>
    <button class="btn primary big" data-act="start" ${todayPick.length ? '' : 'disabled'}>${icons.play}${todayPick.length ? `开始今天的 ${todayPick.length} 题` : '今天的题做完了'}</button>
    ${todayPick.length ? '' : '<p class="note" style="margin-top:10px;text-align:center">还没过关的题，明天会再排进来；也可以从下面按知识点加练。</p>'}
  </div>
  <div class="section"><h2>按知识点练 <small>每次最多 10 题</small></h2><div class="cats">${cats.map(c => `<button class="cat" data-act="cat" data-cat="${esc(c.name)}"><div><b>${esc(c.name)}</b><small>${c.total} 道 · 过关 ${c.graduated}${c.important ? ` · 重点 ${c.important}` : ''}</small></div>${c.review ? `<span class="pill due">上次错 ${c.review}</span>` : c.graduated === c.total ? '<span class="pill good">全部过关</span>' : '<span class="pill">练一组</span>'}<span class="meter"><i style="width:${Math.round(c.graduated / c.total * 100)}%"></i></span></button>`).join('')}</div></div>
  <div class="section"><div class="row"><button class="btn quiet small" data-act="parent">记录</button><span class="note">${storageOK ? '记录保存在这台设备' : '这台设备无法保存记录'}</span></div></div>
  <p class="note" style="margin-top:14px">过关 = 在不同的两天都不看提示独立做对。看过提示或讲解后做对，只记为"订正"。</p>`);
}

/* ---------- 做题 ---------- */
function startSession(list, label) {
  if (!list.length) return;
  session = { id: `${today()}-${Date.now().toString(36)}`, label, ids: list.map(i => i.id), index: 0, results: {}, startedAt: new Date().toISOString() };
  renderQuestion();
}
function cur() { return byId.get(session.ids[session.index]); }
function qstate() { const id = session.ids[session.index]; return session.results[id] || (session.results[id] = { attempts: 0, hinted: false, explained: false, done: false, result: null, answer: '', checks: [] }); }
function dots() { return `<div class="steps">${session.ids.map((id, i) => { const r = session.results[id]; const cls = i === session.index ? 'on' : r?.done ? (r.result === 'independent' ? 'ok' : r.result === 'assisted' ? 'half' : 'no') : ''; return `<i class="${cls}"></i>`; }).join('')}</div>`; }
function imgOk(src) { return typeof src === 'string' && /^(?:\.\.\/)?assets\/[a-zA-Z0-9_./-]+\.(?:svg|png|webp|jpg)$/.test(src); }
function imgSrc(src) { return '../../../' + src.replace(/^\.\.\//, ''); }
function answerArea(it, q) {
  if (it.kind === 'choice') return `<div class="answer"><label>选一个</label><div class="choices">${(it.options || []).map((o, i) => `<button class="choice" data-act="choose" data-val="${esc(o)}" aria-pressed="${q.answer === o}"><i>${'ABCD'[i] || i + 1}</i>${esc(o)}</button>`).join('')}</div></div>`;
  if (it.kind === 'manual') return `<div class="answer"><div class="paper">在纸上做：${esc(it.prompt.includes('答句') ? '列式、计算、写完整答句。' : it.prompt.includes('统计图') ? '画好图再对照参考图逐项核对。' : '把过程写完整。')}做完按"做好了"，对照参考答案自己核对。</div></div>`;
  const num = it.kind === 'number';
  return `<div class="answer"><label>${num ? (it.processRequired ? '先在纸上列式，再把结果填在这里' : '把结果填在这里') : (it.answerFormat === 'brackets' || it.answerFormat === 'expression' ? '把完整算式打在这里（括号、加减乘除都可以直接打）' : it.answers?.[0]?.includes(',') || it.answers?.[0]?.includes('，') ? '按顺序填，用逗号隔开' : '把答案填在这里')}</label><div class="field"><input id="ans" ${num ? 'inputmode="decimal"' : ''} class="${num ? '' : 'text'}" value="${esc(q.answer)}" autocomplete="off" enterkeyhint="done" placeholder="${num ? '' : ''}">${num && it.unit ? `<span class="unit">${esc(it.unit)}</span>` : ''}</div>${it.requiredDecimals != null ? `<p class="note">要求保留 ${it.requiredDecimals} 位小数，末尾的 0 也要写。</p>` : ''}</div>`;
}
function renderQuestion() {
  const it = cur(); const q = qstate(); const n = session.index + 1, total = session.ids.length;
  const imp = it.priority === 'important' || it.recordType === 'important-review'; const r = state.items[it.id];
  view('question', `${topbar(`第 ${n} 题 · 共 ${total} 题`, session.label, { back: 'quit' })}
  <div class="q" id="q">
    ${dots()}
    <div class="q-meta"><span class="pill me">${esc(it.category)}</span>${imp ? '<span class="pill imp">重点</span>' : ''}${r?.needReview ? '<span class="pill due">上次错的</span>' : ''}${it.recordType === 'process-gap' ? '<span class="pill">要写过程</span>' : ''}<span class="pill src">${esc(it.source?.label || '')}${it.source?.question ? ' · ' + esc(it.source.question) : ''}</span></div>
    <div class="q-prompt ${it.prompt.length < 24 && /[0-9]/.test(it.prompt) && !/[一-龥]{6}/.test(it.prompt) ? 'formula' : ''}">${esc(it.prompt)}</div>
    ${imgOk(it.image) ? `<figure class="q-figure"><img src="${esc(imgSrc(it.image))}" alt="${esc(it.diagramAlt || '题目图')}">${it.diagramCaption ? `<figcaption>${esc(it.diagramCaption)}</figcaption>` : ''}</figure>` : ''}
    <div id="hint"${q.hinted ? '' : ' hidden'} class="hint-box"><b>关键关系</b>${esc(it.hint || '')}</div>
    <div id="feedback" hidden></div>
    ${answerArea(it, q)}
    <div class="q-actions" id="actions">
      ${it.kind === 'manual' ? `<button class="btn primary big" data-act="manual-done">做好了，对照参考</button>` : `<button class="btn quiet" data-act="hint" ${q.hinted ? "hidden" : ""}>${icons.bulb}一点提示</button><button class="btn primary" data-act="check">检查答案</button>`}
    </div>
  </div>`);
  const inp = $('#ans'); if (inp) { inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); checkAnswer(); } }); if (window.matchMedia('(min-width:900px)').matches) inp.focus(); }
}
function finishItem(result) {
  const it = cur(); const q = qstate(); q.done = true; q.result = result; const r = rec(it.id); const at = new Date().toISOString(); r.seen++; r.lastAt = at; r.lastResult = result;
  if (result === 'independent') { r.independent++; r.needReview = false; if (!r.days.includes(today())) r.days.push(today()); r.streak++; if (r.streak >= 2 && r.days.length >= 2) r.graduated = true; }
  else if (result === 'assisted') { r.assisted++; r.streak = 0; r.needReview = true; }
  else { r.wrong++; r.streak = 0; r.needReview = true; r.graduated = false; }
  save();
}
function checkAnswer() {
  const it = cur(); const q = qstate(); if (q.done) return;
  const raw = it.kind === 'choice' ? q.answer : ($('#ans')?.value ?? ''); q.answer = raw;
  if (!String(raw).trim()) { showFeedback('no', '先写上答案再检查', ''); return; }
  q.attempts++;
  if (judge(it, raw)) {
    const result = q.hinted || q.explained ? 'assisted' : 'independent'; finishItem(result);
    showFeedback('ok', result === 'independent' ? '对了，自己做对的' : '订正对了', result === 'independent' ? (rec(it.id).graduated ? '这道题过关了。' : '下次换一天再独立做对一次，这题就过关。') : '看过提示才对的，下次还会再出现。');
    $('#actions').innerHTML = `<button class="btn quiet" data-act="show-steps">看看方法</button><button class="btn primary" data-act="next">${session.index + 1 < session.ids.length ? '下一题' : '看结果'}${icons.next}</button>`;
    lockInput(); return;
  }
  if (!q.hinted && !q.explained) { q.hinted = true; $('#hint').hidden = false; showFeedback('no', '不对，再想一下', '上面给了一个关键关系，照着再做一次。'); $('[data-act="hint"]')?.setAttribute('hidden', ''); return; }
  if (!q.explained) { renderExplain(); return; }
  // 讲解后仍错：公布答案，记为错，继续
  finishItem('wrong'); lockInput();
  showFeedback('no', '这次还是没对', `正确答案：${esc(it.answers?.[0] || '')}${it.unit && it.kind === 'number' ? ' ' + esc(it.unit) : ''}。先记下来，这题明天还会再出现。`);
  $('#actions').innerHTML = `<button class="btn quiet" data-act="show-steps">再看一遍方法</button><button class="btn primary" data-act="next">${session.index + 1 < session.ids.length ? '下一题' : '看结果'}${icons.next}</button>`;
}
function lockInput() { const inp = $('#ans'); if (inp) inp.disabled = true; document.querySelectorAll('.choice').forEach(b => b.disabled = true); }
function showFeedback(kind, title, sub) { const f = $('#feedback'); f.hidden = false; f.className = `verdict ${kind}`; f.innerHTML = `${kind === 'ok' ? icons.check : icons.x}<span>${esc(title)}<small>${esc(sub)}</small></span>`; f.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
function renderExplain(afterRight = false) {
  const it = cur(); const q = qstate(); if (!afterRight) q.explained = true;
  view('explain', `${topbar(afterRight ? '方法' : '看一遍方法，再回原题', session.label, { back: 'back-to-q' })}
  <div class="q explain">
    ${dots()}
    <div class="q-prompt" style="font-size:18px;color:var(--ink-2)">${esc(it.prompt)}</div>
    ${imgOk(it.referenceImage || it.image) ? `<figure class="q-figure"><img src="${esc(imgSrc(it.referenceImage || it.image))}" alt="参考图"></figure>` : ''}
    ${q.answer && !afterRight ? `<p class="your">你写的：<b>${esc(q.answer)}</b></p>` : ''}
    <div class="key"><b>关键关系</b>${esc(it.hint || '')}</div>
    <h3>一步一步</h3>
    <ol>${(it.steps || []).map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    ${it.explanation && it.explanation.replace(/[；;。\s]/g, '') !== (it.steps || []).join('').replace(/[；;。\s]/g, '') ? `<p class="ref">${esc(it.explanation)}</p>` : ''}
    <p class="answer-line">答案：${esc(it.answers?.[0] || '')}${it.unit && it.kind === 'number' ? ' ' + esc(it.unit) : ''}</p>
    ${(it.expectedChecks || []).length ? `<h3>检查</h3><ul class="checks-list">${it.expectedChecks.map(c => `<li class="chk"><i>·</i>${esc(c)}</li>`).join('')}</ul>` : ''}
    <div class="q-actions">${afterRight ? `<button class="btn primary big" data-act="next">${session.index + 1 < session.ids.length ? '下一题' : '看结果'}${icons.next}</button>` : `<button class="btn primary big" data-act="back-to-q">${icons.repeat}回原题，再做一次</button>`}</div>
  </div>`);
}
function renderManualCheck() {
  const it = cur(); const q = qstate();
  view('manual', `${topbar('对照参考，自己核对', session.label, { back: 'back-to-q' })}
  <div class="q explain">
    ${dots()}
    <div class="q-prompt" style="font-size:18px;color:var(--ink-2)">${esc(it.prompt)}</div>
    ${imgOk(it.referenceImage) ? `<figure class="q-figure"><img src="${esc(imgSrc(it.referenceImage))}" alt="参考图"><figcaption>参考作图，做完再看</figcaption></figure>` : ''}
    <p class="answer-line">${esc(it.answers?.[0] || '')}</p>
    <ol>${(it.steps || []).map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    ${(it.expectedChecks || []).length ? `<h3>逐项核对，做到的点一下</h3><div class="checks-list">${it.expectedChecks.map((c, i) => `<button class="chk" data-act="chk" data-i="${i}" aria-pressed="${!!q.checks[i]}"><i>${q.checks[i] ? icons.check : ''}</i>${esc(c)}</button>`).join('')}</div>` : ''}
    <div class="q-actions"><button class="btn quiet" data-act="manual-wrong">${icons.x}有地方不对</button><button class="btn primary" data-act="manual-right">${icons.check}全部对了</button></div>
    <p class="note">纸上的结果由你和家长自己核对；这里只记结果。</p>
  </div>`);
}
function next() { if (session.index + 1 >= session.ids.length) { renderResult(); return; } session.index++; renderQuestion(); }
function renderResult() {
  const rs = session.ids.map(id => ({ it: byId.get(id), r: session.results[id] })); const ind = rs.filter(x => x.r?.result === 'independent').length, ast = rs.filter(x => x.r?.result === 'assisted').length, wr = rs.filter(x => x.r?.result === 'wrong').length;
  const done = rs.filter(x => x.r?.done).length;
  if (done) { state.sessions.push({ id: session.id, at: session.startedAt, label: session.label, total: done, independent: ind, assisted: ast, wrong: wr }); save(); }
  view('result', `${topbar('今天的结果', CHILD[who].label, { back: 'home' })}
  <div class="result"><h1>${wr === 0 && ast === 0 ? '全部自己做对了' : ind >= done * .7 ? '大部分自己做对了' : '今天挑出了要再练的题'}</h1>
    <div class="big-num"><div class="ok"><b class="num">${ind}</b><small>独立做对</small></div><div class="half"><b class="num">${ast}</b><small>订正对</small></div><div class="no"><b class="num">${wr}</b><small>没做对</small></div></div>
    <div class="result-list">${rs.filter(x => x.r?.done).map((x, i) => `<div class="rl"><b class="num">${i + 1}</b><span>${esc(x.it.title || x.it.prompt)}</span><span class="pill ${x.r.result === 'independent' ? 'good' : x.r.result === 'assisted' ? 'imp' : 'due'}">${x.r.result === 'independent' ? '独立' : x.r.result === 'assisted' ? '订正' : '再练'}</span></div>`).join('')}</div>
    <p>${ast + wr ? '订正对和没做对的题，明天会再排进"今天这 10 题"，不看提示做对两次才算过关。' : '独立做对的题，换一天再做对一次就过关。'}</p>
    <div class="actions"><button class="btn primary big" data-act="home">回到首页</button></div>
  </div>`);
}

/* ---------- 记录 ---------- */
function renderParent() {
  const ready = items.filter(i => i.status === 'ready'); const review = ready.filter(i => state.items[i.id]?.needReview); const sessions = [...state.sessions].reverse().slice(0, 30);
  view('parent', `${topbar('记录', `${CHILD[who].label} · ${TEST ? '测试记录' : '正式记录'}`, { back: 'home' })}
  <div class="sheet">
    <h2>上次做错、待复查 <small style="font-size:13px;color:var(--muted)">${review.length} 道</small></h2>
    ${review.length ? `<table class="table"><thead><tr><th>题</th><th>知识点</th><th>错</th></tr></thead><tbody>${review.map(it => `<tr><td>${esc(it.title || it.prompt)}</td><td>${esc(it.category)}</td><td class="num">${state.items[it.id].wrong}</td></tr>`).join('')}</tbody></table>` : '<p class="note">没有待复查的题。</p>'}
    <h2>最近几次</h2>
    ${sessions.length ? `<table class="table"><thead><tr><th>日期</th><th>范围</th><th>题数</th><th>独立</th><th>订正</th><th>错</th></tr></thead><tbody>${sessions.map(s => `<tr><td class="num">${s.at.slice(5, 10)}</td><td>${esc(s.label)}</td><td class="num">${s.total}</td><td class="num">${s.independent}</td><td class="num">${s.assisted}</td><td class="num">${s.wrong}</td></tr>`).join('')}</tbody></table>` : '<p class="note">还没有记录。</p>'}
    <h2>题库来源</h2>
    <p class="note">${esc(bank.coverage?.note || bank.coverage?.scope || '')}${bank.coverage?.pendingItems?.length ? `<br>未进入练习（题面或答案未核清）：${bank.coverage.pendingItems.map(p => esc(p.title)).join('、')}` : ''}</p>
    <h2>导出与导入</h2>
    <div class="row"><button class="btn quiet small" data-act="export-md">导出文字记录</button><button class="btn quiet small" data-act="export-json">导出备份</button><label class="btn quiet small file-btn">导入备份<input type="file" accept="application/json" data-act="import"></label></div>
    <p class="status" id="status"></p>
    <h2>清除</h2>
    <div class="row"><button class="btn quiet small" data-act="clear-all">清空这个孩子的全部记录</button></div>
    <p class="note">家长测试请在网址后加 <code>?test=1</code>，测试记录与正式记录分开保存。</p>
  </div>`);
}
function download(name, content, type) { const b = new Blob([content], { type }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 30000); }
function exportMd() {
  const lines = [`# ${CHILD[who].label} · 数学错题本记录（${TEST ? '测试' : '正式'}）`, '', '| 日期 | 范围 | 题数 | 独立 | 订正 | 错 |', '| --- | --- | --- | --- | --- | --- |', ...state.sessions.map(s => `| ${s.at.slice(0, 10)} | ${s.label} | ${s.total} | ${s.independent} | ${s.assisted} | ${s.wrong} |`), '', '## 待复查', ...items.filter(i => state.items[i.id]?.needReview).map(i => `- ${i.title || i.prompt}（${i.category}，错 ${state.items[i.id].wrong} 次）`), '', '## 已过关', ...items.filter(i => isGraduated(i.id)).map(i => `- ${i.title || i.prompt}`)];
  download(`${who}-数学错题记录-${today()}.md`, lines.join('\n'), 'text/markdown;charset=utf-8');
}
async function importJson(file) { try { const s = JSON.parse(await file.text()); if (!s || s.v !== 1 || s.who !== who) throw new Error('不是这个孩子的备份'); const ids = new Set(state.sessions.map(x => x.id)); for (const x of s.sessions || []) if (!ids.has(x.id)) state.sessions.push(x); for (const [id, r] of Object.entries(s.items || {})) { if (!state.items[id] || (r.lastAt || '') > (state.items[id].lastAt || '')) state.items[id] = r; } save(); $('#status').textContent = '已合并导入。'; } catch (e) { $('#status').textContent = '没有导入：' + e.message; } }

/* ---------- 事件 ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'INPUT') return; const act = b.dataset.act;
  if (act === 'portal') { location.href = `../../../subject.html?subject=math&who=${who}`; return; }
  if (act === 'home') { renderHome(); return; }
  if (act === 'quit') { const done = session ? Object.values(session.results).filter(r => r.done).length : 0; if (session && done < session.ids.length && !confirm(`还有 ${session.ids.length - done} 题没做，先退出？做过的已经记下了。`)) return; if (session && done) renderResult(); else renderHome(); return; }
  if (act === 'who') { who = b.dataset.who; const u = new URL(location.href); u.searchParams.set('who', who); history.replaceState(null, '', u); document.body.dataset.who = who; boot(); return; }
  if (act === 'start') { startSession(pickSession(), '今天这 10 题'); return; }
  if (act === 'cat') { const c = b.dataset.cat; let list = pickSession(items.filter(i => i.category === c)); if (!list.length) list = items.filter(i => i.category === c && i.status === 'ready').slice(0, SESSION_SIZE); startSession(list, c); return; }
  if (act === 'choose') { qstate().answer = b.dataset.val; document.querySelectorAll('.choice').forEach(x => x.setAttribute('aria-pressed', x === b)); return; }
  if (act === 'hint') { const q = qstate(); q.hinted = true; $('#hint').hidden = false; b.setAttribute('hidden', ''); return; }
  if (act === 'check') { checkAnswer(); return; }
  if (act === 'show-steps') { renderExplain(true); return; }
  if (act === 'back-to-q') { const q = qstate(); if (q.done) { renderQuestion(); lockInput(); } else { q.answer = ''; renderQuestion(); } return; }
  if (act === 'next') { next(); return; }
  if (act === 'manual-done') { renderManualCheck(); return; }
  if (act === 'chk') { const q = qstate(); const i = Number(b.dataset.i); q.checks[i] = !q.checks[i]; b.setAttribute('aria-pressed', q.checks[i]); b.querySelector('i').innerHTML = q.checks[i] ? icons.check : ''; return; }
  if (act === 'manual-right') { finishItem('independent'); next(); return; }
  if (act === 'manual-wrong') { finishItem('wrong'); next(); return; }
  if (act === 'parent') { renderParent(); return; }
  if (act === 'export-md') { exportMd(); return; }
  if (act === 'export-json') { download(`${who}-数学错题备份-${today()}.json`, JSON.stringify(state, null, 2), 'application/json'); return; }
  if (act === 'clear-all') { if (!confirm('清空这个孩子的全部错题记录？不能恢复。')) return; state = fresh(); save(); renderParent(); return; }
});
document.addEventListener('change', e => { const b = e.target.closest('[data-act="import"]'); if (b && b.files?.[0]) importJson(b.files[0]).then(() => { b.value = ''; }); });

/* ---------- 启动 ---------- */
async function boot() {
  document.body.dataset.who = who;
  try {
    const r = await fetch(`../../../data/learning/${who}_math_mistakes_20261024.json`, { cache: 'no-store' }); if (!r.ok) throw new Error('题库没有打开');
    bank = await r.json(); items = (bank.items || []).filter(i => i && i.id && i.prompt); byId = new Map(items.map(i => [i.id, i]));
    if (!items.length) throw new Error('这个孩子的题库是空的');
    load(); renderHome();
  } catch (e) { $('#app').innerHTML = `<p class="note bad" style="margin-top:40px">${esc(e.message)}。请稍后刷新。</p>`; }
}
boot();
})();
