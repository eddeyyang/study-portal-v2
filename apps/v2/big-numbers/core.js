/* 大数王国 · 数学核心（读数、分级、改写、近似数、比大小、题目生成）
   只处理 0 ~ 999999999999（千亿级以内）的整数，用普通 Number 足够精确。 */
(function (root) {
'use strict';
var NUM = '零一二三四五六七八九';
var SMALL = ['', '十', '百', '千'];
var LEVEL = ['', '万', '亿'];
var PLACE = ['个', '十', '百', '千', '万', '十万', '百万', '千万', '亿', '十亿', '百亿', '千亿'];
var UNIT_VALUE = ['一', '十', '百', '千', '万', '十万', '百万', '千万', '亿', '十亿', '百亿', '千亿'];

function digits(n) { return String(Math.floor(Math.abs(n))); }

/* 标准读法：先分级，从高级读起；每级末尾的 0 不读；其他数位上一个或连续几个 0 只读一个"零"。 */
function read(n) {
  var s = digits(n);
  if (s === '0') return '零';
  var out = '', pending = false, levelHas = false;
  for (var i = 0; i < s.length; i++) {
    var d = +s[i], p = s.length - 1 - i;
    if (d !== 0) {
      if (pending) { out += '零'; pending = false; }
      if (!(d === 1 && p % 4 === 1 && out === '')) out += NUM[d];
      out += SMALL[p % 4];
      levelHas = true;
    } else if (out !== '') {
      pending = true;
    }
    if (p % 4 === 0 && p > 0) {
      if (levelHas) { out += LEVEL[p / 4]; pending = false; }
      levelHas = false;
    }
  }
  return out;
}

/* 分级：从右往左每 4 位一级，返回 [{name:'亿级', digits:'14'}, ...]（高级在前） */
function levels(n) {
  var s = digits(n), arr = [];
  var names = ['个级', '万级', '亿级'];
  var k = 0;
  while (s.length) {
    arr.unshift({ name: names[k], unit: LEVEL[k], digits: s.slice(-4) });
    s = s.slice(0, -4); k++;
  }
  return arr;
}
function split(n, sep) { return levels(n).map(function (l) { return l.digits; }).join(sep || ' '); }

/* 每个 0 的身份：'end' 每级末尾不读；'mid' 读成零（连续几个只读一个）；'lead' 级开头、前面有数，同 mid */
function zeroRoles(n) {
  var s = digits(n), roles = [];
  for (var i = 0; i < s.length; i++) {
    if (s[i] !== '0') { roles.push(null); continue; }
    var p = s.length - 1 - i, lvStart = p - (p % 4); // 本级个位所在 p
    var restOfLevel = s.slice(i, s.length - lvStart); // 从这一位到本级最后一位
    if (/^0+$/.test(restOfLevel)) roles.push('end'); else roles.push('mid');
  }
  return roles;
}

/* 读法按级拆成几段（给读数机用）；拼起来和 read 一致 */
function readPieces(n) {
  var lv = levels(n), out = [];
  lv.forEach(function (l, i) {
    var v = +l.digits, txt = '';
    if (v === 0) { out.push({ level: l, text: '', note: l.unit ? '这一级 4 个 0，一个单位也没有：不读，也不加“' + l.unit + '”字。' : '这一级 4 个 0，都在末尾：不读。' }); return; }
    txt = read(v);
    if (i > 0 && v >= 10 && v < 20) txt = '一' + txt;
    var lead = i > 0 && l.digits[0] === '0';
    var prevAllZeroCarry = false;
    if (!lead && i > 0) { // 前一级全 0 且再前面有数：零已经在前一级被吞掉，要补到这里
      var j = i - 1; while (j >= 0 && +lv[j].digits === 0) { prevAllZeroCarry = true; j--; }
      if (j < 0) prevAllZeroCarry = false;
    }
    if (lead || prevAllZeroCarry) txt = '零' + txt;
    out.push({ level: l, text: txt + l.unit, note: '' });
  });
  return out;
}

function placeName(p) { return PLACE[p] + '位'; }
function unitName(p) { return UNIT_VALUE[p]; }

/* 改写：整万数 → 以"万"为单位；整亿数 → 以"亿"为单位。不是整万（整亿）返回 null */
function rewrite(n, unit) {
  var base = unit === '亿' ? 1e8 : 1e4;
  if (n % base !== 0 || n === 0) return null;
  return (n / base) + unit;
}
/* 四舍五入到万位 / 亿位，返回 {value, text, look: 看的那一位的数字, lookPlace} */
function approx(n, unit) {
  var base = unit === '亿' ? 1e8 : 1e4;
  var lookP = unit === '亿' ? 7 : 3;
  var s = digits(n);
  var look = s.length > lookP ? +s[s.length - 1 - lookP] : 0;
  var head = Math.floor(n / base);
  var v = look >= 5 ? head + 1 : head;
  return { value: v * base, text: v + unit, look: look, lookPlace: PLACE[lookP] + '位', up: look >= 5 };
}
/* 四舍五入到万位后等于 target万 的最大、最小整数 */
function approxRange(targetWan) {
  return { min: targetWan * 1e4 - 5000, max: targetWan * 1e4 + 4999 };
}

function compare(a, b) { return a > b ? '>' : a < b ? '<' : '='; }
function firstDiff(a, b) {
  var x = digits(a), y = digits(b);
  if (x.length !== y.length) return { kind: 'len', la: x.length, lb: y.length };
  for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return { kind: 'digit', index: i, place: PLACE[x.length - 1 - i] + '位' };
  return { kind: 'same' };
}
function group(n) { return split(n, ' '); }

/* ---------- 随机题目工具（检验站用没见过的新数） ---------- */
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
/* 造一个带"0"陷阱的大数：len 位，按模式放 0 */
function makeTricky(len, mode) {
  var s;
  for (var tries = 0; tries < 50; tries++) {
    var a = [];
    for (var i = 0; i < len; i++) a.push(i === 0 ? rnd(1, 9) : rnd(1, 9));
    if (mode === 'levelEnd') { // 万级末尾有 0、个级开头不是 0
      a[len - 5] = 0; if (len - 6 > 0) a[len - 6] = 0; a[len - 4] = rnd(1, 9);
    } else if (mode === 'levelStart') { // 个级开头连续 0
      a[len - 4] = 0; a[len - 3] = 0;
    } else if (mode === 'middle') { // 级中间一个 0、另一个级末尾 0
      a[len - 3] = 0; a[len - 1] = 0; if (len > 6) a[len - 6] = 0;
    } else if (mode === 'wholeLevel') { // 万级全 0
      a[len - 5] = a[len - 6] = a[len - 7] = a[len - 8] = 0;
    }
    s = a.join('');
    if (s[0] !== '0') break;
  }
  return +s;
}
/* 读法的干扰项：多读一个零、少读零、漏"万" */
function readDistractors(n) {
  var right = read(n), set = {};
  set[right] = 1;
  var out = [];
  function add(x) { if (x && !set[x]) { set[x] = 1; out.push(x); } }
  // 末尾 0 也读成零 / 零的个数照写
  var s = digits(n);
  var naive = '';
  for (var i = 0; i < s.length; i++) {
    var d = +s[i], p = s.length - 1 - i;
    naive += d === 0 ? '零' : NUM[d] + SMALL[p % 4];
    if (p % 4 === 0 && p > 0) naive += LEVEL[p / 4];
  }
  naive = naive.replace(/零+$/, '');
  if (/^一十/.test(naive) && s.length % 4 === 2) naive = naive.slice(1);
  add(naive);
  add(right.replace(/零/g, ''));
  add(right.indexOf('零') < 0 ? right.replace('万', '万零') : right.replace('零', '零零'));
  add(right.replace('万', ''));
  return out.slice(0, 2);
}

root.BigCore = {
  read: read, levels: levels, split: split, zeroRoles: zeroRoles, placeName: placeName, unitName: unitName,
  rewrite: rewrite, readPieces: readPieces, approx: approx, approxRange: approxRange, compare: compare, firstDiff: firstDiff, group: group,
  rnd: rnd, pick: pick, shuffle: shuffle, makeTricky: makeTricky, readDistractors: readDistractors,
  PLACE: PLACE, UNIT_VALUE: UNIT_VALUE, NUM: NUM
};
if (typeof module !== 'undefined') module.exports = root.BigCore;
})(typeof window !== 'undefined' ? window : globalThis);
