/* 航段三“怎么飞好”的实验：摇杆模拟、旋翼转速、对尾对头、起飞前五查、判断卡、考试卡、两分钟航线 */
(function(){
'use strict';
const A = window.ART, K = window.KIT, L = window.LABS, C = window.DRONE;
const {esc, range, seg, button, loop, lerp, clamp} = K;
const INK = A.INK, TAU = Math.PI * 2;

/* ---------- 双摇杆（美国手） ---------- */
function makeSticks(host, enable, labels){
  host.insertAdjacentHTML('beforeend', `<div class="sticks">
    ${['L','R'].map(side => { const lb = labels[side]; return `<div><div class="pad ${enable[side] ? '' : 'off'}" data-side="${side}" aria-label="${side === 'L' ? '左手摇杆：' : '右手摇杆：'}${lb.join('、')}">
      <div class="cross"></div><span class="lbl t">${lb[0]}</span><span class="lbl b">${lb[1]}</span><span class="lbl l">${lb[2]}</span><span class="lbl r">${lb[3]}</span><div class="hintdot"></div><div class="knob"></div></div>
      <p class="pad-name">${side === 'L' ? '左手' : '右手'}</p></div>`; }).join('')}
  </div>`);
  const v = {L:{x:0, y:0, held:false}, R:{x:0, y:0, held:false}};
  const keys = new Set();
  host.querySelectorAll('.pad').forEach(pad => {
    const side = pad.dataset.side; if(!enable[side]) return;
    const knob = pad.querySelector('.knob');
    const set = (e) => {
      const r = pad.getBoundingClientRect(), R = r.width * .34;
      let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy); if(d > R){ dx *= R / d; dy *= R / d; }
      v[side].x = dx / R; v[side].y = -dy / R;
    };
    pad.addEventListener('pointerdown', e => { e.preventDefault(); pad.setPointerCapture(e.pointerId); v[side].held = true; set(e); });
    pad.addEventListener('pointermove', e => { if(v[side].held) set(e); });
    const up = () => { v[side].held = false; };
    pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up); pad.addEventListener('lostpointercapture', up);
    v[side].el = knob; v[side].pad = pad;
  });
  const kd = e => { if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){ keys.add(e.code); if(e.code.startsWith('Arrow')) e.preventDefault(); } };
  const ku = e => keys.delete(e.code);
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  return {
    read(dt){
      for(const side of ['L','R']){
        if(!enable[side]){ v[side].x = v[side].y = 0; continue; }
        const k = side === 'L' ? ['KeyD','KeyA','KeyW','KeyS'] : ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'];
        const kx = (keys.has(k[0]) ? 1 : 0) - (keys.has(k[1]) ? 1 : 0), ky = (keys.has(k[2]) ? 1 : 0) - (keys.has(k[3]) ? 1 : 0);
        if(kx || ky){ v[side].x = lerp(v[side].x, kx * .7, Math.min(1, dt * 10)); v[side].y = lerp(v[side].y, ky * .7, Math.min(1, dt * 10)); }
        else if(!v[side].held){ const f = Math.min(1, dt * 14); v[side].x = lerp(v[side].x, 0, f); v[side].y = lerp(v[side].y, 0, f); if(Math.abs(v[side].x) < .01) v[side].x = 0; if(Math.abs(v[side].y) < .01) v[side].y = 0; }
        if(v[side].el){ const R = v[side].pad.getBoundingClientRect().width * .34; v[side].el.style.setProperty('--kx', (v[side].x * R).toFixed(1) + 'px'); v[side].el.style.setProperty('--ky', (-v[side].y * R).toFixed(1) + 'px'); }
      }
      return {lx:v.L.x, ly:v.L.y, rx:v.R.x, ry:v.R.y};
    },
    hint(side, dx, dy){
      const pad = host.querySelector(`.pad[data-side="${side}"]`), dot = pad?.querySelector('.hintdot'); if(!dot) return;
      if(dx === null){ dot.classList.remove('on'); return; }
      const R = pad.getBoundingClientRect().width * .3;
      dot.style.setProperty('--hx', (dx * R).toFixed(1) + 'px'); dot.style.setProperty('--hy', (-dy * R).toFixed(1) + 'px'); dot.classList.add('on');
    },
    destroy(){ removeEventListener('keydown', kd); removeEventListener('keyup', ku); }
  };
}

/* 旋翼转速：0 左前（顺时针）1 右前（逆时针）2 左后（逆时针）3 右后（顺时针） */
function mix(on, i){ /* i: {ly, ry, rx, lx} */
  if(!on) return [0,0,0,0];
  const b = .55 + i.ly * .25, p = i.ry * .22, r = i.rx * .22, y = i.lx * .2;
  return [b - p + r - y, b - p - r + y, b + p + r + y, b + p - r - y].map(v => clamp(v, .12, 1));
}

