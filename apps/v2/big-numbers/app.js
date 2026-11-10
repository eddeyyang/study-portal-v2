/* 大数王国 · 弟弟 四上第4单元《大数的认识与改写》预习（Claude 设计，2026-11-10）
   8 站：①满十进一 ②数位顺序表 ③读数 ④写数 ⑤比大小 ⑥改写（=） ⑦近似数（≈） ⑧闯关检验
   每站：先动手看清一个关系 → 规则一句话 → 自己做；错一次给关键关系再试，再错看步骤后可"再做一次"。
   记录：localStorage sp2.big-numbers:<who>:<formal|test>；做完一站 / 检验交卷 / 离开页面时经 V2Records 上报（app: big-numbers）。 */
(function () {
'use strict';
var C = window.BigCore;
var Q = new URLSearchParams(location.search);
var WHO = Q.get('who') === 'kenton' ? 'kenton' : 'eddey';
var TEST = Q.get('test') === '1' || !/(^|\.)eddeyyang\.github\.io$/.test(location.hostname);
var KEY = 'sp2.big-numbers:' + WHO + ':' + (TEST ? 'test' : 'formal');
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var app = $('#app');

document.body.dataset.who = WHO;
$('#whoI').textContent = WHO === 'kenton' ? '哥' : '弟';
$('#whoName').textContent = WHO === 'kenton' ? 'Kenton' : 'Eddey';
if (TEST) $('#testTag').classList.remove('hide');

/* ---------- 存储与上报 ---------- */
function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); return s && typeof s === 'object' ? s : {}; } catch (e) { return {}; } }
var state = Object.assign({ done: {}, items: [], quiz: [], last: '' }, load());
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
      app: 'big-numbers', who: WHO, subject: 'math', mode: TEST ? 'test' : 'formal', roundId: roundId, kind: kind,
      unit: '四上第4单元 大数的认识与改写（预习）',
      total: items.filter(function (x) { return x.result; }).length,
      right: items.filter(function (x) { return x.result === 'right'; }).length,
      wrong: items.filter(function (x) { return x.result === 'wrong'; }).length,
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
function fmt(n) { return C.group(n); }

/* ---------- 数位舞台 ---------- */
var LVCLS = function (p) { return p >= 8 ? 'y' : p >= 4 ? 'w' : 'g'; };
function Board(host, opt) {
  opt = opt || {};
  var node = el('<div class="board' + (opt.compact ? ' compact' : '') + '"><div class="grid"></div></div>');
  var g = node.firstChild;
  var html = '<div class="lv yi">亿级</div><div class="lv wan">万级</div><div class="lv ge">个级</div>';
  for (var i = 0; i < 12; i++) { var p = 11 - i; html += '<div class="pl ' + LVCLS(p) + '">' + C.PLACE[p] + '<span class="wei">位</span></div>'; }
  for (i = 0; i < 12; i++) { p = 11 - i; html += '<div class="cell ' + LVCLS(p) + (p === 7 || p === 3 ? ' sep' : '') + '" data-p="' + p + '"></div>'; }
  g.innerHTML = html; host.appendChild(node);
  var cells = $$('.cell', g);
  function cell(p) { return cells[11 - p]; }
  return {
    node: node, cell: cell,
    set: function (n, o) {
      o = o || {};
      var s = n === null || n === undefined || n === '' ? '' : String(n);
      var roles = o.zeros && s ? C.zeroRoles(s) : null;
      var prevMid = false;
      for (var p = 0; p < 12; p++) {
        var c = cell(p), idx = s.length - 1 - p, ch = idx >= 0 ? s[idx] : '';
        if (ch === '_') ch = '';
        c.className = 'cell ' + LVCLS(p) + (p === 7 || p === 3 ? ' sep' : '') + (ch === '' ? ' empty' : '') + (opt.pick ? ' pick' : '');
        c.innerHTML = ch === '' ? (o.ghost ? '·' : '') : ch;
        if (o.hot && o.hot.indexOf(p) >= 0) c.classList.add('hot');
        if (o.dim && ch !== '' && o.dim.indexOf(p) >= 0) c.classList.add('dim');
        if (o.pop && ch !== '') { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); c.style.animationDelay = ((s.length - 1 - p) * 0.05) + 's'; }
        else c.style.animationDelay = '';
      }
      if (roles) {
        for (var i = 0; i < s.length; i++) {
          var r = roles[i], pp = s.length - 1 - i;
          if (!r) { prevMid = false; continue; }
          var label = r === 'end' ? '不读' : (prevMid ? '—' : '读零');
          prevMid = r === 'mid';
          cell(pp).insertAdjacentHTML('beforeend', '<span class="z ' + (r === 'end' ? 'end' : 'mid') + '">' + label + '</span>');
        }
      }
    }
  };
}

var readPieces = C.readPieces;

/* ---------- 题目组件 ---------- */
var qCounter = 0;
function askMC(host, sp) {
  return new Promise(function (resolve) {
    var tries = 0, done = false, t0 = Date.now();
    var order = sp.keep ? sp.opts.map(function (_, i) { return i; }) : C.shuffle(sp.opts.map(function (_, i) { return i; }));
    var box = el('<div class="q"></div>');
    host.appendChild(box);
    function draw() {
      box.innerHTML = '<div class="qh"><span class="qn">' + esc(sp.no || '试一试') + '</span><span class="qt">' + sp.q + '</span></div>' +
        (sp.big ? '<div class="big">' + sp.big + '</div>' : '') +
        '<div class="opts ' + (sp.layout || '') + '">' + order.map(function (i) { return '<button class="opt' + (sp.cmp ? ' cmp' : '') + '" data-i="' + i + '">' + sp.opts[i] + '</button>'; }).join('') + '</div><div class="fbw"></div>';
      $$('.opt', box).forEach(function (b) { b.onclick = function () { choose(+b.dataset.i, b); }; });
    }
    function fb(cls, html) { $('.fbw', box).innerHTML = '<div class="fb ' + cls + '">' + html + '</div>'; }
    function choose(i, b) {
      if (done) return;
      var ok = i === sp.ans;
      if (ok) {
        done = true; b.classList.add('right'); $$('.opt', box).forEach(function (x) { x.disabled = true; });
        fb('ok', '<b>对！</b>' + (sp.why || ''));
        record({ id: sp.id, st: sp.st, q: strip(sp.q + (sp.big ? ' ' + sp.big : '')), answer: strip(sp.opts[sp.ans]), user: strip(sp.opts[i]), result: tries === 0 ? 'right' : 'hint-right', tries: tries + 1, ms: Date.now() - t0, redo: !!sp.redo });
        if (sp.onDone) sp.onDone(tries === 0);
        resolve(tries === 0);
        return;
      }
      tries++; b.classList.add('wrong'); b.disabled = true;
      if (tries === 1) { fb('hint', '<b>再看一眼：</b>' + (sp.hint || '')); return; }
      done = true;
      $$('.opt', box).forEach(function (x) { x.disabled = true; if (+x.dataset.i === sp.ans) x.classList.add('right'); });
      record({ id: sp.id, st: sp.st, q: strip(sp.q + (sp.big ? ' ' + sp.big : '')), answer: strip(sp.opts[sp.ans]), user: strip(sp.opts[i]), result: 'wrong', tries: tries, ms: Date.now() - t0, redo: !!sp.redo, reviewNeeded: true });
      fb('show', '<b>正确答案：' + sp.opts[sp.ans] + '</b><br>' + (sp.why || '') +
        '<div class="qact"><button class="btn pri" data-a="redo">看懂了，我再做一次</button><button class="btn ghost" data-a="go">先记下，继续</button></div>');
      $('[data-a=redo]', box).onclick = function () { box.remove(); askMC(host, Object.assign({}, sp, { redo: true, onDone: null })); resolve(false); };
      $('[data-a=go]', box).onclick = function () { $('.qact', box).remove(); resolve(false); };
      if (sp.onDone) sp.onDone(false);
    }
    draw();
  });
}
function strip(h) { return String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }

