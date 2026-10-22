/* 实验室共用的小工具：滑杆、分段按钮、动画循环 */
window.LABS = window.LABS || {};
window.KIT = (function(){
'use strict';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function range(host, {label, min=0, max=100, value=0, step=1, fmt=v=>v}, on){
  const id = 'r' + Math.random().toString(36).slice(2, 8);
  host.insertAdjacentHTML('beforeend', `<div class="range"><label for="${id}">${esc(label)}<span id="${id}-v">${esc(fmt(value))}</span></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></div>`);
  const input = host.querySelector('#' + id), out = host.querySelector(`#${id}-v`);
  const paint = () => { input.style.setProperty('--v', ((input.value - min) / (max - min) * 100) + '%'); out.textContent = fmt(Number(input.value)); };
  input.addEventListener('input', () => { paint(); on(Number(input.value)); });
  paint();
  return input;
}
function seg(host, items, active, on, label=''){
  const wrap = document.createElement('div');
  wrap.className = 'seg'; wrap.setAttribute('role', 'group'); if(label) wrap.setAttribute('aria-label', label);
  wrap.innerHTML = items.map(([id, text]) => `<button type="button" data-id="${esc(id)}" aria-pressed="${id === active}">${esc(text)}</button>`).join('');
  host.append(wrap);
  const set = id => wrap.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  wrap.addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; set(b.dataset.id); on(b.dataset.id); });
  return set;
}
function button(host, text, on, cls='btn quiet small'){
  const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = text;
  b.addEventListener('click', on); host.append(b); return b;
}
/* requestAnimationFrame 循环；页面看不见时暂停 */
function loop(fn){
  let raf = 0, last = performance.now(), alive = true;
  const step = now => { if(!alive) return; const dt = Math.min(.05, (now - last) / 1000); last = now; fn(dt, now / 1000); raf = requestAnimationFrame(step); };
  raf = requestAnimationFrame(step);
  return () => { alive = false; cancelAnimationFrame(raf); };
}
function svg(stage, vb='0 0 360 260', align='xMidYMax meet'){
  stage.insertAdjacentHTML('afterbegin', `<svg viewBox="${vb}" preserveAspectRatio="${align}" role="img"></svg>`);
  return stage.querySelector('svg');
}
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
return {esc, range, seg, button, loop, svg, lerp, clamp};
})();