/* ---------- 摇杆模拟：俯视的练习场 ---------- */
L.sim = function(stage, ctl, api){
  const mode = api.frame.mode;
  stage.classList.add('sim');
  const s = K.svg(stage, '0 0 360 270', 'xMidYMid meet');
  const S = 56, ox = 180, oyb = 236;   /* 世界坐标：x 左右，y 往前（远离你），单位米 */
  const sx = x => ox + x * S, sy = y => oyb - y * S;
  const grid = [];
  for(let x = -2.5; x <= 2.51; x += .5) grid.push(`<path d="M${sx(x)} ${sy(0)}V${sy(3.6)}" />`);
  for(let y = 0; y <= 3.61; y += .5) grid.push(`<path d="M${sx(-2.5)} ${sy(y)}H${sx(2.5)}" />`);
  s.innerHTML = `<rect x="${sx(-2.5)}" y="${sy(3.6)}" width="${5 * S}" height="${3.6 * S}" rx="14" fill="#f7fbfe" stroke="#b7c6d6" stroke-width="2"/>
    <g stroke="#d9e3ee" stroke-width="1">${grid.join('')}</g>
    <g id="marks"></g>
    <g transform="translate(${sx(0)} ${sy(1)})"><ellipse rx="22" ry="22" fill="none" stroke="#b7c6d6" stroke-width="2"/><text y="1" text-anchor="middle" dominant-baseline="central" style="font:800 14px var(--round);fill:#9aabbd">H</text></g>
    <g id="shadow"><ellipse rx="20" ry="20" fill="rgba(22,34,54,.16)"/></g>
    <g id="drone">${A.quadTop({id:'sim', accent:api.accent})}</g>
    <g transform="translate(${sx(0)} 258)">${A.pilot(0, 6, api.accent)}<text x="18" y="2" style="font:800 12px var(--round);fill:#56657a">你</text></g>
    <g id="alt" transform="translate(342 30)"><rect x="-7" y="0" width="14" height="190" rx="7" fill="#fff" stroke="#b7c6d6" stroke-width="1.5"/>
      <path d="M-7 ${190 - 76}h14" stroke="#2a6ff0" stroke-width="2"/><text x="-12" y="${190 - 72}" text-anchor="end" style="font:700 10px var(--sans);fill:#2a6ff0">1 米</text>
      <circle id="altm" cx="0" cy="190" r="6" fill="${api.accent}" stroke="#fff" stroke-width="2"/><text x="0" y="206" text-anchor="middle" style="font:700 10px var(--sans);fill:#56657a">高度</text></g>
    <text id="big" x="${sx(0)}" y="${sy(3.3)}" text-anchor="middle" class="svg-label" style="font-size:20px"></text>`;
  const drone = s.querySelector('#drone'), shadow = s.querySelector('#shadow'), marks = s.querySelector('#marks'), altm = s.querySelector('#altm'), big = s.querySelector('#big');
  const discs = [...drone.querySelectorAll('.disc')], blades = [...drone.querySelectorAll('.blade')];
  const enable = {L: mode === 'left', R: mode === 'right' || mode === 'hover'};
  /* 场地、当前这一步、两根摇杆放在一起：眼睛不用在画面和按钮之间来回找 */
  const tl = mode === 'left' || mode === 'right' ? (stage.insertAdjacentHTML('beforeend', '<ol class="simsteps" aria-label="这一关的三步"></ol>'), stage.querySelector('.simsteps')) : null;
  const sticks = makeSticks(stage, enable, {L:['升','降','左转','右转'], R:['前','后','左移','右移']});
  const fine = matchMedia('(pointer:fine)').matches;
  const st = {x:0, y:1, z:0, yaw:0, vx:0, vy:0, vz:0, air:false, spin:0, blade:0};
  let tasks = [], tIdx = 0, dwell = 0, inside = 0, best = 0, hints = true, wind = 0, t0 = Math.random() * 100;
  const center = {x:0, y:1.95};
  const setTasks = list => { tasks = list.map(t => ({...t, ok:false})); tIdx = 0; renderTasks(); };
  const renderTasks = () => { if(tl) tl.innerHTML = tasks.map((t, i) => `<li class="${t.ok ? 'ok' : i === tIdx ? 'now' : ''}"${i === tIdx ? ' aria-current="step"' : ''}><i>${t.ok ? '✓' : i + 1}</i>${esc(t.short)}</li>`).join(''); };
  const stepDone = (finalMsg) => {
    tasks[tIdx].ok = true; tIdx++; renderTasks();
    if(tIdx >= tasks.length){ api.done(); api.hint(finalMsg, 'ok'); }
    else api.hint(`做到了。下一步：${tasks[tIdx].text}。`, 'ok');
  };
  const reset = () => {
    Object.assign(st, {vx:0, vy:0, vz:0, yaw:0, spin:0});
    if(mode === 'left'){ Object.assign(st, {x:0, y:1, z:0, air:false}); }
    else { Object.assign(st, {x:center.x, y:center.y, z:1.2, air:true}); }
    inside = 0; dwell = 0;
  };
  if(mode === 'left'){
    setTasks([{text:'左杆往上推，升到 1 米以上', short:'升到 1 米', k:'up'},{text:'左杆往左或往右拨，原地转一整圈', short:'原地转一圈', k:'spin'},{text:'左杆往下拉，慢慢降落', short:'慢慢降落', k:'land'}]);
    api.hint(`第一步：${tasks[0].text}。彩色护圈那一头是机头。${fine ? '电脑上也可以用 W、A、S、D 键。' : ''}`);
  } else if(mode === 'right'){
    setTasks([{text:'右杆往前推，飞进前面的圈', short:'前面的圈', k:'A', at:{x:0, y:3.0}},{text:'右杆往右拨，飞进右边的圈', short:'右边的圈', k:'B', at:{x:1.6, y:3.0}},{text:'飞回中间的圈', short:'回到中间', k:'C', at:{x:0, y:1.95}}]);
    api.hint(`第一步：${tasks[0].text}。高度会自己保持。${fine ? '电脑上也可以用方向键。' : ''}`);
  } else if(mode === 'watch'){
    wind = .34;
    api.hint('现在没有人碰摇杆，看它会去哪。');
    button(ctl, '把它放回中间', () => { reset(); }, 'btn quiet small');
  } else {
    wind = .2;
    seg(ctl, [['tail','对尾'],['head','对头（难一点）']], 'tail', id => { reset(); st.yaw = id === 'head' ? Math.PI : 0; api.hint(id === 'head' ? '机头对着你：左右是反的。' : '机尾对着你：左右和你一样。'); });
    seg(ctl, [['on','提示点：开'],['off','提示点：关']], 'on', id => { hints = id === 'on'; if(!hints) sticks.hint('R', null); });
    api.hint(`右杆修位置，高度会自己保持。摇杆上的彩色点指着该往哪边带。${fine ? '电脑上也可以用方向键。' : ''}`);
  }
  reset();
  const ringR = mode === 'hover' || mode === 'watch' ? .35 : .38;
  const drawMarks = () => {
    if(mode === 'right') marks.innerHTML = tasks.map((t, i) => `<circle cx="${sx(t.at.x)}" cy="${sy(t.at.y)}" r="${ringR * S}" fill="${i === tIdx ? 'rgba(255,211,107,.35)' : 'none'}" stroke="${t.ok ? '#14936a' : i === tIdx ? '#e0a21a' : '#c7d0dc'}" stroke-width="3" stroke-dasharray="${i === tIdx ? '' : '6 5'}"/>`).join('');
    if(mode === 'hover' || mode === 'watch') marks.innerHTML = `<circle cx="${sx(center.x)}" cy="${sy(center.y)}" r="${ringR * S}" fill="rgba(255,211,107,.3)" stroke="#e0a21a" stroke-width="3"/><circle id="ring" cx="${sx(center.x)}" cy="${sy(center.y)}" r="${ringR * S + 7}" fill="none" stroke="${api.accent}" stroke-width="5" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 ${sx(center.x)} ${sy(center.y)})"/>`;
  };
  drawMarks();
  let lastTask = -1;
  const stop = loop((dt, now) => {
    const i = sticks.read(dt);
    /* 升降：考试机有气压计，摇杆回中就保持高度 */
    if(st.air || i.ly > .2){
      st.vz = lerp(st.vz, i.ly * .85, Math.min(1, dt * 6));
      st.z += st.vz * dt;
      if(st.z <= 0){ st.z = 0; st.vz = 0; if(st.air && i.ly <= 0){ st.air = false; } } else st.air = true;
      st.z = Math.min(2.4, st.z);
    }
    if(st.air){
      const yr = i.lx * Math.PI * .75 * dt; st.yaw += yr; st.spin += yr;
      const fx = Math.sin(st.yaw), fy = Math.cos(st.yaw), rxv = Math.cos(st.yaw), ryv = -Math.sin(st.yaw);
      let ax = (i.rx * rxv + i.ry * fx) * 2.2, ay = (i.rx * ryv + i.ry * fy) * 2.2;
      if(wind){ const t = now + t0; ax += wind * (Math.sin(t * .41) + .6 * Math.sin(t * 1.13 + 2)); ay += wind * (Math.cos(t * .33 + 1) + .6 * Math.sin(t * .87)); }
      st.vx += (ax - st.vx * 1.15) * dt; st.vy += (ay - st.vy * 1.15) * dt;
      st.x += st.vx * dt; st.y += st.vy * dt;
      if(st.x < -2.3 || st.x > 2.3){ st.x = clamp(st.x, -2.3, 2.3); st.vx *= -.3; }
      if(st.y < .2 || st.y > 3.4){ st.y = clamp(st.y, .2, 3.4); st.vy *= -.3; }
    } else { st.vx = st.vy = 0; }
    /* 画 */
    const X = sx(st.x), Y = sy(st.y), lift = st.z * 16, k = .42 * (1 + st.z * .07);
    shadow.setAttribute('transform', `translate(${X.toFixed(1)} ${Y.toFixed(1)}) scale(${(1.15 - st.z * .12).toFixed(2)})`);
    shadow.style.opacity = (.9 - st.z * .2).toFixed(2);
    drone.setAttribute('transform', `translate(${X.toFixed(1)} ${(Y - lift).toFixed(1)}) rotate(${(st.yaw * 180 / Math.PI).toFixed(1)}) scale(${k.toFixed(3)})`);
    altm.setAttribute('cy', (190 - st.z * 76).toFixed(1));
    const m = mix(st.air || i.ly > .2, i);
    st.blade += dt * (api.reduce ? 0 : 40);
    discs.forEach((d, j) => d.setAttribute('opacity', (m[j] * .95).toFixed(2)));
    blades.forEach((b, j) => b.setAttribute('transform', `rotate(${((st.blade * (m[j] + .2) * 57) * A.ROTOR_DIR[j] % 360).toFixed(0)})`));
    blades.forEach((b, j) => b.style.opacity = m[j] > .3 && !api.reduce ? '.35' : '1');
    /* 任务 */
    if(mode === 'left'){
      const t = tasks[tIdx];
      if(t && ((t.k === 'up' && st.z >= 1) || (t.k === 'spin' && Math.abs(st.spin) >= TAU) || (t.k === 'land' && !st.air))) stepDone('三步都做到了：左手管升降和原地转向。');
      const now = tasks[tIdx];
      big.textContent = now && now.k === 'spin' && st.air ? `转了 ${Math.min(360, Math.round(Math.abs(st.spin) * 180 / Math.PI))}°` : '';
      /* 摇杆上的彩色点：这一步该往哪边推 */
      if(!now) sticks.hint('L', null);
      else if(now.k === 'up') sticks.hint('L', 0, 1);
      else if(now.k === 'spin') sticks.hint('L', 1, 0);
      else sticks.hint('L', 0, -1);
    }
    if(mode === 'right'){
      const t = tasks[tIdx];
      if(t){
        const d = Math.hypot(st.x - t.at.x, st.y - t.at.y);
        if(d < ringR){ dwell += dt; if(dwell > .6){ dwell = 0; stepDone('都飞到了：右手管前后和左右，机头一直没转。'); drawMarks(); } } else dwell = 0;
        if(d > ringR * .6){ const n = d || 1; sticks.hint('R', (t.at.x - st.x) / n, (t.at.y - st.y) / n); } else sticks.hint('R', null);
      } else sticks.hint('R', null);
      if(lastTask !== tIdx){ lastTask = tIdx; drawMarks(); }
    }
    if(mode === 'watch'){
      const d = Math.hypot(st.x - center.x, st.y - center.y);
      if(d > .9 && !api.isDone){ api.isDone = true; api.done(); api.hint('它自己飘走了：没有 GPS、光流帮它停在原地。所以要一直小修。', 'ok'); }
    }
    if(mode === 'hover'){
      const dx = st.x - center.x, dy = st.y - center.y, d = Math.hypot(dx, dy);
      if(d < ringR){ inside += dt; } else inside = 0;
      best = Math.max(best, inside);
      const ring = s.querySelector('#ring'); if(ring) ring.setAttribute('stroke-dasharray', `${Math.min(100, inside * 10).toFixed(1)} 100`);
      big.textContent = inside >= 10 ? '10 秒，稳住了' : inside > .2 ? `${inside.toFixed(1)} 秒` : best > 1 ? `最好 ${best.toFixed(1)} 秒` : '';
      if(inside >= 10 && !api._won){ api._won = true; api.done(); api.hint('悬停 10 秒，做到了。试试把提示关掉，或者换成对头。', 'ok'); }
      if(hints){
        /* 往哪边修：和飘动、偏离的方向相反（换算到机身坐标） */
        const wx = -(dx * 1.6 + st.vx), wy = -(dy * 1.6 + st.vy);
        const mag = Math.hypot(wx, wy);
        if(mag > .25 && d > ringR * .45){
          const bxv = wx * Math.cos(st.yaw) - wy * Math.sin(st.yaw), byv = wx * Math.sin(st.yaw) + wy * Math.cos(st.yaw);
          const n = Math.hypot(bxv, byv); sticks.hint('R', bxv / n, byv / n);
        } else sticks.hint('R', null);
      }
    }
  });
  return () => { stop(); sticks.destroy(); };
};