/* 写数：数字键盘，边写边自动从右往左分级 */
function askWrite(host, sp) {
  return new Promise(function (resolve) {
    var val = '', tries = 0, done = false, t0 = Date.now();
    var box = el('<div class="q"><div class="qh"><span class="qn">' + esc(sp.no || '写一写') + '</span><span class="qt">写出这个数：</span></div>' +
      '<div class="big" style="font-family:var(--font);font-size:24px">' + esc(sp.reading) + '</div>' +
      '<div class="slate"></div><div class="keys"></div><div class="fbw"></div></div>');
    host.appendChild(box);
    var keys = $('.keys', box);
    '1234567890'.split('').forEach(function (d) { keys.insertAdjacentHTML('beforeend', '<button data-k="' + d + '">' + d + '</button>'); });
    keys.insertAdjacentHTML('beforeend', '<button class="wide" data-k="back">退一格</button><button class="wide" data-k="ok" style="background:var(--me);color:#fff;border-color:var(--me)">写好了</button>');
    function paint() {
      var s = $('.slate', box);
      if (!val) { s.innerHTML = '<span class="ph">点下面的数字，从最高位写起</span>'; return; }
      s.innerHTML = C.levels(val).map(function (l) {
        var c = l.name === '亿级' ? 'yi' : l.name === '万级' ? 'wan' : 'ge';
        var col = c === 'yi' ? 'var(--yi)' : c === 'wan' ? 'var(--me-d)' : 'var(--ge)';
        return '<div class="grp"><span class="ds" style="color:' + col + ';border-color:' + col + '">' + l.digits + '</span><small style="color:' + col + '">' + l.name + '</small></div>';
      }).join('');
    }
    function fb(cls, html) { $('.fbw', box).innerHTML = '<div class="fb ' + cls + '">' + html + '</div>'; }
    keys.onclick = function (e) {
      var k = e.target.closest('button'); if (!k || done) return; k = k.dataset.k;
      if (k === 'back') val = val.slice(0, -1);
      else if (k === 'ok') return check();
      else if (val.length < 12 && !(val === '' && k === '0')) val += k;
      paint();
    };
    function check() {
      if (!val) { fb('hint', '还没写数字哦。'); return; }
      var ans = String(sp.ans);
      if (val === ans) {
        done = true; keys.style.display = 'none';
        fb('ok', '<b>对！</b>' + (sp.why || ''));
        record({ id: sp.id, st: sp.st, q: '写数：' + sp.reading, answer: ans, user: val, result: tries === 0 ? 'right' : 'hint-right', tries: tries + 1, ms: Date.now() - t0, redo: !!sp.redo });
        resolve(tries === 0); return;
      }
      tries++;
      if (tries === 1) {
        var more = val.length < ans.length ? '你写的数位<b>少了</b>：' : val.length > ans.length ? '你写的数位<b>多了</b>：' : '';
        fb('hint', '<b>再看一眼：</b>' + more + (sp.hint || '') + '<br>改好后再点“写好了”。');
        return;
      }
      done = true; keys.style.display = 'none';
      record({ id: sp.id, st: sp.st, q: '写数：' + sp.reading, answer: ans, user: val, result: 'wrong', tries: tries, ms: Date.now() - t0, redo: !!sp.redo, reviewNeeded: true });
      fb('show', '<b>正确写法：<span class="n">' + ans + '</span>（分级 ' + C.split(ans, ' ┊ ') + '）</b><br>' + (sp.why || '') +
        '<div class="qact"><button class="btn pri" data-a="redo">看懂了，我再写一次</button><button class="btn ghost" data-a="go">先记下，继续</button></div>');
      $('[data-a=redo]', box).onclick = function () { box.remove(); askWrite(host, Object.assign({}, sp, { redo: true })); resolve(false); };
      $('[data-a=go]', box).onclick = function () { $('.qact', box).remove(); resolve(false); };
    }
    paint();
  });
}

/* 多选数字（□ 里能填几） */
function askDigits(host, sp) {
  return new Promise(function (resolve) {
    var pick = {}, tries = 0, done = false, t0 = Date.now();
    var box = el('<div class="q"><div class="qh"><span class="qn">' + esc(sp.no || '★ 挑战') + '</span><span class="qt">' + sp.q + '</span></div>' +
      (sp.big ? '<div class="big">' + sp.big + '</div>' : '') +
      '<div class="digits">' + '0123456789'.split('').map(function (d) { return '<button data-d="' + d + '">' + d + '</button>'; }).join('') + '</div>' +
      '<div class="qact"><button class="btn pri" data-a="check">选好了</button></div><div class="fbw"></div></div>');
    host.appendChild(box);
    $$('.digits button', box).forEach(function (b) { b.onclick = function () { if (done) return; pick[b.dataset.d] = !pick[b.dataset.d]; b.classList.toggle('on', !!pick[b.dataset.d]); }; });
    function fb(cls, html) { $('.fbw', box).innerHTML = '<div class="fb ' + cls + '">' + html + '</div>'; }
    $('[data-a=check]', box).onclick = function () {
      if (done) return;
      var chosen = Object.keys(pick).filter(function (k) { return pick[k]; }).sort().join('');
      var ans = sp.ans.join('');
      if (!chosen) { fb('hint', '先点选数字。'); return; }
      if (chosen === ans) {
        done = true; fb('ok', '<b>对！</b>' + sp.why);
        record({ id: sp.id, st: sp.st, q: strip(sp.q + ' ' + (sp.big || '')), answer: ans, user: chosen, result: tries === 0 ? 'right' : 'hint-right', tries: tries + 1, ms: Date.now() - t0 });
        $('.qact', box).remove(); resolve(tries === 0); return;
      }
      tries++;
      if (tries === 1) { fb('hint', '<b>再看一眼：</b>' + sp.hint); return; }
      done = true; $('.qact', box).remove();
      $$('.digits button', box).forEach(function (b) { b.classList.toggle('on', sp.ans.indexOf(b.dataset.d) >= 0); });
      record({ id: sp.id, st: sp.st, q: strip(sp.q + ' ' + (sp.big || '')), answer: ans, user: chosen, result: 'wrong', tries: tries, ms: Date.now() - t0, reviewNeeded: true });
      fb('show', '<b>能填：' + sp.ans.join('、') + '</b><br>' + sp.why);
      resolve(false);
    };
  });
}

/* ---------- 站点 ---------- */
var STATIONS = [
  { id: 's1', t: '满十进一，数到一亿', s: '万、十万、百万、千万、亿是怎么来的', min: 4 },
  { id: 's2', t: '数位顺序表', s: '每 4 位一级：个级、万级、亿级', min: 4 },
  { id: 's3', t: '大数怎么读', s: '先分级，0 什么时候读', min: 5 },
  { id: 's4', t: '大数怎么写', s: '按级写，空位补 0', min: 5 },
  { id: 's5', t: '比大小', s: '先比位数，再从最高位比', min: 3 },
  { id: 's6', t: '改写：整万、整亿', s: '去掉 0 加单位，大小不变（=）', min: 4 },
  { id: 's7', t: '近似数：四舍五入', s: '看离哪个整万数近（≈）', min: 6 },
  { id: 's8', t: '闯关检验', s: '12 道新题，自己做', min: 8 }
];
var BUILD = {};

function header(st, goal) {
  var i = STATIONS.indexOf(st);
  $('#crumbTitle').textContent = '第' + (i + 1) + '站 · ' + st.t;
  return '<div class="sthead"><span class="no">' + (i + 1) + '</span><div><small>大数王国 · 第' + (i + 1) + '站 / 共 8 站</small><h2>' + st.t + '</h2></div></div>' +
    '<p class="goal">' + goal + '</p>';
}
function footer(host, st, pending) {
  var i = STATIONS.indexOf(st);
  var f = el('<div class="next"><a class="btn ghost" href="#">← 回地图</a><button class="btn pri" disabled>' + (i < 7 ? '完成这一站，去第' + (i + 2) + '站 →' : '完成') + '</button></div>');
  host.appendChild(f);
  var btn = $('button', f);
  Promise.all(pending).then(function () {
    btn.disabled = false;
    if (!state.done[st.id]) toast('这一站的题做完了，可以去下一站');
  });
  btn.onclick = function () {
    state.done[st.id] = true; save();
    sendReport('station', { station: st.id, label: '第' + (i + 1) + '站 ' + st.t });
    location.hash = i < 7 ? STATIONS[i + 1].id : '';
  };
  return f;
}
/* 让一组题按顺序出现（做完一题才出下一题） */
function sequence(host, makers) {
  var p = Promise.resolve();
  var all = [];
  makers.forEach(function (mk) {
    var d; var pr = new Promise(function (r) { d = r; });
    p = p.then(function () { return mk(host).then(function (v) { d(v); }); });
    all.push(pr);
  });
  return all;
}

