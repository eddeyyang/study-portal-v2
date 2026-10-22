/* 航段一“为什么能飞”的实验：分类、热气球、飞艇、旋翼、风洞、扑翼、滑翔、四个力、阻力 */
(function(){
'use strict';
const A = window.ART, K = window.KIT, L = window.LABS;
const {esc, range, seg, button, loop, svg, lerp, clamp} = K;
const INK = A.INK;

/* ---------- 1. 谁在托着它：分两大类，再看五个家族 ---------- */
L.sort = function(stage, ctl, api){
  const items = [
    ['balloon','热气球','buoy','浮空器','热气球里的空气被烧热、变轻，是浮力托着它。'],
    ['airship','飞艇','buoy','浮空器','飞艇的大气囊里装着比空气轻的氦气，是浮力托着它。'],
    ['lantern','孔明灯','buoy','浮空器','孔明灯和热气球一样，靠热空气变轻，是浮力托着它。'],
    ['airliner','客机','air','固定翼','客机比空气重得多，靠机翼推空气才有升力。'],
    ['helicopter','直升机','air','旋翼','直升机靠头顶的旋翼把空气往下推。'],
    ['quad','四旋翼无人机','air','旋翼','无人机靠四个旋翼把空气往下推。'],
    ['ornithopter','扑翼机','air','扑翼','扑翼机像鸟一样扇翅膀，把空气往下推。'],
    ['glider','滑翔机','air','滑翔','滑翔机没有气囊，靠机翼和空气，一边滑一边往前。'],
    ['kite','风筝','air','滑翔','风筝没有气囊：风吹过它产生升力，线牵着它。']
  ];
  const s = svg(stage);
  const slots = {buoy:[[56,118],[123,118],[90,182]], air:[[222,118],[280,118],[338,118],[222,182],[280,182],[338,182]]};
  s.innerHTML = `
    <g class="zone" data-side="buoy" role="button" tabindex="0" aria-label="放进：浮力托着">
      <rect x="10" y="18" width="160" height="218" rx="22" fill="rgba(255,255,255,.42)" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/>
      <text class="svg-label" x="90" y="46" text-anchor="middle">浮力托着</text>
      ${A.arrow(42,92,0,-1,26,'lift')}${A.arrow(138,92,0,-1,26,'lift')}
    </g>
    <g class="zone" data-side="air" role="button" tabindex="0" aria-label="放进：推空气托着">
      <rect x="186" y="18" width="164" height="218" rx="22" fill="rgba(255,255,255,.42)" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/>
      <text class="svg-label" x="268" y="46" text-anchor="middle">推空气托着</text>
      ${A.arrow(206,66,0,1,24,'#ffffff')}${A.arrow(330,66,0,1,24,'#ffffff')}
    </g>
    <g id="placed"></g><g id="fam"></g>`;
  ctl.innerHTML = `<div class="chips" id="shelf">${items.map(([ic, name]) => `<button type="button" class="chip" data-ic="${ic}" aria-pressed="false">${A.icon(ic, 34)}${esc(name)}</button>`).join('')}</div>`;
  let sel = null; const count = {buoy:0, air:0}; let placed = 0;
  ctl.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
    sel = c.dataset.ic; ctl.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    api.hint(`选好了“${items.find(i => i[0] === sel)[1]}”，再点上面它该去的一边。`);
  }));
  const drop = side => {
    if(!sel){ api.hint('先点下面的一个飞行器。'); return; }
    const it = items.find(i => i[0] === sel);
    const zone = s.querySelector(`.zone[data-side="${side}"]`);
    if(it[2] !== side){
      zone.classList.remove('shake'); void zone.getBBox(); zone.classList.add('shake');
      api.hint(`不是这边。${it[4]}`, 'no');
      return;
    }
    const [x, y] = slots[side][count[side]++];
    s.querySelector('#placed').insertAdjacentHTML('beforeend', `<g class="fade-in">${A.iconG(it[0], x, y, 50)}</g>`);
    s.querySelector('#fam').insertAdjacentHTML('beforeend', `<text class="svg-small fam-t" x="${x}" y="${y + 36}" text-anchor="middle" opacity="0">${esc(it[3])}</text>`);
    const chip = ctl.querySelector(`.chip[data-ic="${sel}"]`); chip.classList.add('placed'); chip.setAttribute('aria-pressed','false');
    sel = null; placed++;
    if(placed === items.length){
      s.querySelectorAll('.fam-t').forEach(t => t.setAttribute('opacity','1'));
      api.hint('全对。两大类，五个家族：浮空器；固定翼、旋翼、扑翼、滑翔。', 'ok'); api.done();
    } else api.hint(`对。${it[1]}${side === 'buoy' ? '靠浮力托着' : '靠推空气托着'}。还剩 ${items.length - placed} 个。`, 'ok');
  };
  s.querySelectorAll('.zone').forEach(z => {
    z.addEventListener('click', () => drop(z.dataset.side));
    z.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); drop(z.dataset.side); } });
    z.style.cursor = 'pointer';
  });
};

