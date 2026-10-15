(function () {
  'use strict';

  var MODE_KEY = 'dd:system:parent-test-mode:v1';
  var OVERLAY_PREFIX = 'dd:test-overlay:v1:';
  var CLEAR_KEY = OVERLAY_PREFIX + '__clear__';
  var QUEUE_KEY = 'dd:sync:queue:v1';
  var QUEUE_READY_KEY = 'dd:sync:ready:v1';
  var CHILD_KEY = 'dd:sync:session-child:v1';
  var PRODUCTION_HOSTS = {
    'study-portal-eta.vercel.app': true
  };
  var RETRY_DELAYS = [5000, 15000, 60000, 180000];
  var native = {
    get: Storage.prototype.getItem,
    set: Storage.prototype.setItem,
    remove: Storage.prototype.removeItem,
    clear: Storage.prototype.clear,
    key: Storage.prototype.key,
    fetch: window.fetch ? window.fetch.bind(window) : null,
    beacon: navigator.sendBeacon ? navigator.sendBeacon.bind(navigator) : null
  };
  var isApp = /\/apps\/[^/]+\.html$/i.test(location.pathname);
  var isHome = /(?:^|\/)index\.html$/i.test(location.pathname) || /\/$/.test(location.pathname);
  var bootedInTest = false;
  var changedKeys = new Set();
  var retryTimer = 0;
  var retryIndex = 0;
  var flushing = null;
  var capturedAttempts = 0;
  // An app with its own explicit summary must keep free-form drafts on-device.
  // Opt-in only: legacy courses retain automatic capture and the completion UI.
  var manualOnly = Boolean(window.DDLearningSyncConfig && window.DDLearningSyncConfig.manualOnly === true);

  function detectEnvironment() {
    var host = String(location.hostname || '').toLowerCase();
    if (PRODUCTION_HOSTS[host]) {
      return { mode: 'production', automatic_test: false, host: host, label: '正式环境' };
    }
    if (!host || location.protocol === 'file:') {
      return { mode: 'local', automatic_test: true, host: host, label: '本地测试环境' };
    }
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') {
      return { mode: 'local', automatic_test: true, host: host, label: '本地测试环境' };
    }
    if (/\.vercel\.app$/i.test(host)) {
      return { mode: 'preview', automatic_test: true, host: host, label: 'Vercel 预览环境' };
    }
    return { mode: 'untrusted', automatic_test: true, host: host, label: '非正式测试环境' };
  }

  var deploymentEnvironment = detectEnvironment();

  function rawGet(key) { return native.get.call(localStorage, key); }
  function rawSet(key, value) { native.set.call(localStorage, key, String(value)); }
  function rawRemove(key) { native.remove.call(localStorage, key); }
  ['dd:sync:device:v1', 'study_portal_cloud_api', 'study_portal_cloud_sync_key'].forEach(rawRemove);
  function nowIso() { return new Date().toISOString(); }
  function normalizeTimestamp(value) {
    if (value == null || value === '') return nowIso();
    var numeric = typeof value === 'number' ? value : (/^\d{10,13}$/.test(String(value).trim()) ? Number(value) : NaN);
    var parsed;
    if (Number.isFinite(numeric)) {
      parsed = new Date(numeric < 100000000000 ? numeric * 1000 : numeric);
    } else {
      parsed = new Date(value);
    }
    return Number.isNaN(parsed.getTime()) ? nowIso() : parsed.toISOString();
  }
  function uid(prefix) {
    var id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    return (prefix || 'event') + '-' + id;
  }
  function hash(value) {
    var h = 2166136261;
    value = String(value);
    for (var i = 0; i < value.length; i += 1) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }
  function safeJson(value, fallback) {
    try { return JSON.parse(value); } catch (_) { return fallback; }
  }
  function modeInfo() {
    var data = safeJson(rawGet(MODE_KEY), null);
    if (!data || !data.expires_at || Number(data.expires_at) <= Date.now()) return null;
    return data;
  }
  function automaticTest() { return deploymentEnvironment.automatic_test; }
  function activeTest() { return automaticTest() || Boolean(modeInfo()); }
  bootedInTest = activeTest();

  function protectedKey(key) {
    key = String(key);
    return key === MODE_KEY || key === QUEUE_KEY || key === QUEUE_READY_KEY || key === CHILD_KEY ||
      key.indexOf(OVERLAY_PREFIX) === 0;
  }
  function overlayKey(key) { return OVERLAY_PREFIX + encodeURIComponent(String(key)); }
  function writeContext() {
    if (activeTest()) return 'test';
    if (bootedInTest) return 'drop';
    return 'formal';
  }
  function clearOverlays() {
    var keys = [];
    for (var i = 0; i < localStorage.length; i += 1) {
      var key = native.key.call(localStorage, i);
      if (key && key.indexOf(OVERLAY_PREFIX) === 0) keys.push(key);
    }
    keys.forEach(rawRemove);
  }
  function visibleTestValue(key) {
    if (key === 'eb_endpoint') return null;
    var overlay = safeJson(rawGet(overlayKey(key)), null);
    if (overlay) return overlay.deleted ? null : String(overlay.value);
    if (rawGet(CLEAR_KEY) === '1') return null;
    return rawGet(key);
  }

  function correctness(row) {
    if (!row || typeof row !== 'object') return null;
    var value;
    if (Object.prototype.hasOwnProperty.call(row, 'ok')) value = row.ok;
    else if (Object.prototype.hasOwnProperty.call(row, 'correct')) value = row.correct;
    else if (Object.prototype.hasOwnProperty.call(row, 'is_correct')) value = row.is_correct;
    else return null;
    if (value === true || value === 1 || value === 'true') return true;
    if (value === false || value === 0 || value === 'false') return false;
    return null;
  }
  function mergeContext(parent, row) {
    var next = Object.assign({}, parent || {});
    ['subject', 'topic', 'lesson', 'activity', 'ts', 'date', 'module'].forEach(function (key) {
      if (row && row[key] != null && row[key] !== '') next[key] = row[key];
    });
    return next;
  }
  function collectAttempts(value, output, context, depth) {
    if (depth > 6 || output.length >= 300 || value == null) return;
    if (Array.isArray(value)) {
      value.forEach(function (item) { collectAttempts(item, output, context, depth + 1); });
      return;
    }
    if (typeof value !== 'object') return;
    var next = mergeContext(context, value);
    var ok = correctness(value);
    if (ok !== null) output.push({ row: value, context: next, ok: ok });
    Object.keys(value).forEach(function (key) {
      var child = value[key];
      if (child && (Array.isArray(child) || typeof child === 'object')) collectAttempts(child, output, next, depth + 1);
    });
  }
  function attemptSignature(entry) {
    var row = entry.row || {};
    return JSON.stringify([
      row.id, row.question, row.prompt, row.item, row.word, row.text, row.answer,
      row.user_answer, row.choice, entry.ok, entry.context.topic, entry.context.lesson,
      row.ts, row.time, row.created_at
    ]);
  }
  function inferChild(key) {
    var source = [location.pathname, location.search, key || ''].join(' ').toLowerCase();
    if (/kenton|who=kenton|child=kenton|kid=kenton/.test(source)) return 'kenton';
    if (/eddey|who=eddey|child=eddey|kid=eddey/.test(source)) return 'eddey';
    var session = rawGet(CHILD_KEY);
    return session === 'kenton' || session === 'eddey' ? session : '';
  }
  function inferSubject() {
    var name = location.pathname.toLowerCase();
    if (/math|calc|数学/.test(name)) return '数学';
    if (/chinese|语文/.test(name)) return '语文';
    if (/english|preply|dictation|verb|clause|sentence|therebe/.test(name)) return '英语';
    if (/coding|cpp|hetao/.test(name)) return '编程';
    return '综合';
  }
  function cleanText(value, max) { return String(value == null ? '' : value).trim().slice(0, max); }
  function eventFromAttempt(entry, key, index) {
    var row = entry.row || {}, ctx = entry.context || {}, kid = inferChild(key);
    if (!kid) return null;
    var signature = attemptSignature(entry);
    return {
      client_event_id: uid('derived') + '-' + hash(key + '|' + signature + '|' + index),
      ts: normalizeTimestamp(row.ts || row.time || row.created_at || ctx.ts),
      kid: kid,
      subject: cleanText(row.subject || ctx.subject || inferSubject(), 40),
      activity: cleanText(row.activity || ctx.activity || 'attempt', 60),
      topic: cleanText(row.topic || ctx.topic || row.skill || ctx.lesson || document.title || '学习作答', 160),
      item: cleanText(row.question || row.prompt || row.item || row.word || row.text || row.id || '学习作答', 2000),
      ok: entry.ok,
      hint: cleanText(row.hint || row.reason || row.explanation || row.correct_answer || '', 1000),
      source: cleanText(location.pathname.replace(/^\//, ''), 120),
      payload: { storage_key: cleanText(key, 120), captured_from: 'localStorage' }
    };
  }
  function captureDelta(key, beforeText, afterText) {
    if (manualOnly) return;
    if (capturedAttempts >= 300 || !afterText || beforeText === afterText || protectedKey(key)) return;
    var before = safeJson(beforeText, null), after = safeJson(afterText, null);
    if (after == null || typeof after !== 'object') return;
    var oldRows = [], newRows = [];
    collectAttempts(before, oldRows, {}, 0);
    collectAttempts(after, newRows, {}, 0);
    if (!newRows.length) return;
    var oldCounts = Object.create(null);
    oldRows.forEach(function (entry) { var sig = attemptSignature(entry); oldCounts[sig] = (oldCounts[sig] || 0) + 1; });
    var seen = Object.create(null);
    newRows.forEach(function (entry) {
      if (capturedAttempts >= 300) return;
      var sig = attemptSignature(entry), occurrence = (seen[sig] || 0) + 1;
      seen[sig] = occurrence;
      if (occurrence <= (oldCounts[sig] || 0)) return;
      var event = eventFromAttempt(entry, key, occurrence);
      if (event) { enqueue(event); capturedAttempts += 1; }
    });
  }

  Storage.prototype.getItem = function (key) {
    if (this !== localStorage || protectedKey(key)) return native.get.call(this, key);
    return activeTest() ? visibleTestValue(String(key)) : native.get.call(this, key);
  };
  Storage.prototype.setItem = function (key, value) {
    if (this !== localStorage || protectedKey(key)) return native.set.call(this, key, value);
    var context = writeContext();
    if (context === 'drop') return;
    if (context === 'test') {
      rawSet(overlayKey(key), JSON.stringify({ value: String(value) }));
      return;
    }
    var before = rawGet(String(key));
    native.set.call(this, key, value);
    changedKeys.add(String(key));
    captureDelta(String(key), before, String(value));
  };
  Storage.prototype.removeItem = function (key) {
    if (this !== localStorage || protectedKey(key)) return native.remove.call(this, key);
    var context = writeContext();
    if (context === 'drop') return;
    if (context === 'test') { rawSet(overlayKey(key), JSON.stringify({ deleted: true })); return; }
    native.remove.call(this, key);
    changedKeys.add(String(key));
  };
  Storage.prototype.clear = function () {
    if (this !== localStorage) return native.clear.call(this);
    var context = writeContext();
    if (context === 'drop') return;
    if (context === 'test') { clearOverlays(); rawSet(CLEAR_KEY, '1'); return; }
    var keep = {};
    [MODE_KEY, QUEUE_KEY, QUEUE_READY_KEY, CHILD_KEY].forEach(function (key) {
      var value = rawGet(key); if (value != null) keep[key] = value;
    });
    native.clear.call(this);
    Object.keys(keep).forEach(function (key) { rawSet(key, keep[key]); });
  };

  if (native.fetch) {
    window.fetch = function (input, init) {
      var method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      if (method !== 'GET' && method !== 'HEAD' && writeContext() !== 'formal') {
        return Promise.resolve(new Response(JSON.stringify({ ok: true, test: true }), { status: 202, headers: { 'Content-Type': 'application/json' } }));
      }
      return native.fetch(input, init);
    };
    if (native.beacon) navigator.sendBeacon = function (url, data) {
      if (writeContext() !== 'formal') return true;
      return native.beacon(url, data);
    };
  }

  function queueRead() {
    var rows = safeJson(rawGet(QUEUE_KEY), []);
    if (!Array.isArray(rows)) return [];
    return rows.map(function (row) {
      if (!row || typeof row !== 'object') return row;
      var next = Object.assign({}, row);
      next.ts = normalizeTimestamp(next.ts || next.occurred_at);
      return next;
    }).filter(function (row) { return row && typeof row === 'object'; });
  }
  function queueReady() { return rawGet(QUEUE_READY_KEY) === '1'; }
  function setQueueReady(value) {
    if (value) rawSet(QUEUE_READY_KEY, '1');
    else rawRemove(QUEUE_READY_KEY);
  }
  function queueWrite(rows) {
    rows = rows.slice(-2000);
    rawSet(QUEUE_KEY, JSON.stringify(rows));
    if (!rows.length) setQueueReady(false);
    renderHomeTestControl();
  }
  function enqueue(event) {
    if (!event || writeContext() !== 'formal') return false;
    if (!event.client_event_id) event.client_event_id = uid('event');
    if (!event.ts) event.ts = nowIso();
    var rows = queueRead();
    if (rows.some(function (row) { return row.client_event_id === event.client_event_id; })) return false;
    rows.push(event); queueWrite(rows); return true;
  }
  function cloudConfig() {
    return { url: deploymentEnvironment.mode === 'production' ? '/api' : '' };
  }
  function scheduleFlush(delay) {
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = setTimeout(function () { retryTimer = 0; flush(); }, Math.max(0, Number(delay) || 0));
  }
  async function flush() {
    if (flushing) return flushing;
    var cfg = cloudConfig();
    if (!cfg.url || !native.fetch || activeTest() || !queueReady()) {
      return { ok: false, queued: queueRead().length, pending: queueRead().length };
    }
    var task = (async function () {
      try {
        var loops = 0;
        while (queueRead().length && loops < 40) {
          var batch = queueRead().slice(0, 50);
          var response = await native.fetch(cfg.url + '/events', {
            method: 'POST', cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch)
          });
          var data = await response.json().catch(function () { return {}; });
          if (!response.ok || data.ok === false) throw new Error(data.error || ('HTTP ' + response.status));
          var sent = new Set(batch.map(function (row) { return row.client_event_id; }));
          queueWrite(queueRead().filter(function (row) { return !sent.has(row.client_event_id); }));
          loops += 1;
        }
        retryIndex = 0;
        return { ok: true, queued: queueRead().length, pending: queueRead().length };
      } catch (error) {
        var delay = RETRY_DELAYS[Math.min(retryIndex, RETRY_DELAYS.length - 1)];
        retryIndex += 1; scheduleFlush(delay);
        return { ok: false, error: error.message, queued: queueRead().length, pending: queueRead().length };
      } finally { renderHomeTestControl(); }
    })();
    flushing = task;
    try { return await task; }
    finally { if (flushing === task) flushing = null; }
  }
  async function recoverPendingQueue() {
    var pendingBefore = queueReady() ? queueRead().length : 0;
    var result = await flush();
    if (
      pendingBefore > 0 &&
      result &&
      result.ok &&
      !result.pending &&
      isApp &&
      document.body
    ) {
      notice('旧学习记录已自动补传 ✓', 'synced');
    }
    return result;
  }

  function snapshot() {
    if (manualOnly) return {};
    var result = {}, total = 0;
    Array.from(changedKeys).slice(0, 80).forEach(function (key) {
      if (protectedKey(key) || /token|secret|password|email|phone|address|school|name/i.test(key)) return;
      var value = rawGet(key);
      if (value == null) return;
      value = String(value).slice(0, 12288);
      if (total + value.length > 49152) return;
      result[key] = value; total += value.length;
    });
    return result;
  }
  function makeEvent(data) {
    data = data || {};
    var kid = data.kid || inferChild(data.storage_key || '');
    if (!kid) return null;
    return {
      client_event_id: data.client_event_id || uid('event'), ts: normalizeTimestamp(data.ts), kid: kid,
      subject: cleanText(data.subject || inferSubject(), 40),
      activity: cleanText(data.activity || 'attempt', 60),
      topic: cleanText(data.topic || document.title || '学习', 160),
      item: cleanText(data.item || '学习作答', 2000),
      ok: data.ok == null ? null : Boolean(data.ok),
      hint: cleanText(data.hint || '', 1000),
      source: cleanText(data.source || location.pathname.replace(/^\//, ''), 120),
      payload: data.payload && typeof data.payload === 'object' ? data.payload : {}
    };
  }
  function recordAttempt(data) { var event = makeEvent(data); return event ? enqueue(event) : false; }
  function complete(data) {
    data = Object.assign({}, data || {}, { activity: 'session_complete', ok: null, item: (data && data.item) || '完成本次学习' });
    data.payload = Object.assign({}, data.payload || {}, { state: snapshot(), mode: 'formal' });
    var saved = recordAttempt(data);
    if (saved) {
      setQueueReady(true);
      scheduleFlush(0);
    }
    return saved;
  }
  function setChild(kid) {
    if (kid === 'kenton' || kid === 'eddey') { rawSet(CHILD_KEY, kid); return true; }
    rawRemove(CHILD_KEY); return false;
  }

  function pickChild() {
    return new Promise(function (resolve) {
      var cover = document.createElement('div');
      cover.id = 'dd-sync-kid-picker';
      cover.style.cssText = 'position:fixed;inset:0;z-index:2147483646;background:rgba(15,31,39,.62);display:grid;place-items:center;padding:20px';
      var box = document.createElement('div');
      box.style.cssText = 'max-width:360px;width:100%;background:#fff;border-radius:22px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.25);font:16px/1.5 system-ui,sans-serif;text-align:center';
      box.innerHTML = '<b style="font-size:21px">这次是谁在学习？</b><p style="color:#667;margin:8px 0 18px">只用于本次页面，不会把两人的记录混在一起。</p>';
      [['kenton','🦁 Kenton'],['eddey','🐯 Eddey']].forEach(function (pair) {
        var button = document.createElement('button');
        button.textContent = pair[1]; button.setAttribute('data-kid', pair[0]);
        button.style.cssText = 'width:100%;margin:6px 0;padding:13px;border:0;border-radius:14px;background:#e8f6f2;color:#174f43;font-weight:800;font-size:17px';
        button.onclick = function () { setChild(pair[0]); cover.remove(); resolve(pair[0]); };
        box.appendChild(button);
      });
      cover.appendChild(box); document.body.appendChild(cover);
    });
  }
  function notice(text, kind) {
    var el = document.createElement('div');
    el.id = 'dd-sync-toast'; el.setAttribute('data-kind', kind || 'info');
    el.textContent = text;
    el.style.cssText = 'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:2147483647;background:#173d36;color:#fff;padding:11px 17px;border-radius:999px;font:700 14px/1.3 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.22);white-space:nowrap';
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 2200);
  }
  async function finishClick() {
    if (writeContext() !== 'formal') {
      notice((automaticTest() ? deploymentEnvironment.label : '家长测试中') + '：本次不记正式记录、不上传', 'test');
      return;
    }
    var kid = inferChild('');
    if (!kid) kid = await pickChild();
    var saved = complete({ kid: kid });
    if (!saved) { notice('未生成记录', 'error'); return; }
    var result = await flush();
    notice(result && result.ok && !result.queued ? '已完成并同步 ✓' : '已保存，联网后自动同步 ✓', result && result.ok && !result.queued ? 'synced' : 'pending');
  }
  function renderEnvironmentBanner() {
    if (!document.body) return;
    var existing = document.getElementById('dd-test-banner');
    if (!activeTest()) {
      if (existing) existing.remove();
      if (document.body.getAttribute('data-dd-test-offset')) {
        document.body.style.paddingTop = document.body.getAttribute('data-dd-test-original-padding') || '';
        document.body.removeAttribute('data-dd-test-offset');
        document.body.removeAttribute('data-dd-test-original-padding');
      }
      return;
    }
    if (existing) return;
    var banner = document.createElement('div');
    banner.id = 'dd-test-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.textContent = automaticTest()
      ? '🧪 ' + deploymentEnvironment.label + '：记录只留在测试沙盒，正式档案和云端同步已锁定'
      : '🧪 家长测试模式：操作只在临时沙盒中，退出后丢弃，正式记录和云端同步已暂停';
    banner.style.cssText = 'position:fixed;z-index:2147483645;top:0;left:0;right:0;padding:9px 14px;background:#7650a8;color:#fff;text-align:center;font:700 13px/1.35 system-ui,sans-serif;box-shadow:0 2px 12px rgba(0,0,0,.18);pointer-events:none';
    document.body.appendChild(banner);
    if (!document.body.getAttribute('data-dd-test-offset')) {
      var currentPadding = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
      document.body.setAttribute('data-dd-test-original-padding', document.body.style.paddingTop || '');
      document.body.style.paddingTop = (currentPadding + 38) + 'px';
      document.body.setAttribute('data-dd-test-offset', '1');
    }
  }
  function renderAppUi() {
    if (manualOnly) return;
    if (!isApp || !document.body) return;
    if (activeTest()) {
      renderEnvironmentBanner();
    }
    if (/news_|cpp_hub|summer_english_hub|wrong_redo/i.test(location.pathname)) return;
    var button = document.createElement('button');
    button.type = 'button'; button.id = 'dd-sync-complete';
    button.textContent = activeTest() ? (automaticTest() ? '预览测试 · 不记正式记录' : '测试中 · 不记记录') : '完成并同步';
    button.style.cssText = 'position:fixed;z-index:2147483644;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));padding:12px 18px;border:0;border-radius:999px;background:' + (activeTest() ? '#7650a8' : '#16856f') + ';color:#fff;font:800 15px/1.2 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.22);cursor:pointer';
    button.addEventListener('click', finishClick); document.body.appendChild(button);
  }

  function startTest() {
    if (automaticTest()) { renderHomeTestControl(); return false; }
    clearOverlays(); rawSet(MODE_KEY, JSON.stringify({ started_at: Date.now(), expires_at: Date.now() + 2 * 60 * 60 * 1000 }));
    broadcast('start'); renderEnvironmentBanner(); renderHomeTestControl();
    return true;
  }
  function stopTest() {
    if (automaticTest()) { renderHomeTestControl(); return false; }
    rawRemove(MODE_KEY); clearOverlays(); broadcast('stop'); renderEnvironmentBanner(); renderHomeTestControl();
    return true;
  }
  function broadcast(action) {
    try { var channel = new BroadcastChannel('dd-learning-sync'); channel.postMessage({ action: action }); channel.close(); } catch (_) {}
  }
  function renderHomeTestControl() {
    if (!isHome || !document.body) return;
    var panel = document.getElementById('dd-home-test-control');
    if (!panel) return;
    var active = activeTest(), queued = queueRead().length, info = modeInfo();
    var button = panel.querySelector('[data-toggle]');
    if (automaticTest()) {
      panel.querySelector('[data-status]').textContent = deploymentEnvironment.label + '已自动锁定 · 不会写入正式记录';
      panel.querySelector('[data-queue]').textContent = '云端正式同步已停用；此网址中的操作只属于测试沙盒';
      button.textContent = '预览已自动隔离';
      button.disabled = true;
      button.style.background = '#8b7aa7';
      button.style.cursor = 'default';
      return;
    }
    panel.querySelector('[data-status]').textContent = active
      ? '测试模式已开启 · ' + new Date(info.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' 自动结束 · 退出会丢弃全部测试操作'
      : '正式模式 · 所有设备可直接同步；做完请点学习页右下角「完成并同步」收尾';
    panel.querySelector('[data-queue]').textContent = queued
      ? queueReady()
        ? '待同步 ' + queued + ' 条（已确认完成，联网后自动重试）'
        : '本机暂存 ' + queued + ' 条（完成学习后点「完成并同步」）'
      : '同步队列为空 ✓';
    button.disabled = false;
    button.textContent = active ? '退出测试并丢弃记录' : '开启家长测试（2小时）';
    button.style.background = active ? '#a33b55' : '#7650a8';
    button.style.cursor = 'pointer';
  }
  function renderHomeTestUi() {
    if (!isHome || !document.body || document.getElementById('dd-home-test-control')) return;
    var panel = document.createElement('section'); panel.id = 'dd-home-test-control'; panel.className = 'card';
    panel.setAttribute('aria-label', '家长测试隔离');
    panel.style.cssText = 'border:2px solid #7650a8;margin:0 0 14px;padding:14px 16px;background:linear-gradient(135deg,#fbf8ff,#f3ecff);box-shadow:0 8px 24px rgba(91,62,127,.12)';
    panel.innerHTML = '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<div style="flex:1 1 210px;min-width:0"><h2 style="margin:0 0 4px;font-size:18px">🧪 家长测试隔离</h2>' +
      '<div data-status style="font-weight:800;font-size:13px;line-height:1.45"></div></div>' +
      '<button data-toggle type="button" style="min-height:44px;padding:10px 16px;border:0;border-radius:999px;color:#fff;font-weight:800;font-size:14px"></button>' +
      '</div><div data-queue class="footer-note" style="text-align:left;margin:7px 0 0"></div>';
    panel.querySelector('[data-toggle]').onclick = function () {
      if (activeTest() && !automaticTest()) stopTest(); else startTest();
    };
    var wrap = document.querySelector('.wrap');
    if (wrap) wrap.insertBefore(panel, wrap.firstChild); else document.body.insertBefore(panel, document.body.firstChild);
    renderHomeTestControl();
  }

  window.DDLearningSync = {
    recordAttempt: recordAttempt,
    complete: complete,
    flush: flush,
    setChild: setChild,
    startTest: startTest,
    stopTest: stopTest,
    isTest: activeTest,
    isAutomaticTest: automaticTest,
    environment: function () { return Object.assign({}, deploymentEnvironment); },
    queueSize: function () { return queueRead().length; }
  };
  window.addEventListener('online', function () { recoverPendingQueue(); });
  window.addEventListener('pageshow', function () { recoverPendingQueue(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) recoverPendingQueue(); });
  window.addEventListener('storage', function (event) {
    if (event.key === MODE_KEY && isApp) location.reload();
    if (event.key === QUEUE_KEY || event.key === MODE_KEY) { renderEnvironmentBanner(); renderHomeTestControl(); }
  });
  try {
    var bc = new BroadcastChannel('dd-learning-sync');
    bc.onmessage = function () { if (isApp) location.reload(); else { renderEnvironmentBanner(); renderHomeTestControl(); } };
  } catch (_) {}
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { renderEnvironmentBanner(); renderAppUi(); renderHomeTestUi(); recoverPendingQueue(); });
  else { renderEnvironmentBanner(); renderAppUi(); renderHomeTestUi(); recoverPendingQueue(); }
})();
