/* 图形思考课 · 哥哥 五上《多边形的面积》（Claude 设计，2026-11-11，家长交办：原来教得少、光做题，要重新设计成"先教怎么想"）
   8 站：①高是谁的高 ②平行四边形（剪·移·拼）③三角形（拼两个，取一半）④梯形（拼两个，两底相加）
        ⑤拉一拉（等底等高）⑥倒着想（已知面积求底或高）⑦组合图形（分与补）⑧闯关（10 道每次新出的题）
   每站：动手看 → 一句话 → 跟我想（一步一步，中间要回答）→ 自己做；错一次给关键关系再试，再错看步骤，可换一道同类题。
   画图规则（台账 R8）：一张图只讲一个关系；底 = 粗青线，高 = 红虚线；只标这一步要用的数。图是示意图，不按比例。
   记录：localStorage sp2.geometry:<who>:<formal|test>；做完一站 / 闯关交卷 / 离开页面时经 V2Records 上报（app: geometry）。 */
(function () {
'use strict';
var QS = new URLSearchParams(location.search);
var WHO = QS.get('who') === 'eddey' ? 'eddey' : 'kenton';
var TEST = QS.get('test') === '1' || !/(^|\.)eddeyyang\.github\.io$/.test(location.hostname);
var KEY = 'sp2.geometry:' + WHO + ':' + (TEST ? 'test' : 'formal');
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var app = $('#app');
var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.body.dataset.who = WHO;
$('#whoI').textContent = WHO === 'kenton' ? '哥' : '弟';
$('#whoName').textContent = WHO === 'kenton' ? 'Kenton' : 'Eddey';
if (TEST) $('#testTag').classList.remove('hide');

/* ---------- 存储与上报 ---------- */
function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); return s && typeof s === 'object' ? s : {}; } catch (e) { return {}; } }
var state = Object.assign({ done: {}, items: [], quiz: [] }, load());
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } }
var roundId = Date.now().toString(36);
function record(it) {
  it.at = new Date().toISOString(); it.sent = false;
  state.items.push(it); if (state.items.length > 400) state.items = state.items.slice(-400); save();
}
function sendReport(kind, extra) {
  var items = state.items.filter(function (x) { return !x.sent; });
  if (!items.length && kind === 'leave') return;
  try {
    if (window.V2Records) window.V2Records.enqueue(Object.assign({
      app: 'geometry', who: WHO, subject: 'math', mode: TEST ? 'test' : 'formal', roundId: roundId, kind: kind,
      unit: '五上 多边形的面积（图形思考课）',
      total: items.filter(function (x) { return x.result; }).length,
      right: items.filter(function (x) { return x.result === 'right'; }).length,
      wrong: items.filter(function (x) { return x.result === 'wrong'; }).length,
      hinted: items.filter(function (x) { return x.result === 'hinted'; }).length,
      items: items.map(function (x) { var o = Object.assign({}, x); delete o.sent; return o; })
    }, extra || {}));
  } catch (e) { }
  items.forEach(function (x) { x.sent = true; }); save();
}
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') sendReport('leave', { label: '离开页面时未发的作答' }); });
window.addEventListener('pagehide', function () { sendReport('leave', { label: '离开页面时未发的作答' }); });

