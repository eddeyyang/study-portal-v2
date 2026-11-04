/* 两枚徽章诞生记 —— 页面与学习流程（V2 自有，Claude 2026-11-04） */
(function(){
'use strict';
const C = window.BADGE, A = window.ART;
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const app = $('#app');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 谁在学、记录存哪里（按孩子、正式/测试分开） ---------- */
const params = new URLSearchParams(location.search);
const pick = v => ['kenton','eddey'].includes(v) ? v : null;
const WHO = pick(params.get('who')) || pick(params.get('child'));
const TEST = ['1','true'].includes(params.get('test')) || params.get('mode') === 'test' || ['1','true'].includes(params.get('parentTest'));
const NAMES = {kenton:'哥哥 Kenton', eddey:'弟弟 Eddey'};
const KEY = w => `sp2.badge-story:${w}:${TEST ? 'test' : 'formal'}`;
const ME = WHO ? C.works[WHO].me : 'gege';
const OTHER = WHO === 'kenton' ? 'eddey' : 'kenton';
const fill = s => String(s || '').replace(/\{me\}/g, ME);

function today(d=new Date()){ const p = n => String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; }
function fresh(w){ return {v:1, who:w, created:today(), st:{}, ans:{}, labs:{}, pick:null, talks:0, days:{}}; }
let storageOK = true;
function load(w){
  try{ const s = JSON.parse(localStorage.getItem(KEY(w)) || 'null'); if(s && s.v === 1 && s.who === w) return s; }catch(e){ storageOK = false; }
  return fresh(w);
}
let state = WHO ? load(WHO) : null;
function save(){ if(!state) return; try{ localStorage.setItem(KEY(state.who), JSON.stringify(state)); }catch(e){ storageOK = false; } }

/* 用时：可见时才计，每次最多 3 分钟 */
let lastMark = Date.now(), stationSec = 0;
function mark(){
  if(!state) return;
  const now = Date.now(), dt = Math.min(180, (now - lastMark) / 1000); lastMark = now;
  if(document.visibilityState !== 'visible' || dt < 1) return;
  const d = state.days[today()] || (state.days[today()] = {sec:0});
  d.sec += dt; stationSec += dt; save();
}

/* ---------- 学习记录上报（家长 2026-11-01：V2 的软件都要把学习记录发给家长） ---------- */
let reportBuf = [];
function noteResult(id, result, extra){ if(state) reportBuf.push(Object.assign({id, result}, extra || {})); }
function itemInfo(r){
  const q = C.questions[r.id];
  return q ? Object.assign({q:q.q.slice(0, 80), ref:String(q.o[q.a]).slice(0, 60)}, r) : r;
}
function sendReport(kind, extra){
  if(!state || !window.V2Records || (!reportBuf.length && kind === 'leave')) return;
  const items = reportBuf.map(itemInfo); reportBuf = [];
  const rid = window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  try{ window.V2Records.enqueue(Object.assign({app:'badge-story', who:state.who, subject:'explore', mode:TEST ? 'test' : 'formal', roundId:rid, kind,
    total:items.filter(x => x.result === 'right' || x.result === 'wrong').length, right:items.filter(x => x.result === 'right').length,
    wrong:items.filter(x => x.result === 'wrong').length, items}, extra || {})); }catch(e){}
}
document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') lastMark = Date.now(); else { mark(); sendReport('leave', {label:'离开页面时未发的作答'}); } });
window.addEventListener('pagehide', () => { mark(); sendReport('leave', {label:'离开页面时未发的作答'}); });

/* ---------- 小工具 ---------- */
let toastTimer;
function toast(msg){
  let t = $('.toast'); if(!t){ t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role','status'); document.body.append(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2400);
}
function lightbox(src, alt){
  const d = document.createElement('div'); d.className = 'lightbox'; d.setAttribute('role','dialog'); d.setAttribute('aria-label', alt || '放大看');
  d.innerHTML = `<img src="${esc(src)}" alt="${esc(alt || '')}"><button class="lb-x" aria-label="关闭">${icon.close}</button>`;
  const close = () => { d.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if(e.key === 'Escape') close(); };
  d.addEventListener('click', close); document.addEventListener('keydown', onKey);
  document.body.append(d);
}
const icon = {
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  next:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
  zoom:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4M11 8v6M8 11h6"/></svg>'
};
const portalBack = () => `../../../subject.html?subject=explore${WHO ? `&who=${WHO}` : ''}`;
const whoURL = w => { const p = new URLSearchParams(location.search); p.set('who', w); p.delete('child'); return `${location.pathname}?${p.toString()}`; };
const switchURL = () => { const p = new URLSearchParams(location.search); p.delete('who'); p.delete('child'); const s = p.toString(); return `${location.pathname}${s ? '?' + s : ''}`; };

function topbar(inner, closeHref, closeLabel){
  return `<header class="top"><a class="ib" href="${esc(closeHref)}" aria-label="${esc(closeLabel)}">${closeHref === '#/' ? icon.close : icon.back}</a>${inner}
    ${TEST ? '<span class="test">测试，不计入</span>' : ''}
    ${WHO ? `<a class="me" href="${esc(switchURL())}" aria-label="现在是${NAMES[WHO]}，点这里换人"><i>${WHO === 'kenton' ? 'K' : 'E'}</i><span>${NAMES[WHO]}</span></a>` : ''}</header>`;
}

/* ---------- 站点与卡片顺序 ---------- */
const stations = C.stations;
function cardsFor(st){
  const out = []; let i = 0;
  while(i < st.cards.length){
    const c = st.cards[i];
    if(!c.kid){ out.push(c); i++; continue; }
    const block = []; while(i < st.cards.length && st.cards[i].kid){ block.push(st.cards[i]); i++; }
    out.push(...block.filter(x => x.kid === WHO), ...block.filter(x => x.kid !== WHO));
  }
  return out;
}
const doneCount = () => stations.filter(s => state.st[s.id]?.done).length;
function nextStation(){ return stations.find(s => !state.st[s.id]?.done) || null; }

/* ---------- 路由 ---------- */
let cleanup = [];
function runCleanup(){ cleanup.forEach(f => { try{ f(); }catch(e){} }); cleanup = []; }
function route(){
  runCleanup(); mark();
  if(!WHO){ renderWho(); return; }
  document.body.dataset.who = WHO;
  const m = location.hash.match(/^#\/s\/([a-z]+)(?:\/(\d+))?/);
  if(m && stations.some(s => s.id === m[1])) renderStation(m[1], Number(m[2] || 0));
  else renderHome();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* ---------- 选人 ---------- */
function renderWho(){
  document.body.removeAttribute('data-who');
  document.title = '两枚徽章诞生记 · 选一个人';
  app.innerHTML = `<div class="who-page"><div class="who-in">
    <p class="kicker">探索与实践 · 小项目</p><h1 class="title">两枚徽章诞生记</h1>
    <p class="lede">先选一下是谁在学，进度分开记。</p>
    <div class="who-pick">${['kenton','eddey'].map(w => `<a class="who-card ${w}" href="${esc(whoURL(w))}"><i>${w === 'kenton' ? 'K' : 'E'}</i><b>${NAMES[w]}</b><span>《${esc(C.works[w].name)}》的作者</span></a>`).join('')}</div>
    <a class="quiet" href="../../../subject.html?subject=explore">回到学习室</a></div></div>`;
}

/* ---------- 首页：封面 + 八站地图 ---------- */
function renderHome(){
  document.title = '两枚徽章诞生记';
  const mine = C.works[WHO], other = C.works[OTHER];
  const nx = nextStation();
  const total = stations.reduce((a, s) => a + s.min, 0);
  const cta = !nx ? `<a class="cta" href="#/s/idea/0">再看一遍 ${icon.next}</a>`
    : state.st[nx.id] ? `<a class="cta" href="#/s/${nx.id}/${state.st[nx.id].card || 0}">继续：第 ${nx.n} 站 · ${esc(nx.title)} ${icon.next}</a>`
    : `<a class="cta" href="#/s/${nx.id}/0">${nx.n === 1 ? '开始第 1 站' : `开始第 ${nx.n} 站 · ${esc(nx.title)}`} ${icon.next}</a>`;
  app.innerHTML = `${topbar('<div class="crumb"><b>两枚徽章诞生记</b><small>探索与实践</small></div>', portalBack(), '回到学习室')}
  <section class="hero">
    <div class="hero-copy">
      <p class="kicker">探索与实践 · 小项目</p>
      <h1 class="title">两枚徽章<br>诞生记</h1>
      <p class="lede">一个想法，怎样变成一枚会发光的徽章？哪里没成功？下次怎样做得更好？</p>
      <div class="chips"><span class="chip">8 站</span><span class="chip">约 ${Math.round(total)} 分钟</span><span class="chip">有动画、小实验和小题目</span></div>
      ${cta}
      ${doneCount() ? `<p class="prog">已完成 ${doneCount()} / ${stations.length} 站</p>` : ''}
    </div>
    <div class="duo" aria-hidden="true">
      <figure class="a"><img src="${esc(mine.hero)}" alt=""><figcaption>${esc(mine.who)} ·《${esc(mine.name)}》</figcaption></figure>
      <figure class="b"><img src="${esc(other.hero)}" alt=""><figcaption>${esc(other.who)} ·《${esc(other.name)}》</figcaption></figure>
    </div>
  </section>
  <section class="map" aria-labelledby="map-h"><h2 id="map-h">八站路线</h2>
    <div class="stations">${stations.map(s => {
      const d = state.st[s.id]?.done, started = state.st[s.id] && !d;
      const href = `#/s/${s.id}/${started ? (state.st[s.id].card || 0) : 0}`;
      return `<a class="st ${d ? 'done' : started ? 'started' : ''}" href="${href}"><span class="n">${d ? icon.check : s.n}</span><span class="t"><b>${esc(s.title)}</b><small>${esc(s.sub)}</small></span><span class="m">${d ? '已完成' : started ? '学到一半' : `${s.min} 分钟`}</span></a>`;
    }).join('')}</div>
    <p class="fine">${storageOK ? '进度只存在这台设备上；学完一站会把结果发给家长。' : '这台设备不能保存进度，关掉页面后要从头看。'}</p>
  </section>`;
}

/* ---------- 一站：一次一张卡片 ---------- */
let navState = {can:true};
function renderStation(id, n){
  const st = stations.find(s => s.id === id), cards = cardsFor(st);
  n = Math.max(0, Math.min(cards.length - 1, n));
  const rec = state.st[id] || (state.st[id] = {card:0});
  rec.card = n; save();
  if(n === 0) stationSec = 0;
  const card = cards[n];
  document.title = `第 ${st.n} 站 · ${st.title} · 两枚徽章诞生记`;
  const bar = cards.map((_, i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('');
  app.innerHTML = `${topbar(`<div class="crumb"><b>第 ${st.n} 站 · ${esc(st.title)}</b><small>${n + 1} / ${cards.length}</small></div>`, '#/', '回到路线')}
    <main class="stage"><div class="bar" aria-hidden="true">${bar}</div><article class="card t-${card.type}" id="card"></article></main>
    ${card.type === 'finish' ? '' : `<nav class="nav" aria-label="翻页"><div class="in">
      <button class="btn prev" type="button" ${n === 0 && st.n === 1 ? 'disabled' : ''} aria-label="上一步">${icon.back}<span>上一步</span></button>
      <button class="btn next" type="button">${card.type === 'wrap' ? `完成第 ${st.n} 站` : '下一步'}${icon.next}</button></div></nav>`}`;
  const el = $('#card');
  navState = {can:true};
  render(card, el, st);
  const prev = $('.btn.prev'), next = $('.btn.next');
  if(prev) prev.addEventListener('click', () => {
    if(n > 0) location.hash = `#/s/${id}/${n - 1}`;
    else { const p = stations[st.n - 2]; if(p) location.hash = `#/s/${p.id}/${cardsFor(p).length - 1}`; }
  });
  if(next){
    const sync = () => { next.disabled = !navState.can; };
    sync(); navState.sync = sync;
    next.addEventListener('click', () => {
      if(!navState.can){ toast('先选一个答案'); return; }
      if(n < cards.length - 1){ location.hash = `#/s/${id}/${n + 1}`; return; }
      finishStation(st);
    });
  }
  const onKey = e => {
    if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if(e.key === 'ArrowRight' && next && !next.disabled) next.click();
    if(e.key === 'ArrowLeft' && prev && !prev.disabled) prev.click();
  };
  document.addEventListener('keydown', onKey); cleanup.push(() => document.removeEventListener('keydown', onKey));
}
function lock(){ navState.can = false; navState.sync && navState.sync(); }
function unlock(){ navState.can = true; navState.sync && navState.sync(); }