/* ---------- 哪几个旋翼在加速 ---------- */
L.rotors = function(stage, ctl, api){
  const s = K.svg(stage);
  s.innerHTML = `<g id="q" transform="translate(180 128) scale(1.55)">${A.quadTop({id:'rt', accent:api.accent})}</g><g id="lbl"></g><g id="mv"></g>
    <text class="svg-small" x="180" y="24" text-anchor="middle">机头</text>`;
  const q = s.querySelector('#q'), lbl = s.querySelector('#lbl'), mv = s.querySelector('#mv');
  const discs = [...q.querySelectorAll('.disc')], blades = [...q.querySelectorAll('.blade')];
  const acts = {
    hover:[[.5,.5,.5,.5], '四个一样快：向上的力等于重力，停在空中。', null],
    up:[[.95,.95,.95,.95], '四个一起转快：向上的力变大，往上升。', 'up'],
    fwd:[[.32,.32,.92,.92], '后面两个转快：机身往前倾，往前飞。', 'fwd'],
    right:[[.92,.32,.92,.32], '左边两个转快：机身往右倾，往右飞。', 'right'],
    yaw:[[.32,.92,.92,.32], '右前和左后这一对转快：机身原地往右转。', 'yaw']
  };
  let cur = 'hover', ang = 0, bl = 0; const tried = new Set();
  const pos = A.ROTOR_POS.map(([x, y]) => [180 + x * 1.55, 128 + y * 1.55]);
  const draw = () => {
    const [sp, text] = acts[cur];
    lbl.innerHTML = pos.map(([x, y], i) => { const fast = sp[i] > .7, slow = sp[i] < .4; return fast || slow ? `<text class="svg-label" x="${x + (x > 180 ? 38 : -38)}" y="${y + 5}" text-anchor="middle" style="fill:${fast ? '#2a6ff0' : '#697387'}">${fast ? '快' : '慢'}</text>` : ''; }).join('');
    const m = acts[cur][2];
    mv.innerHTML = m === 'up' ? A.arrow(306, 200, 0, -1, 70, 'move') + '<text class="svg-small" x="306" y="220" text-anchor="middle">往上</text>'
      : m === 'fwd' ? A.arrow(306, 160, 0, -1, 70, 'move') + '<text class="svg-small" x="306" y="180" text-anchor="middle">往前</text>'
      : m === 'right' ? A.arrow(290, 236, 1, 0, 56, 'move') + '<text class="svg-small" x="306" y="226" text-anchor="middle">往右</text>'
      : m === 'yaw' ? `<path d="M270 50a70 70 0 0 1 48 44" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><polygon points="322,104 308,92 324,88" fill="${INK}"/><text class="svg-small" x="300" y="40" text-anchor="middle">原地右转</text>` : '';
    api.hint(text, cur === 'hover' ? '' : 'ok');
  };
  seg(ctl, [['hover','悬停'],['up','上升'],['fwd','前进'],['right','向右平移'],['yaw','向右转']], 'hover', id => { cur = id; tried.add(id); draw(); if(tried.size >= 4) api.done(); });
  draw();
  return loop(dt => {
    const sp = acts[cur][0];
    if(!api.reduce) bl += dt * 40;
    discs.forEach((d, i) => d.setAttribute('opacity', (sp[i] * .95).toFixed(2)));
    blades.forEach((b, i) => { b.setAttribute('transform', `rotate(${((bl * sp[i] * 60) * A.ROTOR_DIR[i] % 360).toFixed(0)})`); b.style.opacity = api.reduce ? '1' : '.35'; });
    if(cur === 'yaw' && !api.reduce) ang += dt * 30; else ang = lerp(ang, Math.round(ang / 360) * 360, Math.min(1, dt * 3));
    q.setAttribute('transform', `translate(180 128) rotate(${ang.toFixed(1)}) scale(1.55)`);
  });
};