var toastT;
function toast(msg) {
  var t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2400);
}
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
function strip(h) { return String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(a) { return a[ri(0, a.length - 1)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = ri(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function nf(x) { return String(Math.round(x * 100) / 100); }
function show(node) { try { node.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' }); } catch (e) { } }

/* ---------- 画图：单位坐标（y 向上），自动缩放进画布 ---------- */
function Fig(o) {
  o = o || {};
  var W = o.w || 340, H = o.h || 200, pad = o.pad || [40, 28, 40, 34];
  var items = [], P = [];
  function reg(p) { P.push(p); return p; }
  var f = {
    poly: function (pts, cls) { pts.forEach(reg); items.push({ k: 'poly', pts: pts, cls: cls || 'shape' }); return f; },
    seg: function (a, b, cls) { reg(a); reg(b); items.push({ k: 'seg', a: a, b: b, cls: cls || 'side' }); return f; },
    ra: function (p, u, v) { items.push({ k: 'ra', p: p, u: u, v: v }); return f; },
    label: function (p, t, op) { items.push({ k: 'label', p: p, t: t, o: op || {} }); return f; },
    grid: function (x0, y0, x1, y1) { items.push({ k: 'grid', b: [x0, y0, x1, y1] }); return f; },
    svg: function (alt) {
      var b = o.bounds;
      if (!b) { b = [1e9, 1e9, -1e9, -1e9]; P.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }); }
      var bw = Math.max(b[2] - b[0], .001), bh = Math.max(b[3] - b[1], .001);
      var iw = W - pad[0] - pad[2], ih = H - pad[1] - pad[3];
      var s = Math.min(iw / bw, ih / bh);
      var ox = pad[0] + (iw - bw * s) / 2, oy = pad[1] + (ih - bh * s) / 2;
      function X(p) { return (ox + (p[0] - b[0]) * s).toFixed(1); }
      function Y(p) { return (oy + (b[3] - p[1]) * s).toFixed(1); }
      var out = '';
      items.forEach(function (it) {
        if (it.k === 'grid') {
          for (var x = it.b[0]; x <= it.b[2] + 1e-9; x++) out += '<line class="gridl" x1="' + X([x, 0]) + '" y1="' + Y([0, it.b[1]]) + '" x2="' + X([x, 0]) + '" y2="' + Y([0, it.b[3]]) + '"/>';
          for (var y = it.b[1]; y <= it.b[3] + 1e-9; y++) out += '<line class="gridl" x1="' + X([it.b[0], 0]) + '" y1="' + Y([0, y]) + '" x2="' + X([it.b[2], 0]) + '" y2="' + Y([0, y]) + '"/>';
        } else if (it.k === 'poly') {
          out += '<polygon class="' + it.cls + '" points="' + it.pts.map(function (p) { return X(p) + ',' + Y(p); }).join(' ') + '"/>';
        } else if (it.k === 'seg') {
          out += '<line class="' + it.cls + '" x1="' + X(it.a) + '" y1="' + Y(it.a) + '" x2="' + X(it.b) + '" y2="' + Y(it.b) + '"/>';
        } else if (it.k === 'ra') {
          var k = 9 / s, p = it.p, u = it.u, v = it.v;
          var a = [p[0] + u[0] * k, p[1] + u[1] * k], c = [p[0] + v[0] * k, p[1] + v[1] * k], m = [a[0] + v[0] * k, a[1] + v[1] * k];
          out += '<path class="ra" d="M' + X(a) + ' ' + Y(a) + 'L' + X(m) + ' ' + Y(m) + 'L' + X(c) + ' ' + Y(c) + '"/>';
        } else if (it.k === 'label') {
          out += '<text class="' + (it.o.cls || '') + '" text-anchor="' + (it.o.a || 'middle') + '" x="' + (+X(it.p) + (it.o.dx || 0)).toFixed(1) + '" y="' + (+Y(it.p) + (it.o.dy || 0) + 5).toFixed(1) + '">' + esc(it.t) + '</text>';
        }
      });
      return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(alt || '示意图') + '">' + out + '</svg>';
    }
  };
  return f;
}
function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function rot(p, c, deg) { var r = deg * Math.PI / 180, x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(r) - y * Math.sin(r), c[1] + x * Math.sin(r) + y * Math.cos(r)]; }
function cen(pts) { var x = 0, y = 0; pts.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / pts.length, y / pts.length]; }
/* 第二个图形：一边自转半圈，一边滑到拼好的位置（p=1 时正好是绕 M 转 180°） */
function flipTo(pts, M, p) { var c0 = cen(pts), c1 = rot(c0, M, 180); return pts.map(function (q) { var r = rot(q, c0, 180 * p); return [r[0] + (c1[0] - c0[0]) * p, r[1] + (c1[1] - c0[1]) * p]; }); }
function cm(x, u) { return x + ' ' + (u || 'cm'); }
/* 示意图用的显示尺寸：太扁或太高时拉回来（图上的数以标注为准） */
function disp(b, h) { var db = b, dh = h; if (db / dh > 2.2) dh = db / 2.2; if (db / dh < 1.15) db = dh * 1.15; return [db, dh]; }

/* 平行四边形：底在下面放平，高在里面 */
function figPara(o) {
  var d = disp(o.b || 8, o.h || 4), b = d[0], h = d[1], s = Math.min(b * .32, h * .7);
  var A = [0, 0], B = [b, 0], C = [b + s, h], D = [s, h], F = [s, 0];
  var f = Fig().poly([A, B, C, D]);
  if (!o.noBase) f.seg(A, B, 'base');
  f.seg(D, F, 'hgt').ra(F, [1, 0], [0, 1]);
  if (o.lb) f.label(mid(A, B), o.lb, { dy: 20, cls: 'tb' });
  if (o.lh) f.label(mid(D, F), o.lh, { dx: 8, a: 'start', cls: 'th' });
  if (o.ls) f.label(mid(B, C), o.ls, { dx: 10, a: 'start', cls: 'tm' });
  if (o.area) f.label([b * .62 + s / 2, h * .5], o.area, { cls: 'tm' });
  return f.svg(o.alt || '平行四边形');
}
/* 三角形：ax 是顶点在底上的位置（0–1 在里面，>1 高在外面） */
function figTri(o) {
  var d = disp(o.b || 6, o.h || 4), b = d[0], h = d[1], ax = o.ax == null ? .35 : o.ax;
  var A = [0, 0], B = [b, 0], T = [ax * b, h], F = [ax * b, 0];
  var f = Fig().poly([A, B, T]).seg(A, B, 'base');
  if (ax > 1) f.seg(B, F, 'ext');
  f.seg(T, F, 'hgt').ra(F, [-1, 0], [0, 1]);
  if (o.lb) f.label(mid(A, B), o.lb, { dy: 20, cls: 'tb' });
  if (o.lh) f.label(mid(T, F), o.lh, { dx: 8, a: 'start', cls: 'th' });
  if (o.area) f.label([(b + ax * b) / 3 + (ax > 1 ? -b * .08 : 0), h * .3], o.area, { cls: 'tm' });
  return f.svg(o.alt || '三角形');
}
/* 直角三角形：三条边都标出来 */
function figRight(o) {
  var d = disp(o.a, o.b), a = d[0], b = d[1], A = [0, 0], B = [a, 0], T = [0, b];
  return Fig().poly([A, B, T]).ra(A, [1, 0], [0, 1])
    .label(mid(A, B), o.la, { dy: 20 }).label(mid(A, T), o.lb, { dx: -8, a: 'end' }).label(mid(B, T), o.lc, { dx: 10, dy: -6, a: 'start' }).svg('直角三角形');
}
/* 梯形：right = 直角梯形（高就是那条直边） */
function figTrap(o) {
  var d = disp(o.b || 8, o.h || 4), b = d[0], h = d[1], a = b * (o.a || 4) / (o.b || 8), off = o.right ? 0 : (b - a) * .4;
  var A = [0, 0], B = [b, 0], C = [off + a, h], D = [off, h], F = [off, 0];
  var f = Fig().poly([A, B, C, D]);
  if (o.right) f.seg(D, F, 'hgts').ra(F, [1, 0], [0, 1]); else f.seg(D, F, 'hgt').ra(F, [1, 0], [0, 1]);
  if (o.la) f.label(mid(D, C), o.la, { dy: -14, cls: 'tb' });
  if (o.lb) f.label(mid(A, B), o.lb, { dy: 20, cls: 'tb' });
  if (o.lh) f.label(mid(D, F), o.lh, o.right ? { dx: -8, a: 'end', cls: 'th' } : { dx: 8, a: 'start', cls: 'th' });
  if (o.area) f.label([off + a * .62 + (b - off - a) * .2, h * .5], o.area, { cls: 'tm' });
  return f.svg(o.alt || '梯形');
}
/* 房子：长方形 + 三角形 */
function figHouse(o) {
  var w = o.w, hh = o.hh, r = o.r, dw = Math.max(w, (hh + r) * .9), sc = dw / w;
  var A = [0, 0], B = [dw, 0], C = [dw, hh], D = [0, hh], T = [dw / 2, hh + r], F = [dw / 2, hh];
  var f = Fig({ h: 220 }).poly([A, B, C, D]).poly([D, C, T]);
  f.seg(T, F, 'hgt').ra(F, [1, 0], [0, 1]);
  f.label(mid(A, B), cm(w, 'm'), { dy: 20 }).label(mid(A, D), cm(hh, 'm'), { dx: -8, a: 'end' }).label(mid(T, F), cm(r, 'm'), { dx: 8, a: 'start', cls: 'th' });
  void sc; return f.svg('长方形上面加一个三角形');
}
/* 挖掉一个三角形的长方形 */
function figCut(o) {
  var w = o.w, hh = o.hh, cb = o.cb, ch = o.ch, x0 = (w - cb) / 2;
  var f = Fig({ h: 210 }).poly([[0, 0], [w, 0], [w, hh], [0, hh]]).poly([[x0, 0], [x0 + cb, 0], [x0 + cb / 2, ch]], 'hole');
  var T = [x0 + cb / 2, ch], F = [x0 + cb / 2, 0];
  f.seg(T, F, 'hgt').ra(F, [1, 0], [0, 1]);
  f.label([w / 2, hh], cm(w, 'm'), { dy: -14 }).label([0, hh / 2], cm(hh, 'm'), { dx: -8, a: 'end' })
   .label([x0 + cb / 2, 0], '底 ' + cm(cb, 'm'), { dy: 20, cls: 'tb' }).label(mid(T, F), cm(ch, 'm'), { dx: 8, a: 'start', cls: 'th' });
  return f.svg('长方形里挖掉一个三角形');
}
/* L 形：mode '' 原图 / 'split' 分 / 'fill' 补 */
function figL(o, mode) {
  var W = o.W, H = o.H, w2 = o.w2, h1 = o.h1;
  var f = Fig({ h: 230, pad: [46, 30, 52, 36] }).poly([[0, 0], [W, 0], [W, h1], [w2, h1], [w2, H], [0, H]]);
  if (mode === 'split') f.seg([0, h1], [w2, h1], 'cut');
  if (mode === 'fill') f.poly([[w2, h1], [W, h1], [W, H], [w2, H]], 'ghost');
  f.label([W / 2, 0], cm(W, 'm'), { dy: 20 }).label([0, H / 2], cm(H, 'm'), { dx: -8, a: 'end' })
   .label([w2 / 2, H], cm(w2, 'm'), { dy: -14 }).label([W, h1 / 2], cm(h1, 'm'), { dx: 8, a: 'start' });
  if (mode === 'split') f.label([w2, (H + h1) / 2], cm(H - h1, 'm'), { dx: 8, a: 'start', cls: 'th' });
  if (mode === 'fill') f.label([(W + w2) / 2, H], cm(W - w2, 'm'), { dy: -14, cls: 'th' }).label([W, (H + h1) / 2], cm(H - h1, 'm'), { dx: 8, a: 'start', cls: 'th' });
  return f.svg('L 形');
}

/* ---------- 题目界面 ---------- */
function figBox(svg) { return svg ? '<div class="figw">' + svg + '</div>' : ''; }
function fbHtml(cls, html) { return '<div class="fb ' + cls + '" role="status">' + html + '</div>'; }
function stepsHtml(arr) { return '<ol>' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
function parseNum(v) { v = String(v).trim().replace(/[。．，,]/g, '.').replace(/\s/g, ''); if (!/^\d+(\.\d+)?$/.test(v)) return NaN; return parseFloat(v); }

/* 不计分的小问（预测、跟我想里的提问）：答错给一句为什么，再选，直到选对 */
function miniAsk(host, sp) {
  return new Promise(function (resolve) {
    var box = el('<div class="q"><div class="qt">' + sp.q + '</div><div class="opts' + (sp.two ? ' two' : '') + '">' + sp.opts.map(function (t, i) { return '<button class="opt" data-i="' + i + '">' + t + '</button>'; }).join('') + '</div><div class="fbw"></div></div>');
    host.appendChild(box);
    $$('.opt', box).forEach(function (b) {
      b.onclick = function () {
        var i = +b.dataset.i;
        if (i === sp.ans) {
          b.classList.add('right'); $$('.opt', box).forEach(function (x) { x.disabled = true; });
          $('.fbw', box).innerHTML = fbHtml('ok', sp.ok || '对。');
          resolve(true);
        } else { b.classList.add('wrong'); b.disabled = true; $('.fbw', box).innerHTML = fbHtml('hint', sp.why || '再想想。'); }
      };
    });
  });
}

/* 计分的题：q = {id, st, text, fig, type:'mc'|'num', opts, ans, unit, hint, steps, regen} */
function ask(host, q, no, onResult) {
  return new Promise(function (resolve) {
    var tries = 0, done = false, given = [];
    var body = q.type === 'mc'
      ? '<div class="opts' + (q.two ? ' two' : '') + '">' + q.opts.map(function (t, i) { return '<button class="opt" data-i="' + i + '">' + t + '</button>'; }).join('') + '</div>'
      : '<div class="ans"><input type="text" inputmode="decimal" autocomplete="off" aria-label="答案"><span class="u">' + esc(q.unit || '') + '</span><button class="btn" data-a="check">对答案</button></div><div class="err"></div>';
    var box = el('<div class="card q"><div class="no">' + esc(no || '') + '</div><div class="qt">' + q.text + '</div>' + figBox(q.fig) + body + '<div class="fbw"></div></div>');
    host.appendChild(box);
    function finish(result) {
      done = true;
      record({ id: q.id, st: q.st, q: strip(q.text), result: result, given: given.join(' → '), ans: q.type === 'mc' ? strip(q.opts[q.ans]) : q.ans + (q.unit || '') });
      if (onResult) onResult(result);
      $$('.opt', box).forEach(function (x) { x.disabled = true; if (+x.dataset.i === q.ans) x.classList.add('right'); });
      var inp = $('input', box); if (inp) inp.disabled = true; var ck = $('[data-a=check]', box); if (ck) ck.disabled = true;
      var w = $('.fbw', box);
      if (result === 'right') w.innerHTML = fbHtml('ok', '<b>对。</b>' + (q.okNote || ''));
      else if (result === 'hinted') w.innerHTML = fbHtml('ok', '<b>这次对了。</b>是看了提示以后做对的，下次试试不看提示。');
      else w.innerHTML = fbHtml('no', '<b>一步一步看：</b>' + stepsHtml(q.steps || []));
      if (result === 'wrong') {
        var act = el('<div class="row end">' + (q.regen ? '<button class="btn ghost" data-a="redo">换一道同类题再做</button>' : '') + '<button class="btn" data-a="go">看懂了，继续</button></div>');
        box.appendChild(act);
        var rd = $('[data-a=redo]', act);
        if (rd) rd.onclick = function () { act.remove(); ask(host, q.regen(), (no || '') + ' · 再做一道').then(function () { resolve(result); }); };
        $('[data-a=go]', act).onclick = function () { act.remove(); resolve(result); };
      } else resolve(result);
    }
    function judge(ok, label) {
      if (done) return;
      tries++; given.push(label);
      if (ok) return finish(tries === 1 ? 'right' : 'hinted');
      if (tries === 1) { $('.fbw', box).innerHTML = fbHtml('hint', '<b>再想一步：</b>' + (q.hint || '回到三问：求哪块？底是哪条？它的高是哪条？')); return; }
      finish('wrong');
    }
    if (q.type === 'mc') {
      $$('.opt', box).forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; if (i !== q.ans) { b.classList.add('wrong'); b.disabled = true; } judge(i === q.ans, strip(q.opts[i])); }; });
    } else {
      var inp = $('input', box), err = $('.err', box);
      var go = function () {
        var v = parseNum(inp.value);
        if (isNaN(v)) { err.textContent = '先填一个数（只写数字）。'; return; }
        err.textContent = ''; judge(Math.abs(v - q.ans) < 1e-9, inp.value.trim());
        if (!done) { inp.select(); }
      };
      $('[data-a=check]', box).onclick = go;
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      inp.addEventListener('input', function () { err.textContent = ''; });
    }
  });
}

