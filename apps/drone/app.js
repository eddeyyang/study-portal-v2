/* 无人机 · 二级航线 —— 页面与学习流程 */
(function(){
'use strict';
const C = window.DRONE, A = window.ART, LABS = window.LABS || {};
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const app = $('#app');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 谁在学、记录存哪里 ---------- */
const params = new URLSearchParams(location.search);
const pick = v => ['kenton','eddey'].includes(v) ? v : null;
const WHO = pick(params.get('who')) || pick(params.get('child'));
const TEST = ['1','true'].includes(params.get('test')) || params.get('mode') === 'test' || ['1','true'].includes(params.get('parentTest'));
const NAMES = {kenton:'哥哥 Kenton', eddey:'弟弟 Eddey'};
const SHORT = {kenton:'Kenton', eddey:'Eddey'};
const KEY = w => `sp2.drone.l2:${w}:${TEST ? 'test' : 'formal'}`;
let storageOK = true;

function today(d=new Date()){ const p = n => String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; }
function addDays(ds, n){ const [y,m,d] = ds.split('-').map(Number); return today(new Date(y, m-1, d+n)); }
function niceDate(ds){ if(!ds) return ''; const t = today(); if(ds===t) return '今天'; if(ds===addDays(t,1)) return '明天'; const [,m,d] = ds.split('-').map(Number); return `${m} 月 ${d} 日`; }
function fresh(w){ return {v:1, who:w, created:today(), wp:{}, items:{}, exams:[], days:{}}; }
function load(w){
  try{ const s = JSON.parse(localStorage.getItem(KEY(w)) || 'null'); if(s && s.v === 1 && s.who === w) return s; }
  catch(e){ storageOK = false; }
  return fresh(w);
}
let state = WHO ? load(WHO) : null;
function save(){ if(!state) return; try{ localStorage.setItem(KEY(state.who), JSON.stringify(state)); }catch(e){ storageOK = false; } }

/* 用时：每次换页，把距上次的时间（最多 3 分钟）记到今天 */
let lastMark = Date.now();
function mark(){
  if(!state) return;
  const now = Date.now(), dt = Math.min(180, (now - lastMark) / 1000); lastMark = now;
  if(document.visibilityState !== 'visible' || dt < 1) return;
  const d = state.days[today()] || (state.days[today()] = {sec:0});
  d.sec += dt; save();
}
document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') lastMark = Date.now(); else mark(); });

/* ---------- 间隔复习：盒子 0..5，间隔 0/1/2/4/8/16 天 ---------- */
const GAP = [0,1,2,4,8,16];
function grade(id, ok){
  const t = today(), it = state.items[id] || {box:0, seen:0, right:0, wrong:0};
  it.seen++; it.last = t;
  if(ok){
    it.right++;
    if(it.lastOk !== t) it.box = Math.min(5, (it.box||0) + 1);
    it.lastOk = t;
  } else { it.wrong++; it.box = 1; }
  it.due = addDays(t, GAP[Math.max(1, it.box)]);
  state.items[id] = it; save();
}
function soft(id){ /* “差一点”：不加盒，明天再来 */
  const t = today(), it = state.items[id] || {box:0, seen:0, right:0, wrong:0};
  it.seen++; it.last = t; it.box = Math.max(1, it.box||0); it.due = addDays(t,1);
  state.items[id] = it; save();
}
const recallIds = id => C.wps[id].recall.map((_,i) => `r:${id}:${i}`);
const questionIds = id => Object.values(C.questions).filter(q => q.wp === id).map(q => q.id);
const itemsOf = id => [...recallIds(id), ...questionIds(id)];
function dueList(){ const t = today(); return Object.entries(state.items).filter(([,v]) => v.due && v.due <= t && v.box > 0).map(([k]) => k); }
function wpOfItem(k){ return k.startsWith('r:') ? k.split(':')[1] : C.questions[k]?.wp; }

function level(id){
  const s = state.wp[id];
  if(!s || (!s.done && !s.step)) return {key:'none', label:'还没开始'};
  if(!s.done) return {key:'started', label:'学到一半'};
  const seen = itemsOf(id).map(k => state.items[k]).filter(Boolean);
  const avg = seen.length ? seen.reduce((a,b) => a + (b.box||0), 0) / seen.length : 0;
  const later = seen.some(it => it.lastOk && it.lastOk > s.done);
  if(avg >= 4 && later) return {key:'stable', label:'稳定掌握'};
  if(avg >= 2.4 && later) return {key:'delayed', label:'复测通过'};
  const q = s.quiz;
  if(q && q.total && q.first / q.total >= .8) return {key:'indep', label:'独立会'};
  return {key:'touched', label:'飞过一次'};
}
function mastery(id){
  const seen = itemsOf(id).map(k => state.items[k]).filter(Boolean);
  const all = itemsOf(id).length;
  if(!seen.length) return 0;
  return Math.min(1, seen.reduce((a,b) => a + (b.box||0), 0) / (all * 4));
}
const wpOrder = C.legs.flatMap(l => l.wps);
function nextWp(){ return wpOrder.find(id => !state.wp[id]?.done) || null; }
function legOf(id){ return C.legs.find(l => l.wps.includes(id)); }

/* ---------- 小工具 ---------- */
function shuffle(a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
let toastTimer;
function toast(msg){
  let t = $('.toast'); if(!t){ t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role','status'); document.body.append(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
}
const svgIcon = {
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  exam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4.5h6v2.5H9zM8.5 11.5l2 2 4-4M8.5 17h7"/></svg>',
  route:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M10 3h4"/></svg>',
  sheet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M9.5 4v16M15 4v16M3.5 12h17"/></svg>',
  parent:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2"/><circle cx="17" cy="9.5" r="2.4"/><path d="M15.5 14.2c2.4-.2 4.4 1.3 5 4.3"/></svg>',
  print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="6" rx="1"/></svg>'
};
function portalBack(){ return `../../subject.html?subject=explore${WHO ? `&who=${WHO}` : ''}`; }
function topbar({back='#/', backLabel='回到航线', icon='close', title, sub, right=''}){
  return `<header class="topbar"><a class="icon-btn" href="${esc(back)}" aria-label="${esc(backLabel)}">${svgIcon[icon]}</a>
    <div class="crumb"><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>
    ${TEST ? '<span class="test-chip">测试，不计入</span>' : ''}${right}
    ${WHO ? `<a class="me-chip" href="${esc(switchURL())}" aria-label="现在是${NAMES[WHO]}，点这里换人"><i>${WHO === 'kenton' ? 'K' : 'E'}</i><span>${NAMES[WHO]}</span></a>` : ''}</header>`;
}
function switchURL(){ const p = new URLSearchParams(location.search); p.delete('who'); p.delete('child'); const s = p.toString(); return `${location.pathname}${s ? '?' + s : ''}${location.hash}`; }
function whoURL(w){ const p = new URLSearchParams(location.search); p.set('who', w); p.delete('child'); return `${location.pathname}?${p.toString()}${location.hash}`; }

/* ---------- 路由 ---------- */
let cleanup = [];
function runCleanup(){ cleanup.forEach(f => { try{ f(); }catch(e){} }); cleanup = []; }
function route(){
  runCleanup(); mark();
  if(!WHO){ document.title = '无人机 · 二级航线'; return chooser(); }
  document.body.dataset.who = WHO;
  const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
  const [p0, p1, p2] = parts;
  window.scrollTo(0, 0);
  if(p0 === 'w' && C.wps[p1]) return lesson(p1, Number(p2) || 0);
  if(p0 === 'review') return p1 === 'extra' ? extraReview() : review();
  if(p0 === 'exam') return p1 === 'run' ? examRun() : p1 === 'result' ? examResult() : examIntro();
  if(p0 === 'sheet') return sheet();
  if(p0 === 'parent') return parent();
  return home();
}
addEventListener('hashchange', route);

/* ---------- 选人 ---------- */
function chooser(){
  document.body.removeAttribute('data-who');
  app.innerHTML = `<div class="wrap">${topbar({back:'../../today.html', backLabel:'回到学习室', icon:'back', title:'无人机 · 二级航线', sub:'先选今天谁来飞'})}
  <div class="page-head"><h1>今天谁来飞？</h1><p>两个人的进度、错题和复习时间分开记，不会混在一起。</p></div>
  <div class="who-pick">${['kenton','eddey'].map(w => `<a class="who-card ${w}" href="${esc(whoURL(w))}"><i>${w === 'kenton' ? 'K' : 'E'}</i><b>${NAMES[w]}</b><span>从${w === 'kenton' ? '哥哥' : '弟弟'}自己的进度继续</span></a>`).join('')}</div></div>`;
}

/* ---------- 首页：航线 ---------- */
let heroAccent = '#36c5d6';
function phaseNow(){ const h = new Date().getHours() + new Date().getMinutes() / 60; return h >= 5 && h < 7.5 ? 'dawn' : h >= 7.5 && h < 16.5 ? 'day' : h >= 16.5 && h < 19 ? 'dusk' : 'night'; }
function heroScene(narrow){
  const W = narrow ? 400 : 1100, H = narrow ? 290 : 400;
  const pts = narrow
    ? [[42,252],[80,238],[118,224],[156,207],[194,187],[232,164],[268,138],[302,110],[336,80],[364,48]]
    : [[560,352],[612,331],[664,307],[716,281],[767,252],[816,220],[864,186],[910,150],[954,113],[996,76]];
  const d = 'M' + pts.map(p => p.join(' ')).join(' L');
  const curve = smoothPath(pts);
  const nxt = nextWp();
  const here = nxt ? wpOrder.indexOf(nxt) + 1 : 9;
  const due = new Set(dueList().map(wpOfItem));
  const marks = wpOrder.map((id, i) => {
    const [x, y] = pts[i + 1];
    const cls = ['wpt', state.wp[id]?.done ? 'done' : '', due.has(id) ? 'due' : '', i + 1 === here ? 'here' : ''].join(' ');
    return `<a href="#/w/${id}" class="${cls}" aria-label="第 ${i + 1} 站 ${esc(C.wps[id].title)}"><circle class="ring" r="${narrow ? 18 : 20}" cx="${x}" cy="${y}" fill="none"/><circle class="base" r="${narrow ? 13 : 15}" cx="${x}" cy="${y}"/><text x="${x}" y="${y + .5}">${i + 1}</text></a>`;
  }).join('');
  const [hx, hy] = pts[here];
  const title = nxt ? C.wps[nxt].title : '模拟机考';
  const labelX = narrow ? Math.min(hx, W - 120) : hx;
  const anchor = narrow && hx > W - 150 ? 'end' : 'middle';
  const stars = [[600,60,1.4],[690,40,1.2],[760,90,1],[840,30,1.6],[930,64,1.2],[1050,120,1],[640,140,1],[100,40,1.2],[180,90,1],[300,30,1.4]].map(([x,y,r]) => `<circle cx="${narrow ? x % W : x}" cy="${y}" r="${r}"/>`).join('');
  return `<svg class="hero-scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMax slice" aria-hidden="false" role="img" aria-label="二级航线：9 个航点">
    <g class="stars">${stars}</g>
    <g class="cloud">${narrow ? A.cloud(210,40,.8,.9) + A.cloud(40,70,.55,.75) : A.cloud(640,70,1.15,.9) + A.cloud(900,210,.75,.7) + A.cloud(1010,30,.6,.8)}</g>
    <path class="hill1" d="M0 ${H-58}C${W*.25} ${H-74} ${W*.45} ${H-92} ${W*.68} ${H-70}S${W*.9} ${H-52} ${W} ${H-62}V${H}H0z"/>
    <path class="hill2" d="M0 ${H-26}C${W*.3} ${H-40} ${W*.6} ${H-44} ${W} ${H-28}V${H}H0z"/>
    <path class="route" d="${curve}"/>
    <g transform="translate(${pts[0][0]} ${pts[0][1] + 4})"><ellipse rx="${narrow ? 18 : 22}" ry="${narrow ? 5 : 6}" fill="rgba(22,34,54,.18)"/><text y="1" text-anchor="middle" dominant-baseline="central" style="font:800 ${narrow ? 10 : 12}px var(--round);fill:rgba(22,34,54,.55)">起飞</text></g>
    ${marks}
    <g transform="translate(${pts[9][0] + (narrow ? -2 : 4)} ${pts[9][1] - (narrow ? 22 : 26)})"><path d="M0 0V-22" stroke="#162236" stroke-width="2"/><path d="M0-22h16l-4 5 4 5H0" fill="#fff" stroke="#162236" stroke-width="1.6" stroke-linejoin="round"/></g>
    <g transform="translate(${hx} ${hy - (narrow ? 34 : 40)})"><g class="hover-bob"><g transform="scale(${narrow ? .34 : .4})">${A.quadSide({accent:heroAccent})}</g></g></g>
    <text class="wpt-label" x="${labelX}" y="${hy + (narrow ? 34 : 40)}" text-anchor="${anchor}">${esc(title)}</text>
  </svg>`;
}
function smoothPath(p){
  let d = `M${p[0][0]} ${p[0][1]}`;
  for(let i = 0; i < p.length - 1; i++){
    const p0 = p[i-1] || p[i], p1 = p[i], p2 = p[i+1], p3 = p[i+2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}
function home(){
  document.title = `${SHORT[WHO]} · 无人机二级航线`;
  const nxt = nextWp(), due = dueList();
  const narrow = innerWidth < 640;
  heroAccent = getComputedStyle(document.body).getPropertyValue('--me').trim() || '#36c5d6';
  const startLabel = nxt ? `${state.wp[nxt]?.step ? '继续' : '开始'}第 ${C.wps[nxt].n} 站：${C.wps[nxt].title}` : '全部飞过了，做一次模拟机考';
  const startHref = nxt ? `#/w/${nxt}/${Math.min(state.wp[nxt]?.step || 0, C.wps[nxt].frames.length + 1)}` : '#/exam';
  const mins = Math.round((state.days[today()]?.sec || 0) / 60);
  const doneCount = wpOrder.filter(id => state.wp[id]?.done).length;
  const strips = C.legs.map((leg, li) => `<section class="leg"><h2>${esc(leg.name)}</h2><div class="strips">${leg.wps.map(id => {
      const w = C.wps[id], lv = level(id), dueN = due.filter(k => wpOfItem(k) === id).length, m = mastery(id);
      const cls = state.wp[id]?.done ? 'done' : (lv.key === 'started' ? 'started' : '');
      const pill = dueN ? `<span class="pill due">复习 ${dueN} 项</span>` : lv.key === 'none' ? `<span class="pill quiet">${w.min} 分钟</span>` : `<span class="pill ${['stable','delayed','indep'].includes(lv.key) ? 'good' : 'half'}">${lv.label}</span>`;
      return `<a class="strip ${cls}" href="#/w/${id}"><span class="n">${w.n}</span><div><h3>${esc(w.title)}</h3><p>${esc(w.core)}</p></div>${pill}<span class="meter" aria-hidden="true"><i style="width:${Math.round(m * 100)}%"></i></span></a>`;
    }).join('')}</div></section>`).join('');
  app.innerHTML = `<div class="wrap">
    ${topbar({back:portalBack(), backLabel:'回到探索与实践', icon:'back', title:'无人机 · 二级航线', sub:'全国青少年无人机科学素质等级考试 · 二级'})}
    <section class="hero" data-phase="${phaseNow()}">
      <div class="hero-copy">
        <p class="kicker">${esc(NAMES[WHO])} 的航线</p>
        <h1>考二级要会的，<br>都在这条线上</h1>
        <p>9 个航点，每站 4 到 6 分钟。先看懂为什么能飞，再记住人和规矩，最后把考试那两分钟在脑子里飞一遍。</p>
        <div class="hero-actions"><a class="btn primary" href="${startHref}">${esc(startLabel)}</a>${due.length ? `<a class="btn quiet" href="#/review">先复习到期的 ${due.length} 项</a>` : ''}</div>
      </div>
      ${heroScene(narrow)}
    </section>
    <p class="today-line"><span><span class="dot"></span>已飞过 <b>${doneCount}</b> / 9 站</span><span>今天学了 <b>${mins}</b> 分钟</span>${due.length ? `<span>到期复习 <b>${due.length}</b> 项</span>` : '<span>今天没有到期的复习</span>'}</p>
    <div class="legs">${strips}</div>
    <div class="tools">
      <a class="tool" href="#/exam"><span class="ti">${svgIcon.exam}</span><div><h3>模拟机考</h3><p>40 题，30 分钟，答对 30 题合格。</p></div></a>
      <a class="tool" href="#/w/exam/1"><span class="ti">${svgIcon.route}</span><div><h3>考试两分钟</h3><p>跟着航线，把现场飞行在脑子里过一遍。</p></div></a>
      <a class="tool" href="#/sheet"><span class="ti">${svgIcon.sheet}</span><div><h3>一页全图</h3><p>9 站的要点放在一页，可以打印。</p></div></a>
      <a class="tool" href="#/parent"><span class="ti">${svgIcon.parent}</span><div><h3>给家长看</h3><p>进度、常错题，怎么陪练。</p></div></a>
    </div>
    <p class="foot-note">学习记录只存在这台设备的浏览器里，两个人分开保存${storageOK ? '' : '（这个浏览器现在存不了记录，关掉页面后会丢）'}。知识内容和正式站同步，这一版的设计和练法由 Claude 重做。</p>
  </div>`;
  const onResize = () => { const n = innerWidth < 640; if(n !== narrow) home(); };
  addEventListener('resize', onResize); cleanup.push(() => removeEventListener('resize', onResize));
}

/* ---------- 航点 ---------- */
function stepsOf(id){ const w = C.wps[id]; return [...w.frames.map(f => ({kind:'frame', f})), {kind:'recall'}, {kind:'quiz'}, {kind:'done'}]; }
function lesson(id, step){
  const w = C.wps[id], steps = stepsOf(id);
  step = Math.max(0, Math.min(step, steps.length - 1));
  const s = state.wp[id] || (state.wp[id] = {step:0, frames:{}, predict:{}});
  s.frames = s.frames || {}; s.predict = s.predict || {};
  s.step = Math.max(s.step || 0, step); save();
  document.title = `第 ${w.n} 站 ${w.title} · 二级航线`;
  const cur = steps[step];
  const dots = `<div class="steps" aria-label="第 ${step + 1} 步，共 ${steps.length} 步">${steps.map((_, i) => `<i class="${i === step ? 'on' : i < step ? 'past' : ''}"></i>`).join('')}</div>`;
  const head = `<header class="lesson-top"><a class="icon-btn" href="#/" aria-label="回到航线">${svgIcon.close}</a><div class="crumb"><b>第 ${w.n} 站　${esc(w.title)}</b><small>${esc(legOf(id).name)}</small></div>${TEST ? '<span class="test-chip">测试</span>' : ''}${dots}</header>`;
  const prevHref = step > 0 ? `#/w/${id}/${step - 1}` : '#/';
  const nextKind = steps[step + 1]?.kind;
  const nextLabel = nextKind === 'recall' ? '盖住说一说' : nextKind === 'quiz' ? '去秒答' : nextKind === 'frame' ? '下一步' : '';
  const bar = (nextHtml) => `<nav class="bar no-print"><a class="btn ghost" href="${prevHref}">上一步</a>${nextHtml}</nav>`;

  if(cur.kind === 'frame'){
    const f = cur.f, needPredict = f.predict && s.predict[f.id] === undefined;
    app.innerHTML = `<div class="wrap">${head}
      <div class="lesson">
        <div class="stage" id="stage" aria-label="${esc(f.title)}"></div>
        <div class="panel">
          <h1>${esc(f.title)}</h1>
          <div id="predict"></div>
          <div id="body" ${needPredict ? 'hidden' : ''}>
            ${f.sayAfter ? '' : `<p class="say">${esc(f.say)}</p>`}
            ${f.task ? `<p class="task ${s.frames[f.id] ? 'done' : ''}" id="task"><span>${esc(f.task)}</span>${s.frames[f.id] ? '<span class="ok-tag">做到了</span>' : ''}</p>` : ''}
            ${f.sayAfter ? `<p class="say after" id="say" ${s.frames[f.id] ? '' : 'hidden'}>${esc(f.say)}</p>` : ''}
          </div>
          <div class="controls" id="controls" ${needPredict ? 'hidden' : ''}></div>
          <p class="hint" id="hint" aria-live="polite"></p>
          ${f.more ? `<details class="more"><summary>多知道一点</summary><ul>${f.more.map(m => `<li>${esc(m)}</li>`).join('')}</ul></details>` : ''}
        </div>
      </div>
      ${bar(`<a class="btn primary" href="#/w/${id}/${step + 1}">${nextLabel}</a>`)}
    </div>`;
    const stage = $('#stage'), controls = $('#controls'), hint = $('#hint');
    const api = {
      wp:id, frame:f, who:WHO, reduce, accent:getComputedStyle(document.body).getPropertyValue('--me').trim() || '#36c5d6',
      done(){
        if(!s.frames[f.id]){ s.frames[f.id] = today(); save(); }
        const t = $('#task'); if(t && !t.classList.contains('done')){ t.classList.add('done'); t.insertAdjacentHTML('beforeend','<span class="ok-tag">做到了</span>'); }
        const sa = $('#say'); if(sa && sa.hidden){ sa.hidden = false; sa.classList.add('fade-in'); }
      },
      hint(msg, kind=''){ hint.className = 'hint ' + kind; hint.textContent = msg || ''; },
      isDone: !!s.frames[f.id],
      onCleanup(fn){ cleanup.push(fn); }
    };
    const lab = LABS[f.lab];
    if(lab){ const c = lab(stage, controls, api); if(typeof c === 'function') cleanup.push(c); }
    else stage.innerHTML = '';
    if(needPredict){
      stage.insertAdjacentHTML('beforeend', '<div class="veil" aria-hidden="true">?</div>');
      $('#predict').innerHTML = `<div class="predict"><h2>先猜一猜：${esc(f.predict.q)}</h2><div class="opts">${f.predict.o.map((o, i) => `<button class="opt" data-i="${i}"><i>${'AB'[i]}</i>${esc(o)}</button>`).join('')}</div></div>`;
      $$('#predict .opt').forEach(b => b.addEventListener('click', () => {
        const i = Number(b.dataset.i), ok = i === f.predict.a;
        s.predict[f.id] = i; save();
        $$('#predict .opt').forEach((x, j) => { x.disabled = true; x.classList.add(j === f.predict.a ? 'right' : j === i ? 'wrong' : 'dim'); });
        $('#predict .predict').insertAdjacentHTML('beforeend', `<p class="fb">${ok ? '猜对了。下面动手看看为什么。' : `其实是“${esc(f.predict.o[f.predict.a])}”。动手试一下，就知道为什么。`}</p>`);
        $('#body').hidden = false; controls.hidden = false; $('.veil', stage)?.remove();
      }));
    }
    return;
  }

  if(cur.kind === 'recall'){
    app.innerHTML = `<div class="wrap">${head}<div class="narrow">
      <div class="page-head"><h1>盖住说出来</h1><p>先别看答案。在心里或者小声说一遍，说完再点开对照。说对了才点“说对了”。</p></div>
      <div class="checklist" id="cl"></div>
      ${bar(`<a class="btn primary" href="#/w/${id}/${step + 1}">去秒答</a>`)}
    </div></div>`;
    renderChecklist($('#cl'), id, w.recall.map((pair, i) => ({id:`r:${id}:${i}`, ch:pair[0], rs:pair[1]})), `第 ${w.n} 站检查单`);
    return;
  }

  if(cur.kind === 'quiz'){
    app.innerHTML = `<div class="wrap">${head}<div class="narrow">
      <div class="page-head"><h1>秒答 5 题</h1><p>和考试一样是选择题。答错了不要紧：看一眼为什么，这道题等会儿还会再来一次。</p></div>
      <div id="quiz"></div>
    </div></div>`;
    const ids = pickFor(id, 5);
    runQuiz($('#quiz'), ids, {
      onFinish(res){
        s.quiz = {date:today(), first:res.first, total:res.total}; save();
        location.hash = `#/w/${id}/${step + 1}`;
      }
    });
    return;
  }

  /* 到达 */
  const first = !s.done;
  if(first){ s.done = today(); save(); }
  s.last = today(); save();
  const recallOK = recallIds(id).filter(k => state.items[k]?.lastOk === today()).length;
  const nextDue = itemsOf(id).map(k => state.items[k]?.due).filter(Boolean).sort()[0];
  const after = wpOrder[wpOrder.indexOf(id) + 1];
  app.innerHTML = `<div class="wrap">${head}<div class="narrow arrive">
    <div class="stamp" aria-hidden="true"><div><b>${w.n}</b><span>到达</span></div></div>
    <h2>第 ${w.n} 站：${esc(w.title)}</h2>
    <p>${esc(w.core)}</p>
    <div class="facts">
      <div><b class="num">${s.quiz ? `${s.quiz.first}/${s.quiz.total}` : '—'}</b><span>秒答第一次就对</span></div>
      <div><b class="num">${recallOK}/${w.recall.length}</b><span>检查单说对</span></div>
      <div><b>${nextDue ? esc(niceDate(nextDue)) : '—'}</b><span>下次复习</span></div>
    </div>
    <p>${s.quiz && s.quiz.first / s.quiz.total >= .8 ? '第一次就答对了大部分。过一两天再复习一次，记得才牢。' : '有几道一开始没答对，已经放进复习。明天先把它们做掉。'}</p>
    <div class="hero-actions" style="justify-content:center">${after ? `<a class="btn primary" href="#/w/${after}">下一站：${esc(C.wps[after].title)}</a>` : '<a class="btn primary" href="#/exam">做一次模拟机考</a>'}<a class="btn quiet" href="#/">回到航线</a></div>
  </div></div>`;
}

/* 每站秒答挑题：先没见过的，再挑盒子低的 */
function pickFor(id, n){
  const ids = questionIds(id);
  const scored = shuffle(ids).map(k => { const it = state.items[k]; return {k, s: it ? (it.box || 0) * 10 + (it.right - it.wrong) : -100}; });
  scored.sort((a, b) => a.s - b.s);
  return scored.slice(0, n).map(x => x.k);
}

/* ---------- 检查单（盖住说） ---------- */
function renderChecklist(root, id, rows, title, onRated){
  const render = () => {
    const doneN = rows.filter(r => r.res).length;
    root.innerHTML = `<header><b>${esc(title)}</b><span>${doneN} / ${rows.length} 已对照</span></header>` + rows.map((r, i) => `
      <div class="crow ${r.res ? 'mute' : ''}" data-i="${i}">
        <div class="ch">${esc(r.ch)}<em aria-hidden="true"></em></div>
        ${r.open ? `<div class="rs">${esc(r.rs)}</div>${r.res ? '' : `<div class="rate"><button data-r="good">说对了</button><button data-r="soft">差一点</button><button data-r="bad">没想起来</button></div>`}`
                 : `<button class="rs cover" data-open>说完了，点开对照</button>`}
      </div>`).join('');
    $$('[data-open]', root).forEach(b => b.addEventListener('click', () => { rows[Number(b.closest('.crow').dataset.i)].open = true; render(); $(`.crow[data-i="${b.closest('.crow')?.dataset.i}"] .rate button`, root)?.focus(); }));
    $$('[data-r]', root).forEach(b => b.addEventListener('click', () => {
      const r = rows[Number(b.closest('.crow').dataset.i)];
      r.res = b.dataset.r;
      if(r.res === 'good') grade(r.id, true); else if(r.res === 'soft') soft(r.id); else grade(r.id, false);
      render();
      const nextCover = $('[data-open]', root); nextCover?.focus();
      if(onRated) onRated(r);
    }));
  };
  render();
}

/* ---------- 选择题（秒答、复习用） ---------- */
function runQuiz(root, ids, {onFinish, label='题'}){
  const queue = ids.map(id => ({id, retry:false}));
  const firstRight = new Set(); let total = ids.length, idx = 0, answered = false;
  const show = () => {
    if(idx >= queue.length) return onFinish({first:firstRight.size, total});
    const {id, retry} = queue[idx], q = C.questions[id];
    const order = shuffle(q.o.map((_, i) => i));
    answered = false;
    root.innerHTML = `<div class="quiz card">
      <div class="qhead"><span>${retry ? '再来一次' : `第 ${Math.min(idx + 1, total)} ${label}，共 ${total} ${label}`}</span><span>${esc(C.wps[q.wp].title)}</span></div>
      <p class="qtext">${esc(q.q)}</p>
      <div class="opts">${order.map((oi, k) => `<button class="opt" data-oi="${oi}"><i>${'ABCD'[k]}</i>${esc(q.o[oi])}</button>`).join('')}</div>
      <div id="fb" aria-live="polite"></div>
    </div>`;
    $$('.opt', root).forEach(b => b.addEventListener('click', () => {
      if(answered) return; answered = true;
      const oi = Number(b.dataset.oi), ok = oi === q.a;
      $$('.opt', root).forEach(x => { const xo = Number(x.dataset.oi); x.disabled = true; x.classList.add(xo === q.a ? 'right' : x === b ? 'wrong' : 'dim'); });
      if(!retry){ grade(id, ok); if(ok) firstRight.add(id); else queue.push({id, retry:true}); }
      else if(ok) { /* 重来答对：已在复习里，明天再考 */ }
      $('#fb', root).innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}"><b>${ok ? '对了。' : `正确答案：${esc(q.o[q.a])}`}</b><span>${esc(q.why)}</span>${!ok && !retry ? '<span class="again">这道题等会儿再考你一次，明天也会再出现。</span>' : ''}</div>
        <div style="margin-top:14px;display:flex;justify-content:flex-end"><button class="btn primary" id="go">${idx + 1 >= queue.length ? '完成' : '下一题'}</button></div>`;
      $('#go', root).addEventListener('click', () => { idx++; show(); });
      $('#go', root).focus({preventScroll:true});
    }));
  };
  show();
}

/* ---------- 到期复习 ---------- */
function review(){
  document.title = '复习 · 二级航线';
  const due = dueList();
  if(!due.length){
    app.innerHTML = `<div class="wrap">${topbar({title:'复习', sub:'按时间间隔，忘掉之前再想一次'})}<div class="narrow">
      <div class="page-head"><h1>今天没有到期的复习</h1><p>复习会在你快忘的时候出现：答对了，间隔会越拉越长；答错了，第二天再来。</p></div>
      <div class="hero-actions"><a class="btn primary" href="#/review/extra">随便来 8 道</a><a class="btn quiet" href="#/">回到航线</a></div></div></div>`;
    return;
  }
  /* 不同航点交错着来，最多 12 项 */
  const byWp = {}; due.forEach(k => (byWp[wpOfItem(k)] = byWp[wpOfItem(k)] || []).push(k));
  const lists = Object.values(byWp).map(shuffle); const items = [];
  while(items.length < 12 && lists.some(l => l.length)) lists.forEach(l => { if(l.length && items.length < 12) items.push(l.shift()); });
  mixedRun(items, '复习');
}
function extraReview(){
  const seen = Object.keys(C.questions).filter(k => wpOrder.indexOf(C.questions[k].wp) <= Math.max(0, wpOrder.indexOf(nextWp() || 'exam')));
  mixedRun(shuffle(seen).slice(0, 8), '加练');
}
function mixedRun(items, title){
  app.innerHTML = `<div class="wrap">${topbar({title, sub:`${items.length} 项，大约 ${Math.max(2, Math.round(items.length * .35))} 分钟`})}<div class="narrow"><div id="mx"></div></div></div>`;
  const root = $('#mx'); let i = 0, ok = 0;
  const next = () => {
    if(i >= items.length){
      root.innerHTML = `<div class="arrive"><div class="stamp"><div><b class="num">${ok}</b><span>答对</span></div></div><h2>${title}完成</h2><p>${items.length} 项里答对 ${ok} 项。没答对的，明天会再出现。</p><div class="hero-actions" style="justify-content:center"><a class="btn primary" href="#/">回到航线</a></div></div>`;
      return;
    }
    const k = items[i];
    if(k.startsWith('r:')){
      const [, wid, n] = k.split(':'), pair = C.wps[wid].recall[Number(n)];
      root.innerHTML = `<div class="qhead" style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:10px"><span>第 ${i + 1} 项，共 ${items.length} 项</span><span>${esc(C.wps[wid].title)}</span></div><div class="checklist" id="one"></div>`;
      const rows = [{id:k, ch:pair[0], rs:pair[1]}];
      renderChecklist($('#one'), wid, rows, '盖住说出来', r => {
        if(r.res === 'good') ok++;
        $('#one').insertAdjacentHTML('afterend', `<div style="margin-top:14px;display:flex;justify-content:flex-end"><button class="btn primary" id="go">${i + 1 >= items.length ? '完成' : '下一项'}</button></div>`);
        $('#go').addEventListener('click', () => { i++; next(); }); $('#go').focus();
      });
    } else {
      runQuiz(root, [k], {onFinish(r){ ok += r.first; i++; next(); }, label:'项'});
      const qh = $('.qhead span', root); if(qh) qh.textContent = `第 ${i + 1} 项，共 ${items.length} 项`;
    }
  };
  next();
}

/* ---------- 模拟机考 ---------- */
let examSession = null;
function buildExam(){
  const per = {}; wpOrder.forEach(id => per[id] = shuffle(questionIds(id)));
  const total = Object.values(per).reduce((a, b) => a + b.length, 0);
  let pickList = [];
  wpOrder.forEach(id => { const n = Math.max(2, Math.round(C.exam.total * per[id].length / total)); pickList.push(...per[id].slice(0, n)); });
  pickList = shuffle(pickList);
  if(pickList.length > C.exam.total) pickList = pickList.slice(0, C.exam.total);
  const rest = shuffle(Object.keys(C.questions).filter(k => !pickList.includes(k)));
  while(pickList.length < C.exam.total) pickList.push(rest.shift());
  return pickList.map(id => ({id, order:shuffle(C.questions[id].o.map((_, i) => i)), pick:null}));
}
function examIntro(){
  document.title = '模拟机考 · 二级航线';
  const last = state.exams[state.exams.length - 1];
  app.innerHTML = `<div class="wrap">${topbar({title:'模拟机考', sub:'按二级机考的题量和时间'})}<div class="narrow">
    <div class="page-head"><h1>模拟机考</h1><p>和正式机考一样：40 道选择题，30 分钟，答对 30 道算合格。做完才看对错。</p></div>
    <div class="facts" style="max-width:none"><div><b class="num">40</b><span>道选择题</span></div><div><b class="num">30</b><span>答对算合格</span></div><div><b class="num">30</b><span>分钟内做完</span></div></div>
    <div class="card" style="margin-top:18px"><p style="font-size:14.5px;line-height:1.75;color:var(--ink-2)">题目来自课上讲过的内容，不是官方题库。官方二级还会考著名的民用飞机、军用飞机和著名无人机，这部分课上还没讲，这里也就还没有。${last ? `<br>上一次：${esc(niceDate(last.date))}，答对 ${last.score} 道。` : ''}</p></div>
    <div class="hero-actions"><a class="btn primary" href="#/exam/run" id="start">开始，计时 30 分钟</a><a class="btn quiet" href="#/">回到航线</a></div>
  </div></div>`;
  $('#start').addEventListener('click', () => { examSession = {qs:buildExam(), i:0, start:Date.now()}; });
}
function examRun(){
  if(!examSession){ examSession = {qs:buildExam(), i:0, start:Date.now()}; }
  const S = examSession, Q = S.qs;
  const render = () => {
    const it = Q[S.i], q = C.questions[it.id];
    app.innerHTML = `<div class="wrap">${topbar({title:'模拟机考', sub:`第 ${S.i + 1} 题，共 ${Q.length} 题`, right:'<span class="timer" id="timer">30:00</span>'})}<div class="narrow">
      <div class="quiz card"><div class="qhead"><span>第 ${S.i + 1} 题</span><span>${Q.filter(x => x.pick !== null).length} / ${Q.length} 已答</span></div>
        <p class="qtext">${esc(q.q)}</p>
        <div class="opts">${it.order.map((oi, k) => `<button class="opt ${it.pick === oi ? 'picked' : ''}" data-oi="${oi}"><i>${'ABCD'[k]}</i>${esc(q.o[oi])}</button>`).join('')}</div>
        <div style="display:flex;justify-content:space-between;gap:10px;margin-top:6px"><button class="btn ghost" id="prev" ${S.i ? '' : 'disabled'}>上一题</button>${S.i + 1 < Q.length ? '<button class="btn primary" id="nx">下一题</button>' : '<button class="btn primary" id="sub">交卷</button>'}</div>
      </div>
      <div class="grid40" aria-label="题目导航">${Q.map((x, k) => `<button class="${x.pick !== null ? 'done' : ''} ${k === S.i ? 'cur' : ''}" data-k="${k}" aria-label="第 ${k + 1} 题">${k + 1}</button>`).join('')}</div>
      <div class="hero-actions"><button class="btn quiet" id="sub2">交卷</button></div>
    </div></div>`;
    $$('.opt').forEach(b => b.addEventListener('click', () => { it.pick = Number(b.dataset.oi); render(); }));
    $('#prev')?.addEventListener('click', () => { S.i--; render(); });
    $('#nx')?.addEventListener('click', () => { S.i++; render(); });
    $$('.grid40 button').forEach(b => b.addEventListener('click', () => { S.i = Number(b.dataset.k); render(); }));
    const submit = () => {
      const left = Q.filter(x => x.pick === null).length;
      if(left && !S.confirm){ S.confirm = true; toast(`还有 ${left} 道没答，再点一次“交卷”就交了`); return; }
      finishExam();
    };
    $('#sub')?.addEventListener('click', submit); $('#sub2').addEventListener('click', submit);
    tick();
  };
  const tick = () => {
    const el = $('#timer'); if(!el) return;
    const left = C.exam.minutes * 60 - Math.floor((Date.now() - S.start) / 1000);
    const a = Math.abs(left);
    el.textContent = `${left < 0 ? '超时 ' : ''}${String(Math.floor(a / 60)).padStart(2,'0')}:${String(a % 60).padStart(2,'0')}`;
    el.classList.toggle('late', left < 0);
  };
  const timer = setInterval(tick, 1000); cleanup.push(() => clearInterval(timer));
  render();
}
function finishExam(){
  const S = examSession; if(!S) return;
  const byWp = {}, wrong = [];
  let score = 0;
  S.qs.forEach(x => {
    const q = C.questions[x.id], ok = x.pick === q.a;
    byWp[q.wp] = byWp[q.wp] || [0, 0]; byWp[q.wp][1]++;
    if(ok){ score++; byWp[q.wp][0]++; } else wrong.push({id:x.id, pick:x.pick});
    if(x.pick !== null) grade(x.id, ok); else grade(x.id, false);
  });
  state.exams.push({date:today(), score, total:S.qs.length, sec:Math.round((Date.now() - S.start) / 1000), byWp, wrong});
  save(); examSession = null;
  location.hash = '#/exam/result';
}
function examResult(){
  const ex = state.exams[state.exams.length - 1];
  if(!ex){ location.hash = '#/exam'; return; }
  const pass = ex.score >= C.exam.pass;
  app.innerHTML = `<div class="wrap">${topbar({title:'模拟机考结果', sub:`${niceDate(ex.date)}，用时 ${Math.floor(ex.sec / 60)} 分 ${ex.sec % 60} 秒`})}<div class="narrow">
    <div class="score ${pass ? 'pass' : ''}"><b class="num">${ex.score}<small> / ${ex.total}</small></b><p style="font-size:16px;font-weight:800">${pass ? '过了合格线（30 道）' : `离合格线还差 ${C.exam.pass - ex.score} 道`}</p><p style="font-size:14px;color:var(--muted)">${ex.sec > C.exam.minutes * 60 ? '这次超过了 30 分钟，正式考试会自动交卷。' : '在 30 分钟以内。'}</p></div>
    <h2 style="font-family:var(--round);font-size:20px;font-weight:800;margin:26px 4px 0">按航点看</h2>
    <div class="bywp">${wpOrder.filter(id => ex.byWp[id]).map(id => { const [r, t] = ex.byWp[id]; return `<a href="#/w/${id}"><span class="pill">${C.wps[id].n}</span><div><b style="font-size:15px">${esc(C.wps[id].title)}</b><div class="bar2"><i style="width:${Math.round(r / t * 100)}%"></i></div></div><span class="num" style="font-weight:800">${r}/${t}</span></a>`; }).join('')}</div>
    ${ex.wrong.length ? `<h2 style="font-family:var(--round);font-size:20px;font-weight:800;margin:26px 4px 0">做错的 ${ex.wrong.length} 道</h2><div class="wronglist">${ex.wrong.map(w => { const q = C.questions[w.id]; return `<div class="card"><b style="font-size:16px;line-height:1.55">${esc(q.q)}</b><p>${w.pick === null ? '没有作答。' : `你选了：${esc(q.o[w.pick])}。`}正确答案：<b>${esc(q.o[q.a])}</b>。${esc(q.why)}</p></div>`; }).join('')}</div><p class="foot-note">做错的题已经放进复习，明天会再出现。</p>` : ''}
    <div class="hero-actions"><a class="btn primary" href="#/">回到航线</a><a class="btn quiet" href="#/exam">再考一次</a></div>
  </div></div>`;
}

/* ---------- 一页全图 ---------- */
function sheet(){
  document.title = '一页全图 · 二级航线';
  app.innerHTML = `<div class="wrap">${topbar({title:'一页全图', sub:'9 站的要点，考前看这一张', right:`<button class="btn small quiet no-print" id="pr">${svgIcon.print}打印</button>`})}
    <div class="page-head"><h1>无人机二级：一页全图</h1></div>
    <div class="sheet">
      ${C.legs.map(l => `<p class="sheet-leg">${esc(l.name)}</p>` + l.wps.map(id => { const w = C.wps[id]; return `<section><h3><i>${w.n}</i>${esc(w.title)}</h3><p class="core">${esc(w.core)}</p><ul>${w.sheet.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>`; }).join('')).join('')}
      <div class="sheet-exam"><div><b>40 题　答对 30　30 分钟</b><span>理论机考，电脑随机抽题</span></div><div><b>2 分钟</b><span>现场：起飞、科目一、科目二、回起点悬停 10 秒、匀速降落</span></div><div><b>自己对频</b><span>先开遥控器，后开飞机</span></div></div>
    </div></div>`;
  $('#pr').addEventListener('click', () => print());
}

/* ---------- 家长页 ---------- */
function parent(){
  document.title = `家长看 · ${SHORT[WHO]} · 二级航线`;
  const due = dueList(), other = WHO === 'kenton' ? 'eddey' : 'kenton';
  const wrongTop = Object.entries(state.items).filter(([k, v]) => C.questions[k] && v.wrong > 0).sort((a, b) => b[1].wrong - a[1].wrong || a[1].box - b[1].box).slice(0, 6);
  const days = Object.entries(state.days).sort().slice(-7);
  const totalMin = Math.round(Object.values(state.days).reduce((a, b) => a + b.sec, 0) / 60);
  const rows = wpOrder.map(id => { const w = C.wps[id], lv = level(id), s = state.wp[id], dN = due.filter(k => wpOfItem(k) === id).length;
    return `<div class="prow"><i>${w.n}</i><div><b>${esc(w.title)}</b><small style="display:block;color:var(--muted)">${s?.done ? `第一次飞完：${esc(niceDate(s.done))}` : s?.step ? '学到一半' : '还没开始'}${s?.quiz ? `；秒答第一次就对 ${s.quiz.first}/${s.quiz.total}` : ''}${dN ? `；到期复习 ${dN} 项` : ''}</small></div><span class="tag ${['stable','delayed'].includes(lv.key) ? 'done' : lv.key === 'none' ? '' : 'part'}">${lv.label}</span></div>`; }).join('');
  const copy = copyText();
  app.innerHTML = `<div class="wrap">${topbar({title:'给家长看', sub:`${NAMES[WHO]}的记录，只看这一个孩子`})}
    <div class="page-head"><h1>${esc(NAMES[WHO])}：二级备考情况</h1><p>记录在这台设备上${TEST ? '（测试空间，不计入正式记录）' : ''}。<a href="${esc(whoURL(other))}" style="font-weight:700;text-decoration:underline">换成看${NAMES[other]}</a></p></div>
    <div class="pgrid"><div>
      <section class="box"><h2>9 个航点</h2>${rows}<p style="margin-top:10px;font-size:13px;color:var(--muted)">“独立会”：这一站秒答第一次就对 8 成以上。“复测通过”：隔天复习还答得对。“稳定掌握”：间隔拉到一周以上还答得对。看过答案后才做对的，不算独立会。</p></section>
      <section class="box"><h2>模拟机考</h2>${state.exams.length ? `<ul>${state.exams.slice(-6).reverse().map(e => `<li>${esc(niceDate(e.date))}：答对 <b>${e.score}</b> / ${e.total}${e.score >= C.exam.pass ? '，过合格线' : ''}，用时 ${Math.round(e.sec / 60)} 分钟</li>`).join('')}</ul>` : '<p>还没有做过。建议 9 站都飞过以后，每两三天做一次。</p>'}</section>
      <section class="box"><h2>最常错的题</h2>${wrongTop.length ? `<ol>${wrongTop.map(([k, v]) => { const q = C.questions[k]; return `<li><b>${esc(q.q)}</b><br>正确答案：${esc(q.o[q.a])}。错过 ${v.wrong} 次，${v.box >= 2 ? '后来答对了' : '还在复习里'}。</li>`; }).join('')}</ol>` : '<p>还没有错题记录。</p>'}</section>
      <section class="box"><h2>学习时间</h2><p>一共 ${totalMin} 分钟。${days.length ? '最近：' + days.map(([d, v]) => `${esc(niceDate(d))} ${Math.round(v.sec / 60)} 分钟`).join('，') + '。' : ''}</p></section>
    </div><div>
      <section class="box"><h2>怎么用这条航线</h2><ol>
        <li>每次 25—30 分钟：先做到期复习（约 5 分钟），再飞一个新航点（10—15 分钟），最后秒答。</li>
        <li>9 站飞完，大约需要 9 次。之后每两三天做一次模拟机考，错题会自动进复习。</li>
        <li>“盖住说”的时候让他真的说出声，说对了才点“说对了”。这一步最管用。</li>
        <li>摇杆模拟只练“哪只手、往哪拨”的反应，真机手感以周六课上为准。</li>
      </ol></section>
      <section class="box"><h2>陪练时可以这样说</h2><ul>${wpOrder.map(id => `<li><b>第 ${C.wps[id].n} 站</b>：${esc(C.wps[id].coach)}</li>`).join('')}</ul></section>
      <section class="box"><h2>官方考纲，现在覆盖到哪里</h2>${C.syllabus.map(([t, k, n]) => `<div class="sylrow"><span class="tag ${k}">${k === 'done' ? '已覆盖' : k === 'part' ? '部分' : '还没有'}</span><div>${esc(t)}<small>${esc(n)}</small></div></div>`).join('')}<div class="sylrow"><span class="tag part">练想法</span><div>现场飞行：对频、起飞、悬停、科目一、科目二<small>第 6、7、9 站练的是打杆反应和航线顺序；真机动作以教练课上为准。</small></div></div><p style="margin-top:10px;font-size:13px;color:var(--muted)">依据：中国航空学会《全国青少年无人机科学素质等级考试标准》（中航学字〔2024〕21 号附件 1）。</p></section>
      <section class="box"><h2>需要您问一下教练</h2><ul><li>二级科目一、科目二具体怎么飞。这里按官方示意图理解为“绕立杆水平飞一圈”“绕横杆竖着绕一圈”；考点的杆位、高度和起飞点，以教练说的为准。</li><li>二级还要考的著名民用飞机、军用飞机、著名无人机，课上什么时候讲、有没有讲义。</li></ul></section>
      <section class="box"><h2>把记录交给 Claude 记档</h2><p>复制下面这段，发到 Claude 的 Child Study 项目里，就能记进${WHO === 'kenton' ? '哥哥' : '弟弟'}的学情总档。</p><textarea class="copyarea" id="ct" readonly>${esc(copy)}</textarea><div class="hero-actions" style="margin-top:12px"><button class="btn small primary" id="cp">复制</button></div></section>
      <section class="box"><h2>正式站原版</h2><p>同样的知识，正式站（GPT 做的）原来的样子，可以对照看。</p><div class="links" style="margin-top:10px">${C.originals.map(([t, f]) => `<a href="${esc(f + (f.includes('?') ? '&' : '?') + 'who=' + WHO)}">${esc(t)}<span aria-hidden="true">›</span></a>`).join('')}</div></section>
      <section class="box"><h2>清空这台设备上的记录</h2><p>只清空${NAMES[WHO]}${TEST ? '的测试空间' : ''}在这台设备上的航线记录。</p><div class="hero-actions" style="margin-top:12px"><button class="btn small quiet" id="rs">清空记录</button></div></section>
    </div></div></div>`;
  $('#cp').addEventListener('click', async () => {
    try{ await navigator.clipboard.writeText(copy); toast('已复制'); }
    catch(e){ const t = $('#ct'); t.focus(); t.select(); toast('已选中，请按复制'); }
  });
  let armed = false;
  $('#rs').addEventListener('click', e => {
    if(!armed){ armed = true; e.target.textContent = '确定清空？再点一次'; return; }
    state = fresh(WHO); save(); toast('已清空'); parent();
  });
}
function copyText(){
  const due = dueList(), t = today();
  const lines = [`# ${SHORT[WHO]}（${WHO === 'kenton' ? '哥哥' : '弟弟'}）· 无人机二级航线 本机记录`, `导出日期：${t}${TEST ? '（测试空间，不入正式记录）' : ''}`, '', '## 航点'];
  wpOrder.forEach(id => { const w = C.wps[id], s = state.wp[id], lv = level(id); lines.push(`- 第 ${w.n} 站 ${w.title}：${lv.label}${s?.done ? `，第一次飞完 ${s.done}` : ''}${s?.quiz ? `，秒答首次正确 ${s.quiz.first}/${s.quiz.total}` : ''}`); });
  lines.push('', `## 到期复习：${due.length} 项`);
  if(state.exams.length){ lines.push('', '## 模拟机考'); state.exams.slice(-5).forEach(e => lines.push(`- ${e.date}：${e.score}/${e.total}${e.score >= C.exam.pass ? '（过合格线 30）' : ''}，${Math.round(e.sec / 60)} 分钟`)); }
  const wrongTop = Object.entries(state.items).filter(([k, v]) => C.questions[k] && v.wrong > 0).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 5);
  if(wrongTop.length){ lines.push('', '## 常错'); wrongTop.forEach(([k, v]) => lines.push(`- ${C.questions[k].q}（正确：${C.questions[k].o[C.questions[k].a]}；错 ${v.wrong} 次）`)); }
  const totalMin = Math.round(Object.values(state.days).reduce((a, b) => a + b.sec, 0) / 60);
  lines.push('', `总用时约 ${totalMin} 分钟。记录来自本机浏览器，换设备不会带过去。`);
  return lines.join('\n');
}

window.DRONE_APP = {grade, save, get state(){ return state; }, toast, shuffle, esc};
route();
})();
