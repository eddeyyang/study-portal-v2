/* Travel lessons, separate memory practice, teaching images and candidate English audio are stored here.
   Learning answers and API traffic remain outside this resource cache. */
'use strict';

const VERSION = '20260917-travel-textbook-v10';
const CACHE_PREFIX = 'study-chinese-travel-';
const FILES = Object.freeze([
  '/apps/kenton_chinese_preview_20260915.html',
  '/apps/eddey_chinese_preview_20260915.html',
  '/apps/kenton_math_catchup_20260916.html',
  '/apps/eddey_math_catchup_20260916.html',
  '/apps/travel_learning_director_20260916.html',
  '/assets/learning-sync.js',
  '/assets/reader-art/normandy.webp',
  '/assets/reader-art/hailibu.webp',
  '/assets/reader-art/tianji.webp',
  '/assets/reader-art/cowherd.webp',
  '/assets/reader-art/ivy.webp',
  '/assets/reader-art/cricket.webp',
  '/assets/reader-art/bat.webp',
  '/apps/kenton_chinese_memory_20260917.html',
  '/apps/eddey_chinese_memory_20260917.html',
  '/apps/kenton_english_unit2_20260917.html',
  '/apps/eddey_english_unit2_20260917.html',
  '/apps/kenton_english_memory_20260917.html',
  '/apps/eddey_english_memory_20260917.html',
  '/apps/assets/reading-practice-20260917/unit2-scenes.webp',
  '/apps/assets/reading-practice-20260917/unit2-story-scenes.webp',
  '/apps/audio/english_unit2_20260917/unit2-01.mp3',
  '/apps/audio/english_unit2_20260917/unit2-02.mp3',
  '/apps/audio/english_unit2_20260917/unit2-03.mp3',
  '/apps/audio/english_unit2_20260917/unit2-04.mp3',
  '/apps/audio/english_unit2_20260917/unit2-05.mp3',
  '/apps/audio/english_unit2_20260917/unit2-06.mp3',
  '/apps/kenton_english_unit3_20260917.html',
  '/apps/kenton_english_unit3_memory_20260917.html',
  '/apps/eddey_english_unit3_20260917.html',
  '/apps/eddey_english_unit3_memory_20260917.html',
  '/apps/assets/reading-practice-20260917/unit3-plants.webp',
  '/apps/assets/reading-practice-20260917/unit3-animals.webp',
  '/apps/audio/english_unit3_20260917/unit3-01.mp3',
  '/apps/audio/english_unit3_20260917/unit3-02.mp3',
  '/apps/audio/english_unit3_20260917/unit3-03.mp3',
  '/apps/audio/english_unit3_20260917/unit3-04.mp3',
  '/apps/audio/english_unit3_20260917/unit3-05.mp3',
  '/apps/audio/english_unit3_20260917/unit3-06.mp3',
  '/apps/audio/english_unit3_20260917/unit3-07.mp3',
  '/assets/reader-art/pangu.webp',
  '/assets/reader-art/prometheus.webp'
]);
const NETWORK_TIMEOUT_MS = 3000;
const PREPARE_TIMEOUT_MS = 12000;
let preparing = null;
let sequence = 0;

function resourcePath(request) {
  if (!request || request.method !== 'GET') return null;
  try {
    const url = new URL(request.url);
    return url.origin === self.location.origin && FILES.includes(url.pathname)
      ? url.pathname : null;
  } catch (_) {
    return null;
  }
}

function absolute(path) {
  return new URL(path, self.location.origin).href;
}

async function fetchWithin(request, timeout, validate) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(request, {
          cache: 'no-store', credentials: 'same-origin', signal: controller.signal
        });
        // A connection can deliver headers and then stall. Keep the deadline
        // active until the resource body has arrived, not just its headers.
        if (validate) await validate(response);
        else if (response.ok) await response.clone().arrayBuffer();
        return response;
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('网络较慢，请在网络稳定时重新准备。'));
        }, timeout);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function verifyResource(response, path) {
  if (!response || !response.ok || response.redirected || response.type === 'opaque') {
    throw new Error('课程文件未能完整下载，请联网后重试。');
  }
  const type = response.headers.get('content-type') || '';
  if (path.endsWith('.mp3')) {
    const bytes = new Uint8Array(await response.clone().arrayBuffer());
    const id3 = bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51;
    const frame = bytes[0] === 255 && (bytes[1] & 224) === 224;
    if (!/audio\/(?:mpeg|mp3)/i.test(type) || bytes.length < 128 || (!id3 && !frame)) throw new Error('英语音频没有完整下载，旧离线课程已保留。');
    return;
  }
  if (path.endsWith('.webp')) {
    const bytes = new Uint8Array(await response.clone().arrayBuffer());
    const ascii = (a,b) => String.fromCharCode(...bytes.slice(a,b));
    if (!/image\/webp/i.test(type) || bytes.length < 16 || ascii(0,4) !== 'RIFF' || ascii(8,12) !== 'WEBP') throw new Error('插画文件未能完整下载，旧课程已保留。');
    return;
  }
  const body = await response.clone().text();
  const isScript = path.endsWith('.js');
  const marker = isScript ? 'DDLearningSync' : path.split('/').pop().replace('.html', '');
  if ((isScript ? !/(?:javascript|ecmascript)/i.test(type) : !/text\/html/i.test(type)) ||
      !body.includes(marker) || (!isScript && !/<html[\s>]/i.test(body))) {
    throw new Error('下载内容与课程不符，旧离线课程已保留。');
  }
}