function finishStation(st){
  mark();
  const first = !state.st[st.id].done;
  state.st[st.id].done = state.st[st.id].done || today(); state.st[st.id].card = 0; save();
  sendReport('station', {station:st.id, label:`第 ${st.n} 站 · ${st.title}`, seconds:Math.round(stationSec), firstTime:first, doneStations:doneCount()});
  stationSec = 0;
  const nx = stations[st.n] || null;
  toast(`第 ${st.n} 站完成`);
  location.hash = nx ? `#/s/${nx.id}/0` : '#/';
}

/* ---------- 卡片 ---------- */
function render(card, el, st){
  const kick = card.kicker ? `<p class="kicker">第 ${st.n} 站 · ${esc(card.kicker)}</p>` : '';
  const f = R[card.type];
  f(card, el, kick, st);
}
const R = {};

const img = (src, cap, zoom) => `<figure class="media ${zoom ? 'zoomable' : ''}"><img src="${esc(fill(src))}" alt="${esc(cap || '')}" loading="lazy">${zoom ? `<button class="zoom" type="button" data-src="${esc(fill(src))}" aria-label="放大看">${icon.zoom}</button>` : ''}</figure>${cap ? `<p class="cap">${esc(cap)}</p>` : ''}`;
const list = (items, cls='') => `<ol class="pts ${cls}">${items.map(t => `<li>${esc(t)}</li>`).join('')}</ol>`;

