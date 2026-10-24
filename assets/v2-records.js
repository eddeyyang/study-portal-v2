/* v2 学习记录上报（Claude 设计版，2026-10-24）
   作用：孩子在 v2 软件里做完一轮，把结果发到家长自己的接收站，Claude 定时读取后写进学情总档。
   接收站地址在 data/v2-records-config.json 里（endpoint 为空时不发送，只留在本机）。
   发送失败先排队存在本机，下次打开任何 v2 软件时自动补发；同一条记录带固定编号，接收站按编号去重。
   家长测试（?test=1）的记录标 mode:test，接收站分开存，不进正式学情。
   另提供 share(record)：一键把本轮结果用手机分享面板发给家长（邮件/微信），不依赖接收站。 */
(() => {
'use strict';
const QUEUE_KEY = 'sp2.records.queue:v1';
const CONFIG_URL = new URL('../data/v2-records-config.json', document.currentScript ? document.currentScript.src : location.href).href;
let config = null, configPromise = null, flushing = false;

function loadConfig() {
  if (configPromise) return configPromise;
  configPromise = fetch(CONFIG_URL, { cache: 'no-store' }).then(r => r.ok ? r.json() : {}).catch(() => ({})).then(c => { config = c || {}; return config; });
  return configPromise;
}
function readQueue() { try { const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); return Array.isArray(q) ? q : []; } catch (e) { return []; } }
function writeQueue(q) { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-200))); } catch (e) { } }
function uid() { return (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)); }

/* record: {app, who, subject, mode, roundId, at, summary:{...}, items:[...]} */
function enqueue(record) {
  const rec = Object.assign({ id: uid(), at: new Date().toISOString(), site: location.host, v: 1 }, record);
  const q = readQueue(); q.push(rec); writeQueue(q);
  flush();
  return rec.id;
}
async function post(endpoint, rec) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(endpoint, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(rec), signal: ctrl.signal, keepalive: true });
    return r.ok;
  } catch (e) { return false; } finally { clearTimeout(t); }
}
async function flush() {
  if (flushing) return; flushing = true;
  try {
    const cfg = await loadConfig(); const endpoint = cfg && typeof cfg.endpoint === 'string' && /^https:\/\//.test(cfg.endpoint) ? cfg.endpoint : '';
    if (!endpoint) return;
    let q = readQueue();
    while (q.length) {
      const ok = await post(endpoint, q[0]);
      if (!ok) break;
      q = q.slice(1); writeQueue(q);
    }
  } finally { flushing = false; }
}
function status() { const q = readQueue(); return { pending: q.length, enabled: !!(config && config.endpoint) }; }

/* 分享：一键发给家长。优先手机分享面板；没有就打开邮件。 */
async function share(title, text) {
  try { if (navigator.share) { await navigator.share({ title, text }); return 'shared'; } } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  const cfg = await loadConfig(); const to = (cfg && cfg.parentEmail) || '';
  location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
  return 'mailto';
}

window.V2Records = { enqueue, flush, status, share, loadConfig };
if (document.readyState === 'complete') flush(); else window.addEventListener('load', () => flush());
window.addEventListener('online', () => flush());
})();