/* 跟我想：一步一步出现；带 ask 的步骤要先答对才往下 */
function thinkAlong(host, sp) {
  return new Promise(function (resolve) {
    var card = el('<div class="card"><span class="tag">跟我想</span><h2>' + sp.title + '</h2>' + (sp.text ? '<p>' + sp.text + '</p>' : '') + '<div class="figw"></div><ol class="steps"></ol><div class="askw"></div><div class="row end"><button class="btn" data-a="next">下一步</button></div></div>');
    host.appendChild(card); show(card);
    var i = -1, list = $('.steps', card), figw = $('.figw', card), btn = $('[data-a=next]', card), askw = $('.askw', card);
    figw.innerHTML = sp.fig0 || '';
    function step() {
      i++;
      if (i >= sp.steps.length) { btn.remove(); resolve(); return; }
      var s = sp.steps[i];
      $$('li', list).forEach(function (x) { x.classList.remove('now'); });
      if (s.fig) figw.innerHTML = s.fig;
      if (s.t) list.appendChild(el('<li class="now"><span class="k">' + esc(s.k || ('第 ' + (list.children.length + 1) + ' 步')) + '</span><span>' + s.t + '</span></li>'));
      if (i === sp.steps.length - 1) btn.textContent = '想明白了';
      if (s.ask) { btn.disabled = true; askw.innerHTML = ''; miniAsk(askw, s.ask).then(function () { btn.disabled = false; }); }
      else askw.innerHTML = '';
    }
    btn.onclick = step; step();
  });
}
function ruleCard(host, main, sub) { var c = el('<div class="rule"><b>' + main + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div>'); host.appendChild(c); return Promise.resolve(); }

/* 滑杆演示：draw(p) 返回 {svg, cap, eq}；拉到头才能继续 */
function slideDemo(host, sp) {
  return new Promise(function (resolve) {
    var card = el('<div class="card"><span class="tag">动手看</span><h2>' + sp.title + '</h2><p>' + sp.text + '</p><div class="pre"></div><div class="stage hide"><div class="figw"></div><p class="cap"></p><div class="eq"></div><input type="range" min="0" max="100" value="0" aria-label="' + esc(sp.slider || '拖动') + '"><div class="row end"><button class="btn ghost" data-a="play">' + esc(sp.play || '自动演示') + '</button><button class="btn" data-a="ok" disabled>看明白了</button></div></div></div>');
    host.appendChild(card);
    var stage = $('.stage', card), rng = $('input', card), ok = $('[data-a=ok]', card), reached = false, raf;
    function paint() {
      var p = rng.value / 100, r = sp.draw(p);
      $('.figw', card).innerHTML = r.svg; $('.cap', card).innerHTML = r.cap || ''; $('.eq', card).innerHTML = r.eq || '';
      if (sp.reach ? sp.reach(p, rng) : p >= .99) { reached = true; ok.disabled = false; }
    }
    rng.oninput = paint;
    $('[data-a=play]', card).onclick = function () {
      cancelAnimationFrame(raf);
      if (REDUCED) { rng.value = 100; paint(); return; }
      var t0 = null; rng.value = 0;
      (function tick(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / 1800); rng.value = Math.round(k * 100); paint(); if (k < 1) raf = requestAnimationFrame(tick); })(performance.now());
    };
    ok.onclick = function () { ok.remove(); $('[data-a=play]', card).remove(); resolve(); };
    function open() { stage.classList.remove('hide'); paint(); }
    if (sp.predict) miniAsk($('.pre', card), sp.predict).then(open); else open();
    void reached;
  });
}

/* 把一串环节按顺序排出来 */
function run(host, makers) { return makers.reduce(function (p, mk) { return p.then(function () { return mk(host); }); }, Promise.resolve()); }
function practice(host, st, qs) {
  var head = el('<div><span class="tag red">自己做</span><p class="note">先自己想。错一次会给一句提示，再错看步骤。</p></div>'); host.appendChild(head); show(head);
  return qs.reduce(function (p, mk, i) { return p.then(function () { var q = mk(); q.st = st; return ask(host, q, '第 ' + (i + 1) + ' 题 / 共 ' + qs.length + ' 题').then(function () { }); }); }, Promise.resolve());
}

/* ---------- 出题器（每次数字不同） ---------- */
var G = {};
G.para = function () {
  var b = ri(5, 12), h = ri(3, 8), s = h + ri(1, 3);
  return { id: 'g-para', type: 'num', unit: 'cm²', ans: b * h, regen: G.para,
    text: '平行四边形的面积是多少？', fig: figPara({ b: b, h: h, lb: cm(b), lh: cm(h), ls: cm(s) }),
    hint: '找一对：底，和跟它成直角的高。斜边 ' + s + ' 用不到。',
    steps: ['底是 ' + b + '，和它成直角的高是 ' + h + '。', b + ' × ' + h + ' = ' + b * h + '（cm²）', s + ' 是斜边，不是高，不用它。'] };
};
G.perim = function () {
  var a = ri(6, 10), c = a + ri(2, 5), h = ri(3, Math.min(c - 1, 9)), P = 2 * (a + c);
  return { id: 'g-perim', type: 'num', unit: 'cm²', ans: a * h, regen: G.perim,
    text: '平行四边形周长 ' + P + ' cm，一条边 ' + c + ' cm，<b>另一条边</b>上的高是 ' + h + ' cm。面积是多少？',
    fig: figPara({ b: a, h: h, lb: '另一条边 ?', lh: cm(h), ls: cm(c) }),
    hint: '高 ' + h + ' 配的是“另一条边”。先把它求出来：周长的一半减去 ' + c + '。',
    steps: ['周长的一半是两条邻边的和：' + P + ' ÷ 2 = ' + (a + c) + '。', '另一条边：' + (a + c) + ' − ' + c + ' = ' + a + '（cm）', h + ' 是这条边上的高，它们是一对：' + a + ' × ' + h + ' = ' + a * h + '（cm²）', '不能算 ' + c + ' × ' + h + '：' + h + ' 不是 ' + c + ' 那条边上的高。'] };
};
G.tri = function (out) {
  var b = ri(4, 12), h = ri(3, 9); if ((b * h) % 2) b++;
  var outside = out === true;
  return { id: outside ? 'g-tri-out' : 'g-tri', type: 'num', unit: 'cm²', ans: b * h / 2, regen: function () { return G.tri(outside); },
    text: outside ? '这个三角形的高画在外面。面积是多少？' : '三角形的面积是多少？',
    fig: figTri({ b: b, h: h, ax: outside ? 1.32 : pick([.3, .5, .7]), lb: cm(b), lh: cm(h) }),
    hint: outside ? '高在外面也一样：它还是和底（延长出去的那条线）成直角。底还是粗线那一段。' : '底 × 高算出来的是两个这样的三角形，别忘了取一半。',
    steps: ['底 ' + b + '，它的高 ' + h + '。', b + ' × ' + h + ' = ' + b * h + '，这是两个三角形拼成的平行四边形。', '一个三角形：' + b * h + ' ÷ 2 = ' + b * h / 2 + '（cm²）'] };
};
G.triOut = function () { return G.tri(true); };
G.right = function () {
  var t = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]]);
  return { id: 'g-right', type: 'num', unit: 'cm²', ans: t[0] * t[1] / 2, regen: G.right,
    text: '直角三角形的三条边都标出来了。面积是多少？', fig: figRight({ a: t[1], b: t[0], la: cm(t[1]), lb: cm(t[0]), lc: cm(t[2]) }),
    hint: '夹着直角的两条边互相成直角：一条当底，另一条就是它的高。',
    steps: ['成直角的两条边是 ' + t[1] + ' 和 ' + t[0] + '：一条当底，一条当高。', t[1] + ' × ' + t[0] + ' ÷ 2 = ' + t[0] * t[1] / 2 + '（cm²）', t[2] + ' 是斜边，用不到。'] };
};
G.trap = function (right) {
  var a = ri(2, 6), b = a + ri(2, 6), h = ri(2, 8); if (((a + b) * h) % 2) h++;
  var rt = right === true;
  return { id: rt ? 'g-trap-right' : 'g-trap', type: 'num', unit: 'cm²', ans: (a + b) * h / 2, regen: function () { return G.trap(rt); },
    text: rt ? '直角梯形的面积是多少？' : '梯形的面积是多少？', fig: figTrap({ a: a, b: b, h: h, right: rt, la: '上底 ' + cm(a), lb: '下底 ' + cm(b), lh: cm(h) }),
    hint: rt ? '直角梯形里，和两条底都成直角的那条边就是高。先把上底、下底加起来。' : '先把上底和下底加起来（这是拼出来的平行四边形的底），再乘高，最后取一半。',
    steps: ['上底 + 下底：' + a + ' + ' + b + ' = ' + (a + b) + '。', '乘高：' + (a + b) + ' × ' + h + ' = ' + (a + b) * h + '，这是两个梯形。', '一个梯形：' + (a + b) * h + ' ÷ 2 = ' + (a + b) * h / 2 + '（cm²）'] };
};
G.trapRight = function () { return G.trap(true); };
G.revPara = function () {
  var b = ri(4, 9), h = ri(3, 9), S = b * h;
  return { id: 'g-rev-para', type: 'num', unit: 'cm', ans: h, regen: G.revPara,
    text: '平行四边形面积 ' + S + ' cm²，底 ' + b + ' cm。这条底上的高是多少？', fig: figPara({ b: b, h: h, lb: cm(b), lh: '?', area: S + ' cm²' }),
    hint: '底 × 高 = 面积。知道面积和底，倒着用除法。',
    steps: ['底 × 高 = 面积：' + b + ' × 高 = ' + S + '。', '高 = ' + S + ' ÷ ' + b + ' = ' + h + '（cm）'] };
};
G.revTri = function () {
  var b = ri(4, 10), h = ri(3, 9); if ((b * h) % 2) b++; var S = b * h / 2;
  return { id: 'g-rev-tri', type: 'num', unit: 'cm', ans: h, regen: G.revTri,
    text: '三角形面积 ' + S + ' cm²，底 ' + b + ' cm。这条底上的高是多少？', fig: figTri({ b: b, h: h, lb: cm(b), lh: '?', area: S + ' cm²' }),
    hint: '三角形是“取了一半”的。倒着想，第一步先 × 2，变回两个三角形拼成的平行四边形。',
    steps: ['先还原：' + S + ' × 2 = ' + S * 2 + '（这是底 × 高）。', '再除以底：' + S * 2 + ' ÷ ' + b + ' = ' + h + '（cm）', '检查：' + b + ' × ' + h + ' ÷ 2 = ' + S + '，对。'] };
};
G.revTrap = function () {
  var a = ri(2, 5), b = a + ri(2, 5), h = ri(2, 8); if (((a + b) * h) % 2) h++; var S = (a + b) * h / 2;
  return { id: 'g-rev-trap', type: 'num', unit: 'cm', ans: h, regen: G.revTrap,
    text: '梯形面积 ' + S + ' cm²，上底 ' + a + ' cm，下底 ' + b + ' cm。高是多少？', fig: figTrap({ a: a, b: b, h: h, la: '上底 ' + cm(a), lb: '下底 ' + cm(b), lh: '?', area: S + ' cm²' }),
    hint: '梯形也是“取了一半”的。先 × 2，再除以（上底 + 下底）。',
    steps: ['先还原：' + S + ' × 2 = ' + S * 2 + '。', '两底的和：' + a + ' + ' + b + ' = ' + (a + b) + '。', '高 = ' + S * 2 + ' ÷ ' + (a + b) + ' = ' + h + '（cm）'] };
};
G.house = function () {
  var w = ri(4, 8), hh = ri(3, 6), r = ri(2, 4); if ((w * r) % 2) w++;
  return { id: 'g-house', type: 'num', unit: 'm²', ans: w * hh + w * r / 2, regen: G.house,
    text: '一面墙：下面是长方形，上面是三角形。整面墙的面积是多少？', fig: figHouse({ w: w, hh: hh, r: r }),
    hint: '分成两块熟悉的图形：长方形一块，三角形一块，分别算，再加起来。三角形的底就是长方形的长 ' + w + '。',
    steps: ['长方形：' + w + ' × ' + hh + ' = ' + w * hh + '。', '三角形：底 ' + w + '、高 ' + r + '，' + w + ' × ' + r + ' ÷ 2 = ' + w * r / 2 + '。', '加起来：' + w * hh + ' + ' + w * r / 2 + ' = ' + (w * hh + w * r / 2) + '（m²）'] };
};
G.cut = function () {
  var w = ri(6, 10), hh = ri(4, 6), cb = ri(2, w - 2), ch = ri(2, hh - 1); if ((cb * ch) % 2) cb++;
  return { id: 'g-cut', type: 'num', unit: 'm²', ans: w * hh - cb * ch / 2, regen: G.cut,
    text: '长方形木板挖掉一个三角形（白色）。剩下涂色部分的面积是多少？', fig: figCut({ w: w, hh: hh, cb: cb, ch: ch }),
    hint: '整块长方形减去挖掉的三角形。',
    steps: ['整块：' + w + ' × ' + hh + ' = ' + w * hh + '。', '挖掉的三角形：' + cb + ' × ' + ch + ' ÷ 2 = ' + cb * ch / 2 + '。', '剩下：' + w * hh + ' − ' + cb * ch / 2 + ' = ' + (w * hh - cb * ch / 2) + '（m²）'] };
};
G.lshape = function () {
  var W = ri(6, 10), H = ri(5, 8), w2 = ri(2, W - 3), h1 = ri(2, H - 2), o = { W: W, H: H, w2: w2, h1: h1 }, S = W * h1 + w2 * (H - h1);
  return { id: 'g-l', type: 'num', unit: 'm²', ans: S, regen: G.lshape,
    text: '这块地的面积是多少？（每个角都是直角）', fig: figL(o, ''),
    hint: '分一分：横着切一刀，变成上下两个长方形。上面那块的高是 ' + H + ' − ' + h1 + '。也可以补成大长方形再减。',
    steps: ['分：下面 ' + W + ' × ' + h1 + ' = ' + W * h1 + '；上面 ' + w2 + ' × ' + (H - h1) + ' = ' + w2 * (H - h1) + '。', '加起来：' + W * h1 + ' + ' + w2 * (H - h1) + ' = ' + S + '（m²）', '或者补：' + W + ' × ' + H + ' − ' + (W - w2) + ' × ' + (H - h1) + ' = ' + S + '，一样。'] };
};