/* ---------- 2. 热空气托起气球 ---------- */
L.heat = function(stage, ctl, api){
  const s = svg(stage);
  const cx = 180, cy = 92, rx = 54, ry = 60;
  const inside = []; let tries = 0;
  while(inside.length < 40 && tries++ < 2000){ const x = cx + (Math.random() * 2 - 1) * rx, y = cy + (Math.random() * 2 - 1) * ry; if(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < .78) inside.push([x, y, Math.random() * 6.28]); }
  const outside = []; while(outside.length < 34){ const x = 12 + Math.random() * 336, y = 14 + Math.random() * 196; if(((x - cx) / (rx + 22)) ** 2 + ((y - cy) / (ry + 26)) ** 2 > 1.1 && !(x > 150 && x < 210 && y > 150)) outside.push([x, y]); }
  s.innerHTML = `${A.hills(360, 260)}
    <g id="out">${outside.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#fff" opacity=".8"/>`).join('')}</g>
    <text class="svg-small" x="16" y="24">外面的空气</text>
    <g id="bal">
      <path d="M180 26c-33 0-60 26-60 60 0 26 20 45 37 63h46c17-18 37-37 37-63 0-34-27-60-60-60z" fill="#ffd36b" stroke="${INK}" stroke-opacity=".75" stroke-width="2"/>
      <path d="M180 26c-15 0-25 26-25 60 0 26 7 45 13 63h24c6-18 13-37 13-63 0-34-10-60-25-60z" fill="#fff3cf" opacity=".9"/>
      <g id="mol"></g>
      <path d="M160 149l6 22M200 149l-6 22" stroke="${INK}" stroke-opacity=".6" stroke-width="1.6"/>
      <path id="flame" d="M180 168c-6 7-6 13 0 16 6-3 6-9 0-16z" fill="#ff9d3c"/>
      <rect x="164" y="172" width="32" height="20" rx="4" fill="#c99d6c" stroke="${INK}" stroke-opacity=".7" stroke-width="1.6"/>
    </g><g id="arr"></g>`;
  const mol = s.querySelector('#mol'), bal = s.querySelector('#bal'), arr = s.querySelector('#arr'), flame = s.querySelector('#flame');
  let heat = 10, y = 0, vy = 0, okT = 0;
  const SCL = .8, BASE = 228;   /* 气球缩小一点、站在地上；升起来最多 78，箭头和字都留在画面里 */
  const place = () => bal.setAttribute('transform', `translate(180 ${(BASE + y).toFixed(1)}) scale(${SCL}) translate(-180 -192)`);
  mol.innerHTML = inside.map(([x, yy], i) => `<circle data-i="${i}" cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="2.8" fill="#9a6a1d" opacity=".75"/>`).join('');
  const dots = [...mol.children];
  const drawArrows = () => {
    const c = BASE + y - (192 - cy) * SCL, w = 74 - heat * .4, ax = cx + rx * SCL + 18;
    arr.innerHTML = A.arrow(ax, c - 4, 0, -1, 54, 'lift') + `<text class="svg-label" x="${ax + 10}" y="${(c - 26).toFixed(0)}" style="fill:#2a6ff0">浮力</text>`
      + A.arrow(ax, c + 4, 0, 1, w, 'weight') + `<text class="svg-label" x="${ax + 10}" y="${(c + 10 + w / 2).toFixed(0)}">重力</text>`;
  };
  const draw = () => {
    const shown = Math.round(40 - heat * .22);
    dots.forEach((d, i) => d.style.display = i < shown ? '' : 'none');
    flame.setAttribute('transform', `translate(180 176) scale(${.5 + heat / 70}) translate(-180 -176)`);
    place(); drawArrows();
  };
  range(ctl, {label:'加热', value:heat, fmt:v => v < 30 ? '冷' : v < 60 ? '温' : '热'}, v => { heat = v; draw(); });
  draw();
  const stop = loop((dt, t) => {
    const net = 54 - (74 - heat * .4);
    const target = net > 0 ? -Math.min(78, net * 4.2) : 0;
    vy = lerp(vy, (target - y) * 1.6, .1); y += vy * dt; y = clamp(y, -78, 0);
    place(); drawArrows();
    if(!api.reduce){ const a = .6 + heat * .045; dots.forEach((d, i) => { const p = inside[i]; d.setAttribute('transform', `translate(${(Math.sin(t * (2 + heat / 25) + p[2]) * a).toFixed(2)} ${(Math.cos(t * (2.3 + heat / 25) + p[2] * 1.7) * a).toFixed(2)})`); }); }
    const st = heat < 44 ? ['还托不起来：重力比浮力大。',''] : heat < 54 ? ['快了：重力和浮力差不多大。',''] : ['升起来了：里面的空气变稀，整体变轻，浮力托得动了。','ok'];
    if(api._last !== st[0]){ api.hint(st[0], st[1]); api._last = st[0]; }
    if(heat >= 60){ okT += dt; if(okT > .8) api.done(); }
  });
  return stop;
};

/* ---------- 3. 飞艇和热气球：起风了 ---------- */
L.airship = function(stage, ctl, api){
  const s = svg(stage);
  s.innerHTML = `${A.hills(360, 260)}<g id="wind"></g>
    <g id="bal">${A.iconG('balloon', 0, 0, 92)}<text class="svg-small" x="0" y="-52" text-anchor="middle">热气球</text></g>
    <g id="ship"><g transform="scale(-1 1)">${A.iconG('airship', 0, 0, 132)}<ellipse id="prop" cx="-36" cy="9" rx="2" ry="8" fill="#fff" stroke="${INK}" stroke-opacity=".7" stroke-width="1.4" transform="translate(3 0)"/></g>
      <text x="6" y="2" text-anchor="middle" style="font:800 12px var(--round);fill:#4b5b73">氦气</text>
      <text class="svg-small" x="0" y="-44" text-anchor="middle">飞艇</text></g>`;
  const bal = s.querySelector('#bal'), ship = s.querySelector('#ship'), wind = s.querySelector('#wind'), prop = s.querySelector('#prop');
  const streaks = Array.from({length:14}, () => [Math.random() * 380 - 20, 20 + Math.random() * 190, 18 + Math.random() * 30]);
  let on = false, bx = 92, by = 82, sx = 236, onT = 0;
  seg(ctl, [['calm','没有风'],['wind','起风']], 'calm', id => { on = id === 'wind'; if(!on){ bx = 92; } api.hint(on ? '热气球被吹走了；飞艇的螺旋桨转起来，顶着风还能停在原地、选方向。' : ''); });
  const stop = loop((dt, t) => {
    if(on){ bx += 34 * dt; if(bx > 420) bx = -50; onT += dt; if(onT > 2.2) api.done(); }
    const bob = api.reduce ? 0 : Math.sin(t * 1.3) * 3;
    bal.setAttribute('transform', `translate(${bx.toFixed(1)} ${(by + bob).toFixed(1)})`);
    ship.setAttribute('transform', `translate(${sx} ${150 + (api.reduce ? 0 : Math.sin(t * 1.1 + 1) * 2)})`);
    prop.setAttribute('ry', on && !api.reduce ? (2 + Math.abs(Math.sin(t * 40)) * 7).toFixed(1) : '8');
    wind.innerHTML = on ? streaks.map(st => { st[0] += 160 * dt; if(st[0] > 380) st[0] = -40; return `<path d="M${st[0].toFixed(0)} ${st[1].toFixed(0)}h${st[2].toFixed(0)}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>`; }).join('') : '';
  });
  return stop;
};

