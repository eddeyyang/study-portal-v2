/* 航段二“谁先飞上天”的实验：人物配对、证据三分、排序、1903 年那一天、三个第一。排序也给“对频五步”用。 */
(function(){
'use strict';
const A = window.ART, K = window.KIT, L = window.LABS, C = window.DRONE;
const {esc, button} = K;
const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const html = stage => { stage.classList.add('html'); stage.innerHTML = ''; return stage; };
const bump = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

/* ---------- 人物配对 ---------- */
L.match = function(stage, ctl, api){
  html(stage);
  const people = shuffle(C.people), crafts = shuffle(C.people);
  stage.innerHTML = `<div class="match"><div class="mcol" id="pp">${people.map(p => `<button type="button" class="mcard person" data-id="${p.id}"><b>${esc(p.name)}</b><span>${esc(p.era)}</span></button>`).join('')}</div>
    <div class="mcol" id="cc">${crafts.map(p => `<button type="button" class="mcard craft" data-id="${p.id}">${A.icon(p.icon, 40)}<b>${esc(p.craft)}</b></button>`).join('')}</div></div>`;
  let sel = null, n = 0;
  stage.querySelectorAll('.person').forEach(b => b.addEventListener('click', () => {
    if(b.classList.contains('ok')) return;
    sel = b.dataset.id; stage.querySelectorAll('.person').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const p = C.people.find(x => x.id === sel);
    api.hint(`线索：${p.name}，${p.note}再点他的飞行器。`);
  }));
  stage.querySelectorAll('.craft').forEach(b => b.addEventListener('click', () => {
    if(b.classList.contains('ok')) return;
    if(!sel){ api.hint('先点左边的一个人。'); return; }
    const p = C.people.find(x => x.id === sel);
    if(b.dataset.id !== sel){ bump(b); api.hint(`不是这个。${p.name}：${p.note.replace(/。$/, '')}，再找找。`, 'no'); return; }
    const pb = stage.querySelector(`.person[data-id="${sel}"]`);
    pb.classList.add('ok'); pb.setAttribute('aria-pressed','false'); b.classList.add('ok');
    pb.querySelector('span').textContent = `${p.era}　${p.craft}`;
    n++; sel = null;
    api.hint(`对。${p.name}：${p.note}`, 'ok');
    if(n === C.people.length){ api.done(); api.hint('五对都连上了。下面这句就是要记住的。', 'ok'); }
  }));
};

/* ---------- 画过、传说、飞成 ---------- */
L.evidence = function(stage, ctl, api){
  html(stage);
  const kinds = {design:'只画过', legend:'传说', flew:'飞成了'};
  const icons = {'达·芬奇的扑翼飞行器':'davinci','万户的火箭椅':'rocketchair','莱特兄弟的飞行者一号':'flyer','孟格菲兄弟的热气球':'balloon','李林塔尔的滑翔机':'hangglider'};
  const list = shuffle(C.evidence); let i = 0, right = 0;
  const show = () => {
    if(i >= list.length){ stage.innerHTML = `<div class="card judge-card" style="text-align:center"><p class="stmt">${right} / ${list.length} 第一次就放对了</p><p style="color:var(--ink-2)">画过不等于飞过，传说不等于史实。</p></div>`; api.done(); return; }
    const [name, k, why] = list[i];
    stage.innerHTML = `<div class="card judge-card"><span class="count">第 ${i + 1} 个，共 ${list.length} 个</span><div style="display:flex;gap:14px;align-items:center">${A.icon(icons[name], 64)}<p class="stmt">${esc(name)}</p></div>
      <div class="opts three">${Object.entries(kinds).map(([id, t]) => `<button type="button" class="opt" data-k="${id}">${t}</button>`).join('')}</div><div id="efb"></div></div>`;
    let first = true;
    stage.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      if(b.dataset.k !== k){ first = false; b.classList.add('wrong'); b.disabled = true; api.hint('再想想：有人真的飞起来了吗？还是只画了图，或者只是故事？', 'no'); return; }
      if(first) right++;
      stage.querySelectorAll('.opt').forEach(x => { x.disabled = true; if(x === b) x.classList.add('right'); });
      stage.querySelector('#efb').innerHTML = `<p class="feedback ok">${esc(why)}</p><div style="display:flex;justify-content:flex-end;margin-top:10px"><button type="button" class="btn primary small" id="enext">${i + 1 >= list.length ? '看结果' : '下一个'}</button></div>`;
      stage.querySelector('#enext').addEventListener('click', () => { i++; show(); });
      api.hint('');
    }));
  };
  show();
};

/* ---------- 按顺序点：航空史 / 对频五步 ---------- */
L.order = function(stage, ctl, api){
  html(stage);
  const items = api.frame.items, order = shuffle(items.map((_, i) => i));
  let next = 0;
  stage.innerHTML = `<div class="order-list">${order.map(i => `<button type="button" class="order-item" data-i="${i}"><i>?</i><span>${esc(items[i])}</span></button>`).join('')}</div>`;
  stage.querySelectorAll('.order-item').forEach(b => b.addEventListener('click', () => {
    if(b.classList.contains('set')) return;
    const i = Number(b.dataset.i);
    if(i !== next){ bump(b); api.hint(next === 0 ? '这一步不是第一步。先想：最开始要做什么？' : `这一步还早。上一步是“${items[next - 1]}”，接下来呢？`, 'no'); return; }
    b.classList.add('set'); b.querySelector('i').textContent = String(next + 1); next++;
    if(next === items.length){
      api.done(); api.hint('顺序全对。', 'ok');
      const list = stage.querySelector('.order-list');
      [...list.children].sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i)).forEach(x => list.append(x));
    } else api.hint(`对，第 ${next} 步。`, 'ok');
  }));
};

