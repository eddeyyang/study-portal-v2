/* V2 页面学习记录转发（Claude，2026-11-01；家长要求：V2 上的学习页面都要把学习记录发给家长）

   从正式站同步来的页面在 V2 上按“测试/预览”方式运行：进度只存在这台设备，自己不会上传。
   内容同步工具（tools/upstream-sync/sync.py）会在每个同步来的页面里自动加一行，引用 v2-records.js 和本脚本。
   本脚本只“旁听”页面往本机存进度（localStorage），不改页面自己的存储和流程：
     · 离开页面、切到别的应用、锁屏，或点右下角“完成并发给家长”时，把这次新做的题（页面存的数据里
       带对/错标记的行）和这次改动过的进度，经 v2-records.js 发到 V2 接收站（app: page）。
     · 只有 V2 预览站（eddeyyang.github.io）上记正式；网址带 ?test=1、家长测试模式或本地预览一律记 test。
     · 只是打开看看（没有作答、停留不到 30 秒）不发；认不出是哪个孩子时，自动发送先跳过，点“完成”时让孩子选。
     · 导航页（首页、今日、学科、全部内容、家长页等）不记录。
   页面顶部的紫色提示条原来写“记录只留在测试沙盒，正式档案和云端同步已锁定”，在 V2 上不再属实，改成 V2 的说明。 */