R.lead = (c, el, kick) => {
  let body = '';
  if(c.both){
    const ws = [WHO, OTHER].map(w => C.works[w]);
    body = `<div class="pair">${ws.map((w, i) => `<div class="work ${i ? 'other' : 'mine'}"><img src="${esc(w.hero)}" alt="${esc(w.name)}的设计效果图"><div class="wt"><span class="tag">${esc(w.who)} · ${esc(w.grade)}${i ? '' : ' · 你的作品'}</span><b>《${esc(w.name)}》</b><p>${esc(w.question)}</p></div></div>`).join('')}</div>
      <p class="cap">图是电脑里做的设计效果图；真正的徽章，要靠一步一步做出来。</p>`;
  }
  el.innerHTML = `${kick}<h2>${esc(c.title)}</h2>${c.text ? `<p>${esc(c.text)}</p>` : ''}${body}
    ${c.img ? img(c.img, c.imgCap) : ''}
    ${c.callout ? `<p class="callout">${esc(c.callout)}</p>` : ''}${c.list ? list(c.list, c.key ? 'key' : '') : ''}
    ${c.note ? `<p class="note">${esc(c.note)}</p>` : ''}`;
  bindZoom(el);
};

R.wrap = (c, el, kick, st) => {
  el.innerHTML = `<div class="wrapbox"><p class="kicker">第 ${st.n} 站 · 小结</p><h2>${esc(c.title)}</h2>
    <ul class="checks">${c.points.map(t => `<li><span>${icon.check}</span>${esc(t)}</li>`).join('')}</ul>
    ${c.note ? `<p class="note">${esc(c.note)}</p>` : ''}</div>`;
};

