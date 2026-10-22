/* 无人机 · 二级航线 —— 图形
   一套笔触：白色或浅色填充，墨色细描边，圆角。只有考试机的机头用孩子自己的颜色。 */
window.ART = (function(){
'use strict';
const INK = '#162236';
const st = (w=1.6, o=.78) => `stroke="${INK}" stroke-opacity="${o}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

const icons = {
balloon:`<g ${st()}><path d="M32 5C20.4 5 12.5 13.6 12.5 24c0 8.8 6.8 15.3 12.6 20.8h13.8C44.7 39.3 51.5 32.8 51.5 24 51.5 13.6 43.6 5 32 5z" fill="#ffd36b"/><path d="M32 5c-5.6 0-9.2 8.6-9.2 19 0 8.8 2.7 15.3 5.2 20.8h8c2.5-5.5 5.2-12 5.2-20.8C41.2 13.6 37.6 5 32 5z" fill="#fff3cf"/><path d="M25.6 44.8l1.6 7.4M38.4 44.8l-1.6 7.4" fill="none"/><rect x="26.5" y="52" width="11" height="7.5" rx="1.6" fill="#c99d6c"/></g>`,
airship:`<g ${st()}><path d="M12.6 24.4L5 16h6.6l6.1 6.3zM12.6 29.6L5 38h6.6l6.1-6.3z" fill="#cbd6e4"/><path d="M10 27c0-6.6 10.7-11.5 24-11.5S58 20.4 58 27s-10.7 11.5-24 11.5S10 33.6 10 27z" fill="#e6edf5"/><path d="M15 27h41" fill="none" stroke-opacity=".22"/><path d="M28.5 38.3h11l-1.6 5.2h-7.8z" fill="#fff"/><path d="M28 41h-4.4" fill="none"/><ellipse cx="22.4" cy="41" rx="1.3" ry="4" fill="#fff"/></g>`,
lantern:`<g ${st()}><path d="M21.5 9h21l4.5 33h-30z" fill="#ffdcaa"/><ellipse cx="32" cy="31" rx="8" ry="9" fill="#fff4dd" stroke="none"/><path d="M26.6 9l-2.7 33M37.4 9l2.7 33" fill="none" stroke-opacity=".25"/><path d="M17 42h30" fill="none"/><path d="M26 42l3 6h6l3-6" fill="none" stroke-opacity=".5"/><path d="M32 47.2c-2 2.3-2 4.6 0 5.8 2-1.2 2-3.5 0-5.8z" fill="#ffa64d" stroke="none"/></g>`,
airliner:`<g ${st()}><path d="M14 26.6L9.4 14h5.5l9.5 12.6z" fill="#dfe7f1"/><path d="M8 31.6c0-2.8 2.6-4.9 6.4-4.9h31.8c5 0 9.4 2.3 11.8 4.9-2.4 2.6-6.8 4.4-11.8 4.4H14.4C10.6 36 8 34.4 8 31.6z" fill="#fff"/><path d="M24 34.6l-6.5 10h6.2l13-10z" fill="#dfe7f1"/><rect x="26.5" y="37.7" width="8.5" height="3.6" rx="1.8" fill="#dfe7f1"/><g fill="#59aef1" stroke="none"><circle cx="19" cy="30.7" r=".95"/><circle cx="23" cy="30.7" r=".95"/><circle cx="27" cy="30.7" r=".95"/><circle cx="31" cy="30.7" r=".95"/><circle cx="35" cy="30.7" r=".95"/><circle cx="39" cy="30.7" r=".95"/><circle cx="43" cy="30.7" r=".95"/><path d="M49.4 29.4h3.7l2.4 2.1h-6.1z"/></g></g>`,
helicopter:`<g ${st()}><path d="M7 15.5h50" fill="none" stroke-width="2.4"/><path d="M32 15.5v5.6" fill="none"/><path d="M22.2 27.6H10" fill="none" stroke-width="3.2"/><circle cx="8.6" cy="27.6" r="4.6" fill="#fff" fill-opacity=".6"/><path d="M21.6 29.6c0-5.3 4.3-8.6 10.5-8.6h5.5c7.5 0 12 5.2 12 11.2 0 3.2-2.2 5.3-5.3 5.3H27.1c-3.4 0-5.5-3.1-5.5-7.9z" fill="#fff"/><path d="M38.5 22.4c4.4 1 7.6 4.6 7.9 9H38.5z" fill="#9fd5f8"/><path d="M24.5 42.6h22M28 37.6l-1.2 5M42 37.6l1.2 5" fill="none"/></g>`,
quad:`<g ${st()}><path d="M17 17l30 30M47 17L17 47" fill="none" stroke-width="3.4"/><g fill="#fff" fill-opacity=".92"><circle cx="17" cy="17" r="10.5"/><circle cx="47" cy="17" r="10.5"/><circle cx="17" cy="47" r="10.5"/><circle cx="47" cy="47" r="10.5"/></g><path d="M11 13l12 8M41 21l12-8M11 51l12-8M41 43l12 8" fill="none" stroke-width="1.8"/><rect x="24.5" y="24.5" width="15" height="15" rx="4.6" fill="#fff"/><path d="M28.6 27.6L32 23.4l3.4 4.2z" fill="#59aef1" stroke="none"/></g>`,
ornithopter:`<g ${st()}><path d="M29 31C21 22 11.5 18.5 4.5 19.5c3 5.5 10 11.5 24.5 16z" fill="#f3e8d6"/><path d="M35 31c8-9 17.5-12.5 24.5-11.5-3 5.5-10 11.5-24.5 16z" fill="#f3e8d6"/><path d="M27 31.6L9.5 21.4M27.6 33.2L8 24.8M28.2 34.6l-17-7M37 31.6l17.5-10.2M36.4 33.2L56 24.8M35.8 34.6l17-7" fill="none" stroke-opacity=".32"/><ellipse cx="32" cy="35.6" rx="4.6" ry="9.6" fill="#e7d4b6"/><circle cx="32" cy="24.4" r="3.2" fill="#e7d4b6"/><path d="M29 44.6l3 9 3-9z" fill="#e7d4b6"/></g>`,
glider:`<g ${st()}><path d="M3 25.6c9-.6 19-1 29-1s20 .4 29 1v3.4c-9 .5-19 .8-29 .8s-20-.3-29-.8z" fill="#fff"/><path d="M32 9.6c1.8 0 2.8 2.4 2.8 6v30.6h-5.6V15.6c0-3.6 1-6 2.8-6z" fill="#fff"/><path d="M24.6 46.6h14.8v3H24.6z" fill="#fff"/><ellipse cx="32" cy="16.6" rx="1.5" ry="3" fill="#9fd5f8" stroke="none"/></g>`,
kite:`<g ${st()}><path d="M42.6 23C48.6 27 54 37 57 56" fill="none" stroke-dasharray="1.4 3" stroke-opacity=".55"/><path d="M28 6l14.6 17L28 46 13.4 23z" fill="#9fd5f8"/><path d="M28 6l14.6 17H28zM28 23v23L13.4 23z" fill="#ffd36b" stroke="none"/><path d="M28 6l14.6 17L28 46 13.4 23z" fill="none"/><path d="M28 6v40M13.4 23h29.2" fill="none" stroke-opacity=".45"/><path d="M28 46c-3 2.4 3 4.8 0 7.2s3 4.8 0 7.2" fill="none"/><path d="M28 52.6l-3-1.6v3.2zM28 52.6l3-1.6v3.2zM28 59.6l-3-1.6v3.2zM28 59.6l3-1.6v3.2z" fill="#ffd36b"/></g>`,
muyuan:`<g ${st()}><path d="M28.6 24.6C21 19.6 11.6 17.6 4 20.6l3.4 3-2.6 2.8 4.4 1.6-1.4 3.2L28.6 33z" fill="#d2a678"/><path d="M35.4 24.6C43 19.6 52.4 17.6 60 20.6l-3.4 3 2.6 2.8-4.4 1.6 1.4 3.2L35.4 33z" fill="#d2a678"/><path d="M29 43.4l-5.4 11.2c5.4 2.4 11.4 2.4 16.8 0L35 43.4z" fill="#c9965f"/><ellipse cx="32" cy="30" rx="5.6" ry="14.6" fill="#ddb688"/><circle cx="32" cy="15.6" r="4.4" fill="#ddb688"/><path d="M30.6 12l1.4-4.6 1.4 4.6z" fill="#b07a45"/><path d="M32 20.4v20M26.6 48.6l2.4-4.6M37.4 48.6l-2.4-4.6M32 44v10.6M10 22.4l18 5M54 22.4l-18 5" fill="none" stroke-opacity=".28"/></g>`,
rocketchair:`<g ${st(1.5,.7)} stroke-dasharray="3 2.4"><rect x="11" y="10" width="6" height="26" rx="3" fill="#e9eef5"/><rect x="47" y="10" width="6" height="26" rx="3" fill="#e9eef5"/><path d="M21 44V20h22v24M21 33h22M24 44v10M40 44v10" fill="#e2c49c"/></g><g fill="#ffb24a"><path d="M14 37c-2 3-2 6 0 8 2-2 2-5 0-8zM50 37c-2 3-2 6 0 8 2-2 2-5 0-8z"/></g>`,
davinci:`<g stroke="#7b5b3c" stroke-opacity=".85" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"><path d="M29 31C21 22 11.5 18.5 4.5 19.5c3 5.5 10 11.5 24.5 16z" fill="#f7eedd"/><path d="M35 31c8-9 17.5-12.5 24.5-11.5-3 5.5-10 11.5-24.5 16z" fill="#f7eedd"/><path d="M27 31.6L9.5 21.4M27.6 33.2L8 24.8M28.2 34.6l-17-7M37 31.6l17.5-10.2M36.4 33.2L56 24.8M35.8 34.6l17-7M12 22.6l1.6 2.4M16 23.4l1.4 2.6M48 23.4l-1.4 2.6M52 22.6l-1.6 2.4" fill="none" stroke-opacity=".45"/><ellipse cx="32" cy="35.6" rx="4.6" ry="9.6" fill="#f7eedd"/><path d="M22 52c6-3 14-3 20 0" fill="none" stroke-dasharray="2 2.4" stroke-opacity=".5"/></g>`,
hangglider:`<g ${st()}><path d="M4 27c6-6.4 13.6-9.4 20-8.4l8-4.4 8 4.4c6.4-1 14 2 20 8.4-5 0-9 1-13 3L32 27l-15 3c-4-2-8-3-13-3z" fill="#f3e8d6"/><path d="M32 14.2V27M24 18.6l-7 11.4M40 18.6l7 11.4M18 21l-9.4 6.4M46 21l9.4 6.4" fill="none" stroke-opacity=".32"/><circle cx="32" cy="33.6" r="2.6" fill="#fff"/><path d="M32 36.4v9.4M32 45.8l-3 7.6M32 45.8l3 7.6M32 38.6l-5.4-9.2M32 38.6l5.4-9.2" fill="none"/></g>`,
flyer:`<g ${st()}><g fill="#e9f3fb" fill-opacity=".85" stroke-opacity=".3"><circle cx="20" cy="27.2" r="6.8"/><circle cx="44" cy="27.2" r="6.8"/></g><path d="M20 20.8v12.8M44 20.8v12.8" fill="none" stroke-width="2.2" stroke-opacity=".55"/><rect x="3" y="17.6" width="58" height="3.6" rx="1.6" fill="#f3e8d6"/><rect x="3" y="33" width="58" height="3.6" rx="1.6" fill="#f3e8d6"/><path d="M7.5 21.2V33M13 21.2V33M26.5 21.2V33M37.5 21.2V33M51 21.2V33M56.5 21.2V33" fill="none" stroke-opacity=".6"/><path d="M7.5 21.2L13 33M13 21.2L7.5 33M51 21.2L56.5 33M56.5 21.2L51 33" fill="none" stroke-opacity=".22" stroke-width="1"/><path d="M27 36.6V47M37 36.6V47M24.6 47h4.8M34.6 47h4.8" fill="none"/><rect x="23" y="40.6" width="18" height="2.6" rx="1.2" fill="#f3e8d6"/></g>`
};

function icon(name, size=56, extra=''){
  return `<svg class="icon-${name}" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true" ${extra}>${icons[name]||''}</svg>`;
}
function iconG(name, x, y, size=56){
  const k = size/64;
  return `<g transform="translate(${x-size/2} ${y-size/2}) scale(${k})">${icons[name]||''}</g>`;
}

/* 考试机俯视图：四轴、带护圈。机头朝上（屏幕 y 负方向）。
   旋翼编号：0 左前（顺时针转）1 右前（逆时针）2 左后（逆时针）3 右后（顺时针）。 */
const ROTOR_POS = [[-30,-30],[30,-30],[-30,30],[30,30]];
const ROTOR_DIR = [1,-1,-1,1];
function quadTop(opt={}){
  const accent = opt.accent || '#36c5d6';
  const id = opt.id || 'q';
  const rotors = ROTOR_POS.map(([x,y],i)=>`<g class="rotor r${i}" transform="translate(${x} ${y})">
    <circle class="disc" r="15.5" fill="url(#${id}-disc)" opacity="0"/>
    <g class="blade"><path d="M-13 0h26" stroke="${INK}" stroke-opacity=".7" stroke-width="2.6" stroke-linecap="round"/><circle r="2.6" fill="#fff" stroke="${INK}" stroke-opacity=".7" stroke-width="1.4"/></g>
    <circle r="17.5" fill="none" stroke="${i<2?accent:INK}" stroke-opacity="${i<2?1:.7}" stroke-width="${i<2?3:1.8}"/>
  </g>`).join('');
  return `<g class="quad-top">
    <defs><radialGradient id="${id}-disc"><stop offset="0" stop-color="#ffffff" stop-opacity=".1"/><stop offset=".72" stop-color="#9fd5f8" stop-opacity=".55"/><stop offset="1" stop-color="#59aef1" stop-opacity=".25"/></radialGradient></defs>
    <path d="M-30-30L30 30M30-30L-30 30" stroke="${INK}" stroke-opacity=".72" stroke-width="5.5" stroke-linecap="round"/>
    ${rotors}
    <rect x="-14" y="-15" width="28" height="30" rx="9" fill="#fff" stroke="${INK}" stroke-opacity=".72" stroke-width="1.8"/>
    <rect x="-8" y="-4" width="16" height="12" rx="4" fill="#eef2f7"/>
    <path d="M-5.5-9.5L0-16l5.5 6.5z" fill="${accent}"/>
  </g>`;
}

/* 侧视：旋翼实验用 */
function quadSide(opt={}){
  const accent = opt.accent || '#36c5d6';
  return `<g class="quad-side">
    <g class="guard"><rect x="-66" y="-17" width="40" height="7" rx="3.5" fill="none" stroke="${INK}" stroke-opacity=".55" stroke-width="1.6"/><rect x="26" y="-17" width="40" height="7" rx="3.5" fill="none" stroke="${INK}" stroke-opacity=".55" stroke-width="1.6"/></g>
    <g class="side-rotor" transform="translate(-46 -13)"><ellipse class="disc" rx="19" ry="3.2" fill="#59aef1" opacity="0"/><path class="blade" d="M-17 0h34" stroke="${INK}" stroke-opacity=".75" stroke-width="2.4" stroke-linecap="round"/></g>
    <g class="side-rotor" transform="translate(46 -13)"><ellipse class="disc" rx="19" ry="3.2" fill="#59aef1" opacity="0"/><path class="blade" d="M-17 0h34" stroke="${INK}" stroke-opacity=".75" stroke-width="2.4" stroke-linecap="round"/></g>
    <path d="M-46-12v8M46-12v8" stroke="${INK}" stroke-opacity=".72" stroke-width="3"/>
    <path d="M-46-3H46" stroke="${INK}" stroke-opacity=".72" stroke-width="4.5" stroke-linecap="round"/>
    <rect x="-17" y="-9" width="34" height="15" rx="6" fill="#fff" stroke="${INK}" stroke-opacity=".72" stroke-width="1.8"/>
    <circle cx="13" cy="-1.5" r="2.2" fill="${accent}"/>
    <path d="M-12 6l-4 8M12 6l4 8M-19 14h8M11 14h8" stroke="${INK}" stroke-opacity=".6" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </g>`;
}

/* 斜视的小飞机：考试航线用（原点在机身中心） */
function quad34(accent){
  /* 从后上方看：远处两个（机头一侧）在上、小一点，近处两个在下 */
  const rotor = (x,y,rx,c,w) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx*.36}" fill="#e9f5fd" fill-opacity=".9" stroke="${c}" stroke-width="${w}"/>`;
  return `<g class="quad34">
    ${rotor(-10,-7,8,accent,1.8)}${rotor(10,-7,8,accent,1.8)}
    <path d="M-10-6.5L11 7M10-6.5L-11 7" stroke="${INK}" stroke-opacity=".72" stroke-width="2.6" stroke-linecap="round"/>
    <rect x="-6.5" y="-3.6" width="13" height="8" rx="3.4" fill="#fff" stroke="${INK}" stroke-opacity=".72" stroke-width="1.3"/>
    <circle cx="0" cy="-2" r="1.6" fill="${accent}"/>
    ${rotor(-12,7.5,9.5,INK,1.2)}${rotor(12,7.5,9.5,INK,1.2)}
  </g>`;
}