async function completeCache(name) {
  const cache = await caches.open(name);
  const resources = await Promise.all(FILES.map(path => cache.match(absolute(path))));
  return resources.every(Boolean) ? cache : null;
}

async function cachedResource(path) {
  // CacheStorage preserves creation order. Inspect newest complete snapshots
  // first so a worker restart never promotes a half-written preparation.
  const names = (await caches.keys()).filter(name => name.startsWith(CACHE_PREFIX)).reverse();
  for (const name of names) {
    const cache = await completeCache(name);
    if (cache) return cache.match(absolute(path));
  }
  // Preserve all 40 previous Unit 3 resources if a new illustration download is interrupted.
  for (const name of names.filter(name => name.startsWith(CACHE_PREFIX + '20260917-travel-unit3-v9-'))) {
    const old = await caches.open(name);
    if ((await Promise.all(FILES.slice(0,40).map(file => old.match(absolute(file))))).every(Boolean)) {
      const response = await old.match(absolute(path));
      if (response) return response;
    }
  }
  // Preserve the complete 27-resource Unit 2 / memory pack during an interrupted upgrade.
  for (const name of names.filter(name => name.startsWith(CACHE_PREFIX + '20260917-travel-memory-v8-'))) {
    const old = await caches.open(name);
    if ((await Promise.all(FILES.slice(0,27).map(file => old.match(absolute(file))))).every(Boolean)) {
      const response = await old.match(absolute(path));
      if (response) return response;
    }
  }
  // Keep the previously complete v7 pack usable during an interrupted upgrade.
  for (const name of names.filter(name => name.startsWith(CACHE_PREFIX + '20260917-travel-reader-v7-'))) {
    const old = await caches.open(name);
    if ((await Promise.all(FILES.slice(0,13).map(file => old.match(absolute(file))))).every(Boolean)) {
      const response = await old.match(absolute(path));
      if (response) return response;
    }
  }
  // The previously published six-resource v5 pack remains usable if images
  // cannot yet be prepared. Require every old course; never use a partial pack.
  for (const name of names.filter(name => name.startsWith(CACHE_PREFIX + '20260916-travel-v5-'))) {
    const old = await caches.open(name);
    if ((await Promise.all(FILES.slice(0,6).map(file => old.match(absolute(file))))).every(Boolean)) {
      const response = await old.match(absolute(path));
      if (response) return response;
    }
  }
  // An already-prepared v2 Chinese pack stays usable if the v3 download fails.
  // Only known v2 snapshots with every old resource qualify, never half a new pack.
  for (const name of names.filter(name => name.startsWith(CACHE_PREFIX + '20260915-travel-v2-'))) {
    const old = await caches.open(name);
    const originalFiles = [FILES[0], FILES[1], '/assets/learning-sync.js'];
    if ((await Promise.all(originalFiles.map(file => old.match(absolute(file))))).every(Boolean)) {
      const response = await old.match(absolute(path));
      if (response) return response;
    }
  }
  return undefined;
}

async function prepareResources() {
  // Fetch and validate every response before touching any existing snapshot.
  const downloaded = await Promise.all(FILES.map(async path => {
    const response = await fetchWithin(new Request(absolute(path)), PREPARE_TIMEOUT_MS,
      received => verifyResource(received, path));
    return { path, response };
  }));
  const name = CACHE_PREFIX + VERSION + '-' + Date.now() + '-' + (++sequence);
  try {
    const cache = await caches.open(name);
    for (const { path, response } of downloaded) {
      await cache.put(absolute(path), response.clone());
    }
    if (!await completeCache(name)) throw new Error('离线文件检查未完成，请重试。');
  } catch (_) {
    // Delete only this failed attempt, never the previous usable snapshot.
    try { await caches.delete(name); } catch (_) { /* A previous snapshot remains usable. */ }
    throw new Error('设备未能保存完整课程，旧离线课程已保留。');
  }

  // Keep the newest successful preparation and one recovery snapshot. Cleanup
  // is optional and cannot turn a verified preparation into a false failure.
  try {
    const names = (await caches.keys()).filter(key => key.startsWith(CACHE_PREFIX));
    const complete = [];
    for (const key of names) if (await completeCache(key)) complete.push(key);
    for (const key of complete.slice(0, -2)) await caches.delete(key);
  } catch (_) { /* Storage cleanup is not a learning prerequisite. */ }
  return { ok: true, version: VERSION, files: FILES.slice() };
}

self.addEventListener('install', event => {
  // Installing or opening a course never silently downloads the offline pack.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'PREPARE_CHINESE_TRAVEL') return;
  const port = event.ports && event.ports[0];
  if (!port) return;
  if (!preparing) {
    preparing = prepareResources()
      .catch(error => ({ ok: false, error: error.message || '离线课程尚未准备好，请重试。' }))
      .finally(() => { preparing = null; });
  }
  event.waitUntil(preparing.then(result => port.postMessage(result)));
});

self.addEventListener('fetch', event => {
  const path = resourcePath(event.request);
  if (!path) return;
  event.respondWith((async () => {
    let response;
    let failure;
    try {
      response = await fetchWithin(event.request, NETWORK_TIMEOUT_MS);
      if (response.ok) return response;
    } catch (error) {
      failure = error;
    }
    const cached = await cachedResource(path);
    if (cached) return cached;
    if (response) return response;
    throw failure || new Error('尚未准备离线课程，请先联网打开。');
  })());
});