R.quiz = (c, el) => {
  const q = C.questions[c.q], prev = state.ans[c.q];
  const shapes = q.shapes;
  el.innerHTML = `<p class="kicker">问一问</p><h2>${esc(q.q)}</h2>${c.lead ? `<p>${esc(c.lead)}</p>` : ''}
    <div class="opts ${shapes ? 'pics' : ''}" role="group" aria-label="选项">${q.o.map((o, i) => `<button class="opt" type="button" data-i="${i}">${shapes ? A.joint(shapes[i]) : ''}<span class="k">${'ABCD'[i]}</span><span class="o">${shapes ? '' : esc(o)}</span></button>`).join('')}</div>
    <div class="fb" aria-live="polite"></div>${c.after === 'countbars' ? '<div class="after" hidden></div>' : ''}`;
  const fb = $('.fb', el);
  let solved = false, misses = 0;
  const finish = (head) => {
    solved = true;
    $$('.opt', el).forEach(b => { b.disabled = true; if(Number(b.dataset.i) === q.a) b.classList.add('right'); });
    fb.innerHTML = `<div class="why ok"><b>${esc(head)}</b>${esc(q.why)}</div>`;
    const af = $('.after', el); if(af){ af.hidden = false; af.innerHTML = countBars(); }
    unlock();
  };
  const reveal = (i, first) => {
    if(i === q.a){ finish(first ? '答对了！' : '对了。'); return; }
    misses++;
    $$('.opt', el).forEach(b => { if(Number(b.dataset.i) === i){ b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); } });
    if(misses >= 2){ finish(`答案是 ${'ABCD'[q.a]}${q.shapes ? '' : '：' + q.o[q.a]}。`); return; }
    fb.innerHTML = `<div class="why no"><b>再想想。</b>${esc(q.hint || '换一个再试试。')}</div>`;
  };
  lock();
  if(prev) finish(prev.first === 'right' ? '你上次第一次就答对了。' : '上次做过这题，再看一遍讲解：');
  $$('.opt', el).forEach(b => b.addEventListener('click', () => {
    if(solved) return;
    const i = Number(b.dataset.i);
    if(!state.ans[c.q]){ state.ans[c.q] = {first: i === q.a ? 'right' : 'wrong', at:today()}; save(); noteResult(c.q, state.ans[c.q].first, {pickedFirst:q.o[i]}); }
    reveal(i, state.ans[c.q].first === 'right' && i === q.a);
  }));
};
function countBars(){
  const rows = [['7 颗灯，每颗 3 个点', 21], ['7 个短脚串起来', 12], ['两个开关', 4], ['电池和主板', 4], ['地线两头', 2]];
  return `<div class="bars"><p class="bars-h">约 43 个焊点，都从哪儿来</p>${rows.map(([t, v]) => `<div class="brow"><span>${esc(t)}</span><i style="--w:${v / 21 * 100}%"><em>${v}</em></i></div>`).join('')}</div>`;
}

R.video = (c, el) => {
  let src, poster, alt = null;
  if(c.video === 'demo-kenton'){ src = C.works.kenton.demo.src; poster = C.works.kenton.demo.poster; }
  else if(c.video === 'demo-eddey'){ src = C.works.eddey.demo.src; poster = C.works.eddey.demo.poster; }
  else if(c.video === 'full'){ src = `media/full-${ME}.mp4`; poster = `media/full-${ME}.webp`; alt = OTHER; }
  else { src = `media/${c.video}-${ME}.mp4`; poster = `media/${c.video}-${ME}.webp`; }
  el.innerHTML = `<p class="kicker">${c.optional ? '选看' : '动画'}</p><h2>${esc(c.title)}</h2>
    <figure class="media vid"><video controls playsinline preload="none" poster="${esc(poster)}" src="${esc(src)}"></video></figure>
    <p>${esc(c.text)}</p>${c.ask ? `<p class="ask">${esc(c.ask)}</p>` : ''}
    ${alt ? `<p class="alt"><button class="link" type="button" data-alt="1">换成看${esc(C.works[alt].who)}的《${esc(C.works[alt].name)}》</button></p>` : ''}`;
  const v = $('video', el);
  v.addEventListener('play', () => { if(!state.labs['v:' + c.video]){ state.labs['v:' + c.video] = today(); save(); noteResult('video:' + c.video, 'started'); } });
  cleanup.push(() => { try{ v.pause(); }catch(e){} });
  const b = $('[data-alt]', el);
  if(b) b.addEventListener('click', () => {
    const me2 = C.works[alt].me; const on = b.dataset.alt === '1';
    v.pause(); v.src = `media/full-${on ? me2 : ME}.mp4`; v.poster = `media/full-${on ? me2 : ME}.webp`;
    b.dataset.alt = on ? '0' : '1';
    b.textContent = on ? `换回${C.works[WHO].who}的《${C.works[WHO].name}》` : `换成看${C.works[alt].who}的《${C.works[alt].name}》`;
  });
};

R.steps = (c, el, kick) => {
  el.innerHTML = `${kick}<h2>${esc(c.title)}</h2>
    <ol class="steps">${c.items.map(([k, t, d], i) => `<li><figure><img src="media/step-${k}-${ME}.webp" alt="" loading="lazy"></figure><div><span class="sn">${i + 1}</span><b>${esc(t)}</b><p>${esc(d)}</p></div></li>`).join('')}</ol>`;
};

R.compare = (c, el) => {
  el.innerHTML = `<p class="kicker">对比</p><h2>${esc(c.title)}</h2>
    <div class="cmp" role="table"><div class="cr hd" role="row"><span role="columnheader"></span><span role="columnheader">这一版</span><span role="columnheader">下一版</span></div>
    ${c.rows.map(([a, b, d]) => `<div class="cr" role="row"><span role="rowheader">${esc(a)}</span><span role="cell" class="now">${esc(b)}</span><span role="cell" class="nx">${esc(d)}</span></div>`).join('')}</div>`;
};

R.compare2 = (c, el, kick) => {
  el.innerHTML = `${kick}<h2>${esc(c.title)}</h2>
    <div class="two">${c.cols.map((x, i) => `<div class="col ${i ? 'b' : 'a'}"><span class="ic">${A.icons[x.icon]}</span><b>${esc(x.h)}</b><p>${esc(x.t)}</p></div>`).join('')}</div>
    ${c.img ? img(c.img, c.imgCap) : ''}`;
};

R.lab = (c, el, kick) => {
  el.innerHTML = `${kick || '<p class="kicker">动手试试</p>'}<h2>${esc(c.title)}</h2>${c.text ? `<p>${esc(c.text)}</p>` : ''}<div class="labbox"></div>`;
  LAB[c.lab]($('.labbox', el), c);
  if(!state.labs[c.lab]){ state.labs[c.lab] = today(); save(); }
};