/* 箭头：从 (x,y) 出发，方向 (dx,dy)，长度 len。kind 决定颜色 */
const FORCE = {lift:'#2a6ff0', weight:'#162236', thrust:'#13a07a', drag:'#c4761f', air:'#ffffff', move:'#162236'};
function arrow(x, y, dx, dy, len, kind, cls=''){
  if(len < 2) return `<g class="arrow ${cls}"></g>`;
  const c = FORCE[kind] || kind;
  const n = Math.hypot(dx,dy)||1, ux = dx/n, uy = dy/n;
  const x2 = x+ux*len, y2 = y+uy*len, hs = Math.min(9, len*.45);
  const px = -uy, py = ux;
  const tip = `${x2},${y2} ${x2-ux*hs+px*hs*.6},${y2-uy*hs+py*hs*.6} ${x2-ux*hs-px*hs*.6},${y2-uy*hs-py*hs*.6}`;
  return `<g class="arrow ${cls}" data-kind="${kind}"><path d="M${x} ${y}L${x2-ux*hs*.6} ${y2-uy*hs*.6}" stroke="${c}" stroke-width="4" stroke-linecap="round"/><polygon points="${tip}" fill="${c}"/></g>`;
}

/* 天空背景（白天，课堂里统一用白天，保证看得清） */
function skyBack(w, h, id='sky'){
  return `<defs><linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc0f4"/><stop offset=".62" stop-color="#bfe3fa"/><stop offset="1" stop-color="#eaf6fd"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id}-g)"/>`;
}
const cloudPath = 'M0 30c0-13 11-22 24-20 4-9 13-14 23-12 9 2 15 8 17 16 10-1 19 7 18 17 0 6-5 11-11 11H10C4 42 0 37 0 30z';
function cloud(x, y, s=1, o=.95){ return `<path d="${cloudPath}" transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${o}"/>`; }
function hills(w, h){
  return `<path d="M0 ${h-34}C${w*.2} ${h-46} ${w*.38} ${h-56} ${w*.58} ${h-44}S${w*.86} ${h-30} ${w} ${h-40}V${h}H0z" fill="#acdcc6"/><path d="M0 ${h-14}C${w*.3} ${h-24} ${w*.6} ${h-26} ${w} ${h-16}V${h}H0z" fill="#86c9ab"/>`;
}