/* ---------- 对尾、对头 ---------- */
L.orient = function(stage, ctl, api){
  const s = K.svg(stage, '0 0 360 260', 'xMidYMid meet');
  stage.style.background = 'linear-gradient(180deg,#e9f3fb,#dbeaf6)';
  s.innerHTML = `<rect x="40" y="20" width="280" height="180" rx="16" fill="#f7fbfe" stroke="#b7c6d6" stroke-width="2"/>
    <g id="trail"></g><g id="d"><g id="dr">${A.quadTop({id:'or', accent:api.accent})}</g></g>
    ${A.pilot(180, 236, api.accent)}<text x="198" y="232" style="font:800 12px var(--round);fill:#56657a">你</text>
    <text class="svg-small" x="70" y="246" text-anchor="middle">你的左边</text><text class="svg-small" x="290" y="246" text-anchor="middle">你的右边</text>
    <text id="res" class="svg-label" x="180" y="44" text-anchor="middle"></text>`;
  const d = s.querySelector('#d'), dr = s.querySelector('#dr'), trail = s.querySelector('#trail'), res = s.querySelector('#res');
  let yaw = 0, x = 180, target = 180, anim = 0; const tried = new Set();
  const place = () => { d.setAttribute('transform', `translate(${x.toFixed(1)} 112)`); dr.setAttribute('transform', `rotate(${yaw}) scale(.62)`); };
  seg(ctl, [['tail','对尾：机尾对着你'],['head','对头：机头对着你']], 'tail', id => { yaw = id === 'head' ? 180 : 0; x = target = 180; trail.innerHTML = ''; res.textContent = ''; place(); });
  const push = document.createElement('button'); push.type = 'button'; push.className = 'btn primary small'; push.innerHTML = `${A.stickGlyph('right')}右杆往右拨`;
  push.addEventListener('click', () => {
    const dir = yaw === 0 ? 1 : -1; target = 180 + dir * 92; anim = 0;
    trail.innerHTML = A.arrow(180, 112, dir, 0, 80, 'move');
    res.textContent = dir > 0 ? '往你的右边走了' : '往你的左边走了';
    tried.add(yaw); if(tried.size >= 2){ api.done(); api.hint('对尾时左右和你一样；对头时左右反过来。考试从对尾开始。', 'ok'); }
    else api.hint(yaw === 0 ? '对尾：右杆往右，它就往你的右边走。再切到“对头”试试。' : '对头：右杆往右，它却往你的左边走。再切到“对尾”试试。');
  });
  ctl.append(push);
  place();
  return loop(dt => { if(x !== target){ anim = Math.min(1, anim + dt * (api.reduce ? 10 : 1.4)); x = lerp(x, target, anim); if(Math.abs(x - target) < .5) x = target; place(); } });
};