(() => {
'use strict';
if (window.V2PageSync) return;

const SCRIPT = document.currentScript;
const ROOT_PATH = new URL('../', SCRIPT && SCRIPT.src ? SCRIPT.src : location.href).pathname;
let PAGE = location.pathname.startsWith(ROOT_PATH) ? location.pathname.slice(ROOT_PATH.length) : location.pathname.replace(/^\/+/, '');
try { PAGE = decodeURIComponent(PAGE); } catch (e) { }
if (!PAGE || PAGE.endsWith('/')) PAGE += 'index.html';
const Q = new URLSearchParams(location.search);
const FORMAL_HOSTS = ['eddeyyang.github.io'];
const NO_RECORD = /^(?:index|today|subject|apps|parent|paper-intake|summer|school_day)\.html$/;
const RECORDING = !NO_RECORD.test(PAGE);
const OVERLAY = 'dd:test-overlay:v1:';
const SESSION_CHILD = 'dd:sync:session-child:v1';
const PARENT_TEST = 'dd:system:parent-test-mode:v1';
const SYSTEM_KEY = /^(?:dd:(?:system|sync|test-overlay):|sp2\.|study_portal_cloud)|^eb_endpoint$/;   // learning-sync 自己的键、V2 自己的键
const PRIVATE_KEY = /token|secret|password|email|phone|address|school|name/i;
const LIMIT = 56000;        // 接收站单条上限 64KB，留余量
const LS = (() => { try { return window.localStorage; } catch (e) { return null; } })();

const clip = (s, n) => { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) + '…' : s; };
const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
const parse = s => { if (s == null) return null; try { return JSON.parse(s); } catch (e) { return null; } };

/* ---------- 谁、哪科、正式还是测试 ---------- */
function parentTest() { try { const m = parse(LS && LS.getItem(PARENT_TEST)); return !!(m && Number(m.expires_at) > Date.now()); } catch (e) { return false; } }
function mode() {
  const testUrl = Q.get('test') === '1' || Q.get('mode') === 'test' || Q.get('parentTest') === '1';
  return FORMAL_HOSTS.includes(location.hostname) && !testUrl && !parentTest() ? 'formal' : 'test';
}
function who() {
  const p = PAGE.toLowerCase();
  if (/kenton/.test(p) || /^papers\/k_/.test(p)) return 'kenton';
  if (/eddey/.test(p) || /^papers\/e_/.test(p)) return 'eddey';
  for (const k of ['who', 'kid', 'child']) { const v = (Q.get(k) || '').toLowerCase(); if (v === 'kenton' || v === 'eddey') return v; }
  try { const s = LS && LS.getItem(SESSION_CHILD); if (s === 'kenton' || s === 'eddey') return s; } catch (e) { }
  return '';
}
const TITLE_SUBJECTS = [['english', /英语/], ['math', /数学/], ['chinese', /语文/], ['coding', /编程|C\+\+/i], ['drone', /无人机/]];
const PATH_SUBJECTS = [['math', /math|calc/i], ['chinese', /chinese|guanchao/i], ['coding', /cpp|hetao|coding|gesp|xiaomawang|ai_/i], ['drone', /drone/i],
  ['english', /english|grammar|verb|clause|sentence|therebe|tense|spelling|vocabulary|preply|question|sound|subjunctive|passive|rhyme/i]];
function subject() {
  const t = document.title || '';
  for (const [id, re] of TITLE_SUBJECTS) if (re.test(t)) return id;
  for (const [id, re] of PATH_SUBJECTS) if (re.test(PAGE)) return id;
  return 'other';
}

/* ---------- 旁听本机存储 ---------- */
const base = new Map();   // 键 → 上次发送时（或第一次写之前）的值
const cur = new Map();    // 键 → 最新值（null = 已删除）
function note(key, before, after) {
  if (SYSTEM_KEY.test(key)) return;
  if (!base.has(key)) base.set(key, before == null ? null : String(before));
  cur.set(key, after == null ? null : String(after));
}
// learning-sync.js 若在本脚本之后才加载，页面的写入会以沙盒键（dd:test-overlay:v1:…）经过这里，按原键记
function semantic(key, value) {
  if (!key.startsWith(OVERLAY)) return [key, value];
  let k = null; try { k = decodeURIComponent(key.slice(OVERLAY.length)); } catch (e) { }
  if (!k || k === '__clear__') return null;
  const o = parse(value);
  return [k, o && !o.deleted && o.value != null ? String(o.value) : null];
}
if (RECORDING && LS) {
  const P = Storage.prototype, innerSet = P.setItem, innerRemove = P.removeItem;
  P.setItem = function (key, value) {
    let before, k = String(key), track = this === LS;
    if (track) { try { before = this.getItem(k); } catch (e) { track = false; } }
    const out = innerSet.apply(this, arguments);
    if (track) { try { const a = semantic(k, String(value)), b = semantic(k, before); if (a) note(a[0], b ? b[1] : null, a[1]); } catch (e) { } }
    return out;
  };
  P.removeItem = function (key) {
    let before, k = String(key), track = this === LS;
    if (track) { try { before = this.getItem(k); } catch (e) { track = false; } }
    const out = innerRemove.apply(this, arguments);
    if (track) { try { const b = semantic(k, before); if (b) note(b[0], b[1], null); } catch (e) { } }
    return out;
  };
}

/* ---------- 从页面数据里认出“作答” ---------- */
const VERDICT = ['ok', 'correct', 'is_correct', 'isCorrect', 'right'];
const CONTEXT = ['subject', 'topic', 'lesson', 'skill', 'unit', 'node', 'module', 'activity'];
function verdictOf(row) {
  for (const f of VERDICT) {
    if (!Object.prototype.hasOwnProperty.call(row, f)) continue;
    const v = row[f];
    if (v === true || v === 1 || v === 'true') return true;
    if (v === false || v === 0 || v === 'false') return false;
    if (v === null) return null;
  }
  for (const f of ['result', 'outcome']) {
    if (typeof row[f] !== 'string') continue;
    const s = row[f].toLowerCase();
    if (/^(?:right|correct|pass|passed|ok|independent|mastered)$/.test(s)) return true;
    if (/^(?:wrong|incorrect|fail|failed|error)$/.test(s)) return false;
    return null;
  }
  return undefined;           // 不像一条作答
}
function compact(row, ctx) {
  const out = {}; let n = 0;
  for (const k of Object.keys(row)) {
    if (n >= 14) break;
    const v = row[k];
    if (v == null || typeof v === 'function') continue;
    if (Array.isArray(v)) { if (v.length && v.every(x => x == null || typeof x !== 'object')) { out[k] = clip(v.join(' | '), 100); n++; } continue; }
    if (typeof v === 'object') continue;
    out[k] = typeof v === 'string' ? clip(v, 100) : v; n++;
  }
  for (const k of CONTEXT) if (out[k] == null && ctx[k] != null) out[k] = clip(ctx[k], 60);
  return out;
}
function walk(value, ctx, out, depth) {
  if (out.length >= 8000 || depth > 7 || value == null || typeof value !== 'object') return;
  if (Array.isArray(value)) { for (const x of value) walk(x, ctx, out, depth + 1); return; }
  const v = verdictOf(value);
  if (v !== undefined) out.push({ ok: v, row: compact(value, ctx) });
  const next = Object.assign({}, ctx);
  for (const k of CONTEXT) if (value[k] != null && value[k] !== '' && typeof value[k] !== 'object') next[k] = value[k];
  for (const k of Object.keys(value)) { const c = value[k]; if (c && typeof c === 'object') walk(c, next, out, depth + 1); }
}
function newAttempts(before, after) {
  const a = [], b = [];
  walk(parse(before), {}, a, 0); walk(parse(after), {}, b, 0);
  if (!b.length) return [];
  const seen = new Map();
  for (const x of a) { const s = JSON.stringify(x.row); seen.set(s, (seen.get(s) || 0) + 1); }
  const out = [];
  for (const x of b) { const s = JSON.stringify(x.row); const c = seen.get(s) || 0; if (c > 0) seen.set(s, c - 1); else out.push(Object.assign({ ok: x.ok }, x.row)); }
  return out;
}

/* ---------- 打包、发送 ---------- */
const visitId = uid(), startedAt = new Date().toISOString();
let part = 0, activeMs = 0, sentActiveMs = 0, visibleSince = document.visibilityState === 'hidden' ? 0 : Date.now();
const activeNow = () => activeMs + (visibleSince ? Date.now() - visibleSince : 0);
function stateOf(keys, per) {
  const s = {}; let total = 0;
  for (const k of keys) {
    if (PRIVATE_KEY.test(k)) continue;
    const v = cur.get(k), t = v == null ? null : clip(v, per);
    s[k] = t; total += t ? t.length : 0;
    if (total > per * 4) break;
  }
  return s;
}
function bytes(o) { const s = JSON.stringify(o); try { return new Blob([s]).size; } catch (e) { return s.length * 3; } }
function fit(rec) {
  for (const per of [3000, 1200, 400]) { if (bytes(rec) <= LIMIT) return; rec.state = stateOf(Object.keys(rec.state), per); rec.stateTrimmed = true; }
  if (bytes(rec) <= LIMIT) return;
  rec.state = {}; rec.stateTrimmed = true;
  while (bytes(rec) > LIMIT && rec.items.length > 10) { const cut = Math.ceil(rec.items.length / 4); rec.items = rec.items.slice(cut); rec.dropped += cut; }
  if (bytes(rec) > LIMIT) rec.items = rec.items.map(x => ({ ok: x.ok, row: clip(JSON.stringify(x), 160) }));
}
function pendingChanges() {
  const changed = [...cur.keys()].filter(k => cur.get(k) !== base.get(k));
  let items = [];
  for (const k of changed) { try { items = items.concat(newAttempts(base.get(k), cur.get(k))); } catch (e) { } }
  return { changed, items };
}
function send(reason, opts) {
  if (!RECORDING) return { sent: false, why: 'not-a-learning-page' };
  const { changed, items } = pendingChanges();
  const secs = Math.round((activeNow() - sentActiveMs) / 1000);
  if (!items.length && !(changed.length && (reason === 'finish' || secs >= 30))) return { sent: false, why: 'nothing-new' };
  const w = (opts && opts.who) || who();
  if (!w) return { sent: false, why: 'who-unknown' };
  if (!window.V2Records) return { sent: false, why: 'no-sender' };
  const rec = {
    app: 'page', who: w, mode: mode(), subject: subject(), page: PAGE, title: clip(document.title || '', 80),
    roundId: visitId, part: part + 1, reason, startedAt, activeSeconds: Math.max(0, secs),
    total: items.length, right: items.filter(x => x.ok === true).length, wrong: items.filter(x => x.ok === false).length,
    items: items.slice(-150), dropped: Math.max(0, items.length - 150), state: stateOf(changed, 6000)
  };
  fit(rec);
  let id = '';
  try { id = window.V2Records.enqueue(rec); } catch (e) { return { sent: false, why: 'enqueue-failed' }; }
  part += 1; sentActiveMs = activeNow();
  for (const k of changed) base.set(k, cur.get(k));
  return { sent: true, id, rec };
}

/* ---------- 界面：提示条、完成按钮、选孩子、小提示 ---------- */
function toast(text) {
  if (!document.body) return;
  let el = document.getElementById('v2-sync-toast');
  if (!el) {
    el = document.createElement('div'); el.id = 'v2-sync-toast'; el.setAttribute('role', 'status');
    el.style.cssText = 'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:2147483647;background:#173d36;color:#fff;padding:11px 17px;border-radius:999px;font:700 14px/1.3 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.22);max-width:calc(100vw - 32px);text-align:center';
    document.body.appendChild(el);
  }
  el.textContent = text; clearTimeout(toast.t); toast.t = setTimeout(() => el.remove(), 2600);
}
function pickChild() {
  return new Promise(resolve => {
    const cover = document.createElement('div');
    cover.id = 'v2-sync-kid-picker';
    cover.style.cssText = 'position:fixed;inset:0;z-index:2147483646;background:rgba(15,31,39,.62);display:grid;place-items:center;padding:20px';
    const box = document.createElement('div');
    box.style.cssText = 'max-width:360px;width:100%;background:#fff;border-radius:22px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.25);font:16px/1.5 system-ui,sans-serif;text-align:center';
    box.innerHTML = '<b style="font-size:21px">这次是谁在学习？</b><p style="color:#667;margin:8px 0 18px">选好后，这一页的记录会发给家长，两个人的记录分开放。</p>';
    const done = v => { cover.remove(); resolve(v); };
    [['kenton', '🦁 Kenton'], ['eddey', '🐯 Eddey'], ['', '先不发']].forEach(([id, label]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.dataset.kid = id;
      b.style.cssText = id ? 'width:100%;margin:6px 0;padding:13px;border:0;border-radius:14px;background:#e8f6f2;color:#174f43;font-weight:800;font-size:17px' : 'width:100%;margin:10px 0 0;padding:10px;border:0;background:none;color:#667;font-size:15px';
      b.onclick = () => done(id);
      box.appendChild(b);
    });
    cover.appendChild(box); document.body.appendChild(cover);
  });
}
async function finish() {
  let r = send('finish');
  if (!r.sent && r.why === 'who-unknown') {
    const w = await pickChild();
    if (!w) return;
    try { LS && LS.setItem(SESSION_CHILD, w); } catch (e) { }
    r = send('finish', { who: w });
  }
  if (!r.sent) { toast(r.why === 'nothing-new' ? '这次还没有新的作答记录' : '没能生成记录，请告诉家长'); return; }
  toast('正在发给家长…');
  let pending = true;
  try { await window.V2Records.flush(); pending = window.V2Records.isPending ? window.V2Records.isPending(r.id) : false; } catch (e) { }
  toast(pending ? '已保存，联网后自动发给家长 ✓' : (r.rec.mode === 'test' ? '测试记录已发送（不进学情）✓' : '已发给家长 ✓'));
}
function fixUi() {
  const banner = document.getElementById('dd-test-banner');
  if (banner && banner.dataset.v2 !== '1') {
    banner.dataset.v2 = '1';
    banner.textContent = mode() === 'formal' ? '🧪 V2 预览站：页面按测试方式运行，学习记录照常发给家长' : '🧪 V2 测试：本页记录标为测试，不进学情';
  }
  const btn = document.getElementById('dd-sync-complete');
  if (btn && btn.dataset.v2 !== '1' && RECORDING) {
    const nb = btn.cloneNode(true);          // 换掉原来“预览测试 · 不记正式记录”的点击
    nb.dataset.v2 = '1'; nb.textContent = '完成并发给家长';
    if (mode() === 'formal') nb.style.background = '#16856f';
    nb.addEventListener('click', () => { finish(); });
    btn.replaceWith(nb);
  }
}

/* ---------- 时机 ---------- */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (visibleSince) { activeMs += Date.now() - visibleSince; visibleSince = 0; }
    send('hide');
  } else if (!visibleSince) visibleSince = Date.now();
});
window.addEventListener('pagehide', () => { send('leave'); });
fixUi();
document.addEventListener('DOMContentLoaded', fixUi);
window.addEventListener('load', () => { fixUi(); setTimeout(fixUi, 1500); });

window.V2PageSync = {
  send, finish,
  status: () => { const p = pendingChanges(); return { page: PAGE, recording: RECORDING, who: who(), mode: mode(), subject: subject(), changedKeys: p.changed, newAttempts: p.items.length, parts: part }; }
};
})();