R.finish = (c, el) => {
  mark();
  const answered = Object.keys(C.questions).filter(k => state.ans[k]);
  const right = answered.filter(k => state.ans[k].first === 'right').length;
  const all = stations.slice(0, -1).every(s => state.st[s.id]?.done);
  const mins = Math.max(1, Math.round(Object.values(state.days).reduce((a, d) => a + (d.sec || 0), 0) / 60));
  const firstFinish = !state.finished;
  if(firstFinish) state.finished = today();
  state.st.next = state.st.next || {}; state.st.next.done = state.st.next.done || today(); save();
  if(firstFinish || reportBuf.length) sendReport('finish', {station:'next', label:'学完两枚徽章诞生记', firstTime:firstFinish, firstTryRight:right, answered:answered.length, pick:state.pick, talks:state.talks, minutes:mins, allStations:all});
  el.innerHTML = `<div class="finish"><div class="seal">${icon.check}</div><p class="kicker">两枚徽章诞生记</p><h2>学完啦！</h2>
    <p>从一个问题，到 9 道工序、43 个焊点，再到下一版的电路板——你已经知道一枚徽章是怎么诞生的，也知道它哪里没成功、下次怎么做得更好。</p>
    <div class="stats"><div><b>${doneCount()}</b><span>站学完</span></div><div><b>${right}/${answered.length}</b><span>题第一次就答对</span></div><div><b>${mins}</b><span>分钟</span></div></div>
    <p class="note">最后一个问题，留给你自己：下一枚徽章，你想让它多会做一件什么事？</p>
    <div class="fin-btns"><button class="btn share" type="button">发给家长</button><a class="btn" href="#/">回到路线</a><a class="btn" href="${esc(portalBack())}">回到学习室</a></div></div>`;
  $('.share', el).addEventListener('click', async () => {
    const text = `${NAMES[WHO]} 学完了《两枚徽章诞生记》：${doneCount()} 站，${right}/${answered.length} 题第一次答对，约 ${mins} 分钟。最想先试的方向：${state.pick ? (C.future.find(f => f.id === state.pick) || {}).t : '还没选'}；跟专家讲的四句话练了 ${state.talks} 遍。`;
    if(window.V2Records){ const r = await window.V2Records.share('两枚徽章诞生记 · 学习记录', text); if(r === 'shared') toast('发好了'); }
  });
};

function bindZoom(el){ $$('.zoom', el).forEach(b => b.addEventListener('click', () => lightbox(b.dataset.src, '放大看'))); }

/* ---------- 小实验 ---------- */
const LAB = {};

LAB.parts = (box) => {
  const P = { body:[13.4, 24.6], divider:[32.7, 24.6], lid:[52.1, 24.4], battery:[72.8, 23.4], xiao:[90, 24.6], leds:[14.9, 48.6], res:[34.5, 49.9],
    switches:[50.2, 51], wires:[78.1, 50], screws:[13.1, 78.8], nuts:[33.5, 78.9], tubes:[55, 78.8], brooch:[70.8, 78.9], sticker:[88.7, 75.1] };
  const isK = WHO === 'kenton';
  const parts = [
    ['body','主体','外壳的“身体”。外壳三件都是 3D 打印机一层一层“画”出来的塑料。'],
    ['divider','隔板','把下面的电池和上面的电路隔开。'],
    ['lid','前盖','灯从这里的小孔露出来，外面贴贴纸。'],
    ['battery','锂电池','给徽章供电，能反复充电。它怕被刺破、压坏和短路，要小心。'],
    ['xiao','主板','徽章的“大脑”：一台比邮票还小的电脑，程序就装在它里面。'],
    ['leds','7 颗灯', isK ? 'LED：外圈 6 颗蓝灯、中间 1 颗黄灯。长脚是正极（+），短脚是负极（−）。' : 'LED：7 颗黄灯。长脚是正极（+），短脚是负极（−）。'],
    ['res','7 个电阻', isK ? '限流，保护灯和主板：蓝灯配 330 欧，黄灯配 1 千欧。' : '限流，保护灯和主板：每颗灯配 1 千欧。'],
    ['switches','2 个开关','一个管电源（开、关），一个切换模式。'],
    ['wires','彩色线','把主板和灯、开关连起来。颜色不同，是为了不接错。'],
    ['screws','螺丝','把前盖和主体固定在一起。'],
    ['nuts','螺母','藏在外壳四角的小槽里，和螺丝一起拧紧。'],
    ['tubes','热缩管','套在焊点外面，一烤就缩紧，防止碰线。'],
    ['brooch','胸针底座','粘在背面，徽章就能别在衣服上。'],
    ...(isK ? [['sticker','前盖贴纸','印着图案和开关说明，七个小孔正好套住七颗灯。']] : [])
  ];
  box.innerHTML = `<div class="parts"><figure class="media"><img src="media/parts-${ME}.webp" alt="一枚徽章的全部零件"></figure>
    ${parts.map(([k], i) => `<button class="hot" type="button" data-k="${k}" style="left:${P[k][0]}%;top:${P[k][1]}%" aria-label="${esc(parts[i][1])}">${i + 1}</button>`).join('')}</div>
    <div class="part-info" aria-live="polite"><b>点一个圆点</b><p>一共 ${parts.length} 样东西。</p></div>
    <div class="part-chips">${parts.map(([k, t], i) => `<button type="button" data-k="${k}"><i>${i + 1}</i>${esc(t)}</button>`).join('')}</div>`;
  const info = $('.part-info', box), seen = new Set();
  const show = k => {
    const p = parts.find(x => x[0] === k); seen.add(k);
    $$('[data-k]', box).forEach(b => { b.classList.toggle('on', b.dataset.k === k); if(seen.has(b.dataset.k)) b.classList.add('seen'); });
    info.innerHTML = `<b>${esc(p[1])}</b><p>${esc(p[2])}</p><small>看过 ${seen.size} / ${parts.length}</small>`;
  };
  $$('[data-k]', box).forEach(b => b.addEventListener('click', () => show(b.dataset.k)));
};