/* ===== ① 满十进一 ===== */
BUILD.s1 = function (st) {
  app.innerHTML = header(st, '<b>今天的目标：</b>说清楚“十万、百万、千万、一亿”都是由 10 个比它小一级的单位换来的。');
  var stage = el('<div class="stage"><div class="say">这是一个<b>换块工厂</b>：每一列放同一种块。<b>同一列满 10 块，就会被打包，换成左边一列的 1 块</b>。点每列下面的“+1”，把最左边的<b>一亿</b>点亮。</div>' +
    '<div class="factory" style="margin-top:12px"></div><div class="flash"></div><div class="predict"></div></div>');
  app.appendChild(stage);
  var names = ['一亿', '千万', '百万', '十万', '一万'];
  var counts = [0, 0, 0, 0, 0], predicted = false, busy = false, reached = false;
  var fac = $('.factory', stage);
  names.forEach(function (n, i) {
    fac.insertAdjacentHTML('beforeend', '<div class="col u' + (5 - i) + '"><span class="cnt">0</span><div class="stack"></div><b>' + n + '</b><button class="btn add" data-i="' + i + '">+1</button></div>');
  });
  function paint() {
    $$('.col', fac).forEach(function (c, i) {
      $('.cnt', c).textContent = counts[i];
      var s = $('.stack', c); var have = s.children.length;
      if (have > counts[i]) s.innerHTML = '';
      for (var k = s.children.length; k < counts[i]; k++) s.insertAdjacentHTML('beforeend', '<span class="blk"></span>');
    });
  }
  function flash(t) { $('.flash', stage).innerHTML = t; }
  function add(i) {
    if (busy) return;
    if (i === 0 && counts[0] >= 1) { flash('一亿已经点亮啦！'); return; }
    if (counts[i] === 9 && !predicted) return predict(i);
    counts[i]++; paint();
    if (counts[i] === 10) carry(i);
    else flash(counts[i] + ' 个' + names[i]);
  }
  function carry(i) {
    busy = true;
    $$('.col', fac)[i].querySelector('.stack').classList.add('full');
    flash('满 10 个' + names[i] + '！打包……');
    setTimeout(function () {
      $$('.col', fac)[i].querySelector('.stack').classList.remove('full');
      counts[i] = 0; counts[i - 1]++; paint();
      flash('<span class="n">10</span> 个' + names[i] + ' → 换成 <span class="n">1</span> 个' + names[i - 1]);
      busy = false;
      if (counts[i - 1] === 10) setTimeout(function () { carry(i - 1); }, 500);
      if (i - 1 === 0) done1();
    }, 750);
  }
  function predict(i) {
    predicted = true;
    var box = $('.predict', stage);
    box.innerHTML = '<div class="q"><div class="qh"><span class="qn">先猜一猜</span><span class="qt">这一列已经有 9 个' + names[i] + '。再放 1 个，会怎样？</span></div>' +
      '<div class="opts three"><button class="opt" data-k="a">挤成 10 个，留在这一列</button><button class="opt" data-k="b">10 个打包，换成左边的 1 个' + names[i - 1] + '</button><button class="opt" data-k="c">直接变成 1 个一亿</button></div><div class="fbw"></div></div>';
    $$('.opt', box).forEach(function (b) {
      b.onclick = function () {
        var right = b.dataset.k === 'b';
        record({ id: 's1-predict', st: 's1', q: '9个' + names[i] + '再放1个会怎样', answer: '换成1个' + names[i - 1], user: strip(b.innerHTML), result: right ? 'right' : 'wrong', tries: 1, kind: 'predict' });
        $('.fbw', box).innerHTML = '<div class="fb ' + (right ? 'ok' : 'hint') + '">' + (right ? '猜对了！放进去看看。' : '看看会发生什么——') + '</div>';
        $$('.opt', box).forEach(function (x) { x.disabled = true; });
        setTimeout(function () { box.innerHTML = ''; add(i); }, 900);
      };
    });
  }
  $$('.add', fac).forEach(function (b) { b.onclick = function () { add(+b.dataset.i); }; });
  paint();
  flash('先点“一万”下面的 +1 试试');

  var after = el('<div class="hide"></div>'); app.appendChild(after);
  var resolveReach; var reach = new Promise(function (r) { resolveReach = r; });
  function done1() {
    if (reached) return; reached = true;
    after.classList.remove('hide');
    after.innerHTML = '<div class="rule"><b>一亿点亮了！</b>这一路都是同一个规则：<b>满十进一</b>。相邻两个计数单位之间，都是 10 倍关系（十进制）。' +
      '<div class="chain"><span>一</span><i>×10</i><span>十</span><i>×10</i><span>百</span><i>×10</i><span>千</span><i>×10</i><span>万</span><i>×10</i><span>十万</span><i>×10</i><span>百万</span><i>×10</i><span>千万</span><i>×10</i><span>亿</span></div></div>' +
      '<div class="card"><h3>一亿到底有多大？</h3><div class="facts">' +
      '<div class="fact"><b>约 10 千米</b>一张纸大约 0.1 毫米厚。一亿张叠起来，大约 10 千米高——比珠穆朗玛峰（约 8.8 千米）还高。</div>' +
      '<div class="fact"><b>3 年多</b>1 秒数 1 个数，不吃不睡一直数，数到一亿要 3 年多。</div></div></div>';
    resolveReach();
    var qs = el('<div></div>'); after.appendChild(qs);
    var ps = sequence(qs, [
      function (h) { return askMC(h, { id: 's1-q1', st: 's1', no: '第 1 题', q: '10 个一百万是（　　）。', opts: ['一千万', '十万', '一亿'], ans: 0, layout: 'three', hint: '满十进一：一百万满 10 个，换成它<b>左边</b>一列的 1 块。看工厂里“百万”左边是谁。', why: '百万满 10 个，进一位，就是 1 个<b>千万</b>。' }); },
      function (h) { return askMC(h, { id: 's1-q2', st: 's1', no: '第 2 题', q: '1 亿里面有（　　）个一千万。', opts: ['10', '100', '1000'], ans: 0, layout: 'three', hint: '刚才的一亿，是由几个一千万打包换来的？', why: '10 个一千万换 1 个一亿，所以 1 亿里有 <b>10</b> 个一千万。' }); },
      function (h) { return askMC(h, { id: 's1-q3', st: 's1', no: '第 3 题', q: '1 亿里面有（　　）个一万。', opts: ['10000 个', '1000 个', '100 个'], ans: 0, layout: 'three', hint: '从一万到一亿，一共进了几次“十”？一万→十万→百万→千万→亿，每进一次就 ×10。', why: '进了 4 次十：10×10×10×10＝10000，所以 1 亿＝<b>10000</b> 个一万。' }); }
    ]);
    footer(after, st, ps);
  }
};