/* ---------- 起飞前五查（盖住说） ---------- */
L.checklist = function(stage, ctl, api){
  stage.classList.add('html'); stage.innerHTML = '';
  const open = new Set();
  const render = () => {
    stage.innerHTML = `<div class="checklist"><header><b>起飞前五查</b><span>${open.size} / 5 已对照</span></header>${C.checklist.map(([n, k, m], i) => `<div class="crow"><div class="ch"><span style="color:var(--muted);min-width:1.4em">${n}</span>${esc(k)}<em aria-hidden="true"></em></div>${open.has(i) ? `<div class="rs">${esc(m)}</div>` : `<button type="button" class="rs cover" data-i="${i}">先自己说，再点开</button>`}</div>`).join('')}</div>`;
    stage.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => { open.add(Number(b.dataset.i)); render(); if(open.size === 5){ api.done(); api.hint('五查都对照过了。出门上课前，当一回机长，把口诀说一遍。', 'ok'); } }));
  };
  button(ctl, '全部盖住，再说一遍', () => { open.clear(); render(); });
  render();
};

/* ---------- 判断卡 ---------- */
L.judge = function(stage, ctl, api){
  stage.classList.add('html');
  const set = C.judge[api.frame.set], labels = api.frame.labels;
  const order = set.map((_, i) => i).sort(() => Math.random() - .5);
  let i = 0, right = 0;
  const show = () => {
    if(i >= order.length){
      stage.innerHTML = `<div class="card judge-card" style="text-align:center"><p class="stmt">${right} / ${order.length} 第一次就判断对了</p><button type="button" class="btn quiet small" id="again" style="justify-self:center">再判断一遍</button></div>`;
      stage.querySelector('#again').addEventListener('click', () => { i = 0; right = 0; show(); });
      api.done(); return;
    }
    const [text, bad, why] = set[order[i]];
    stage.innerHTML = `<div class="card judge-card"><span class="count">第 ${i + 1} 张，共 ${order.length} 张</span><p class="stmt">${esc(text)}</p>
      <div class="two">${labels.map((l, k) => `<button type="button" class="opt" data-k="${k}"><i>${k ? '✕' : '✓'}</i>${esc(l)}</button>`).join('')}</div><div id="jfb" aria-live="polite"></div></div>`;
    stage.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      const k = Number(b.dataset.k), ok = k === bad;
      if(ok) right++;
      stage.querySelectorAll('.opt').forEach(x => { x.disabled = true; x.classList.add(Number(x.dataset.k) === bad ? 'right' : x === b ? 'wrong' : 'dim'); });
      stage.querySelector('#jfb').innerHTML = `<p class="feedback ${ok ? 'ok' : 'no'}"><b>${ok ? '对。' : `应该是“${esc(labels[bad])}”。`}</b> ${esc(why)}</p><div style="display:flex;justify-content:flex-end;margin-top:10px"><button type="button" class="btn primary small" id="jn">${i + 1 >= order.length ? '看结果' : '下一张'}</button></div>`;
      const n = stage.querySelector('#jn'); n.addEventListener('click', () => { i++; show(); }); n.focus({preventScroll:true});
    }));
  };
  show();
};