LAB.circuit = (box) => {
  box.innerHTML = `<div class="circ">${A.circuit()}</div><div class="row-btns"><button class="btn sm" type="button" data-a="sw">合上开关</button><button class="btn sm ghost" type="button" data-a="rev">把灯反过来</button></div><p class="msg" aria-live="polite">开关是断开的：圈没接通，灯不亮。</p>`;
  const s = $('svg', box), msg = $('.msg', box);
  let closed = false, rev = false;
  const upd = () => {
    s.classList.toggle('closed', closed); s.classList.toggle('rev', rev); s.classList.toggle('lit', closed && !rev);
    $('[data-a=sw]', box).textContent = closed ? '断开开关' : '合上开关';
    $('[data-a=rev]', box).textContent = rev ? '把灯摆正' : '把灯反过来';
    msg.textContent = !closed ? '开关是断开的：圈没接通，灯不亮。' : rev ? '圈接通了，灯却不亮：LED 是单向的，电只能从长脚（+）流进去。' : '圈接通了！电流动起来，灯亮了。';
  };
  $('[data-a=sw]', box).addEventListener('click', () => { closed = !closed; upd(); });
  $('[data-a=rev]', box).addEventListener('click', () => { rev = !rev; upd(); });
};

LAB.pins = (box) => {
  box.innerHTML = `<div class="pinsbox">${A.pins(WHO)}</div><div class="row-btns"><button class="btn sm" type="button" data-a="seq">按顺序亮一遍（像测试程序）</button></div><p class="msg" aria-live="polite">点一行，让主板的那只脚“送电”。</p>
    <p class="cap"><button class="link" type="button" data-z="media/wiring-${ME}.webp">看真正的接线电路图（制作用）</button></p>`;
  const msg = $('.msg', box); let timer = null;
  const names = WHO === 'kenton' ? ['顶部','右上','右下','底部','左下','左上','中心'] : ['A','上1','上2','上3','B','桥1','桥2'];
  const setOn = i => { $$('.pin', box).forEach(p => p.classList.toggle('on', Number(p.dataset.i) === i)); if(i >= 0) msg.textContent = `D${i} 送电 → 电阻 → ${names[i]}的灯亮 → 电从短脚回到地线。`; };
  $$('.pin', box).forEach(p => {
    const go = () => { clearInterval(timer); timer = null; setOn(p.classList.contains('on') ? -1 : Number(p.dataset.i)); };
    p.addEventListener('click', go); p.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); } });
  });
  $('[data-a=seq]', box).addEventListener('click', () => {
    clearInterval(timer); let i = 0; setOn(0);
    timer = setInterval(() => { i++; if(i > 6){ clearInterval(timer); timer = null; setOn(-1); msg.textContent = '七颗灯轮流亮了一遍——装好以后，先用这样的测试程序检查有没有接错。'; return; } setOn(i); }, reduce ? 900 : 650);
  });
  cleanup.push(() => clearInterval(timer));
  $('[data-z]', box).addEventListener('click', e => lightbox(e.currentTarget.dataset.z, '接线电路图'));
};

LAB.chain = (box) => {
  const lay = C.layout[WHO];
  box.innerHTML = `<div class="chainbox">${A.chain(WHO)}</div>
    <div class="row-btns"><button class="btn sm" type="button" data-a="ring">把串的两头连起来</button><button class="btn sm ghost" type="button" data-a="reset">全部接好</button></div>
    <p class="msg" aria-live="polite">现在七颗灯都亮着。点一段黑线，把它剪断。</p>`;
  const s = $('svg', box), msg = $('.msg', box);
  const cut = new Set(); let ring = false, tried = false;
  const edges = () => {
    const e = [];
    for(let i = 0; i < lay.chain.length - 1; i++) if(!cut.has(String(i))) e.push([lay.chain[i], lay.chain[i + 1]]);
    if(ring && !cut.has('ring')) e.push(lay.close);
    if(!cut.has('gnd')) e.push([lay.gnd, 'GND']);
    return e;
  };
  const upd = () => {
    const E = edges(), lit = new Set(['GND']), q = ['GND'];
    while(q.length){ const x = q.shift(); E.forEach(([a, b]) => { const y = a === x ? b : b === x ? a : null; if(y && !lit.has(y)){ lit.add(y); q.push(y); } }); }
    let off = 0;
    $$('.led', s).forEach(g => { const on = lit.has(g.dataset.id); g.classList.toggle('on', on); if(!on) off++; });
    $$('.link', s).forEach(g => g.classList.toggle('cutd', cut.has(g.dataset.link)));
    s.classList.toggle('ringon', ring);
    $('[data-a=ring]', box).textContent = ring ? '拆掉两头的连线' : '把串的两头连起来';
    if(cut.has('gnd')) msg.textContent = '这一根是接到主板的地线。它一断，所有灯都灭——这就是“一坏全停”的地方。';
    else if(!cut.size) msg.textContent = ring ? `连成一个圈了（${lay.closeText}连上了）。现在随便剪断一处试试。` : '现在七颗灯都亮着。点一段黑线，把它剪断。';
    else if(off === 0) msg.textContent = `断了 ${cut.size} 处，灯还都亮着——电从另一条路回去了。这就是“留一条备用的路”。`;
    else msg.textContent = `断了 ${cut.size} 处，灭了 ${off} 颗。${ring ? '连成圈只能防住断一处；断两处，中间那几颗还是会灭。' : '就像一串彩灯：中间断一处，后面的一起灭。试试“把串的两头连起来”。'}`;
  };
  $$('.link', s).forEach(g => {
    const go = () => { const k = g.dataset.link; if(k === 'ring' && !ring) return; cut.has(k) ? cut.delete(k) : cut.add(k); if(!tried){ tried = true; noteResult('lab:chain', 'tried'); } upd(); };
    g.addEventListener('click', go); g.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); } });
  });
  $('[data-a=ring]', box).addEventListener('click', () => { ring = !ring; cut.delete('ring'); upd(); });
  $('[data-a=reset]', box).addEventListener('click', () => { cut.clear(); upd(); });
  upd();
};