/* ---------- 4. 旋翼：推空气向下 ---------- */
L.rotor = function(stage, ctl, api){
  const s = svg(stage);
  const SC = 1.25, rotorX = [-46 * SC, 46 * SC];
  s.innerHTML = `${A.hills(360, 260)}<g id="parts"></g><g id="drone"><g transform="scale(${SC})">${A.quadSide({accent:api.accent})}</g></g><g id="arr"></g>
    <text id="airlbl" class="svg-small" x="0" y="0" opacity="0">空气被往下推</text>`;
  const drone = s.querySelector('#drone'), parts = s.querySelector('#parts'), arr = s.querySelector('#arr'), lbl = s.querySelector('#airlbl');
  const discs = drone.querySelectorAll('.disc'), blades = drone.querySelectorAll('.blade');
  const P = Array.from({length:44}, (_, i) => ({side:i % 2, x:(Math.random() * 2 - 1) * 22, d:Math.random() * 90}));
  let rpm = 0, y = 196, vy = 0, hovT = 0;
  range(ctl, {label:'转速', value:0, fmt:v => v === 0 ? '停' : v < 40 ? '慢' : v < 56 ? '中' : v <= 64 ? '刚好' : '快'}, v => { rpm = v; });
  const stop = loop((dt, t) => {
    const up = Math.min(84, 44 * (rpm / 60) ** 2), weight = 44;
    const ground = 196;
    let acc = (up - weight) * 3.2;
    if(y >= ground && acc < 0) acc = 0;
    vy = (vy + acc * dt * 1.4) * Math.pow(.25, dt);
    y = clamp(y - vy * dt, 108, ground);
    if(y >= ground && vy < 0) vy = 0;
    drone.setAttribute('transform', `translate(180 ${y.toFixed(1)})`);
    discs.forEach(d => d.setAttribute('opacity', (Math.min(1, rpm / 50) * .7).toFixed(2)));
    blades.forEach(b => b.setAttribute('opacity', rpm > 25 ? '.25' : '1'));
    const ry = y - 13 * SC;
    const speed = rpm * 2.2;
    parts.innerHTML = rpm < 4 ? '' : P.map(p => { if(!api.reduce) p.d = (p.d + speed * dt) % 100; const px = 180 + rotorX[p.side] + p.x, py = ry + 6 + p.d; return `<path d="M${px.toFixed(1)} ${py.toFixed(1)}v${(4 + rpm / 9).toFixed(1)}" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity="${(1 - p.d / 100).toFixed(2)}"/>`; }).join('');
    arr.innerHTML = A.arrow(180, y - 20, 0, -1, up, 'lift') + A.arrow(180, y + 14, 0, 1, weight, 'weight')
      + (up > 6 ? `<text class="svg-label" x="190" y="${(y - 18 - up / 2).toFixed(0)}" style="fill:#2a6ff0">向上的力</text>` : '') + `<text class="svg-label" x="190" y="${(y + 20 + weight / 2).toFixed(0)}">重力</text>`;
    lbl.setAttribute('x', (180 + rotorX[1] + 30).toFixed(0)); lbl.setAttribute('y', (ry + 46).toFixed(0)); lbl.setAttribute('opacity', rpm > 20 ? '1' : '0');
    const airborne = y < ground - 1;
    let st;
    if(rpm === 0) st = ['拖动转速，让旋翼转起来。',''];
    else if(!airborne && up < weight - 2) st = ['向上的力还比重力小，飞不起来。',''];
    else if(Math.abs(up - weight) <= 4 && airborne) st = ['悬停了：向上的力刚好等于重力。','ok'];
    else if(Math.abs(up - weight) <= 4) st = ['两个力一样大了，但它原来停在地上：先推快一点让它起飞，再慢慢调回来。',''];
    else if(up > weight) st = ['向上的力比重力大，往上升。',''];
    else st = ['向上的力比重力小，往下落。',''];
    if(api._last !== st[0]){ api.hint(st[0], st[1]); api._last = st[0]; }
    if(airborne && Math.abs(up - weight) <= 4){ hovT += dt; if(hovT > 1.2) api.done(); } else hovT = 0;
  });
  return stop;
};