/* ===== ② 数位顺序表 ===== */
BUILD.s2 = function (st) {
  app.innerHTML = header(st, '<b>今天的目标：</b>分清“数位”（数字站的位置）和“计数单位”（这个位置上的 1 代表多少），会给大数分级。');
  var stage = el('<div class="stage"><div class="say">数字 <b>3</b> 在数位顺序表上旅行：<b>站的位置不同，表示的大小就不同</b>。点左右箭头，或者直接点一个格子。</div><div class="bd"></div>' +
    '<div class="mover"><button class="btn" data-m="1">← 往左一位</button><button class="btn" data-m="-1">往右一位 →</button></div><div class="travel"></div></div>');
  app.appendChild(stage);
  var b = Board($('.bd', stage), { pick: true });
  var pos = 5, visited = {};
  function paint() {
    var n = '3' + '0'.repeat(pos);
    b.set(n, { hot: [pos], dim: Array.from({ length: pos }, function (_, i) { return i; }) });
    visited[pos] = 1;
    $('.travel', stage).innerHTML = '3 站在<b>' + C.PLACE[pos] + '位</b>（数位），表示 <b>3 个' + C.UNIT_VALUE[pos] + '</b>（计数单位），写出来是 <span class="n"><b>' + fmt(n) + '</b></span>，读作“' + C.read(n) + '”。';
  }
  $$('[data-m]', stage).forEach(function (x) { x.onclick = function () { pos = Math.max(0, Math.min(11, pos + +x.dataset.m)); paint(); }; });
  b.node.addEventListener('click', function (e) { var c = e.target.closest('.cell'); if (c) { pos = +c.dataset.p; paint(); } });
  paint();

  app.appendChild(el('<div class="rule"><b>数位顺序表的规律</b><ul>' +
    '<li>从右往左：个位、十位、百位、千位，然后是<b>万位</b>、十万位、百万位、千万位，再是<b>亿位</b>……</li>' +
    '<li><b>每 4 个数位是一级</b>：<span class="tag ge">个级</span> 个十百千，<span class="tag wan">万级</span> 万 十万 百万 千万，<span class="tag yi">亿级</span> 亿 十亿 百亿 千亿。</li>' +
    '<li>每一级的第一位（最右边那位）就是这一级的名字：万级从<b>万位</b>开始，亿级从<b>亿位</b>开始。</li></ul></div>'));

  // 分级小刀
  var cutWrap = el('<div class="card"><h3>动手分级：在数字中间点一下就是“切一刀”</h3><div class="say" style="font-size:15px;color:var(--ink2)">从<b>右边</b>开始，每 4 位切一刀。切好点“检查”。</div><div class="cuts"></div></div>');
  app.appendChild(cutWrap);
  function cutter(host, num, id) {
    return new Promise(function (resolve) {
      var s = String(num), tries = 0, done = false;
      var box = el('<div class="q"><div class="cutter"></div><div class="qact"><button class="btn pri">检查</button></div><div class="fbw"></div></div>');
      host.appendChild(box);
      var c = $('.cutter', box), html = '';
      for (var i = 0; i < s.length; i++) { html += '<span class="d">' + s[i] + '</span>'; if (i < s.length - 1) html += '<button class="gap" data-g="' + (s.length - 1 - i) + '" aria-label="在这里切"></button>'; }
      c.innerHTML = html;
      var gaps = $$('.gap', c);
      gaps.forEach(function (g) { g.onclick = function () { if (!done) g.classList.toggle('on'); }; });
      function fb(cls, h) { $('.fbw', box).innerHTML = '<div class="fb ' + cls + '">' + h + '</div>'; }
      $('.btn', box).onclick = function () {
        if (done) return;
        var wrong = 0;
        gaps.forEach(function (g) { var need = (+g.dataset.g) % 4 === 0; var on = g.classList.contains('on'); g.classList.remove('ok', 'no'); if (need !== on) { wrong++; if (on) g.classList.add('no'); } });
        if (!wrong) {
          done = true; gaps.forEach(function (g) { if (g.classList.contains('on')) g.classList.add('ok'); });
          var lv = C.levels(s);
          fb('ok', '<b>切对了！</b>' + lv.map(function (l) { return l.name + ' ' + l.digits; }).join('，') + '。');
          record({ id: id, st: 's2', q: '分级 ' + s, answer: C.split(s, '|'), user: C.split(s, '|'), result: tries ? 'hint-right' : 'right', tries: tries + 1 });
          $('.qact', box).remove(); resolve(!tries); return;
        }
        tries++;
        if (tries === 1) { fb('hint', '<b>再看一眼：</b>要从<b>最右边</b>往左数，数满 4 个数字切一刀（红色的刀切错了）。最左边剩几个都可以。'); return; }
        done = true;
        gaps.forEach(function (g) { var need = (+g.dataset.g) % 4 === 0; g.classList.remove('no'); g.classList.toggle('on', need); if (need) g.classList.add('ok'); });
        record({ id: id, st: 's2', q: '分级 ' + s, answer: C.split(s, '|'), user: '切错', result: 'wrong', tries: tries, reviewNeeded: true });
        fb('show', '正确的切法：<b class="n">' + C.split(s, ' ┊ ') + '</b>。从右往左，4 个一刀，最左边剩下的就是最高的一级。');
        $('.qact', box).remove(); resolve(false);
      };
    });
  }
  var cuts = $('.cuts', cutWrap);
  var ps = sequence(cuts, [
    function (h) { return cutter(h, 305060000, 's2-cut1'); },
    function (h) { return cutter(h, 72008000400, 's2-cut2'); }
  ]);
  var qs = el('<div></div>'); app.appendChild(qs);
  var ps2 = sequence(qs, [
    function (h) { return Promise.all(ps).then(function () { return askMC(h, { id: 's2-q1', st: 's2', no: '第 1 题', q: '千万位在哪一级？', opts: ['万级', '亿级', '个级'], ans: 0, layout: 'three', hint: '万级的 4 个数位是：万位、十万位、百万位、（　　）位。', why: '万级是 万、十万、百万、<b>千万</b>，千万位是万级的最高位；再往左才进入亿级。' }); }); },
    function (h) { return askMC(h, { id: 's2-q2', st: 's2', no: '第 2 题', q: '从右边起，第 9 位是（　　）。', opts: ['亿位', '千万位', '十亿位'], ans: 0, layout: 'three', hint: '第 1 位是个位，第 5 位是万位（万级第一位），第 9 位是哪一级的第一位？', why: '每 4 位一级：第 1 位个位、第 5 位万位、第 9 位<b>亿位</b>。' }); },
    function (h) { return askMC(h, { id: 's2-q3', st: 's2', no: '第 3 题', q: '在 <span class="n">4 8 0 6 0 0 0 0</span> 里，数字 8 在（　　）上，表示（　　）。', opts: ['百万位，8 个百万', '十万位，8 个十万', '千万位，8 个千万'], ans: 0, layout: 'three', hint: '先分级：4806┊0000。8 在万级的第几位？万级从右往左是 万、十万、百万、千万。', why: '分级 4806┊0000，8 在万级从右数第 3 位，是<b>百万位</b>，表示 <b>8 个百万</b>。' }); }
  ]);
  footer(app, st, ps.concat(ps2));
};

/* ===== ③ 读数 ===== */
BUILD.s3 = function (st) {
  app.innerHTML = header(st, '<b>今天的目标：</b>会读亿以内、亿以上的大数，说得清每个 0 读不读。');
  var demos = [
    { n: 1443497378, tag: '最长的数' }, { n: 31850088, tag: '级的开头有 0' },
    { n: 40004000, tag: '每级末尾有 0' }, { n: 300050000, tag: '整一级都是 0' }
  ];
  var stage = el('<div class="stage"><div class="say">读数机：<b>先分级，再从最高级一级一级读</b>。选一个数，按“读下一步”。</div>' +
    '<div class="row demos" style="margin:10px 0"></div><div class="bd"></div><div class="readout"></div><div class="say step" style="margin-top:6px;color:var(--ink2);font-size:15.5px"></div>' +
    '<div class="row" style="margin-top:10px"><button class="btn pri" data-a="next">读下一步</button><button class="btn ghost" data-a="reset">重来</button></div></div>');
  app.appendChild(stage);
  var b = Board($('.bd', stage));
  var cur = 0, step = 0, seen = {};
  demos.forEach(function (d, i) { $('.demos', stage).insertAdjacentHTML('beforeend', '<button class="btn" data-d="' + i + '"><span class="n">' + fmt(d.n) + '</span>&nbsp;<small style="color:var(--ink3)">' + d.tag + '</small></button>'); });
  function levelPs(name) { return name === '亿级' ? [8, 9, 10, 11] : name === '万级' ? [4, 5, 6, 7] : [0, 1, 2, 3]; }
  function paint() {
    var d = demos[cur], pcs = readPieces(d.n);
    $$('[data-d]', stage).forEach(function (x) { x.classList.toggle('pri', +x.dataset.d === cur); });
    var ro = $('.readout', stage), sp = $('.step', stage);
    if (step === 0) {
      b.set(d.n, { pop: true }); ro.innerHTML = ''; sp.innerHTML = '数字落进数位顺序表。先看它有几级。';
    } else if (step === 1) {
      b.set(d.n, { zeros: true });
      ro.innerHTML = '<span class="n">' + C.split(d.n, ' ┊ ') + '</span>';
      sp.innerHTML = '<b>第 1 步 分级：</b>从右往左每 4 位一级，分成 ' + pcs.length + ' 级。格子下面的小字提前告诉你：哪些 0 <b>不读</b>，哪些 0 <b>读成零</b>。';
    } else {
      var k = step - 2, done = pcs.slice(0, k + 1);
      var lv = pcs[k];
      b.set(d.n, { zeros: true, hot: levelPs(lv.level.name) });
      ro.innerHTML = done.map(function (p) { var c = p.level.name === '亿级' ? 'y' : p.level.name === '万级' ? 'w' : 'g'; return p.text ? '<span class="' + c + '">' + p.text.replace(/^零/, '<span class="zz">零</span>') + '</span>' : ''; }).join('');
      var say = '<b>读' + lv.level.name + '（' + lv.level.digits + '）：</b>';
      if (lv.note) say += lv.note;
      else {
        say += '按个级的读法读' + (lv.level.unit ? '，读完加一个“' + lv.level.unit + '”字' : '') + '。';
        if (/^零/.test(lv.text)) say += '这一级开头（或前面那一级）有 0，夹在两个数中间，<b>读一个“零”</b>。';
        if (/0+$/.test(lv.level.digits) && +lv.level.digits) say += '这一级末尾的 0 <b>不读</b>。';
      }
      if (k === pcs.length - 1) { say += '<br>✅ 读完：<b>' + C.read(d.n) + '</b>'; seen[cur] = 1; }
      sp.innerHTML = say;
    }
    $('[data-a=next]', stage).disabled = step >= pcs.length + 1;
  }
  $('.demos', stage).onclick = function (e) { var x = e.target.closest('[data-d]'); if (x) { cur = +x.dataset.d; step = 0; paint(); } };
  $('[data-a=next]', stage).onclick = function () { step++; paint(); };
  $('[data-a=reset]', stage).onclick = function () { step = 0; paint(); };
  paint();

  app.appendChild(el('<div class="rule"><b>读大数的三句话</b><ol>' +
    '<li>先分级，<b>从最高级读起</b>；亿级、万级都按个级的读法读，读完加“亿”或“万”。</li>' +
    '<li>每一级<b>末尾</b>的 0 都<b>不读</b>。</li>' +
    '<li>其他数位上有一个 0 或<b>连续几个 0</b>，都<b>只读一个“零”</b>。</li></ol></div>'));
  var qs = el('<div></div>'); app.appendChild(qs);
  function mk(n, id, no) {
    var right = C.read(n), ds = C.readDistractors(n);
    var pcs = readPieces(n);
    return function (h) {
      return askMC(h, { id: id, st: 's3', no: no, q: '这个数怎么读？', big: fmt(n), opts: [right].concat(ds), ans: 0, layout: '',
        hint: '先分级：<b class="n">' + C.split(n, ' ┊ ') + '</b>。逐级看：每级末尾的 0 不读；级中间或级开头的 0（连着几个都算）读一个“零”。',
        why: '分级 ' + C.split(n, ' ┊ ') + '：' + pcs.map(function (p) { return p.level.name + (p.text ? '读“' + p.text + '”' : '全是 0 不读'); }).join('，') + '。合起来：<b>' + right + '</b>。' });
    };
  }
  var ps = sequence(qs, [mk(6080300, 's3-q1', '第 1 题'), mk(50400700, 's3-q2', '第 2 题'), mk(2003000000, 's3-q3', '第 3 题'), mk(700070007, 's3-q4', '第 4 题')]);
  footer(app, st, ps);
};