LAB.pcb = (box) => {
  box.innerHTML = `<div class="seg" role="group" aria-label="切换"><button type="button" class="on" data-v="now">这一版：18 根线</button><button type="button" data-v="next">下一版：电路板</button></div>
    <div class="pcbview"><figure class="media now"><img src="media/wires-${ME}.webp" alt="这一版：主板和灯之间焊了很多线"></figure><div class="media next" hidden>${A.pcb(WHO)}</div></div>
    <p class="msg" aria-live="polite">这一版：每颗灯都要单独接线，全靠手工焊。</p>`;
  const msg = $('.msg', box);
  $$('.seg button', box).forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.v;
    $$('.seg button', box).forEach(x => x.classList.toggle('on', x === b));
    $('.now', box).hidden = v !== 'now'; $('.next', box).hidden = v !== 'next';
    msg.textContent = v === 'now' ? '这一版：每颗灯都要单独接线，全靠手工焊。' : '下一版（示意）：灯和电阻贴在板上，金色的铜线路代替电线；主板贴在背面，电池用插座一插就行，图案直接印在板上。';
    if(v === 'next' && !state.labs['pcb-next']){ state.labs['pcb-next'] = today(); save(); }
  }));
};

LAB.smt = (box) => {
  const caps = [
    '画板子：在电脑上画出电路板——零件放在哪、线怎么走。',
    '做光板：工厂在板上做出铜线路、钻孔，刷一层保护漆（常见是绿色），再印上字和图案。',
    '刷锡膏：钢网盖在板上，刮板一刮，每个焊盘上都留下一点“锡膏”（焊锡粉加助焊剂）。',
    '贴零件：贴片机的“吸嘴”把小零件一个个放到锡膏上，一小时能放上万个。',
    '过炉子：整块板走一趟“回流焊炉”，所有锡膏一起熔化——几百个焊点一次焊好。拿到手的，基本是“半成品”，自己只焊几个点。'
  ];
  box.innerHTML = `<div class="tabs" role="tablist">${caps.map((_, i) => `<button type="button" role="tab" data-i="${i + 1}" class="${i ? '' : 'on'}" aria-selected="${i ? 'false' : 'true'}">${i + 1}</button>`).join('')}</div>
    <div class="smtview media"></div><p class="msg" aria-live="polite"></p><div class="row-btns"><button class="btn sm" type="button" data-a="nx">下一步工序</button></div>`;
  const view = $('.smtview', box), msg = $('.msg', box); let cur = 1;
  const show = i => { cur = i; view.innerHTML = A.smt(i); msg.textContent = caps[i - 1]; $$('.tabs button', box).forEach(b => { const on = Number(b.dataset.i) === i; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); }); $('[data-a=nx]', box).textContent = i < 5 ? '下一步工序' : '从头再看'; };
  $$('.tabs button', box).forEach(b => b.addEventListener('click', () => show(Number(b.dataset.i))));
  $('[data-a=nx]', box).addEventListener('click', () => show(cur < 5 ? cur + 1 : 1));
  show(1);
};

LAB.usb = (box) => {
  box.innerHTML = `<div class="media usbbox">${A.usb()}</div><p class="cap">USB-C 线里其实还有更多细线；最基本的，就是这四根。</p>`;
};