/* ---------- 第 1 站用的"哪条是高"图 ---------- */
function whichFig(kind) {
  var f, A, B, C, D, F;
  if (kind === 'para') {
    A = [0, 0]; B = [6, 0]; C = [8, 4]; D = [2, 4]; F = [2, 0];
    f = Fig({ h: 210 }).poly([A, B, C, D]).seg(A, B, 'base').seg(A, D, 'c1').seg(D, F, 'c2').seg(D, C, 'c3')
      .label(mid(A, B), '底', { dy: 20, cls: 'tb' }).label(mid(A, D), '①', { dx: -12, a: 'end', cls: 't1 big' }).label(mid(D, F), '②', { dx: 12, a: 'start', cls: 't2 big' }).label(mid(D, C), '③', { dy: -14, cls: 't3 big' });
    return f.svg('平行四边形，粗线是底，三条彩色线段 ①②③');
  }
  if (kind === 'obtuse') {
    A = [0, 0]; B = [5, 0]; var T = [7.5, 4]; F = [7.5, 0];
    f = Fig({ h: 210 }).poly([A, B, T]).seg(B, F, 'ext').seg(A, B, 'base').seg(B, T, 'c1').seg(T, F, 'c2').seg(A, T, 'c3')
      .label(mid(A, B), '底', { dy: 20, cls: 'tb' }).label(mid(B, T), '①', { dx: 12, dy: 8, a: 'start', cls: 't1 big' }).label(mid(T, F), '②', { dx: 12, a: 'start', cls: 't2 big' }).label(mid(A, T), '③', { dx: -10, dy: -10, a: 'end', cls: 't3 big' });
    return f.svg('钝角三角形，粗线是底，三条彩色线段 ①②③');
  }
  A = [0, 0]; B = [7, 0]; C = [10, 4]; D = [3, 4]; F = [2.52, 3.36];
  f = Fig({ h: 210 }).poly([A, B, C, D]).seg(A, D, 'base').seg(B, C, 'c1').seg(B, F, 'c2').seg(A, B, 'c3')
    .label(mid(A, D), '底', { dx: -12, a: 'end', cls: 'tb' }).label(mid(B, C), '①', { dx: 12, a: 'start', cls: 't1 big' }).label(lerp(B, F, .45), '②', { dy: -14, cls: 't2 big' }).label(mid(A, B), '③', { dy: 20, cls: 't3 big' });
  return f.svg('平行四边形，斜着的粗线是底，三条彩色线段 ①②③');
}