/* ===== ④ 写数 ===== */
BUILD.s4 = function (st) {
  app.innerHTML = header(st, '<b>今天的目标：</b>听到或看到读法，能写对数字；尤其是哪里要补 0。');
  var demo = { r: '三千零五万六百', n: 30050600 };
  var stage = el('<div class="stage"><div class="say">写数机：把读法“<b>' + demo.r + '</b>”写成数字。</div><div class="bd"></div><div class="readout"></div><div class="say step" style="font-size:15.5px;color:var(--ink2)"></div>' +
    '<div class="row" style="margin-top:10px"><button class="btn pri" data-a="next">下一步</button><button class="btn ghost" data-a="reset">重来</button></div></div>');
  app.appendChild(stage);
  var b = Board($('.bd', stage)), step = 0;
  var steps = [
    function () { b.set('', { ghost: true }); return ['', '先找读法里的“<b>万</b>”字：“三千零五<b>万</b>”是万级，“六百”是个级。']; },
    function () { b.set('3005____', { pop: true, hot: [4, 5, 6, 7] }); return ['<span class="w">3005</span>', '<b>万级写“三千零五”</b>：千位 3，百位、十位没有就写 0，个位 5 → <b>3005</b>。'] },
    function () { b.set('30050600', { pop: true, hot: [0, 1, 2, 3] }); return ['<span class="w">3005</span> <span class="g">0600</span>', '<b>个级写“六百”</b>：个级<b>必须写满 4 位</b>。千位一个单位也没有，写 0；百位 6；十位、个位写 0 → <b>0600</b>。'] },
    function () { b.set('30050600', {}); return ['<span class="n">30050600</span>', '✅ 合起来：<b class="n">30050600</b>。检查：分级 3005┊0600，读出来正好是“三千零五万六百”。'] }
  ];
  function paint() { var r = steps[step](); $('.readout', stage).innerHTML = r[0]; $('.step', stage).innerHTML = r[1]; $('[data-a=next]', stage).disabled = step >= steps.length - 1; }
  $('[data-a=next]', stage).onclick = function () { step++; paint(); };
  $('[data-a=reset]', stage).onclick = function () { step = 0; paint(); };
  paint();
  app.appendChild(el('<div class="rule"><b>写大数的三句话</b><ol>' +
    '<li>先找“亿”“万”字，把读法<b>切成几级</b>。</li>' +
    '<li>从最高级写起，每级按个级的写法写。</li>' +
    '<li>除了最高级，<b>每一级都要写满 4 位</b>；哪一位一个单位也没有，就写 <b>0</b>。</li></ol>' +
    '<div style="margin-top:6px;font-size:15px;color:var(--ink2)">写完自查：再分一次级，读一遍，和原来的读法一样就对了。下面写的时候，屏幕会自动帮你分级。</div></div>'));
  var items = [
    { r: '六亿零四十万', n: 600400000, cut: '六亿 ┊ 零四十万 ┊（个级没有）' },
    { r: '八百万零七', n: 8000007, cut: '八百万 ┊ 零七' },
    { r: '二十亿三千万', n: 2030000000, cut: '二十亿 ┊ 三千万 ┊（个级没有）' },
    { r: '五千零二万零九十', n: 50020090, cut: '五千零二万 ┊ 零九十' }
  ];
  var qs = el('<div></div>'); app.appendChild(qs);
  var ps = sequence(qs, items.map(function (it, i) {
    return function (h) {
      return askWrite(h, { id: 's4-q' + (i + 1), st: 's4', no: '第 ' + (i + 1) + ' 题', reading: it.r, ans: it.n,
        hint: '按“亿”“万”切开：' + it.cut + '。除最高级外每级写满 4 位，没有的位写 0；整一级都没有，就写 4 个 0。',
        why: '分级写：' + C.levels(it.n).map(function (l) { return l.name + ' ' + l.digits; }).join('，') + '。' });
    };
  }));
  footer(app, st, ps);
};

/* ===== ⑤ 比大小 ===== */
BUILD.s5 = function (st) {
  app.innerHTML = header(st, '<b>今天的目标：</b>两个大数谁大，能说出理由。');
  app.appendChild(el('<div class="rule"><b>比大小两步走</b><ol><li><b>先数位数</b>：位数多的数大。</li><li>位数一样，<b>从最高位开始一位一位比</b>，第一个不同的数位，谁大谁就大。</li></ol></div>'));
  var items = [
    { a: 99999, b: 100000, why: '99999 是 5 位数，100000 是 6 位数，<b>位数多的大</b>。' },
    { a: 4560000, b: 4506000 },
    { a: 199999999, b: 200000000, bt: '2亿', why: '2 亿＝200000000（9 位）。两个都是 9 位，最高位 1 < 2，所以 199999999 < 2 亿。' },
    { a: 3050000, b: 3050000, bt: '305万', why: '305 万＝3050000，两个数一样大。' },
    { a: 87654321, b: 87645321 }
  ];
  var qs = el('<div></div>'); app.appendChild(qs);
  var ps = sequence(qs, items.map(function (it, i) {
    return function (h) {
      var ans = C.compare(it.a, it.b), d = C.firstDiff(it.a, it.b);
      var why = it.why;
      if (!why) {
        var sa = String(it.a), sb = String(it.b);
        why = '两个都是 ' + sa.length + ' 位数，从最高位比，前面都一样，到<b>' + d.place + '</b>：' + sa[d.index] + (ans === '>' ? ' > ' : ' < ') + sb[d.index] + '，所以 ' + fmt(it.a) + ' ' + ans + ' ' + fmt(it.b) + '。' +
          '<div class="center"><div class="dual">' + hl(sa, d.index) + '<br>' + hl(sb, d.index) + '</div></div>';
      }
      return askMC(h, { id: 's5-q' + (i + 1), st: 's5', no: '第 ' + (i + 1) + ' 题', q: '在（　）里填 >、< 或 =', big: '<span class="n">' + fmt(it.a) + '</span>　（　）　<span class="n">' + (it.bt || fmt(it.b)) + '</span>', opts: ['&gt;', '&lt;', '='], ans: ['>', '<', '='].indexOf(ans), keep: true, cmp: true, layout: 'three cmpw',
        hint: (it.bt ? '先把“' + it.bt + '”写成数字，再比。' : '') + '先数位数；位数一样，从最高位一位一位比。', why: why });
    };
  }));
  function hl(s, idx) { return s.split('').map(function (c, i) { return i === idx ? '<span class="hl">' + c + '</span>' : c; }).join(''); }
  footer(app, st, ps);
};