/* ---------- 5. 风洞里的机翼 ---------- */
L.wing = function(stage, ctl, api){
  stage.style.background = 'linear-gradient(180deg,#eef4fa,#e2ebf5)';
  const s = svg(stage, '0 0 360 260', 'xMidYMid meet');
  const ys = [56, 74, 92, 110, 150, 168, 186, 204];
  s.innerHTML = `<rect x="8" y="24" width="344" height="210" rx="20" fill="#f8fbff" stroke="#c6d4e3" stroke-width="2"/>
    <text class="svg-small" x="24" y="46">风洞</text>
    <g id="fan" transform="translate(30 129)"><circle r="17" fill="#fff" stroke="${INK}" stroke-opacity=".55" stroke-width="1.6"/><g id="fanb"><path d="M0-13v26M-13 0h26" stroke="${INK}" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/></g></g>
    <g id="lines"></g>
    <g id="wing"><path d="M-78 2C-74-12-40-20-6-16 24-12 52-5 74 2 46 6-6 12-40 10-62 9-76 7-78 2z" fill="#fff" stroke="${INK}" stroke-opacity=".8" stroke-width="2"/></g>
    <path d="M168 150v40M152 190h32" stroke="#9aa8ba" stroke-width="3" stroke-linecap="round"/>
    <g id="pr"></g><g id="arr"></g>`;
  const lines = s.querySelector('#lines'), wing = s.querySelector('#wing'), pr = s.querySelector('#pr'), arr = s.querySelector('#arr'), fanb = s.querySelector('#fanb');
  let on = false, ang = 4, moved = false, rot = 0;
  const path = (y0, upper) => {
    const c = Math.exp(-Math.abs(y0 - 130) / 46);
    let d = '';
    for(let x = 50; x <= 346; x += 6){
      const g = Math.exp(-(((x - 172) / 52) ** 2)), g2 = Math.exp(-(((x - 160) / 58) ** 2));
      const down = x > 214 ? (x - 214) * (.02 + ang * .011) * c : 0;
      const dy = upper ? -(9 + ang * .9) * c * g + down : (3 + ang * .5) * c * g2 + down;
      d += `${x === 50 ? 'M' : 'L'}${x} ${(y0 + dy).toFixed(1)}`;
    }
    return d;
  };
  const draw = () => {
    wing.setAttribute('transform', `translate(176 128) rotate(${ang})`);
    lines.innerHTML = ys.map(y0 => { const up = y0 < 130; return `<path d="${path(y0, up)}" fill="none" stroke="${up ? '#59aef1' : '#8fb4d9'}" stroke-width="2.4" stroke-linecap="round" class="${on && !api.reduce ? 'flow' : ''}" style="--spd:${up ? .5 : 1.05}s;${on ? '' : 'opacity:.18;stroke-dasharray:2 7'}"/>`; }).join('');
    pr.innerHTML = on ? `<g class="fade-in"><rect x="146" y="70" width="64" height="26" rx="13" fill="#2a6ff0"/><text x="178" y="87" text-anchor="middle" style="font:800 13px var(--round);fill:#fff">压强小</text><rect x="146" y="164" width="64" height="26" rx="13" fill="#162236"/><text x="178" y="181" text-anchor="middle" style="font:800 13px var(--round);fill:#fff">压强大</text></g>` : '';
    const lift = on ? 26 + ang * 5.2 : 0;
    arr.innerHTML = on ? A.arrow(228, 124, 0, -1, lift, 'lift') + `<text class="svg-label" x="238" y="${(118 - lift).toFixed(0)}" style="fill:#2a6ff0">升力</text>` : '';
    api.hint(on ? '上面的线挤得更密、跑得更快：压强小；机翼后面的气流被压向下，空气就把机翼往上推。' : '风还没开：没有气流流过机翼，就没有升力。', on ? 'ok' : '');
    if(on && moved) api.done();
  };
  seg(ctl, [['off','关风'],['on','开风']], 'off', id => { on = id === 'on'; draw(); });
  range(ctl, {label:'迎角', min:0, max:12, value:ang, fmt:v => v + '°'}, v => { ang = v; moved = true; draw(); });
  draw();
  return loop(dt => { if(on && !api.reduce){ rot = (rot + dt * 900) % 360; fanb.setAttribute('transform', `rotate(${rot.toFixed(0)})`); } });
};