/* ---------- 各站 ---------- */
var STATIONS = [
  { id: 's1', t: '高是谁的高', d: '底和高是一对。看不出来，就把本子转一转。' },
  { id: 's2', t: '平行四边形：剪·移·拼', d: '把斜的变成正的，面积没变。' },
  { id: 's3', t: '三角形：拼两个，取一半', d: '为什么要 ÷2，自己拼出来看。' },
  { id: 's4', t: '梯形：拼两个，两底相加', d: '新的底 = 上底 + 下底。' },
  { id: 's5', t: '拉一拉：样子变了，面积没变', d: '等底等高，面积相等。' },
  { id: 's6', t: '倒着想：知道面积，求底或高', d: '取过一半的，先 ×2 还回去。' },
  { id: 's7', t: '组合图形：分一分，补一补', d: '陌生的图，变成几块熟悉的图。' },
  { id: 's8', t: '闯关：10 道新题', d: '每次数字都不同，不给提示先自己做。' }
];
var BUILD = {};

BUILD.s1 = function (host) {
  var A = [0, 0], B = [6, 0], C = [9, 4], D = [3, 4], CEN = [4.5, 2], FB = [3, 0], FS = [2.16, 2.88];
  function demo(h) {
    return new Promise(function (resolve) {
      var card = el('<div class="card"><span class="tag">动手看</span><h2>同一个平行四边形，换一条边当底</h2><p>高不是随便一条线。<b>先定底，再找它的高</b>：高要和这条底成直角。</p><div class="seg"><button data-m="flat" class="on">下面这条边当底</button><button data-m="slant">斜的这条边当底</button></div><div class="figw"></div><p class="cap"></p><div class="turn hide"><input type="range" min="0" max="100" value="0" aria-label="转动图形"><div class="row end"><button class="btn ghost" data-a="play">转一转，让底躺平</button></div></div><div class="row end"><button class="btn" data-a="ok" disabled>看明白了</button></div></div>');
      h.appendChild(card);
      var mode = 'flat', seen = {}, rng = $('input', card), raf;
      function paint() {
        var ang = mode === 'slant' ? 126.87 * rng.value / 100 : 0;
        var R = function (p) { return rot(p, CEN, ang); };
        var f = Fig({ w: 340, h: 300, pad: [20, 20, 20, 20], bounds: [-.7, -3.2, 9.7, 7.2] }).poly([A, B, C, D].map(R));
        var b0, b1, h0, h1, u, v;
        if (mode === 'flat') { b0 = A; b1 = B; h0 = D; h1 = FB; u = [1, 0]; v = [0, 1]; } else { b0 = A; b1 = D; h0 = B; h1 = FS; u = [.6, .8]; v = [.8, -.6]; }
        var O = [0, 0];
        f.seg(R(b0), R(b1), 'base').seg(R(h0), R(h1), 'hgt').ra(R(h1), rot(u, O, ang), rot(v, O, ang));
        var mb = R(mid(b0, b1)), mh = R(mid(h0, h1));
        var ob = [mb[0] - CEN[0], mb[1] - CEN[1]], L = Math.hypot(ob[0], ob[1]) || 1;
        f.label(mb, '底', { dx: ob[0] / L * 20, dy: -ob[1] / L * 20, cls: 'tb big' });
        f.label(mh, '高', { dx: 12, dy: mode === 'flat' ? 0 : -14 * (1 - rng.value / 100), a: 'start', cls: 'th big' });
        $('.figw', card).innerHTML = f.svg(mode === 'flat' ? '下面的边当底，高竖着' : '斜边当底，高和斜边成直角');
        var cap = mode === 'flat' ? '<b>下面的边当底</b>：高从上面那条边直直地量下来，和底成直角。'
          : (rng.value >= 99 ? '<b>底躺平了，高就站直了。</b>还是同一条红线，只是我们换了个方向看。' : '<b>斜的边当底</b>：高要和这条斜边成直角，所以它看起来是歪的。拉下面的滑杆，把图转一转。');
        $('.cap', card).innerHTML = cap;
        if (mode === 'flat') seen.flat = true; else if (rng.value >= 99) seen.slant = true;
        if (seen.flat && seen.slant) $('[data-a=ok]', card).disabled = false;
      }
      $$('.seg button', card).forEach(function (b) { b.onclick = function () { mode = b.dataset.m; rng.value = 0; cancelAnimationFrame(raf); $$('.seg button', card).forEach(function (x) { x.classList.toggle('on', x === b); }); $('.turn', card).classList.toggle('hide', mode !== 'slant'); paint(); }; });
      rng.oninput = paint;
      $('[data-a=play]', card).onclick = function () {
        cancelAnimationFrame(raf);
        if (REDUCED) { rng.value = 100; paint(); return; }
        var t0 = null; rng.value = 0;
        (function tick(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / 2000); rng.value = Math.round(k * 100); paint(); if (k < 1) raf = requestAnimationFrame(tick); })(performance.now());
      };
      $('[data-a=ok]', card).onclick = function () { this.remove(); resolve(); };
      paint();
    });
  }
  return run(host, [
    demo,
    function (h) { return ruleCard(h, '底和高是一对。高要和它的底成直角。', '斜着的边不是高。看不出哪条是高，就把本子转一转，让底躺平。'); },
    function (h) {
      return thinkAlong(h, { title: '三条线，哪条是高？', text: '粗线是底。①②③ 里只有一条是它的高。', fig0: whichFig('para'), steps: [
        { k: '先定底', t: '底是下面那条粗线。' },
        { k: '用直角去靠', t: '高要和底成直角。想象拿三角尺的直角去靠：① 是斜的，靠不上，它<b>不是</b>高。' },
        { k: '再看 ③', t: '③ 是上面那条边。', ask: { q: '③ 和底是什么关系？', opts: ['成直角', '平行（像两根铁轨）'], ans: 1, two: true, why: '③ 和底一直一样远，不会相交，是平行的。', ok: '对，③ 和底平行，不是高。' } },
        { k: '结论', t: '② 从上面直直地落到底上，和底成直角。<b>② 是高。</b>' }
      ] });
    },
    function (h) {
      return practice(h, 's1', [
        function () { return { id: 's1-q1', type: 'mc', text: '粗线是底。哪条是它的高？', fig: whichFig('para'), opts: ['①', '②', '③'], ans: 1, hint: '高要和底成直角。哪一条能让三角尺的直角靠上去？', steps: ['① 是斜边，和底不成直角。', '③ 和底平行。', '② 和底成直角，② 是高。'] }; },
        function () { return { id: 's1-q2', type: 'mc', text: '这个三角形很斜。粗线是底，哪条是它的高？', fig: whichFig('obtuse'), opts: ['①', '②', '③'], ans: 1, hint: '高可以在图形外面。把底延长出去（灰虚线），看哪条线和它成直角。', steps: ['①、③ 都是三角形的斜边，和底不成直角。', '把底延长（灰虚线），② 从顶点直直落下来，和它成直角。', '② 是高。高在图形外面也没关系。'] }; },
        function () { return { id: 's1-q3', type: 'mc', text: '这次<b>斜着的粗线</b>是底。哪条是它的高？', fig: whichFig('slant'), opts: ['①', '②', '③'], ans: 1, hint: '把本子转一转，让粗线躺平。哪条线会站直？', steps: ['① 是粗线对面的边，和粗线平行。', '③ 是下面的边，和粗线不成直角。', '② 和粗线成直角。把图转到粗线躺平，② 就站直了：② 是高。'] }; },
        function () { return { id: 's1-q4', type: 'mc', text: '平行四边形一条边 8 cm，<b>这条边上的高</b>是 6 cm，旁边的斜边 12 cm。算面积用哪两个数？', fig: figPara({ b: 8, h: 6, lb: '8 cm', lh: '6 cm', ls: '12 cm' }), opts: ['8 和 6', '12 和 6', '8 和 12'], ans: 0, hint: '6 是谁的高？题目说的是“这条边（8）上的高”。', steps: ['6 是 8 那条边上的高，8 和 6 是一对。', '面积 = 8 × 6 = 48（cm²）', '12 是斜边：6 不是它的高，不能用 12 × 6。'] }; }
      ]);
    }
  ]);
};