/* ---------- 二级考什么 ---------- */
L.examcard = function(stage, ctl, api){
  const s = K.svg(stage, '0 0 360 260', 'xMidYMid meet');
  stage.style.background = 'linear-gradient(180deg,#e9f3fb,#dbeaf6)';
  s.innerHTML = `
    <g transform="translate(18 26)"><rect width="156" height="206" rx="20" fill="#fff"/>
      <text x="78" y="30" text-anchor="middle" class="svg-small">理论机考</text>
      <rect x="22" y="44" width="112" height="72" rx="8" fill="#162236"/><path d="M12 124h132l-10 10H22z" fill="#c7d0dc"/>
      <text x="78" y="88" text-anchor="middle" style="font:800 30px var(--round);fill:#fff">40 题</text>
      <text x="78" y="166" text-anchor="middle" style="font:800 19px var(--round);fill:#162236">答对 30 题</text>
      <text x="78" y="192" text-anchor="middle" style="font:700 14px var(--sans);fill:#697387">30 分钟</text></g>
    <g transform="translate(186 26)"><rect width="156" height="206" rx="20" fill="#fff"/>
      <text x="78" y="30" text-anchor="middle" class="svg-small">现场飞行</text>
      <circle cx="78" cy="92" r="44" fill="#fff" stroke="#162236" stroke-width="5"/><path d="M70 42h16M78 42v6" stroke="#162236" stroke-width="5" stroke-linecap="round"/>
      <text x="78" y="102" text-anchor="middle" style="font:800 26px var(--round);fill:#162236">2:00</text>
      <text x="78" y="166" text-anchor="middle" style="font:800 15px var(--round);fill:#162236">科目一 + 科目二</text>
      <text x="78" y="190" text-anchor="middle" style="font:700 12.5px var(--sans);fill:#697387">回起点悬停 10 秒再降落</text></g>`;
  api.done();
};