/* ---------- 6. 扑翼：扇一下 ---------- */
L.flap = function(stage, ctl, api){
  const s = svg(stage);
  const wingPts = '0,0 -72,-20 -88,-8 -64,10 -8,8';
  s.innerHTML = `${A.hills(360, 260)}<g id="air"></g>
    <g id="bird">
      <g id="wl"><polygon points="${wingPts}" fill="#f3e8d6" stroke="${INK}" stroke-opacity=".75" stroke-width="1.8" stroke-linejoin="round"/><path d="M-8 3L-70-14M-10 6L-82-6M-12 8L-62 8" stroke="${INK}" stroke-opacity=".25" stroke-width="1.4"/></g>
      <g id="wr" transform="scale(-1 1)"><polygon points="${wingPts}" fill="#f3e8d6" stroke="${INK}" stroke-opacity=".75" stroke-width="1.8" stroke-linejoin="round"/><path d="M-8 3L-70-14M-10 6L-82-6M-12 8L-62 8" stroke="${INK}" stroke-opacity=".25" stroke-width="1.4"/></g>
      <ellipse cx="0" cy="10" rx="11" ry="22" fill="#e7d4b6" stroke="${INK}" stroke-opacity=".75" stroke-width="1.8"/>
      <circle cx="0" cy="-16" r="8" fill="#e7d4b6" stroke="${INK}" stroke-opacity=".75" stroke-width="1.8"/>
      <path d="M-6 30l6 18 6-18z" fill="#e7d4b6" stroke="${INK}" stroke-opacity=".75" stroke-width="1.6" stroke-linejoin="round"/>
    </g><g id="up"></g>`;
  const bird = s.querySelector('#bird'), wl = s.querySelector('#wl'), wr = s.querySelector('#wr'), air = s.querySelector('#air'), up = s.querySelector('#up');
  let y = 150, vy = 0, phase = -1, pt = 0, ang = 30, flaps = 0;
  const puffs = [];
  const flap = () => { if(phase >= 0) return; phase = 0; pt = 0; };
  button(ctl, '扇一下', flap, 'btn primary small');
  api.hint('点“扇一下”，多点几下试试。');
  const stop = loop(dt => {
    if(phase === 0){ pt += dt / (api.reduce ? .15 : .28); ang = lerp(30, -18, Math.min(1, pt)); if(pt >= 1){ phase = 1; pt = 0; flaps++; vy -= 52; puffs.push({x:-60, d:0}, {x:60, d:0}); if(flaps >= 3) api.done(); api.hint(`第 ${flaps} 下：翅膀把空气往下推，空气把鸟往上托。`, 'ok'); } }
    else if(phase === 1){ pt += dt / .45; ang = lerp(-18, 30, Math.min(1, pt)); if(pt >= 1) phase = -1; }
    vy += 22 * dt; vy *= Math.pow(.5, dt); y = clamp(y + vy * dt, 64, 160);
    bird.setAttribute('transform', `translate(180 ${y.toFixed(1)})`);
    wl.setAttribute('transform', `translate(-8 0) rotate(${ang.toFixed(1)})`);
    wr.setAttribute('transform', `translate(8 0) scale(-1 1) rotate(${ang.toFixed(1)})`);
    for(const p of puffs) p.d += 70 * dt;
    while(puffs.length && puffs[0].d > 70) puffs.shift();
    air.innerHTML = puffs.map(p => A.arrow(180 + p.x, y + 20 + p.d, 0, 1, 26, '#ffffff').replace('<g class="arrow ', `<g opacity="${(1 - p.d / 70).toFixed(2)}" class="arrow `)).join('');
    up.innerHTML = phase === 0 || (phase === 1 && pt < .3) ? A.arrow(180, y - 30, 0, -1, 44, 'lift') : '';
  });
  return stop;
};