LAB.speed = (box) => {
  const isK = WHO === 'kenton';
  const code = isK
    ? [['STEP', '0.5', '# 外圈每格秒数（一圈 = 6 × STEP）'], ['FADE', '0.4', '# 中心灯渐变秒数'], ['RING', '[D0, D5, D4, D3, D2, D1]', '# 逆时针']]
    : [['STEP', '0.5', '# 每颗灯亮多久（秒）——两条路线一样'], ['GAP', '0.8', '# 到 B 以后全灭多久（秒）'], ['NORMAL', '[A, U1, U2, U3, B]', '# 普通路线'], ['WORM', '[A, N1, N2, B]', '# 虫洞路线']];
  box.innerHTML = `<div class="speed"><pre class="code" aria-label="程序"><code>${code.map(([k, v, cm]) => `<span class="ln"><span class="kw">${k}</span> = <span class="${k === 'STEP' ? 'val' : 'lit'}">${esc(v)}</span>   <span class="cm">${esc(cm)}</span></span>`).join('\n')}</code></pre>
    <div class="sim">${A.badge(WHO, 'simb', '徽章模拟')}</div></div>
    <div class="controls"><label class="slider"><span>STEP = <b class="sv">0.5</b> 秒</span><input type="range" min="0.2" max="1.5" step="0.1" value="0.5" aria-label="改 STEP 的数字"></label>
    <button class="btn sm" type="button" data-a="mode">拨模式开关</button></div>
    <p class="msg" aria-live="polite"></p>
    <p class="cap">在真的主板上：插上 USB，打开 CIRCUITPY 盘里的 code.py，把 0.5 改掉、保存——灯马上就照新数字走。</p>`;
  const s = $('.simb', box), msg = $('.msg', box), range = $('input', box);
  const led = k => $(`.led[data-id="${k}"]`, s);
  let step = 0.5, mode = true, t0 = performance.now(), last = t0, level = 1, start = t0, raf = 0, touched = false;
  const RING = ['D0','D5','D4','D3','D2','D1'], NORMAL = ['A','U1','U2','U3','B'], WORM = ['A','N1','N2','B'], GAP = .8, FADE = .4;
  const text = () => {
    if(isK) msg.textContent = `一圈 = 6 × ${step.toFixed(1)} = ${(6 * step).toFixed(1)} 秒。${mode ? '现在是恒星：中心亮着。' : '现在是同质量黑洞：中心灭了，外圈照样转。'}`;
    else msg.textContent = `${mode ? '普通路线：A→1→2→3→B，走 4 步' : '虫洞路线：A→①→②→B，走 3 步'}，到 B 用 ${((mode ? 4 : 3) * step).toFixed(1)} 秒。`;
  };
  const tick = now => {
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if(isK){
      const k = Math.floor((now - t0) / 1000 / step) % 6;
      RING.forEach((id, i) => led(id).classList.toggle('on', i === k));
      const target = mode ? 1 : 0, rate = 1 / FADE;
      level = level < target ? Math.min(target, level + rate * dt) : Math.max(target, level - rate * dt);
      const c = led('D6'); c.classList.add('on'); c.querySelector('.glow').style.opacity = String(level * level); c.querySelector('.lens').style.opacity = String(.35 + .65 * level);
    } else {
      const route = mode ? NORMAL : WORM, period = step * route.length + GAP;
      const t = ((now - start) / 1000) % period, k = Math.floor(t / step);
      const on = k < route.length ? route[k] : null;
      Object.keys(C.layout.eddey.leds).forEach(id => led(id).classList.toggle('on', id === on));
    }
    raf = requestAnimationFrame(tick);
  };
  range.addEventListener('input', () => {
    step = Number(range.value); $('.sv', box).textContent = step.toFixed(1); $('.val', box).textContent = step.toFixed(1);
    if(!touched){ touched = true; noteResult('lab:speed', 'tried'); }
    text();
  });
  $('[data-a=mode]', box).addEventListener('click', () => { mode = !mode; start = performance.now(); text(); });
  text(); raf = requestAnimationFrame(tick);
  cleanup.push(() => cancelAnimationFrame(raf));
};

LAB.future = (box) => {
  box.innerHTML = `<div class="future">${C.future.map(f => `<button type="button" class="fu ${state.pick === f.id ? 'on' : ''}" data-id="${f.id}"><b>${esc(f.t)}</b><span>${esc(f.d)}</span></button>`).join('')}</div><p class="msg" aria-live="polite">${state.pick ? esc((C.future.find(f => f.id === state.pick) || {}).ask || '') : ''}</p>`;
  const msg = $('.msg', box);
  $$('.fu', box).forEach(b => b.addEventListener('click', () => {
    const f = C.future.find(x => x.id === b.dataset.id);
    state.pick = f.id; save(); noteResult('pick:future', 'picked', {pick:f.id, label:f.t});
    $$('.fu', box).forEach(x => x.classList.toggle('on', x === b));
    msg.textContent = `好选择。${f.ask}`;
  }));
};

LAB.talk = (box) => {
  const w = C.works[WHO];
  box.innerHTML = `<ol class="talk">${C.talk.map((t, i) => `<li><span class="tn">${i + 1}</span><div><b>${esc(t.h)}</b><p>“${esc(t.kid ? w.pitch : t.t)}”</p></div></li>`).join('')}</ol>
    <p class="note">照实说：哪些是你自己想的、自己做的，哪些是大人或 AI 帮忙的，也说清楚。专家最想听的，是你自己的话。</p>
    <div class="talk-tools"><button class="poster" type="button" data-z="${esc(w.poster)}"><img src="${esc(w.poster)}" alt="《${esc(w.name)}》海报"><span>你的海报，也能帮你讲</span></button>
      <div class="timer"><div class="ring" style="--p:0"><b>60</b><small>秒</small></div><div class="tbtns"><button class="btn sm" type="button" data-a="go">对着家人讲一遍（计时 60 秒）</button><button class="btn sm ghost" type="button" data-a="done">我讲完了一遍</button><p class="count">已经练了 <b>${state.talks}</b> 遍</p></div></div></div>`;
  let timer = null, left = 60;
  const ring = $('.ring', box);
  $('[data-a=go]', box).addEventListener('click', () => {
    clearInterval(timer); left = 60; ring.style.setProperty('--p', 0); $('b', ring).textContent = '60';
    timer = setInterval(() => { left--; $('b', ring).textContent = String(Math.max(0, left)); ring.style.setProperty('--p', (60 - left) / 60); if(left <= 0){ clearInterval(timer); toast('一分钟到了'); } }, 1000);
  });
  $('[data-a=done]', box).addEventListener('click', () => { clearInterval(timer); state.talks = (state.talks || 0) + 1; save(); noteResult('talk:practice', 'done', {seconds:60 - left}); $('.count b', box).textContent = String(state.talks); toast('讲得好！'); });
  $('[data-z]', box).addEventListener('click', e => lightbox(e.currentTarget.dataset.z, '海报'));
  cleanup.push(() => clearInterval(timer));
};

route();
})();