/* ---------- 两分钟航线（按官方示意图） ---------- */
L.route = function(stage, ctl, api){
  const s = K.svg(stage, '0 0 360 260', 'xMidYMid meet');
  const S = 62, P = (x, y, z=0) => [143 + x * S + y * S * .38, 222 - z * S - y * S * .36];
  const pt = (x, y, z) => P(x, y, z).map(v => v.toFixed(1)).join(' ');
  const pad = [0, .45], pole = [-.95, 2.15], bar = {x:1.0, y0:1.55, y1:2.75, z:1.0}, H = 1.1;
  /* 每段的点（世界坐标） */
  const lineSeg = (a, b, n=24) => Array.from({length:n + 1}, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n), lerp(a[2], b[2], i / n)]);
  const orbit = Array.from({length:61}, (_, i) => { const t = -Math.PI / 2 - i / 60 * Math.PI * 2; return [pole[0] + .62 * Math.cos(t), pole[1] + .62 * Math.sin(t), H]; });
  const loopC = [bar.x, (bar.y0 + bar.y1) / 2, bar.z], r = .46;
  const vloop = Array.from({length:61}, (_, i) => { const f = Math.PI - i / 60 * Math.PI * 2; return [loopC[0] + r * Math.cos(f), loopC[1], loopC[2] + r * Math.sin(f)]; });
  const segs = [
    {t:'起飞', sec:8, L:'up', R:'hold', tip:'左杆慢慢往上推，升到大约齐眼的高度，稳住。', pts:lineSeg([pad[0], pad[1], 0], [pad[0], pad[1], H])},
    {t:'飞到立杆', sec:8, L:'hold', R:'up', tip:'右杆往前推，快到立杆前提前减速。', pts:lineSeg([pad[0], pad[1], H], orbit[0])},
    {t:'科目一：绕立杆一圈', sec:26, L:'right', R:'up', tip:'绕着立杆水平飞一圈，方向随意。高度不变，眼睛盯住杆，杆量小、转弯顺。', pts:orbit},
    {t:'飞到横杆', sec:10, L:'hold', R:'right', tip:'右杆往右，飞到横杆的一侧，和横杆一样高。', pts:lineSeg(orbit[60], vloop[0])},
    {t:'科目二：绕横杆竖着一圈', sec:26, steps:[['up',null,'升'],[null,'right','越过'],['down',null,'降'],[null,'left','从下面穿回'],['up',null,'升回']], tip:'升高越过横杆，降到横杆下面，再从下面穿回来，回到原来的高度。方向也可以反过来。', pts:vloop},
    {t:'回到起飞点', sec:12, L:'hold', R:'down', tip:'飞回起飞点上方，提前减速，别冲过头。', pts:lineSeg(vloop[60], [pad[0], pad[1], H])},
    {t:'悬停 10 秒', sec:10, L:'hold', R:'hold', tip:'对尾悬停 10 秒：飘哪边，就往反方向轻轻带一点。', pts:Array.from({length:20}, () => [pad[0], pad[1], H])},
    {t:'匀速降落', sec:6, L:'down', R:'hold', tip:'左杆慢慢往下，匀速降落；落地后把油门收到底。', pts:lineSeg([pad[0], pad[1], H], [pad[0], pad[1], 0])}
  ];
  const total = segs.reduce((a, b) => a + b.sec, 0);
  const pathD = pts => 'M' + pts.map(p => pt(...p)).join(' L');
  const poleBase = P(pole[0], pole[1]), poleTop = P(pole[0], pole[1], 1.75);
  const b0b = P(bar.x, bar.y0), b0t = P(bar.x, bar.y0, 1.55), b1b = P(bar.x, bar.y1), b1t = P(bar.x, bar.y1, 1.55);
  const corner = [P(-1.9, 0), P(1.9, 0), P(1.9, 3.3), P(-1.9, 3.3)];
  s.innerHTML = `<polygon points="${corner.map(c => c.join(',')).join(' ')}" fill="#cfe6d8" stroke="#a9c9b6" stroke-width="2"/>
    <g id="paths">${segs.map((g, i) => `<path data-i="${i}" d="${pathD(g.pts)}" fill="none" stroke="#7d8ca0" stroke-width="2" stroke-dasharray="4 5" opacity=".55"/>`).join('')}</g>
    <g transform="translate(${P(pad[0], pad[1]).join(' ')})"><ellipse rx="24" ry="9" fill="#fff" stroke="#8a99ad" stroke-width="1.6"/><text y="1" text-anchor="middle" dominant-baseline="central" style="font:800 10px var(--round);fill:#697387">起飞点</text></g>
    <g><ellipse cx="${poleBase[0]}" cy="${poleBase[1]}" rx="9" ry="4" fill="#ffb24a"/><path d="M${poleBase[0]} ${poleBase[1]}V${poleTop[1]}" stroke="#f08a2c" stroke-width="4" stroke-linecap="round"/><ellipse cx="${poleTop[0]}" cy="${poleTop[1]}" rx="7" ry="3" fill="#ffb24a"/>
      <text class="svg-small" x="${poleTop[0]}" y="${poleTop[1] - 10}" text-anchor="middle">立杆</text></g>
    <g><ellipse cx="${b1b[0]}" cy="${b1b[1]}" rx="8" ry="3.5" fill="#ffb24a"/><path d="M${b1b[0]} ${b1b[1]}V${b1t[1]}" stroke="#f08a2c" stroke-width="4" stroke-linecap="round"/>
      <path d="M${pt(bar.x, bar.y0, bar.z)}L${pt(bar.x, bar.y1, bar.z)}" stroke="#f08a2c" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="${b0b[0]}" cy="${b0b[1]}" rx="9" ry="4" fill="#ffb24a"/><path d="M${b0b[0]} ${b0b[1]}V${b0t[1]}" stroke="#f08a2c" stroke-width="4" stroke-linecap="round"/>
      <text class="svg-small" x="${b1t[0] + 4}" y="${b1t[1] - 10}" text-anchor="middle">横杆</text></g>
    <g id="sh"><ellipse rx="13" ry="5" fill="rgba(22,34,54,.2)"/></g>
    <g id="dr"><g transform="scale(1.15)">${A.quad34(api.accent)}</g></g>
    <text id="clock" x="340" y="236" text-anchor="end" style="font:800 20px var(--round);fill:#162236" class="num">0:00</text>
    <text x="340" y="252" text-anchor="end" style="font:700 11px var(--sans);fill:#697387">考试计时（加快播放）</text>`;
  const dr = s.querySelector('#dr'), sh = s.querySelector('#sh'), clock = s.querySelector('#clock');
  ctl.innerHTML = `<div class="route-ctl"><div class="seg" role="group" aria-label="播放控制"><button type="button" id="rp">播放</button><button type="button" id="rb">上一段</button><button type="button" id="rf">下一段</button></div>
    <div class="segcard" id="sc"></div>
    <div class="budget" aria-label="两分钟时间分配">${segs.map((g, i) => `<i data-i="${i}" style="flex:${g.sec}"></i>`).join('')}<i class="spare" style="flex:${C.exam.flySeconds - total}"></i></div>
    <p class="budget-note">参考分配：一共约 ${total} 秒，比 2 分钟少 ${C.exam.flySeconds - total} 秒，留作余量。</p></div>`;
  let cur = 0, u = 0, playing = false, seen = new Set([0]);
  const glyphs = g => g.steps ? `<div class="stepglyphs">${g.steps.map(([l, r, t]) => `<div>${A.stickGlyph(l || null)}${A.stickGlyph(r || null)}<span>${t}</span></div>`).join('')}</div>`
    : `<div class="hands"><div>${A.stickGlyph(g.L === 'hold' ? 'hold' : g.L === 'right' ? 'right' : g.L)}<span>左手</span></div><div>${A.stickGlyph(g.R === 'hold' ? 'hold' : g.R)}<span>右手</span></div></div>`;
  const showSeg = () => {
    const g = segs[cur];
    ctl.querySelector('#sc').innerHTML = `<b>第 ${cur + 1} 段　${esc(g.t)}</b><span class="secs">约 ${g.sec} 秒</span>${glyphs(g)}<p>${esc(g.tip)}${cur === 2 ? '（机头跟着转时，左杆往绕的方向轻拨；机头不转，就只用右杆画圈。）' : ''}</p>`;
    s.querySelectorAll('#paths path').forEach(p => { const on = Number(p.dataset.i) === cur; p.setAttribute('stroke', on ? api.accent : '#7d8ca0'); p.setAttribute('stroke-width', on ? '3.5' : '2'); p.setAttribute('opacity', on ? '1' : '.5'); p.setAttribute('stroke-dasharray', on ? '' : '4 5'); });
    ctl.querySelectorAll('.budget i[data-i]').forEach(b => b.classList.toggle('on', Number(b.dataset.i) === cur));
    seen.add(cur); if(seen.size === segs.length){ api.done(); }
  };
  const goto = i => { cur = (i + segs.length) % segs.length; u = 0; showSeg(); };
  ctl.querySelector('#rp').addEventListener('click', e => { playing = !playing; e.target.textContent = playing ? '暂停' : '播放'; e.target.setAttribute('aria-pressed', String(playing)); });
  ctl.querySelector('#rb').addEventListener('click', () => goto(cur - 1));
  ctl.querySelector('#rf').addEventListener('click', () => goto(cur + 1));
  showSeg();
  const before = i => segs.slice(0, i).reduce((a, b) => a + b.sec, 0);
  return loop(dt => {
    const g = segs[cur];
    if(playing){ u += dt * 4 / g.sec; if(u >= 1){ if(cur === segs.length - 1){ playing = false; u = 1; ctl.querySelector('#rp').textContent = '播放'; } else { cur++; u = 0; showSeg(); } } }
    const n = g.pts.length - 1, f = Math.min(n, u * n), i0 = Math.floor(f), i1 = Math.min(n, i0 + 1), k = f - i0;
    const p = [0, 1, 2].map(j => lerp(g.pts[i0][j], g.pts[i1][j], k));
    const [X, Y] = P(...p), [gx, gy] = P(p[0], p[1], 0);
    dr.setAttribute('transform', `translate(${X.toFixed(1)} ${Y.toFixed(1)})`);
    sh.setAttribute('transform', `translate(${gx.toFixed(1)} ${gy.toFixed(1)}) scale(${(1 - p[2] * .2).toFixed(2)})`);
    const tsec = Math.round(before(cur) + u * g.sec);
    clock.textContent = `${Math.floor(tsec / 60)}:${String(tsec % 60).padStart(2, '0')}`;
  });
};
})();