/* ---------- 7. 滑翔：上升气流 ---------- */
L.glide = function(stage, ctl, api){
  const s = svg(stage);
  s.innerHTML = `<path d="M0 260V74h38c10 0 14 8 18 30l12 156z" fill="#93cfb5"/><path d="M0 236C120 228 240 230 360 236V260H0z" fill="#86c9ab"/>
    <rect x="300" y="231" width="52" height="7" rx="3" fill="#56657a" opacity=".5"/>
    <g id="therm"></g><path id="path" fill="none" stroke="${INK}" stroke-opacity=".55" stroke-width="2" stroke-dasharray="4 6"/>
    <g id="g"><path d="M-24 0c8-3 30-3 40-1l8 1-8 2c-10 1-32 1-40-2z" fill="#fff" stroke="${INK}" stroke-opacity=".8" stroke-width="1.6"/><path d="M-8-1h24" stroke="${INK}" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/><path d="M-24-1l-4-9h4l6 8z" fill="#fff" stroke="${INK}" stroke-opacity=".8" stroke-width="1.4" stroke-linejoin="round"/></g>
    <g id="labels"></g>`;
  const pathEl = s.querySelector('#path'), g = s.querySelector('#g'), therm = s.querySelector('#therm'), labels = s.querySelector('#labels');
  let str = 0, pts = [], u = 0;
  const T0 = 160, T1 = 222;
  const compute = () => {
    pts = []; let x = 46, y = 70; const vx = 60;
    while(x < 356 && y < 229){ const inT = x > T0 && x < T1; const vyy = 20 - (inT ? str * .62 : 0); x += vx / 30; y = clamp(y + vyy / 30, 30, 229); pts.push([x, y]); }
    pathEl.setAttribute('d', 'M46 70 ' + pts.map(p => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' '));
    const last = pts[pts.length - 1];
    therm.innerHTML = str > 0 ? `<rect x="${T0}" y="40" width="${T1 - T0}" height="190" rx="22" fill="#fff" opacity="${(.12 + str / 300).toFixed(2)}"/>${[0, 1, 2].map(i => A.arrow(T0 + 14 + i * 18, 200 - i * 22, 0, -1, 30 + str * .3, '#ffffff', 'up')).join('')}<text class="svg-small" x="${(T0 + T1) / 2}" y="34" text-anchor="middle">${str > 20 ? '上升气流：空气电梯' : '上升气流'}</text>` : '';
    labels.innerHTML = `<text class="svg-small" x="70" y="58">用高度换前进</text>` + (last[1] >= 228 ? `<text class="svg-label" x="${Math.min(330, last[0]).toFixed(0)}" y="222" text-anchor="middle">落地</text>` : `<text class="svg-label" x="300" y="${Math.max(30, last[1] - 14).toFixed(0)}" text-anchor="middle">还在飞</text>`);
    const minY = Math.min(...pts.filter(p => p[0] > T0 && p[0] < T1).map(p => p[1]));
    const enterY = (pts.find(p => p[0] > T0) || [0, 999])[1];
    api.hint(str === 0 ? '没有上升气流：一边下降一边往前，用高度换前进。' : minY < enterY - 2 ? '进了上升气流，滑翔机反而升高了：像坐上了空气电梯。' : '有一点上升气流，下降变慢了，能飞得更远。', str >= 50 ? 'ok' : '');
    if(minY < enterY - 2) api.done();
  };
  range(ctl, {label:'上升气流', value:0, fmt:v => v === 0 ? '没有' : v < 50 ? '弱' : '强'}, v => { str = v; compute(); });
  compute();
  return loop(dt => {
    if(!pts.length) return;
    u = (u + dt * (api.reduce ? 0 : 36)) % (pts.length + 40);
    const i = Math.min(pts.length - 1, Math.floor(u)), p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)];
    const a = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
    g.setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${a.toFixed(1)})`);
  });
};

/* ---------- 8. 四个力 ---------- */
L.forces = function(stage, ctl, api){
  const s = svg(stage);
  const mode = api.frame.mode;
  s.innerHTML = `<g id="clouds"></g><g id="ground"></g><g id="plane"><g transform="scale(2.9) translate(-32 -31)">${A.icons.airliner}</g></g><g id="arr"></g>`;
  const plane = s.querySelector('#plane'), arr = s.querySelector('#arr'), cl = s.querySelector('#clouds'), gr = s.querySelector('#ground');
  const clouds = Array.from({length:5}, (_, i) => [i * 90 + Math.random() * 40, 24 + Math.random() * 170, .4 + Math.random() * .4]);
  const label = (x, y, t, c, anchor='middle') => `<text class="svg-label" x="${x}" y="${y}" text-anchor="${anchor}" style="fill:${c}">${t}</text>`;
  if(mode === 'level'){
    let sc = 'level', v = 40;
    const set = {level:[50, 50, '推力 = 阻力：速度不变。升力 = 重力：高度不变。'], fast:[78, 50, '推力比阻力大：越飞越快。'], slow:[28, 50, '推力比阻力小：慢慢变慢。']};
    seg(ctl, [['level','平飞匀速'],['fast','加速'],['slow','减速']], 'level', id => { sc = id; api.hint(set[id][2], id === 'level' ? '' : 'ok'); if(id !== 'level') api.done(); });
    api.hint(set.level[2]);
    return loop(dt => {
      const [th, dr] = set[sc]; const target = sc === 'level' ? 40 : sc === 'fast' ? 130 : 12;
      v = lerp(v, target, Math.min(1, dt * .8));
      cl.innerHTML = clouds.map(c => { c[0] -= v * c[2] * dt * (api.reduce ? 0 : 1); if(c[0] < -90) c[0] = 380; return A.cloud(c[0], c[1], c[2], .9); }).join('');
      plane.setAttribute('transform', 'translate(180 128)');
      arr.innerHTML = A.arrow(180, 112, 0, -1, 62, 'lift') + A.arrow(180, 146, 0, 1, 62, 'weight') + A.arrow(258, 130, 1, 0, th * .9, 'thrust') + A.arrow(104, 130, -1, 0, dr * .9, 'drag')
        + label(180, 38, '升力', '#2a6ff0') + label(180, 232, '重力', '#162236') + label(Math.min(340, 266 + th * .9), 118, '推力', '#13a07a') + label(Math.max(20, 96 - dr * .9), 118, '阻力', '#c4761f');
    });
  }
  /* 受控下降 */
  gr.innerHTML = `<path d="M0 236C120 228 240 230 360 236V260H0z" fill="#86c9ab"/><rect x="190" y="231" width="170" height="10" rx="3" fill="#56657a"/><path d="M200 236h150" stroke="#fff" stroke-width="2" stroke-dasharray="10 10"/>`;
  let t0 = 0, playing = true;
  const P = u => { const x = lerp(46, 300, u); const y = u < .85 ? lerp(64, 214, u / .85) : lerp(214, 222, (u - .85) / .15); const a = u < .8 ? 9 : lerp(9, -3, (u - .8) / .2); return [x, y, a]; };
  button(ctl, '再看一次', () => { t0 = 0; playing = true; });
  api.hint('看它怎么下来。');
  return loop((dt) => {
    if(playing){ t0 += dt / (api.reduce ? 1.2 : 5); if(t0 >= 1){ t0 = 1; playing = false; api.hint('平稳落地了：下降是受控的，不是坠毁。', 'ok'); api.done(); } }
    cl.innerHTML = clouds.map(c => A.cloud(c[0], c[1] * .7, c[2], .85)).join('');
    const [x, y, a] = P(t0);
    plane.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)}) scale(.62)`);
    arr.innerHTML = t0 < 1 ? A.arrow(x, y - 12, 0, -1, 40, 'lift') + A.arrow(x, y + 12, 0, 1, 50, 'weight') + A.arrow(x - 48, y, -1, 0, 26, 'drag')
      + label(x + 14, y - 58, '升力比重力小一点', '#2a6ff0', 'start') : '';
  });
};