BUILD.s2 = function (host) {
  return run(host, [
    function (h) {
      return slideDemo(h, { title: '斜的格子数不清，怎么办？', text: '每个小格是 1 cm²。平行四边形两头是斜的，格子被切成了半个半个。', slider: '把左边的三角形移到右边',
        predict: { q: '沿着高剪下左边的小三角形，移到右边。面积会变吗？', opts: ['会变大', '不变', '会变小'], ans: 1, why: '想一想：纸剪开再拼上，有没有多出一块，或者丢掉一块？', ok: '对，纸没多也没少。拉滑杆，自己移过去看。' },
        draw: function (p) {
          var f = Fig({ h: 210, bounds: [0, 0, 8, 4] }).poly([[2, 0], [6, 0], [8, 4], [2, 4]]).poly([[6 * p, 0], [2 + 6 * p, 0], [2 + 6 * p, 4]], 'shape2').grid(0, 0, 8, 4);
          if (p < .99) f.seg([2, 0], [2, 4], 'hgt'); else f.seg([2, 0], [8, 0], 'base').seg([2, 0], [2, 4], 'hgts').label([5, 0], '6 格', { dy: 20, cls: 'tb' }).label([2, 2], '4 行', { dx: -8, a: 'end', cls: 'th' });
          return { svg: f.svg('平行四边形剪拼成长方形'), cap: p < .99 ? '把滑杆拉到头：左边的小三角形移到右边。' : '<b>变成长方形了。</b>每行 6 格，有 4 行，能数清了。', eq: p < .99 ? '' : '6 × 4 = 24（cm²）' };
        } });
    },
    function (h) { return ruleCard(h, '平行四边形的面积 = 底 × 高', '剪拼以后：底变成了长方形的长，高变成了宽。斜边没有变成长也没有变成宽，所以不用它。'); },
    function (h) {
      return thinkAlong(h, { title: '用“三问”做一道题', text: '平行四边形：底 8 cm，斜边 5 cm，高 3 cm。求面积。', fig0: figPara({ b: 8, h: 3, lb: '8 cm', lh: '3 cm', ls: '5 cm' }), steps: [
        { k: '问1 求哪块', t: '求整个涂色的平行四边形。' },
        { k: '问2 底是哪条', t: '下面的粗线，8 cm。' },
        { k: '问3 它的高', t: '和 8 成直角的红虚线，3 cm。5 是斜边，用不到。', ask: { q: '所以怎么列式？', opts: ['8 × 5', '8 × 3', '5 × 3'], ans: 1, why: '只用成直角的那一对：底和它的高。', ok: '对，8 × 3。' } },
        { k: '算', t: '8 × 3 = 24（cm²）' }
      ] });
    },
    function (h) {
      return thinkAlong(h, { title: '难一点：高配的是哪条边？', text: '平行四边形周长 36 cm，一条边 10 cm，<b>另一条边</b>上的高是 5 cm。求面积。', fig0: figPara({ b: 8, h: 5, lb: '另一条边 ?', lh: '5 cm', ls: '10 cm' }), steps: [
        { k: '读题', t: '关键词是“<b>另一条边</b>上的高”。高 5 配的不是 10，是我们还不知道的那条边。所以图上把它放平当底。' },
        { k: '先求底', t: '周长是四条边：两条 10，两条“另一条边”。一半就是一条 10 加一条另一条边。', ask: { q: '另一条边是多少？', opts: ['36 − 10 = 26', '36 ÷ 2 − 10 = 8', '36 ÷ 4 = 9'], ans: 1, why: '周长的一半是 18，18 里有一条 10，剩下的就是另一条边。', ok: '对，另一条边是 8 cm。' }, fig: figPara({ b: 8, h: 5, lb: '另一条边 ?', lh: '5 cm', ls: '10 cm' }) },
        { k: '配对', t: '底 8，它的高 5，是一对。', fig: figPara({ b: 8, h: 5, lb: '8 cm', lh: '5 cm' }) },
        { k: '算', t: '8 × 5 = 40（cm²）。不能算 10 × 5：5 不是 10 那条边上的高。' }
      ] });
    },
    function (h) { return practice(h, 's2', [G.para, G.perim, G.revPara]); }
  ]);
};

BUILD.s3 = function (host) {
  var A = [0, 0], B = [6, 0], T = [2, 4], M = [4, 2];
  return run(host, [
    function (h) {
      return slideDemo(h, { title: '再拿一个一模一样的三角形', text: '第二个三角形（黄色）和第一个完全一样，先叠在上面。把它转过来，拼到旁边。', slider: '转动第二个三角形',
        predict: { q: '两个一模一样的三角形，能拼成什么？', opts: ['一个平行四边形', '一个更大的三角形'], ans: 0, two: true, why: '把其中一个倒过来，斜边对斜边拼上去试试。', ok: '拉滑杆，自己拼出来。' },
        draw: function (p) {
          var f = Fig({ h: 270, pad: [34, 14, 34, 14], bounds: [-.4, -2.4, 8.4, 6.4] }).poly([A, B, T]).poly(flipTo([A, B, T], M, p), 'shape2');
          f.seg(A, B, 'base').seg(T, [2, 0], 'hgt').ra([2, 0], [1, 0], [0, 1]).label([3, 0], '底 6', { dy: 20, cls: 'tb' }).label([2, 2], '高 4', { dx: -8, a: 'end', cls: 'th' });
          return { svg: f.svg('两个相同三角形拼成平行四边形'), cap: p < .99 ? '把滑杆拉到头：第二个三角形转半圈。' : '<b>拼成了平行四边形。</b>它的底还是 6，高还是 4。6 × 4 = 24 是两个三角形。', eq: p < .99 ? '' : '一个三角形：6 × 4 ÷ 2 = 12' };
        } });
    },
    function (h) { return ruleCard(h, '三角形的面积 = 底 × 高 ÷ 2', '底 × 高算出来的是“两个三角形拼成的平行四边形”，所以一个三角形要取一半。'); },
    function (h) {
      return thinkAlong(h, { title: '用“三问”做一道题', text: '三角形：底 10 cm，高 6 cm。求面积。', fig0: figTri({ b: 10, h: 6, ax: .6, lb: '10 cm', lh: '6 cm' }), steps: [
        { k: '问1 求哪块', t: '求涂色的这一个三角形。' },
        { k: '问2、问3', t: '底 10，和它成直角的高 6。' },
        { k: '先乘', t: '10 × 6 = 60。', ask: { q: '60 是谁的面积？', opts: ['这一个三角形', '两个这样的三角形拼成的平行四边形'], ans: 1, why: '想想刚才拼出来的图：底 × 高是整块平行四边形。', ok: '对，是两个。所以还要取一半。' } },
        { k: '取一半', t: '60 ÷ 2 = 30（cm²）' }
      ] });
    },
    function (h) { return practice(h, 's3', [G.tri, G.triOut, G.right]); }
  ]);
};

BUILD.s4 = function (host) {
  var P = [[0, 0], [8, 0], [6, 4], [2, 4]], M = [7, 2];
  return run(host, [
    function (h) {
      return slideDemo(h, { title: '梯形也拿两个来拼', text: '第二个梯形（黄色）和第一个完全一样。把它转半圈，拼到右边。', slider: '转动第二个梯形',
        predict: { q: '拼好以后，下面那条长长的底是由谁接起来的？', opts: ['两条下底', '一条下底 + 一条上底'], ans: 1, two: true, why: '第二个梯形转了半圈，它原来在上面的短边，现在到下面来了。', ok: '拉滑杆看一看。' },
        draw: function (p) {
          var f = Fig({ h: 250, pad: [16, 14, 16, 14], bounds: [-.3, -2.7, 14.3, 6.7] }).poly(P).poly(flipTo(P, M, p), 'shape2');
          f.seg([2, 4], [2, 0], 'hgt').ra([2, 0], [1, 0], [0, 1]).label([4, 4], '上底 4', { dy: -14, cls: 'tb' }).label([4, 0], '下底 8', { dy: 20, cls: 'tb' }).label([2, 2], '高 4', { dx: 8, a: 'start', cls: 'th' });
          if (p >= .99) f.seg([0, 0], [12, 0], 'base').label([10, 0], '上底 4', { dy: 20, cls: 'tb' });
          return { svg: f.svg('两个相同梯形拼成平行四边形'), cap: p < .99 ? '把滑杆拉到头：第二个梯形转半圈。' : '<b>拼成了平行四边形。</b>新的底 = 下底 8 + 上底 4 = 12，高还是 4。12 × 4 = 48 是两个梯形。', eq: p < .99 ? '' : '一个梯形：(4 + 8) × 4 ÷ 2 = 24' };
        } });
    },
    function (h) { return ruleCard(h, '梯形的面积 =（上底 + 下底）× 高 ÷ 2', '先加：两底加起来是拼出来的新底。再乘高。最后取一半，因为拼了两个。'); },
    function (h) {
      return thinkAlong(h, { title: '三步：加 → 乘 → 取一半', text: '梯形：上底 3 cm，下底 7 cm，高 4 cm。求面积。', fig0: figTrap({ a: 3, b: 7, h: 4, la: '上底 3 cm', lb: '下底 7 cm', lh: '4 cm' }), steps: [
        { k: '加', t: '两个梯形拼成平行四边形。', ask: { q: '拼出来的平行四边形，底是多少？', opts: ['7', '3 + 7 = 10', '7 − 3 = 4'], ans: 1, why: '新的底是一条下底接一条上底。', ok: '对，3 + 7 = 10。' } },
        { k: '乘', t: '10 × 4 = 40，这是两个梯形。' },
        { k: '取一半', t: '40 ÷ 2 = 20（cm²）。写成一个式子：(3 + 7) × 4 ÷ 2 = 20，括号不能丢。' }
      ] });
    },
    function (h) { return practice(h, 's4', [G.trap, G.trapRight, G.trap]); }
  ]);
};

