/* 两枚徽章诞生记 —— 插图（SVG，按两件作品的真实灯位画） */
window.ART = (function(){
'use strict';
let uid = 0;
const U = () => 'a' + (++uid);
const svg = (vb, inner, cls='', label='') => `<svg class="art ${cls}" viewBox="${vb}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${inner}</svg>`;
const L = () => window.BADGE.layout;

/* ---------- 徽章正面（贴纸图案 + 七颗灯），灯是 <g class="led" data-id>，亮不亮由 CSS 的 .on 控制 ---------- */
function badgeFace(kid, {extra='', title=true} = {}){
  const lay = L()[kid], id = U(), S = 10;          // 1 毫米 = 10 个单位，贴纸 46×46
  const isK = kid === 'kenton';
  const bg = isK
    ? `<radialGradient id="${id}bg" cx="50%" cy="48%" r="70%"><stop offset="0" stop-color="#21407f"/><stop offset=".55" stop-color="#11214d"/><stop offset="1" stop-color="#080f2a"/></radialGradient>`
    : `<radialGradient id="${id}bg" cx="50%" cy="58%" r="72%"><stop offset="0" stop-color="#43308a"/><stop offset=".55" stop-color="#241650"/><stop offset="1" stop-color="#120a2c"/></radialGradient>`;
  const defs = `<defs>${bg}
    <radialGradient id="${id}gb"><stop offset="0" stop-color="#e9f6ff" stop-opacity="1"/><stop offset=".25" stop-color="#8fd0ff" stop-opacity=".95"/><stop offset=".6" stop-color="#3f8dff" stop-opacity=".35"/><stop offset="1" stop-color="#3f8dff" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}gy"><stop offset="0" stop-color="#fffbe8" stop-opacity="1"/><stop offset=".25" stop-color="#ffe08a" stop-opacity=".95"/><stop offset=".6" stop-color="#ffb340" stop-opacity=".35"/><stop offset="1" stop-color="#ffb340" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}lens" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs>`;
  let stars = '';
  for(let i = 0; i < 26; i++){ const x = (i * 97 + 31) % 440 + 10, y = (i * 61 + 17) % 440 + 10, r = i % 3 ? .9 : 1.5; stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${.25 + (i % 5) * .1}"/>`; }
  let art = '';
  if(isK){
    art = `<circle cx="230" cy="230" r="150" fill="none" stroke="#9cc3ff" stroke-opacity=".38" stroke-width="2.6"/>
      <circle cx="230" cy="230" r="44" fill="none" stroke="#f4c96d" stroke-opacity=".22" stroke-width="1.6"/>
      <path d="M128 120 a150 150 0 0 0 -30 52" fill="none" stroke="#f4c96d" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>
      <path d="M93 160 l5 14 l11 -10" fill="none" stroke="#f4c96d" stroke-opacity=".8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${title ? '<text x="430" y="40" text-anchor="end" class="face-title" fill="#f4d48d">换心不换轨</text>' : ''}`;
  } else {
    art = `<path d="M80 280 C80 168 150 96 230 90 C310 96 380 168 380 280" fill="none" stroke="#c9b8ff" stroke-opacity=".5" stroke-width="3"/>
      <path d="M118 258 C150 210 200 196 230 196 C260 196 310 210 342 258" fill="none" stroke="#c9b8ff" stroke-opacity=".16" stroke-width="2"/>
      <path d="M150 240 C180 222 205 218 230 218 C255 218 280 222 310 240" fill="none" stroke="#c9b8ff" stroke-opacity=".12" stroke-width="2"/>
      <path d="M80 280 L380 280" fill="none" stroke="#ffd98a" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>
      <text x="80" y="334" text-anchor="middle" class="face-ab">A</text><text x="380" y="334" text-anchor="middle" class="face-ab">B</text>
      ${title ? '<text x="230" y="44" text-anchor="middle" class="face-title" fill="#e6dcff">虫洞之桥</text>' : ''}`;
  }
  let leds = '';
  for(const [k, [x, y]] of Object.entries(lay.leds)){
    const yellow = !isK || lay.color[k] === 'sun';
    leds += `<g class="led ${yellow ? 'y' : 'b'}" data-id="${k}" transform="translate(${x * S} ${y * S})">
      <circle class="glow" r="${yellow && isK ? 70 : 52}" fill="url(#${id}${yellow ? 'gy' : 'gb'})"/>
      <circle class="lens" r="16"/><circle r="16" fill="url(#${id}lens)"/>
    </g>`;
  }
  return `${defs}<rect x="0" y="0" width="460" height="460" rx="40" fill="url(#${id}bg)"/>${stars}${art}${extra}<g class="leds">${leds}</g>`;
}
function badge(kid, cls='', label=''){ return svg('0 0 460 460', badgeFace(kid), 'badge ' + cls, label); }

/* ---------- 断线小实验：七个短脚串成一串 + 一根地线到主板 ---------- */
function chain(kid){
  const lay = L()[kid], S = 10, M = 30, P = k => lay.leds[k].map(v => v * S);
  let links = '';
  const seg = (a, b, i, extra='') => {
    const [x1, y1] = P(a), [x2, y2] = P(b);
    return `<g class="link ${extra}" data-link="${i}" tabindex="0" role="button" aria-label="${extra ? '两头之间的连线' : '短黑线'}">
      <line class="hit" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
      <line class="wire" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
      <g class="cut" transform="translate(${(x1 + x2) / 2} ${(y1 + y2) / 2})"><circle r="15"/><path d="M-6 -6 L6 6 M6 -6 L-6 6"/></g></g>`;
  };
  for(let i = 0; i < lay.chain.length - 1; i++) links += seg(lay.chain[i], lay.chain[i + 1], i);
  links += seg(lay.close[0], lay.close[1], 'ring', 'ring');
  // 地线绕到徽章外面，不压住短黑线：哥哥从左上那颗往上绕，弟弟从桥 1 往下绕
  const [gx0, gy0] = P(lay.gnd), gx = gx0 + M, gy = gy0 + M, top = kid === 'kenton';
  const by = top ? 330 : 330, dot = top ? [600, 330] : [600, 450];
  const d = top ? `M${gx} ${gy} C${gx - 30} ${gy - 80} ${gx + 20} 18 ${gx + 140} 14 C420 10 600 40 ${dot[0]} ${dot[1]}`
                : `M${gx} ${gy} C${gx} ${gy + 120} ${gx + 20} 512 ${gx + 130} 512 C470 514 600 512 ${dot[0]} ${dot[1]}`;
  const mid = top ? [430, 18] : [470, 513];
  const gnd = `<g class="link gnd" data-link="gnd" tabindex="0" role="button" aria-label="接到主板的地线">
    <path class="hit" d="${d}"/><path class="wire" d="${d}"/>
    <g class="cut" transform="translate(${mid[0]} ${mid[1]})"><circle r="15"/><path d="M-6 -6 L6 6 M6 -6 L-6 6"/></g></g>
    <g class="board"><rect x="556" y="${by}" width="132" height="120" rx="16"/><text x="622" y="${by + 54}" text-anchor="middle">主板</text><text x="622" y="${by + 84}" text-anchor="middle" class="sm">GND</text><circle cx="${dot[0]}" cy="${dot[1]}" r="7"/></g>`;
  return svg('0 0 700 530', `<g transform="translate(${M} ${M})">${badgeFace(kid, {title:false, extra:`<g class="links">${links}</g>`})}</g>` + gnd, 'chain', '断线小实验');
}

/* ---------- 电走一个圈 ---------- */
function circuit(){
  const id = U();
  return svg('0 0 400 260', `<defs><radialGradient id="${id}g"><stop offset="0" stop-color="#fffbe8"/><stop offset=".3" stop-color="#ffe08a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb340" stop-opacity="0"/></radialGradient></defs>
    <path class="loop" d="M60 70 H170 M230 70 H340 V190 H60 V70"/>
    <path class="flow" d="M60 130 V70 H340 V190 H60 Z"/>
    <g class="bat"><rect x="38" y="112" width="44" height="40" rx="6"/><path d="M48 126 h24 M54 138 h12"/><text x="60" y="176" text-anchor="middle">电池</text></g>
    <g class="sw"><circle cx="170" cy="70" r="5"/><circle cx="230" cy="70" r="5"/><path class="lever" d="M170 70 L226 70"/><text x="200" y="48" text-anchor="middle">开关</text></g>
    <g class="res"><rect x="270" y="58" width="48" height="24" rx="6"/><path d="M276 70 l5 -7 l7 14 l7 -14 l7 14 l7 -14 l4 7"/><text x="294" y="46" text-anchor="middle">电阻</text></g>
    <g class="ledsym" transform="translate(340 130)"><circle class="g" r="46" fill="url(#${id}g)"/><g class="sym"><path d="M-14 -12 L14 -12 L0 12 Z"/><path d="M-14 12 H14"/></g><text x="34" y="5">灯</text><text class="pm" x="-26" y="-18">+</text><text class="pm" x="-26" y="30">−</text></g>`, 'circuit', '电池、开关、电阻和灯连成一个圈');
}

/* ---------- 七颗灯各走一条路：主板脚 → 电阻 → 灯 → 地线 ---------- */
function pins(kid){
  const isK = kid === 'kenton';
  const names = isK ? ['顶部','右上','右下','底部','左下','左上','中心'] : ['A','上1','上2','上3','B','桥1','桥2'];
  const ohm = i => (isK && i < 6) ? '330Ω' : '1kΩ';
  const yel = i => !isK || i === 6;
  let rows = '';
  for(let i = 0; i < 7; i++){
    const y = 34 + i * 50;
    rows += `<g class="pin" data-i="${i}" tabindex="0" role="button" aria-label="D${i} 送电">
      <rect class="hit" x="0" y="${y - 24}" width="420" height="48"/>
      <rect class="pill" x="4" y="${y - 17}" width="66" height="34" rx="17"/><text class="pn" x="37" y="${y + 6}" text-anchor="middle">D${i}</text>
      <path class="w" d="M70 ${y} H108 M170 ${y} H204 M240 ${y} H372"/><path class="fl" d="M70 ${y} H108 M170 ${y} H204 M240 ${y} H372"/>
      <rect class="rz" x="108" y="${y - 14}" width="62" height="28" rx="7"/><text class="oh" x="139" y="${y + 6}" text-anchor="middle">${ohm(i)}</text>
      <g transform="translate(222 ${y})" class="ls ${yel(i) ? 'y' : 'b'}"><circle class="gl" r="24"/><path d="M-11 -10 L-11 10 L9 0 Z"/><path d="M9 -10 V10"/></g>
      <text class="nm" x="256" y="${y - 7}">${names[i]}</text>
    </g>`;
  }
  return svg('0 0 420 370', `${rows}<path class="bus" d="M372 14 V354"/><text class="busl" x="384" y="140">GND 地线</text>`, 'pins', '主板的 D0 到 D6 各接一颗灯');
}

/* ---------- 焊点切面：good 好焊点、ball 虚焊、cold 冷焊 ---------- */
function joint(kind){
  const id = U();
  const defs = `<defs>
    <linearGradient id="${id}cu" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f5cf7a"/><stop offset="1" stop-color="#b9822f"/></linearGradient>
    <linearGradient id="${id}pin" x1="0" x2="1"><stop offset="0" stop-color="#8d96a3"/><stop offset=".45" stop-color="#eef2f7"/><stop offset="1" stop-color="#7c8592"/></linearGradient>
    <linearGradient id="${id}sn" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fbfdff"/><stop offset=".35" stop-color="#c9d1dc"/><stop offset=".7" stop-color="#8f99a7"/><stop offset="1" stop-color="#d8dee7"/></linearGradient>
    <linearGradient id="${id}dull" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#a3a6aa"/><stop offset=".6" stop-color="#7b7f85"/><stop offset="1" stop-color="#8e9196"/></linearGradient></defs>`;
  const board = `<rect x="20" y="132" width="200" height="26" rx="3" fill="#1d3b33"/><rect x="20" y="132" width="200" height="4" fill="#2e5a4e"/>
    <rect x="62" y="124" width="116" height="9" rx="2" fill="url(#${id}cu)"/><rect x="112" y="124" width="16" height="36" fill="#0e1f1a"/>`;
  const pin = `<rect x="114" y="24" width="12" height="150" rx="2" fill="url(#${id}pin)"/>`;
  let solder = '';
  if(kind === 'good'){
    solder = `<path d="M64 125 C92 123 108 108 114 66 L126 66 C132 108 148 123 176 125 Z" fill="url(#${id}sn)"/>
      <path d="M84 118 C100 112 109 100 112 80" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/>`;
  } else if(kind === 'ball'){
    solder = `<ellipse cx="120" cy="74" rx="31" ry="27" fill="url(#${id}sn)"/><ellipse cx="108" cy="62" rx="9" ry="5.5" fill="#fff" opacity=".75"/>
      <ellipse cx="120" cy="121" rx="34" ry="3" fill="#000" opacity=".35"/>`;
  } else {
    solder = `<path d="M66 125 C74 112 86 114 92 100 C98 88 106 92 112 70 L128 70 C132 90 142 88 148 100 C154 112 166 112 174 125 Z" fill="url(#${id}dull)"/>
      <path d="M94 114 l8 -7 l-3 -7 l8 -6 M142 108 l-7 7 l4 6 M118 96 l4 6 l-3 5" fill="none" stroke="#2e3136" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="104" cy="96" r="2" fill="#5e6267"/><circle cx="136" cy="92" r="1.6" fill="#5e6267"/><circle cx="150" cy="114" r="1.6" fill="#5e6267"/>`;
  }
  return svg('36 34 168 132', defs + board + pin + solder, 'joint', kind === 'good' ? '好焊点' : kind === 'ball' ? '虚焊' : '冷焊');
}

/* ---------- 下一版：电路板当前盖（示意） ---------- */
function pcb(kid){
  const lay = L()[kid], id = U(), isK = kid === 'kenton', S = 10, O = 10;   // 板 48×48，贴纸区偏移 1 毫米
  const mask = isK ? ['#13285d', '#0a1636'] : ['#2b1a5c', '#150c33'];
  const P = k => lay.leds[k].map(v => v * S + O);
  const cx = 240, cy = 250, xw = 176, xh = 212;                          // 背面主板 XIAO 的位置（虚线）
  const keys = Object.keys(lay.leds);
  // 每颗灯按角度就近接到一个过孔
  const ang = k => { const [x, y] = P(k); return Math.atan2(y - cy, x - cx); };
  const order = keys.slice().sort((a, b) => ang(a) - ang(b));
  const viaAll = [];
  for(let i = 0; i < 7; i++){ viaAll.push([cx - xw / 2 + 10, cy - xh / 2 + 24 + i * 27]); viaAll.push([cx + xw / 2 - 10, cy - xh / 2 + 24 + i * 27]); }
  let traces = '', parts = '';
  const used = new Set();
  order.forEach(k => {
    const [x, y] = P(k);
    let best = -1, bd = 1e9;
    viaAll.forEach((v, j) => { if(used.has(j)) return; const d = Math.hypot(v[0] - x, v[1] - y); if(d < bd){ bd = d; best = j; } });
    used.add(best);
    const [vx, vy] = viaAll[best];
    const rx = x + (vx - x) * .42, ry = y + (vy - y) * .42;                // 电阻放在灯和过孔之间
    const mx = Math.abs(vx - x) > Math.abs(vy - y) ? [x + Math.sign(vx - x) * Math.abs(vy - y), vy] : [vx, y + Math.sign(vy - y) * Math.abs(vx - x)];
    traces += `<path d="M${x} ${y} L${mx[0]} ${mx[1]} L${vx} ${vy}"/>`;
    parts += `<g transform="translate(${rx} ${ry}) rotate(${Math.atan2(vy - y, vx - x) * 180 / Math.PI})"><rect x="-11" y="-5" width="22" height="10" rx="1.5" fill="#15171c"/><rect x="-13" y="-5" width="5" height="10" fill="#e9c36f"/><rect x="8" y="-5" width="5" height="10" fill="#e9c36f"/></g>`;
    const yellow = !isK || lay.color[k] === 'sun';
    parts += `<g transform="translate(${x} ${y})"><rect x="-17" y="-12" width="34" height="24" rx="3" fill="#f2f0ea"/><rect x="-21" y="-9" width="6" height="18" fill="#e9c36f"/><rect x="15" y="-9" width="6" height="18" fill="#e9c36f"/><circle r="8.5" fill="${yellow ? '#ffd36b' : '#8fd0ff'}"/><circle r="8.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/></g>`;
  });
  let viaSvg = [...used].map(j => viaAll[j]).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="#0c0f16" stroke="#e9c36f" stroke-width="3"/>`).join('');
  const silk = isK
    ? `<circle cx="240" cy="240" r="150" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-dasharray="3 7"/><text x="240" y="52" text-anchor="middle" class="silk">换心不换轨</text>`
    : `<path d="M90 290 C90 178 160 106 240 100 C320 106 390 178 390 290" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-dasharray="3 7"/><text x="240" y="54" text-anchor="middle" class="silk">虫洞之桥</text>`;
  return svg('0 0 480 480', `<defs><linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mask[0]}"/><stop offset="1" stop-color="${mask[1]}"/></linearGradient></defs>
    <rect x="0" y="0" width="480" height="480" rx="44" fill="url(#${id}m)"/><rect x="5" y="5" width="470" height="470" rx="40" fill="none" stroke="#e9c36f" stroke-opacity=".35" stroke-width="2"/>
    ${[[40, 40], [440, 40], [40, 440], [440, 440]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="#06080d" stroke="#e9c36f" stroke-width="5"/>`).join('')}
    ${silk}
    <rect x="${cx - xw / 2}" y="${cy - xh / 2}" width="${xw}" height="${xh}" rx="12" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="8 6"/>
    <text x="${cx}" y="${cy + xh / 2 - 14}" text-anchor="middle" class="silk sm">背面：主板</text>
    <g class="tr">${traces}</g>${viaSvg}${parts}
    <g transform="translate(240 452)"><rect x="-34" y="-16" width="68" height="26" rx="4" fill="#f3efe4"/><rect x="-24" y="-10" width="48" height="14" rx="2" fill="#d8d0bd"/><text y="-24" text-anchor="middle" class="silk sm">电池插座</text></g>
    <g transform="translate(110 452)"><rect x="-26" y="-12" width="52" height="20" rx="3" fill="#c7ccd4"/><rect x="-6" y="-20" width="12" height="10" rx="2" fill="#2a2f38"/></g>
    <g transform="translate(370 452)"><rect x="-26" y="-12" width="52" height="20" rx="3" fill="#c7ccd4"/><rect x="-6" y="-20" width="12" height="10" rx="2" fill="#2a2f38"/></g>`, 'pcb', '下一版电路板示意');
}

/* ---------- 工厂贴片五步 ---------- */
function smt(step){
  const board = (y=120, w=260) => `<rect x="${180 - w / 2}" y="${y}" width="${w}" height="44" rx="6" fill="#16362e" stroke="#2f6b5b" stroke-width="2"/>`;
  const pads = (y=118, cls='pad') => [70, 112, 154, 206, 248, 290].map(x => `<rect class="${cls}" x="${x - 10}" y="${y}" width="20" height="8" rx="2"/>`).join('');
  const scenes = {
    1: `<rect x="70" y="22" width="220" height="140" rx="12" class="frame"/><rect x="160" y="162" width="40" height="14" class="frame"/><rect x="120" y="176" width="120" height="6" rx="3" class="frame"/>
        <rect x="112" y="44" width="136" height="96" rx="10" class="pcbline"/><path class="trace" d="M132 66 H176 L196 86 H228 M132 118 H160 L182 96 M210 118 H228"/>
        ${[[132, 66], [228, 86], [132, 118], [182, 96], [210, 118], [228, 118]].map(([x, y]) => `<circle class="viad" cx="${x}" cy="${y}" r="5"/>`).join('')}
        <path class="cursor" d="M238 128 l0 22 l6 -6 l5 10 l5 -2 l-5 -10 l8 0 Z"/>`,
    2: `${board()}<path class="trace" d="M80 136 H150 L166 150 H280"/><path class="trace" d="M90 152 H130"/>
        ${[96, 150, 214, 268].map(x => `<circle cx="${x}" cy="132" r="5" fill="#0b1210" stroke="#e9c36f" stroke-width="2.5"/>`).join('')}
        <g class="drill"><rect x="208" y="40" width="12" height="54" rx="3"/><path d="M208 94 L214 112 L220 94 Z"/></g>
        <text x="180" y="190" text-anchor="middle" class="cap">铜线路 · 钻孔 · 保护漆 · 印字</text>`,
    3: `${board()}${pads(116, 'pad')}${pads(116, 'paste')}
        <rect x="46" y="98" width="268" height="12" rx="3" class="stencil"/>${[70, 112, 154, 206, 248, 290].map(x => `<rect x="${x - 10}" y="98" width="20" height="12" fill="#0b1324"/>`).join('')}
        <g class="squeegee"><rect x="-6" y="30" width="12" height="66" rx="3"/><rect x="-30" y="22" width="60" height="14" rx="4"/></g>`,
    4: `${board()}${pads(116, 'pad')}
        ${[70, 112, 154].map(x => `<rect x="${x - 15}" y="104" width="30" height="14" rx="2" class="chip"/>`).join('')}
        <g class="nozzle"><rect x="196" y="10" width="20" height="58" rx="4"/><rect x="202" y="68" width="8" height="18"/><rect x="191" y="86" width="30" height="14" rx="2" class="chip"/></g>
        <path d="M150 40 h34" class="arrowl"/><path d="M178 34 l8 6 l-8 6" class="arrowl"/>`,
    5: `<rect x="96" y="40" width="168" height="110" rx="14" class="oven"/>
        ${[0, 1, 2].map(i => `<path class="heat" style="animation-delay:${i * .3}s" d="M${140 + i * 40} 120 c-8 -10 8 -18 0 -28 c-8 -10 8 -18 0 -28"/>`).join('')}
        <rect x="20" y="150" width="320" height="10" rx="5" class="belt"/>
        <g class="ride">${board(118, 90).replace('x="135"', 'x="0"')}</g>
        <text x="180" y="190" text-anchor="middle" class="cap">两百多度，所有锡膏一起熔化</text>`
  };
  return svg('0 0 360 200', scenes[step], 'smt s' + step, '贴片第 ' + step + ' 步');
}

/* ---------- USB 线里的四根线 ---------- */
function usb(){
  const leg = [['#ff5a5f','电','电源 +5 伏','p'],['#232833','地','地线','p'],['#3ccf7c','D+','数据 D+','d'],['#f2f4f8','D−','数据 D−','d']];
  return svg('0 0 440 250', `
    <path class="cable" d="M18 64 H128"/>
    <g transform="translate(128 40)"><rect width="80" height="48" rx="14" class="plugb"/><rect x="80" y="9" width="40" height="30" rx="9" class="plugm"/><rect x="90" y="19" width="22" height="10" rx="4" fill="#0b1324"/></g>
    <path class="pulse p" d="M18 64 H128"/><path class="pulse d" d="M18 64 H128"/>
    <text x="18" y="24" class="lbl">一根 USB 线 · 剖开看</text>
    ${leg.map(([c, s1, t, k], i) => `<g transform="translate(22 ${122 + i * 30})"><circle r="10" fill="${c}" stroke="#7d8597" stroke-width="${c === '#232833' ? 2 : 0}"/><text x="22" y="6" class="lg">${t}</text></g>`).join('')}
    <path d="M150 112 V170" class="br p"/><text x="160" y="146" class="grp p">送电</text>
    <path d="M150 172 V230" class="br d"/><text x="160" y="206" class="grp d">传消息</text>
    <g transform="translate(340 150)"><circle r="84" class="jacket"/><circle r="72" class="shield"/>
      <circle cx="-30" cy="-26" r="19" fill="#ff5a5f"/><circle cx="30" cy="-26" r="19" fill="#232833" stroke="#7d8597" stroke-width="2"/>
      <circle cx="-30" cy="30" r="19" fill="#3ccf7c"/><circle cx="30" cy="30" r="19" fill="#f2f4f8"/>
      <text x="-30" y="-21" text-anchor="middle" class="w">电</text><text x="30" y="-21" text-anchor="middle" class="w">地</text>
      <text x="-30" y="35" text-anchor="middle" class="w">D+</text><text x="30" y="35" text-anchor="middle" class="w dk">D−</text></g>`, 'usb', 'USB 线里的电源线和数据线');
}

/* ---------- 小图标 ---------- */
const icons = {
  arc:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 38 L22 26" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M24 24 l6 -8 l2 6 l7 -9" fill="none" stroke="#ffd36b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="24" r="4" fill="#fff"/><path d="M30 30 l5 3 M28 34 l2 5 M33 26 l6 1" stroke="#ffd36b" stroke-width="2.5" stroke-linecap="round"/></svg>',
  iron:'<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="22" y="4" width="8" height="22" rx="3" fill="currentColor"/><path d="M24 26 h4 l-1 12 h-2 z" fill="#c9d1dc"/><path d="M26 38 v6" stroke="#ffd36b" stroke-width="3" stroke-linecap="round"/><path d="M12 30 c4 2 6 6 4 10" fill="none" stroke="#c9d1dc" stroke-width="2.5" stroke-linecap="round"/></svg>'
};

return { badge, chain, circuit, pins, joint, pcb, smt, usb, icons };
})();