/* ---------- 9. 阻力和迎风面积 ---------- */
L.drag = function(stage, ctl, api){
  const s = svg(stage);
  s.innerHTML = `<g id="wind"></g><g id="plate"></g><g id="arr"></g>`;
  const wind = s.querySelector('#wind'), plate = s.querySelector('#plate'), arr = s.querySelector('#arr');
  const streaks = Array.from({length:16}, (_, i) => [Math.random() * 360, 30 + (i % 8) * 25, 20 + Math.random() * 20]);
  let a = 15, lo = 15, hi = 15;
  const draw = () => {
    const rad = a * Math.PI / 180, h = 110 * Math.sin(rad) + 4;
    plate.innerHTML = `<g transform="translate(190 130) rotate(${-a})"><rect x="-56" y="-5" width="112" height="10" rx="4" fill="#d9b88f" stroke="${INK}" stroke-opacity=".7" stroke-width="1.6"/></g>
      <path d="M124 ${(130 - h / 2).toFixed(1)}h-8v${h.toFixed(1)}h8" fill="none" stroke="${INK}" stroke-width="2"/><text class="svg-small" x="110" y="134" text-anchor="end">迎风面积</text>`;
    const d = 12 + 78 * Math.sin(rad), x0 = 190 + 56 * Math.cos(rad) + 10;
    arr.innerHTML = A.arrow(x0, 130, 1, 0, d, 'drag') + `<text class="svg-label" x="${Math.min(334, x0 + d + 8).toFixed(0)}" y="122" style="fill:#c4761f" text-anchor="${x0 + d + 8 > 300 ? 'end' : 'start'}">阻力</text>`;
    lo = Math.min(lo, a); hi = Math.max(hi, a);
    if(hi - lo >= 55){ api.done(); }
    api.hint(a > 60 ? '正面迎风：面积大，阻力大。' : a < 25 ? '侧过来迎风：面积小，阻力小。' : '转一转，看阻力箭头怎么变。', a > 60 || a < 25 ? 'ok' : '');
  };
  range(ctl, {label:'转动木板', min:0, max:90, value:a, fmt:v => v > 60 ? '正对着风' : v < 25 ? '侧对着风' : '斜着'}, v => { a = v; draw(); });
  draw();
  return loop(dt => { wind.innerHTML = streaks.map(st => { if(!api.reduce) st[0] += 140 * dt; if(st[0] > 380) st[0] = -40; const blocked = st[0] > 150 && st[0] < 200 && Math.abs(st[1] - 130) < 55 * Math.sin(a * Math.PI / 180); return blocked ? '' : `<path d="M${st[0].toFixed(0)} ${st[1]}h${st[2].toFixed(0)}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>`; }).join(''); });
};
})();