/* ===== ⑥ 改写 ===== */
BUILD.s6 = function (st) {
  app.innerHTML = header(st, '<b>今天的目标：</b>把整万数、整亿数改写成用“万”“亿”作单位的数，知道大小没变。');
  var demos = [{ n: 25000000, u: '万', z: 4 }, { n: 600000000, u: '亿', z: 8 }];
  var stage = el('<div class="stage"><div class="say">改写就是<b>换一个更大的单位来数</b>：25000000 里有多少个“一万”？</div><div class="row demos" style="margin:10px 0"></div>' +
    '<div class="morph"></div><div class="eq"></div><div class="row" style="justify-content:center;margin-top:10px"><button class="btn pri" data-a="go">收起末尾的 0</button></div></div>');
  app.appendChild(stage);
  var cur = 0, folded = false;
  demos.forEach(function (d, i) { $('.demos', stage).insertAdjacentHTML('beforeend', '<button class="btn" data-d="' + i + '"><span class="n">' + d.n + '</span> → 以“' + d.u + '”作单位</button>'); });
  function paint() {
    var d = demos[cur], s = String(d.n), head = s.slice(0, s.length - d.z), zs = s.slice(-d.z);
    $$('[data-d]', stage).forEach(function (x) { x.classList.toggle('pri', +x.dataset.d === cur); });
    $('.morph', stage).innerHTML = '<span>' + head + '</span><span class="zs' + (folded ? ' gone' : '') + '" style="color:var(--ink3)">' + zs + '</span><span class="wz' + (folded ? ' on' : '') + '">' + d.u + '</span>';
    $('.eq', stage).innerHTML = folded ? '<span class="n">' + s + '</span> <b>=</b> ' + head + d.u + '<div style="font-size:15px;font-weight:600;color:var(--ink2);margin-top:4px">' + s + ' 里有 ' + head + ' 个一' + d.u + '。末尾 ' + d.z + ' 个 0 去掉，换成一个“' + d.u + '”字。数没变大也没变小，所以用 <b>=</b>。</div>' : '末尾有 <b>' + d.z + '</b> 个 0' + (d.u === '万' ? '（个级 4 个 0）' : '（万级、个级 8 个 0）');
    $('[data-a=go]', stage).textContent = folded ? '再看一遍' : '收起末尾的 0';
  }
  $('.demos', stage).onclick = function (e) { var x = e.target.closest('[data-d]'); if (x) { cur = +x.dataset.d; folded = false; paint(); } };
  $('[data-a=go]', stage).onclick = function () { folded = !folded; paint(); };
  paint();
  app.appendChild(el('<div class="rule"><b>改写口诀</b><ul><li>整万数 → 以“万”作单位：<b>去掉个级的 4 个 0，加“万”</b>。</li><li>整亿数 → 以“亿”作单位：<b>去掉末尾 8 个 0，加“亿”</b>。</li><li>改写前后大小一样，中间用 <b>=</b>。只有末尾真的有这么多 0 的数才能这样改写。</li></ul></div>'));
  var qs = el('<div></div>'); app.appendChild(qs);
  var ps = sequence(qs, [
    function (h) { return askMC(h, { id: 's6-q1', st: 's6', no: '第 1 题', q: '<span class="n">32000000</span> ＝（　　）万', opts: ['3200万', '320万', '32000万'], ans: 0, layout: 'three', hint: '先分级：3200┊0000。个级 4 个 0 去掉，剩下的就是多少万。', why: '3200┊0000，去掉个级 4 个 0，加“万”：<b>3200万</b>。' }); },
    function (h) { return askMC(h, { id: 's6-q2', st: 's6', no: '第 2 题', q: '把 <span class="n">507000000</span> 改写成用“万”作单位的数。', opts: ['50700万', '5070万', '507万'], ans: 0, layout: 'three', hint: '只去掉<b>个级</b>的 4 个 0：5┊0700┊0000。万级和亿级的数字（包括中间的 0）都留下。', why: '5┊0700┊0000 去掉个级 4 个 0，剩 50700，加“万”：<b>50700万</b>。万级里的 0 是有用的，不能去。' }); },
    function (h) { return askMC(h, { id: 's6-q3', st: 's6', no: '第 3 题', q: '<span class="n">900000000</span> ＝（　　）亿', opts: ['9亿', '90亿', '900亿'], ans: 0, layout: 'three', hint: '数一数有几个 0；以“亿”作单位要去掉 8 个 0。', why: '9┊0000┊0000，去掉 8 个 0 加“亿”：<b>9亿</b>。' }); },
    function (h) { return askMC(h, { id: 's6-q4', st: 's6', no: '第 4 题', q: '<span class="n">360500</span> 能直接改写成“多少万”这样的整数吗？', opts: ['不能，它不是整万数（个级不是 4 个 0）', '能，是 36万', '能，是 3605万'], ans: 0, hint: '分级 36┊0500：个级是 0500，是 4 个 0 吗？', why: '36┊0500 个级不是 0000，不是整万数，不能直接去 0 改写。它<b>约等于</b> 36 万——那是下一站的“近似数”，要用 ≈。' }); },
    function (h) { return askMC(h, { id: 's6-q5', st: 's6', no: '第 5 题', q: '反过来想：4亿 ＝（　　）万', opts: ['40000万', '4000万', '400万'], ans: 0, layout: 'three', hint: '1 亿里有多少个一万？（第①站算过：进了 4 次十）', why: '1 亿＝10000 个一万，4 亿就是 <b>40000万</b>。写成数是 4┊0000┊0000，去掉个级 4 个 0 也是 40000 万。' }); }
  ]);
  footer(app, st, ps);
};