/* ---------- 1903 年 12 月 17 日：第 1 次和第 4 次 ---------- */
L.wright = function(stage, ctl, api){
  html(stage);
  const bar = (m, w, court) => {
    const px = m * 1.12, W = 330;
    return `<svg viewBox="0 0 ${W} ${court ? 64 : 50}" width="100%" aria-hidden="true">
      <path d="M10 38h${W - 20}" stroke="#c7d0dc" stroke-width="2" stroke-dasharray="2 5"/>
      <rect x="6" y="35" width="10" height="6" rx="2" fill="#56657a"/>
      <path d="M12 34Q${12 + px / 2} ${34 - Math.min(26, 8 + px / 12)} ${12 + px} 34" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-dasharray="5 4"/>
      <circle cx="${12 + px}" cy="35" r="3.4" fill="var(--ink)"/>
      ${court ? `<rect x="12" y="50" width="${28 * 1.12}" height="8" rx="2" fill="#f0b46b"/><text x="${20 + 28 * 1.12}" y="57.5" style="font:700 10.5px var(--sans);fill:var(--muted)">一个篮球场 28 米</text>` : ''}
    </svg>`;
  };
  stage.innerHTML = `<div class="flights">
    <div class="flight" data-n="1"><header><b>第 1 次</b><span>最短</span></header>${bar(36.6, 1, true)}<div class="slots" id="s1"></div></div>
    <div class="flight" data-n="4"><header><b>第 4 次</b><span>最远</span></header>${bar(260, 4)}<div class="slots" id="s4"></div></div>
  </div>`;
  ctl.innerHTML = `<div class="chips" id="wc">${shuffle(C.wrightCards).map(([t, n]) => `<button type="button" class="chip" data-n="${n}" aria-pressed="false">${esc(t)}</button>`).join('')}</div>`;
  let sel = null, placed = 0;
  ctl.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => { sel = c; ctl.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === c))); api.hint(`“${c.textContent}”是第几次的？点上面的第 1 次或第 4 次。`); }));
  stage.querySelectorAll('.flight').forEach(f => f.addEventListener('click', () => {
    if(!sel){ api.hint('先点下面的一张卡片。'); return; }
    if(sel.dataset.n !== f.dataset.n){ bump(f); api.hint(`不对。${sel.textContent}是第 ${sel.dataset.n} 次的。先想“第几次”，再整组记。`, 'no'); return; }
    f.querySelector('.slots').insertAdjacentHTML('beforeend', `<span class="slot fade-in">${esc(sel.textContent)}</span>`);
    sel.classList.add('placed'); sel.setAttribute('aria-pressed','false'); sel = null; placed++;
    if(placed === C.wrightCards.length){ api.done(); api.hint('全对：第 1 次奥维尔 12 秒、120 英尺约 36 米；第 4 次威尔伯 59 秒、852 英尺约 260 米。', 'ok'); }
    else api.hint('对。', 'ok');
  }));
};

/* ---------- 三个第一 ---------- */
L.firsts = function(stage, ctl, api){
  const s = K.svg(stage);
  /* 正面看飞行者一号：上下两层长机翼，中间两副螺旋桨 */
  const k = 3.6, X = v => 180 + (v - 32) * k, Y = v => 116 + (v - 28) * k;
  s.innerHTML = `${A.hills(360, 260)}<g transform="translate(${X(0)} ${Y(0)}) scale(${k})">${A.icons.flyer}</g>
    <text class="svg-small" x="${X(4)}" y="${Y(8)}">上层机翼</text><path d="M${X(10)} ${Y(9.5)}L${X(13)} ${Y(17.6)}" stroke="#162236" stroke-width="1.4"/>
    <text class="svg-small" x="${X(4)}" y="${Y(48)}">下层机翼</text><path d="M${X(10)} ${Y(44.4)}L${X(13)} ${Y(36.4)}" stroke="#162236" stroke-width="1.4"/>
    <text class="svg-small" x="${X(60)}" y="${Y(8)}" text-anchor="end">螺旋桨</text><path d="M${X(52)} ${Y(9.5)}L${X(47)} ${Y(21.6)}" stroke="#162236" stroke-width="1.4"/>
    <text class="svg-label" x="180" y="238" text-anchor="middle">飞行者一号　双翼飞机</text>`;
  const cards = [['有动力','有发动机，带动螺旋桨推它往前飞，不是靠风或者从高处滑下来。'],['可操纵','飞行员能控制它往哪飞、飞多高。'],['重于空气','它比空气重，靠机翼产生的升力飞起来，不是靠浮力。']];
  ctl.innerHTML = `<div class="flips">${cards.map(([t, d], i) => `<button type="button" class="flip" data-i="${i}" aria-expanded="false"><b>${esc(t)}</b><span>${esc(d)}</span></button>`).join('')}</div>`;
  const seen = new Set();
  ctl.querySelectorAll('.flip').forEach(b => b.addEventListener('click', () => {
    b.setAttribute('aria-expanded','true'); seen.add(b.dataset.i);
    if(seen.size === 3){ api.done(); api.hint('三个条件缺一不可：有动力、可操纵、重于空气。', 'ok'); }
  }));
};
})();