BUILD.s5 = function (host) {
  return run(host, [
    function (h) {
      return slideDemo(h, { title: '拉着顶点走', text: '上下两条灰线是平行的（像铁轨）。三角形的底不动，顶点沿着上面那条线走。', slider: '左右移动顶点', play: '自动走一遍',
        predict: { q: '顶点往右拉，三角形越来越斜。面积会变吗？', opts: ['会变', '不会变'], ans: 1, two: true, why: '面积只看底和高。顶点沿着铁轨走，底变了吗？高变了吗？', ok: '拉滑杆，盯住底和高这两个数。' },
        reach: function (p, rng) { rng._mx = Math.max(rng._mx || 0, p); return rng._mx >= .95; },
        draw: function (p) {
          var x = 1 + 9 * p, T = [x, 4], F = [x, 0];
          var f = Fig({ h: 220, bounds: [-.5, 0, 10.5, 4] }).seg([-.5, 4], [10.5, 4], 'par').seg([-.5, 0], [10.5, 0], 'par').poly([[2, 0], [8, 0], T]).seg([2, 0], [8, 0], 'base').seg(T, F, 'hgt').ra(F, [x > 8 ? -1 : 1, 0], [0, 1]);
          f.label([5, 0], '底 6', { dy: 20, cls: 'tb' }).label([x, 2], '高 4', { dx: x > 7 ? -8 : 8, a: x > 7 ? 'end' : 'start', cls: 'th' });
          return { svg: f.svg('顶点沿平行线移动的三角形'), cap: x > 8 ? '顶点跑到外面了，高也画到了外面。<b>底还是 6，高还是 4。</b>' : '样子在变，<b>底还是 6，高还是 4。</b>', eq: '6 × 4 ÷ 2 = 12（一直是 12）' };
        } });
    },
    function (h) { return ruleCard(h, '等底等高的三角形，面积相等。', '面积只看底和高，不看样子斜不斜。同底同高时，三角形是平行四边形的一半。'); },
    function (h) {
      var f = Fig({ h: 210, bounds: [0, 0, 13, 4] }).seg([0, 4], [13, 4], 'par').seg([0, 0], [13, 0], 'par')
        .poly([[0, 0], [3, 0], [1.5, 4]]).poly([[5, 0], [8, 0], [5, 4]]).poly([[10, 0], [13, 0], [9, 4]])
        .seg([0, 0], [3, 0], 'base').seg([5, 0], [8, 0], 'base').seg([10, 0], [13, 0], 'base')
        .label([1.5, 0], '甲 3 cm', { dy: 20, cls: 'tb' }).label([6.5, 0], '乙 3 cm', { dy: 20, cls: 'tb' }).label([11.5, 0], '丙 3 cm', { dy: 20, cls: 'tb' }).svg('两条平行线之间的三个三角形');
      return thinkAlong(h, { title: '三个三角形，谁大？', text: '甲、乙、丙夹在两条平行线中间，底都是 3 cm。', fig0: f, steps: [
        { k: '看底', t: '三个的底都是 3 cm，一样。' },
        { k: '看高', t: '三个都夹在同一对平行线中间。', ask: { q: '它们的高一样吗？', opts: ['一样，都是两条线之间的距离', '丙最斜，高最长'], ans: 0, why: '高是直直地量，不是沿着斜边量。两条平行线之间处处一样远。', ok: '对，高都一样。' } },
        { k: '结论', t: '底一样，高一样，<b>面积就一样</b>。不用算，也不要被“看起来大”骗了。' }
      ] });
    },
    function (h) {
      return practice(h, 's5', [
        function () { var f = Fig({ h: 200, bounds: [0, 0, 11, 4] }).seg([0, 4], [11, 4], 'par').seg([0, 0], [11, 0], 'par').poly([[0, 0], [4, 0], [1, 4]]).poly([[6, 0], [10, 0], [11, 4]]).seg([0, 0], [4, 0], 'base').seg([6, 0], [10, 0], 'base').label([2, 0], '甲 4 cm', { dy: 20, cls: 'tb' }).label([8, 0], '乙 4 cm', { dy: 20, cls: 'tb' }).svg('平行线间的两个三角形');
          return { id: 's5-q1', type: 'mc', text: '甲和乙夹在两条平行线中间，底都是 4 cm。谁的面积大？', fig: f, opts: ['甲大', '乙大', '一样大'], ans: 2, hint: '面积只看底和高。它们的底一样吗？高一样吗？', steps: ['底都是 4 cm。', '都夹在同一对平行线中间，高一样。', '等底等高，面积一样大。'] }; },
        function () { var S = pick([18, 24, 30, 36, 42]); return { id: 's5-q2', type: 'num', unit: 'cm²', ans: S / 2, text: '一个平行四边形面积是 ' + S + ' cm²。和它等底等高的三角形，面积是多少？', hint: '两个一样的三角形拼成一个等底等高的平行四边形。', steps: ['三角形是等底等高平行四边形的一半。', S + ' ÷ 2 = ' + S / 2 + '（cm²）'] }; },
        function () { var S = pick([7, 9, 12, 15]); return { id: 's5-q3', type: 'num', unit: 'cm²', ans: S * 2, text: '一个三角形面积是 ' + S + ' cm²。和它等底等高的平行四边形，面积是多少？', hint: '这次是反过来：平行四边形是两个三角形。', steps: ['等底等高的平行四边形 = 2 个这样的三角形。', S + ' × 2 = ' + S * 2 + '（cm²）'] }; }
      ]);
    }
  ]);
};

BUILD.s6 = function (host) {
  var A = [0, 0], B = [8, 0], T = [3, 6], M = [5.5, 3];
  function tri(extra) { var f = Fig({ h: 220, bounds: [0, 0, 11, 6] }).poly([A, B, T]); if (extra) f.poly([A, B, T].map(function (q) { return rot(q, M, 180); }), 'shape2'); f.seg(A, B, 'base').seg(T, [3, 0], 'hgt').ra([3, 0], [1, 0], [0, 1]).label([4, 0], '底 8 cm', { dy: 20, cls: 'tb' }).label([3, 3], '高 ?', { dx: -8, a: 'end', cls: 'th' }).label(extra ? [6.5, 2.2] : [3.8, 1.6], extra ? '一共 48' : '面积 24', { cls: 'tm' }); return f.svg(extra ? '还原成平行四边形' : '已知面积的三角形'); }
  return run(host, [
    function (h) {
      return thinkAlong(h, { title: '知道面积，怎么找回高？', text: '三角形面积 24 cm²，底 8 cm。这条底上的高是多少？', fig0: tri(false), steps: [
        { k: '想公式', t: '底 × 高 ÷ 2 = 面积。这个三角形是“取过一半”的。' },
        { k: '先还回去', t: '倒着走，最后一步先还：取过一半，就先 × 2。24 × 2 = 48，这是两个三角形拼成的平行四边形。', fig: tri(true) },
        { k: '再除以底', t: '平行四边形：底 × 高 = 48。', ask: { q: '高是多少？', opts: ['48 ÷ 8 = 6', '24 ÷ 8 = 3', '48 × 8 = 384'], ans: 0, why: '底 × 高 = 48，底是 8，用除法找高。注意用的是还原以后的 48。', ok: '对，高是 6 cm。' } },
        { k: '检查', t: '代回去：8 × 6 ÷ 2 = 24，和题目一样。倒着求的题，都代回去查一遍。' }
      ] });
    },
    function (h) { return ruleCard(h, '倒着求：取过一半的，先 × 2。', '三角形、梯形先把面积 × 2，再除。平行四边形没有取一半，直接除。最后代回去检查。'); },
    function (h) { return practice(h, 's6', [G.revTri, G.revPara, G.revTrap]); }
  ]);
};

BUILD.s7 = function (host) {
  var L = { W: 8, H: 6, w2: 5, h1: 4 };
  function demo(h) {
    return new Promise(function (resolve) {
      var card = el('<div class="card"><span class="tag">动手看</span><h2>没有公式的图形，怎么办？</h2><p>L 形没有自己的面积公式。办法：<b>把它变成长方形</b>。有两条路，都点开看看。</p><div class="seg"><button data-m="split">分一分</button><button data-m="fill">补一补</button></div><div class="figw"></div><p class="cap"></p><div class="eq"></div><div class="row end"><button class="btn" data-a="ok" disabled>看明白了</button></div></div>');
      h.appendChild(card); var seen = {};
      function paint(m) {
        $('.figw', card).innerHTML = figL(L, m);
        $('.cap', card).innerHTML = m === 'split' ? '<b>分</b>：横着切一刀，变成上下两个长方形。上面那块的高是 6 − 4 = 2。分开算，<b>加起来</b>。' : m === 'fill' ? '<b>补</b>：把缺的角补上，变成一个大长方形。补上的那块是 3 × 2。算大的，<b>减掉补的</b>。' : '先点上面的按钮。';
        $('.eq', card).innerHTML = m === 'split' ? '8 × 4 + 5 × 2 = 42（m²）' : m === 'fill' ? '8 × 6 − 3 × 2 = 42（m²）' : '';
        if (m) seen[m] = true; if (seen.split && seen.fill) $('[data-a=ok]', card).disabled = false;
      }
      $$('.seg button', card).forEach(function (b) { b.onclick = function () { $$('.seg button', card).forEach(function (x) { x.classList.toggle('on', x === b); }); paint(b.dataset.m); }; });
      $('[data-a=ok]', card).onclick = function () { this.remove(); resolve(); };
      paint('');
    });
  }
  return run(host, [
    demo,
    function (h) { return ruleCard(h, '分开算就加，补满算就减。', '两条路答案一样。哪条路要用的数题目里都有，就走哪条。'); },
    function (h) {
      return thinkAlong(h, { title: '一面墙：先分块，再一块一块问', text: '下面是长方形（长 6 m、宽 4 m），上面是三角形（高 2 m）。求整面墙的面积。', fig0: figHouse({ w: 6, hh: 4, r: 2 }), steps: [
        { k: '分块', t: '分成两块熟悉的图形：下面长方形，上面三角形。' },
        { k: '长方形', t: '6 × 4 = 24。' },
        { k: '三角形', t: '高是 2。底没有直接写出来。', ask: { q: '三角形的底是多少？', opts: ['6，就是长方形的长', '4，就是长方形的宽', '题目没给，算不出'], ans: 0, why: '看图：三角形的底和长方形上面那条边是同一条线。', ok: '对，底是 6。6 × 2 ÷ 2 = 6。' } },
        { k: '加起来', t: '24 + 6 = 30（m²）。检查：两块拼起来正好是整面墙，没有重复，也没有漏。' }
      ] });
    },
    function (h) { return practice(h, 's7', [G.house, G.cut, G.lshape]); }
  ]);
};