/* ===== ⑦ 近似数 ===== */
BUILD.s7 = function (st) {
  app.innerHTML = header(st, '<b>今天的目标：</b>明白四舍五入是在找“离哪个整万数更近”，会求到万位、亿位的近似数。');
  var stage = el('<div class="stage"><div class="say">拖动小圆点。它离 <b>34万</b> 近，还是离 <b>35万</b> 近？看看<b>千位</b>上的数字有什么秘密。</div>' +
    '<div class="line"><div class="axis"></div><div class="arrow"></div><div class="half"><small>正中间 345000</small></div><div class="end" style="left:0">34万</div><div class="end" style="left:100%">35万</div><div class="dot"></div><div class="lab"></div>' +
    '<input type="range" min="340000" max="350000" step="100" value="342800" aria-label="拖动小圆点选一个数"></div>' +
    '<div class="near"></div><div class="say task" style="font-size:15px;margin-top:8px;color:var(--ink2)"></div></div>');
  app.appendChild(stage);
  var rng = $('input', stage), got = { lo: false, hi: false }, resolveDrag;
  var dragDone = new Promise(function (r) { resolveDrag = r; });
  function paint() {
    var v = +rng.value, pct = (v - 340000) / 100;
    var s = String(v), th = s[2];
    $('.dot', stage).style.left = pct + '%';
    $('.lab', stage).style.left = pct + '%';
    $('.lab', stage).innerHTML = s.slice(0, 2) + '<span style="background:#fff;color:var(--me-d);border-radius:5px;padding:0 3px;margin:0 1px">' + th + '</span>' + s.slice(3);
    var up = +th >= 5;
    var a = $('.arrow', stage);
    a.style.left = (up ? pct : 0) + '%'; a.style.width = (up ? 100 - pct : pct) + '%';
    $('.near', stage).innerHTML = '<span class="n">' + v + '</span> 的千位是 <b>' + th + '</b>，' + (up ? (v === 345000 ? '正好在中间，<b>规定入</b>' : '离 35万 更近') + ' → <b>≈ 35万</b>（五入）' : '离 34万 更近 → <b>≈ 34万</b>（四舍）');
    if (moved && v !== 340000 && v !== 350000) { if (up) got.hi = true; else got.lo = true; }
    $('.task', stage).innerHTML = '任务：拖出一个 ≈34万 的数 ' + (got.lo ? '✅' : '⬜') + '，再拖出一个 ≈35万 的数 ' + (got.hi ? '✅' : '⬜') + (got.lo && got.hi ? '　<b>发现了吗？千位 0～4 舍，5～9 入。</b>' : '<br>两个任务都完成，下面的题就会出现。');
    if (got.lo && got.hi) resolveDrag(true);
  }
  var moved = false; rng.oninput = function () { moved = true; paint(); }; paint();

  var demo = el('<div class="stage"><div class="say">四舍五入到<b>万位</b>：<span class="n">84748016</span> ≈ （　　）万</div><div class="bd"></div><div class="say step" style="font-size:15.5px;color:var(--ink2)"></div><div class="row" style="margin-top:10px"><button class="btn pri" data-a="next">下一步</button><button class="btn ghost" data-a="reset">重来</button></div></div>');
  app.appendChild(demo);
  var b = Board($('.bd', demo)), step = 0;
  var steps = [
    function () { b.set(84748016); return '第 1 步：分级 <b class="n">8474 ┊ 8016</b>。要“省略万位后面的尾数”，保留万级 8474。'; },
    function () { b.set(84748016, { hot: [3] }); return '第 2 步：看<b>万位后面的那一位——千位</b>，是 <b>8</b>。'; },
    function () { b.set(84748016, { hot: [4], dim: [0, 1, 2, 3] }); return '第 3 步：8 ≥ 5，要<b>入</b>：万级 8474 加 1，变成 8475；后面的尾数全部省略。'; },
    function () { b.set(84750000, { hot: [4] }); return '✅ <b class="n">84748016 ≈ 8475万</b>。大小变了一点点，所以用 <b>≈</b>，不能用 =。'; }
  ];
  function p2() { $('.step', demo).innerHTML = steps[step](); $('[data-a=next]', demo).disabled = step >= steps.length - 1; }
  $('[data-a=next]', demo).onclick = function () { step++; p2(); };
  $('[data-a=reset]', demo).onclick = function () { step = 0; p2(); };
  p2();
  app.appendChild(el('<div class="rule"><b>求近似数</b><ul><li>省略<b>万位</b>后面的尾数 → 看<b>千位</b>；省略<b>亿位</b>后面的尾数 → 看<b>千万位</b>。</li><li>看的那一位 <b>&lt; 5 就舍</b>，<b>≥ 5 就向前一位进 1</b>。</li><li>结果写 <b>≈</b>，别忘了写“万”或“亿”。</li></ul></div>'));
  var qs = el('<div></div>'); app.appendChild(qs);
  var ps = sequence(qs, [
    function (h) { return dragDone.then(function () { return askMC(h, { id: 's7-q1', st: 's7', no: '第 1 题', q: '<span class="n">6450000</span> ≈（　　）万', opts: ['645万', '646万', '64万'], ans: 0, layout: 'three', hint: '分级 645┊0000；看千位，是几？', why: '645┊0000，千位是 0，<b>舍</b>：≈ <b>645万</b>（这个数本来就是整万数，也可以说 ＝645 万）。' }); }); },
    function (h) { return askMC(h, { id: 's7-q2', st: 's7', no: '第 2 题', q: '<span class="n">2849000</span> ≈（　　）万', opts: ['285万', '284万', '28万'], ans: 0, layout: 'three', hint: '分级 284┊9000；千位是 9，舍还是入？', why: '千位 9 ≥ 5，<b>入</b>：284 加 1 → ≈ <b>285万</b>。' }); },
    function (h) { return askMC(h, { id: 's7-q3', st: 's7', no: '第 3 题', q: '<span class="n">1349999999</span> ≈（　　）亿', opts: ['13亿', '14亿', '134亿'], ans: 0, layout: 'three', hint: '分级 13┊4999┊9999；到亿位要看<b>千万位</b>——万级的第一个数字。后面的 9 再多也不看。', why: '千万位是 4，&lt; 5，<b>舍</b>：≈ <b>13亿</b>。只看千万位一位，不看后面一串 9。' }); },
    function (h) { return askMC(h, { id: 's7-q4', st: 's7', no: '第 4 题', q: '<span class="n">960400000</span> ≈（　　）亿', opts: ['10亿', '9亿', '96亿'], ans: 0, layout: 'three', hint: '分级 9┊6040┊0000；千万位是 6，要入。9 加 1 是多少？', why: '千万位 6 ≥ 5，<b>入</b>：9 加 1 ＝ 10，≈ <b>10亿</b>。' }); },
    function (h) { return askDigits(h, { id: 's7-q5', st: 's7', no: '★ 挑战 1', q: '<span class="n">59□200</span> ≈ 60万，□ 里能填哪些数字？（可以多选）', ans: ['5', '6', '7', '8', '9'], hint: '原来万级是 59，结果变成了 60，说明是“舍”还是“入”？□ 在千位。', why: '59 万变成 60 万，是<b>入</b>上去的，所以千位要 ≥ 5：能填 <b>5、6、7、8、9</b>。' }); },
    function (h) { return askMC(h, { id: 's7-q6', st: 's7', no: '★ 挑战 2', q: '一个六位数，四舍五入到万位约是 30 万。它<b>最大</b>是多少？', opts: ['304999', '309999', '299999'], ans: 0, layout: 'three', hint: '最大的情况：万级还是 30（舍下来的），千位最大能填几还算“舍”？其余位填最大的 9。', why: '要“舍”成 30 万，万级是 30，千位最大填 4，后面都填 9：<b>304999</b>。305000 就会入成 31 万了。' }); },
    function (h) { return askMC(h, { id: 's7-q7', st: 's7', no: '★ 挑战 3', q: '同一个题：它<b>最小</b>是多少？', opts: ['295000', '300000', '250000'], ans: 0, layout: 'three', hint: '最小的情况是从 29 万“入”上来的：千位最小填几才会入？其余填 0。', why: '从 29 万入成 30 万，千位最小填 5，后面都填 0：<b>295000</b>。294999 就舍成 29 万了。' }); }
  ]);
  footer(app, st, ps);
};