/* 小摇杆示意：dir 为 'up','down','left','right','circle',null */
function stickGlyph(dir, label){
  const r = 15, a = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];
  let mark = `<circle cx="0" cy="0" r="4.6" fill="${INK}" fill-opacity=".25"/>`;
  if(a) mark = `<circle cx="${a[0]*8}" cy="${a[1]*8}" r="4.6" fill="${INK}"/><path d="M0 0L${a[0]*8} ${a[1]*8}" stroke="${INK}" stroke-width="2"/>`;
  if(dir==='circle') mark = `<circle r="8" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="3 2.5"/><circle cx="0" cy="-8" r="4" fill="${INK}"/>`;
  if(dir==='hold') mark = `<circle r="4.6" fill="${INK}"/><circle r="9" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="1.4"/>`;
  return `<svg class="stick-glyph${dir?' on':''}" viewBox="-20 -20 40 40" width="40" height="40" aria-hidden="true"><circle r="${r}" fill="#fff" stroke="${INK}" stroke-opacity=".3" stroke-width="1.5"/><path d="M-${r-4} 0H${r-4}M0-${r-4}V${r-4}" stroke="${INK}" stroke-opacity=".12" stroke-width="1.2"/>${mark}</svg>${label?`<span>${label}</span>`:''}`;
}

/* 一个小人（“你”） */
function pilot(x, y, color='#36c5d6'){
  return `<g class="pilot" transform="translate(${x} ${y})"><circle cy="-15" r="6" fill="#ffe1cc" stroke="${INK}" stroke-opacity=".6" stroke-width="1.2"/><path d="M-7-8h14l1 14h-16z" fill="${color}"/><rect x="-6" y="-7" width="12" height="6" rx="2" fill="#2b2f3e"/></g>`;
}

return {icon, iconG, icons, quadTop, quadSide, quad34, arrow, FORCE, skyBack, cloud, hills, stickGlyph, pilot, ROTOR_POS, ROTOR_DIR, INK};
})();