/* 闯关：10 道，每类各一，顺序打乱 */
BUILD.s8 = function (host) {
  return new Promise(function (resolve) {
    var gens = shuffle([G.para, G.perim, G.tri, G.triOut, G.right, G.trap, G.revTri, G.revTrap, G.house, G.lshape]);
    var res = [], bar = el('<div class="prog">' + gens.map(function () { return '<i></i>'; }).join('') + '</div>');
    var intro = el('<div class="card"><span class="tag red">闯关</span><h2>10 道新题，自己做</h2><p>拿好草稿纸。每道题先在心里走一遍三问：<b>求哪块？底是哪条？它的高是哪条？</b></p><div class="row end"><button class="btn">开始</button></div></div>');
    host.appendChild(intro);
    $('button', intro).onclick = function () {
      intro.remove(); host.appendChild(bar);
      var i = 0;
      (function next() {
        if (i >= gens.length) return finish();
        $$('i', bar).forEach(function (x, k) { x.className = k < res.length ? (res[k] === 'right' ? 'r' : res[k] === 'hinted' ? 'h' : 'w') : k === i ? 'cur' : ''; });
        var wrap = el('<div></div>'); host.appendChild(wrap);
        var q = gens[i](); q.st = 's8'; delete q.regen;
        var got = null;
        ask(wrap, q, '第 ' + (i + 1) + ' 题 / 共 10 题', function (r) { got = r; }).then(function () {
          res.push(got); i++;
          if (got === 'wrong') { wrap.remove(); show(bar); next(); }
          else { var go = el('<div class="row end"><button class="btn">' + (i >= gens.length ? '看结果' : '下一题') + '</button></div>'); wrap.appendChild(go); $('button', go).onclick = function () { wrap.remove(); show(bar); next(); }; }
        });
        show(bar);
      })();
    };
    function finish() {
      $$('i', bar).forEach(function (x, k) { x.className = res[k] === 'right' ? 'r' : res[k] === 'hinted' ? 'h' : 'w'; });
      var r = res.filter(function (x) { return x === 'right'; }).length, hn = res.filter(function (x) { return x === 'hinted'; }).length, w = 10 - r - hn;
      state.quiz.push({ at: new Date().toISOString(), right: r, hinted: hn, wrong: w }); save();
      sendReport('quiz', { label: '闯关 10 题', score: r + '/10（一次做对）', hintedCount: hn });
      var msg = r >= 9 ? '一次做对 ' + r + ' 道，底和高找得很准。' : r >= 6 ? '一次做对 ' + r + ' 道。黄色和红色的那几道，回到对应的站再看一遍“跟我想”。' : '这次一次做对 ' + r + ' 道。先不急着再闯，回到第 1、2 站把“底和高是一对”再走一遍。';
      host.appendChild(el('<div class="card"><span class="tag">结果</span><div class="score">' + r + ' / 10</div><p>一次做对 ' + r + ' 道 · 看提示后做对 ' + hn + ' 道 · 看了步骤 ' + w + ' 道</p><p>' + msg + '</p><p class="note">只有“一次做对”算自己会的。结果已经记下来发给家长。</p></div>'));
      resolve();
    }
  });
};

/* ---------- 页面 ---------- */
function home() {
  $('#back').onclick = null; $('#back').setAttribute('href', '../../../index.html');
  $('#crumbTitle').textContent = '图形思考课';
  var doneN = STATIONS.filter(function (s) { return state.done[s.id]; }).length;
  var nextSt = STATIONS.filter(function (s) { return !state.done[s.id]; })[0];
  app.innerHTML = '<h1>图形题，先想清楚再算</h1><p class="lead">这门课不比谁做得多。每一站先动手看明白一个道理，再跟着想一遍，最后自己做几道。一次学 1–2 站就够。</p>' +
    '<div class="card"><h2>每道图形题，先问三句</h2><ol class="three"><li><div><b>求哪一块？</b><small>在图上找到要算的那块，心里把它涂上颜色。</small></div></li><li><div><b>底是哪条？</b><small>选一条边当底。</small></div></li><li><div><b>它的高是哪条？</b><small>和这条底成直角的那条。底和高是一对，不能拿别人的高来配。</small></div></li></ol></div>' +
    '<div class="card"><h2>四个办法，把不会的变成会的</h2><div class="moves"><div><b>转一转</b><small>看不出高，就把图转到底躺平。</small></div><div><b>剪下来移过去</b><small>斜的变成正的，面积不变。</small></div><div><b>拿两个来拼</b><small>三角形、梯形拼成平行四边形，再取一半。</small></div><div><b>分一分，补一补</b><small>陌生的图变成几块熟悉的图。</small></div></div></div>' +
    '<h2 style="margin-top:20px">8 站' + (doneN ? '（已学 ' + doneN + ' 站）' : '') + '</h2><div class="stlist">' +
    STATIONS.map(function (s, i) { return '<button class="st' + (state.done[s.id] ? ' done' : '') + '" data-id="' + s.id + '"><span class="no">' + (state.done[s.id] ? '✓' : i + 1) + '</span><span class="tx"><b>' + s.t + '</b><small>' + s.d + '</small></span><span class="go">' + (nextSt && nextSt.id === s.id ? '从这里学' : state.done[s.id] ? '再看' : '') + '</span></button>'; }).join('') + '</div>' +
    '<details class="card" style="margin-top:16px"><summary>给家长：这门课怎么用</summary><p class="note" style="margin-top:10px">重新设计的原因：原来的面积练习讲得少、题多。这一版每站都是“动手看 → 一句话 → 跟我想 → 自己做”，讲的部分比题多；“跟我想”中间会停下来问一句，答对才往下。</p><p class="note">依据五年级上“多边形的面积”单元的内容顺序（平行四边形、三角形、梯形、组合图形）编写，题目和图都是新出的，不是课本或教辅原题；课本具体页码未核对。图是示意图，不按比例，数以标注为准。</p><p class="note">建议一次 1–2 站，连纸笔约 25 分钟。第 1 站“高是谁的高”最要紧，后面每一站都用它。记录里只有“一次做对”算独立会；看提示后做对、看步骤后都分开记。</p><p class="note"><a href="../../kenton_area_preview_20261107.html">原来的《面积实验室》仍可以打开</a>（里面还有公顷、平方千米和估测，这门课没有重复做）。</p><p class="note"><button class="btn ghost" id="reset">清空这台设备上的本课进度</button></p></details>';
  $$('.st', app).forEach(function (b) { b.onclick = function () { openStation(b.dataset.id); }; });
  $('#reset').onclick = function () { if ($('#reset').dataset.sure) { state.done = {}; save(); toast('已清空进度（作答记录保留）'); home(); } else { $('#reset').dataset.sure = '1'; $('#reset').textContent = '再点一次确认清空'; } };
  window.scrollTo(0, 0);
}
function openStation(id) {
  var idx = STATIONS.findIndex(function (s) { return s.id === id; }), st = STATIONS[idx];
  if (!st) return home();
  $('#crumbTitle').textContent = '第 ' + (idx + 1) + ' 站 · ' + st.t;
  $('#back').setAttribute('href', '#'); $('#back').onclick = function (e) { e.preventDefault(); sendReport('leave', { label: '中途返回目录' }); home(); };
  app.innerHTML = '<h1>' + st.t + '</h1><p class="lead">' + st.d + '</p><div id="flow"></div>';
  window.scrollTo(0, 0);
  var token = roundId + id + Date.now(); app.dataset.token = token;
  BUILD[id]($('#flow')).then(function () {
    if (app.dataset.token !== token) return;
    state.done[id] = true; save();
    if (id !== 's8') sendReport('station', { label: '第 ' + (idx + 1) + ' 站 ' + st.t });
    var nx = STATIONS[idx + 1];
    var end = el('<div class="card"><span class="tag">这一站学完了</span><p>' + (nx ? '下一站：<b>' + nx.t + '</b>。累了就先停，下次从目录接着学。' : '8 站都走完了。过两天再来闯一次关，看还记不记得。') + '</p><div class="row end"><button class="btn ghost" data-a="home">回目录</button>' + (nx ? '<button class="btn" data-a="next">下一站</button>' : '') + '</div></div>');
    $('#flow').appendChild(end); show(end);
    $('[data-a=home]', end).onclick = home;
    if (nx) $('[data-a=next]', end).onclick = function () { openStation(nx.id); };
  });
}
window.__geo = { G: G, open: openStation, home: home, state: state };
home();
})();