/* ===== ⑧ 闯关检验 ===== */
function makeQuiz() {
  var R = C.rnd, list = [];
  // 读数 ×2
  [['levelEnd', 8], ['levelStart', 9]].forEach(function (m, i) {
    var n = C.makeTricky(m[1], m[0]); var right = C.read(n);
    list.push({ type: 'mc', topic: '读数', id: 'q-read' + i, q: '这个数怎么读？', big: fmt(n), opts: [right].concat(C.readDistractors(n)), ans: 0,
      hint: '先分级 <b class="n">' + C.split(n, ' ┊ ') + '</b>；每级末尾的 0 不读，其他地方的 0 连着几个都只读一个“零”。', why: '读作：<b>' + right + '</b>。' });
  });
  // 写数 ×2
  [C.makeTricky(9, 'wholeLevel'), C.makeTricky(7, 'levelStart')].forEach(function (n, i) {
    list.push({ type: 'write', topic: '写数', id: 'q-write' + i, reading: C.read(n), ans: n, hint: '按“亿”“万”把读法切开；除最高级外每级写满 4 位，没有的写 0。', why: '分级：' + C.split(n, ' ┊ ') + '。' });
  });
  // 比大小 ×2
  (function () {
    var a = R(1000000, 9999999), b = R(10000000, 19999999);
    list.push(cmpQ(a, b, 'q-cmp0'));
    var x = String(R(10000000, 99999999)), k = R(1, 5), y = x.slice(0, k) + ((+x[k] + R(1, 8)) % 10) + x.slice(k + 1);
    list.push(cmpQ(+x, +y, 'q-cmp1'));
  })();
  function cmpQ(a, b, id) {
    var ans = C.compare(a, b);
    return { type: 'mc', topic: '比大小', id: id, q: '在（　）里填 >、< 或 =', big: '<span class="n">' + fmt(a) + '</span>　（　）　<span class="n">' + fmt(b) + '</span>', opts: ['&gt;', '&lt;', '='], ans: ['>', '<', '='].indexOf(ans), keep: true, cmp: true, layout: 'three cmpw',
      hint: '先数位数；位数一样，从最高位一位一位比。', why: fmt(a) + ' ' + ans + ' ' + fmt(b) + '。' };
  }
  // 改写 ×2
  (function () {
    var w = R(11, 9999) * 10 + (R(0, 1) ? 0 : R(1, 9)); var n = w * 1e4;
    list.push({ type: 'mc', topic: '改写', id: 'q-rw0', q: '<span class="n">' + n + '</span> ＝（　　）万', opts: [w + '万', Math.floor(w / 10) + '万', (w * 10) + '万'], ans: 0, layout: 'three', hint: '去掉个级的 4 个 0，加“万”。', why: '去掉个级 4 个 0：<b>' + w + '万</b>。' });
    var y = R(2, 99), m = y * 1e8;
    list.push({ type: 'mc', topic: '改写', id: 'q-rw1', q: '<span class="n">' + m + '</span> ＝（　　）亿', opts: [y + '亿', (y * 10) + '亿', (y * 10000) + '亿'], ans: 0, layout: 'three', hint: '以“亿”作单位，去掉末尾 8 个 0。', why: '去掉 8 个 0 加“亿”：<b>' + y + '亿</b>。' });
  })();
  // 近似数 ×2
  (function () {
    var n = R(1000000, 99999999); if (n % 1e4 === 0) n += 3217;
    var a = C.approx(n, '万'), head = Math.floor(n / 1e4);
    var other = a.up ? head + '万' : (head + 1) + '万';
    list.push({ type: 'mc', topic: '近似数', id: 'q-ap0', q: '<span class="n">' + fmt(n) + '</span> ≈（　　）万（四舍五入到万位）', opts: [a.text, other, Math.floor(head / 10) + '万'], ans: 0, layout: 'three', hint: '看千位：' + a.look + '，' + (a.up ? '≥5 入' : '<5 舍') + '吗？再想想。', why: '千位是 ' + a.look + '，' + (a.up ? '入' : '舍') + '：≈ <b>' + a.text + '</b>。' });
    var big = R(100000000, 9999999999);
    var b2 = C.approx(big, '亿'), h2 = Math.floor(big / 1e8);
    list.push({ type: 'mc', topic: '近似数', id: 'q-ap1', q: '<span class="n">' + fmt(big) + '</span> ≈（　　）亿（四舍五入到亿位）', opts: [b2.text, (b2.up ? h2 : h2 + 1) + '亿', (h2 * 10 + (+String(big)[String(big).length - 8])) + '亿'], ans: 0, layout: 'three', hint: '到亿位，看<b>千万位</b>（万级最左边那一位）。', why: '千万位是 ' + b2.look + '，' + (b2.up ? '入' : '舍') + '：≈ <b>' + b2.text + '</b>。' });
  })();
  // 数位与计数单位 ×1
  (function () {
    var n = R(10000000, 999999999), s = String(n), p;
    do { p = R(4, s.length - 1); } while (s[s.length - 1 - p] === '0');
    var d = s[s.length - 1 - p];
    var o = [C.PLACE[p] + '位，表示 ' + d + ' 个' + C.UNIT_VALUE[p]];
    if (p + 1 < 12) o.push(C.PLACE[p + 1] + '位，表示 ' + d + ' 个' + C.UNIT_VALUE[p + 1]);
    o.push(C.PLACE[p - 1] + '位，表示 ' + d + ' 个' + C.UNIT_VALUE[p - 1]);
    list.push({ type: 'mc', topic: '数位', id: 'q-place', q: '在 <span class="n">' + fmt(n) + '</span> 里，从左边数第 ' + (s.length - p) + ' 个数字 <b>' + d + '</b> 在（　）上，表示（　）。', opts: o, ans: 0, hint: '先分级，再看它在哪一级的第几位。每级从右往左：（个/万/亿）、十、百、千。', why: '它在<b>' + C.PLACE[p] + '位</b>，表示 ' + d + ' 个' + C.UNIT_VALUE[p] + '。' });
  })();
  // 范围 ×1
  (function () {
    var t = R(12, 98), max = R(0, 1) === 1, rg = C.approxRange(t);
    var right = max ? rg.max : rg.min;
    var opts = max ? [rg.max, t * 1e4 + 9999, t * 1e4] : [rg.min, t * 1e4, (t - 1) * 1e4];
    list.push({ type: 'mc', topic: '近似数★', id: 'q-range', q: '一个六位数四舍五入到万位约是 ' + t + ' 万，它' + (max ? '<b>最大</b>' : '<b>最小</b>') + '是多少？', opts: opts.map(String), ans: 0, layout: 'three', hint: max ? '最大：是“舍”下来的，千位最大填 4，其余填 9。' : '最小：是从 ' + (t - 1) + ' 万“入”上来的，千位最小填 5，其余填 0。', why: '答案 <b>' + right + '</b>。' });
  })();
  return list;
}
BUILD.s8 = function (st) {
  app.innerHTML = header(st, '<b>规则：</b>12 道<b>新题</b>（数字每次都不一样），自己做，不翻前面。错一次会给一个关键提示，再错会给步骤。只算第一次就做对的。');
  var list = makeQuiz(), i = 0, first = 0, weak = {};
  var host = el('<div></div>'), bar = el('<div class="fine" style="margin:4px 0">第 1 / 12 题</div>');
  app.appendChild(bar); app.appendChild(host);
  function next() {
    host.innerHTML = '';
    if (i >= list.length) return finish();
    bar.textContent = '第 ' + (i + 1) + ' / ' + list.length + ' 题 · ' + list[i].topic;
    var it = Object.assign({ st: 's8', no: '第 ' + (i + 1) + ' 题' }, list[i]);
    var pr = it.type === 'write' ? askWrite(host, it) : askMC(host, it);
    pr.then(function (ok) {
      if (ok) first++; else weak[it.topic] = (weak[it.topic] || 0) + 1;
      var nb = el('<div class="next"><span></span><button class="btn pri">' + (i < list.length - 1 ? '下一题 →' : '看结果') + '</button></div>');
      host.appendChild(nb); $('button', nb).onclick = function () { i++; next(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    });
  }
  function finish() {
    bar.textContent = '';
    var wk = Object.keys(weak);
    state.quiz.push({ at: new Date().toISOString(), first: first, total: list.length, weak: weak }); state.done.s8 = true; save();
    sendReport('quiz', { label: '闯关检验', score: first, of: list.length, weak: weak });
    host.innerHTML = '<div class="stage center"><div class="fine">第一次就做对</div><div class="score">' + first + ' / ' + list.length + '</div>' +
      '<div class="say">' + (first >= 11 ? '太稳了！这一单元的预习过关。上课时注意听老师怎么说每一步。' : first >= 8 ? '大部分会了。下面这些再回去看一眼那一站：' : '先别急，回到下面这些站再走一遍，换一天再来闯关。') + '</div>' +
      (wk.length ? '<ul class="list" style="text-align:left;display:inline-block">' + wk.map(function (k) { return '<li>' + k + '（' + weak[k] + ' 题）→ ' + backTo(k) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="fine" style="margin-top:8px">今天做对只算“当场会”。过两天换新题再闯一次，还对，才算记住了。</div>' +
      '<div class="next" style="justify-content:center"><a class="btn ghost" href="#">回地图</a><button class="btn pri" id="again">换一套新题</button></div></div>';
    $('#again').onclick = function () { BUILD.s8(st); window.scrollTo(0, 0); };
  }
  function backTo(k) { var m = { '读数': 's3', '写数': 's4', '比大小': 's5', '改写': 's6', '近似数': 's7', '近似数★': 's7', '数位': 's2' }[k]; var x = STATIONS.filter(function (s) { return s.id === m; })[0]; return '<a href="#' + m + '">第' + (STATIONS.indexOf(x) + 1) + '站 ' + x.t + '</a>'; }
  next();
};

/* ---------- 首页 ---------- */
function home() {
  $('#crumbTitle').textContent = '大数王国';
  var doneN = STATIONS.filter(function (s) { return state.done[s.id]; }).length;
  var nextSt = STATIONS.filter(function (s) { return !state.done[s.id]; })[0];
  var last = state.quiz.length ? state.quiz[state.quiz.length - 1] : null;
  app.innerHTML = '<section class="hero"><div><p class="kick">四年级上 · 第 4 单元 · 预习</p><h1>大数<em>王国</em></h1>' +
    '<p class="lede">比一万还大的数怎么数、怎么读、怎么写、怎么变短？8 站，每站先动手看明白一个道理，再自己做几题。</p>' +
    (nextSt ? '<a class="resume" href="#' + nextSt.id + '">' + (doneN ? '接着学：第' + (STATIONS.indexOf(nextSt) + 1) + '站 ' + nextSt.t : '从第 1 站开始') + ' →</a>' : '<a class="resume" href="#s8">8 站都完成了 · 再闯一次关 →</a>') +
    '</div><div class="marquee"><div class="cap"><span>2020 年人口普查：全国总人口（含港澳台）</span><span class="n" id="mqn"></span></div><div class="mq"></div><div class="say" id="mqs"></div></div></section>' +
    '<h2 class="h2">8 站地图 <small class="fine">已完成 ' + doneN + ' / 8' + (last ? ' · 上次闯关 ' + last.first + '/' + last.total : '') + '</small></h2><div class="stations">' +
    STATIONS.map(function (s, i) { return '<a class="st' + (state.done[s.id] ? ' done' : '') + '" href="#' + s.id + '"><span class="no">' + (state.done[s.id] ? '✓' : i + 1) + '</span><span><b>' + s.t + '</b><small>' + s.s + '</small></span><span class="m">' + (state.done[s.id] ? '完成' : '约 ' + s.min + ' 分') + '</span></a>'; }).join('') +
    '</div><p class="fine">建议分两次学，每次 25 分钟左右：第一次 ①–④（认识、读、写），第二次 ⑤–⑧（比大小、改写、近似数、闯关）。预习只求先懂道理，上课时听老师怎么讲，课本的说法以老师为准。</p>';
  var b = Board($('.mq', app), { compact: true });
  var show = [1443497378, 1400000000];
  var k = 0;
  function cycle() {
    if (!document.body.contains(b.node)) return;
    var n = show[k % 2];
    b.set(n, { pop: true });
    $('#mqs').innerHTML = k % 2 ? '<span class="n">1443497378</span> ≈ <b>14 亿</b>（四舍五入到亿位）' : '读作：' + C.read(n);
    k++; setTimeout(cycle, 4200);
  }
  cycle();
}

function route() {
  var id = location.hash.replace('#', '');
  var st = STATIONS.filter(function (s) { return s.id === id; })[0];
  window.scrollTo(0, 0);
  if (!st) { home(); return; }
  state.last = id; save();
  BUILD[id](st);
}
window.addEventListener('hashchange', route);
route();
})();
