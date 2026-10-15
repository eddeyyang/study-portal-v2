import { neon } from '@neondatabase/serverless';

const ALLOWED_ORIGINS = new Set([
  'https://easonyoung1990-dot.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
]);

const MAX_ROWS = 200;
const MAX_BODY_BYTES = 256 * 1024;
const MAX_PAIR_BODY_BYTES = 4 * 1024;
const PAIR_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const PAIR_CODE_LENGTH = 10;
const DEVICE_TOKEN_BYTES = 32;

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, X-Sync-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
  if (ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function json(origin, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function cleanText(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function readRows(input) {
  const values = Array.isArray(input) ? input : [input];
  if (!values.length || values.length > MAX_ROWS) {
    throw new Error(`每次同步须为 1-${MAX_ROWS} 条记录`);
  }

  return values.map((raw) => {
    const kid = cleanText(raw.kid, 16).toLowerCase();
    const activity = cleanText(raw.activity, 60) || 'practice';
    const isSystemCheck = kid === 'system' && activity === 'connection_test';
    if (kid !== 'kenton' && kid !== 'eddey' && !isSystemCheck) {
      throw new Error('kid 只允许 kenton 或 eddey');
    }

    const occurredAt = raw.ts ? new Date(raw.ts) : new Date();
    if (Number.isNaN(occurredAt.getTime())) {
      throw new Error('记录时间格式不正确');
    }

    return {
      clientEventId: cleanText(raw.client_event_id, 120) || crypto.randomUUID(),
      occurredAt: occurredAt.toISOString(),
      kid,
      subject: cleanText(raw.subject, 40),
      activity,
      topic: cleanText(raw.topic, 160),
      item: cleanText(raw.item, 2000),
      isCorrect: raw.ok == null && raw.is_correct == null ? null : Boolean(raw.ok ?? raw.is_correct),
      hint: cleanText(raw.hint, 1000),
      source: cleanText(raw.source, 120) || 'study-portal',
      payload: raw.payload && typeof raw.payload === 'object' ? raw.payload : {},
    };
  });
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function randomPairCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(PAIR_CODE_LENGTH));
  return Array.from(bytes, (byte) => PAIR_CODE_ALPHABET[byte & 31]).join('');
}

function randomDeviceToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(DEVICE_TOKEN_BYTES));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function normalizePairCode(value) {
  const code = cleanText(value, 32).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== PAIR_CODE_LENGTH) return '';
  return Array.from(code).every((character) => PAIR_CODE_ALPHABET.includes(character)) ? code : '';
}

async function authorized(request, env, sql) {
  const supplied = request.headers.get('X-Sync-Key') || '';
  if (!supplied) return false;

  const suppliedHash = await sha256(supplied);
  if (env.SYNC_KEY && suppliedHash === await sha256(env.SYNC_KEY)) return true;

  const rows = await sql`
    SELECT id
    FROM public.authorized_devices
    WHERE token_hash = ${suppliedHash} AND revoked_at IS NULL
    LIMIT 1
  `;
  return rows.length === 1;
}

async function readJson(request, maxBytes) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > maxBytes) throw new Error('请求内容过大');

  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new Error('请求内容过大');
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new Error('JSON 格式不正确');
  }
}

async function insertEvents(sql, rows) {
  const queries = rows.map((row) => sql`
    INSERT INTO public.learning_events (
      client_event_id, occurred_at, kid, subject, activity, topic,
      item, is_correct, hint, source, payload
    ) VALUES (
      ${row.clientEventId}, ${row.occurredAt}, ${row.kid}, ${row.subject},
      ${row.activity}, ${row.topic}, ${row.item}, ${row.isCorrect},
      ${row.hint}, ${row.source}, ${JSON.stringify(row.payload)}::jsonb
    )
    ON CONFLICT (client_event_id) DO NOTHING
    RETURNING id
  `);
  const results = await sql.transaction(queries);
  return results.reduce((count, result) => count + result.length, 0);
}

async function handleGet(request, env, origin) {
  const url = new URL(request.url);
  const sql = neon(env.DATABASE_URL);

  if (url.pathname === '/health') {
    const [row] = await sql`SELECT current_database() AS database, now() AS checked_at`;
    return json(origin, { ok: true, service: 'study-portal-api', ...row });
  }

  if (url.pathname !== '/events') {
    return json(origin, { ok: false, error: 'Not found' }, 404);
  }
  if (!await authorized(request, env, sql)) {
    return json(origin, { ok: false, error: '未授权' }, 401);
  }

  const mode = url.searchParams.get('mode') || 'stats';
  const kid = cleanText(url.searchParams.get('kid'), 16).toLowerCase();
  if (kid && kid !== 'kenton' && kid !== 'eddey') {
    return json(origin, { ok: false, error: '孩子参数不正确' }, 400);
  }

  if (mode === 'errors') {
    const rows = kid
      ? await sql`
          SELECT id, occurred_at AS ts, kid, subject, topic, item,
                 is_correct AS ok, hint, source
          FROM public.learning_events
          WHERE is_correct = false AND kid = ${kid}
          ORDER BY occurred_at DESC
          LIMIT 500
        `
      : await sql`
          SELECT id, occurred_at AS ts, kid, subject, topic, item,
                 is_correct AS ok, hint, source
          FROM public.learning_events
          WHERE is_correct = false
          ORDER BY occurred_at DESC
          LIMIT 500
        `;
    return json(origin, { ok: true, errors: rows });
  }

  const rows = kid
    ? await sql`
        SELECT kid, subject, topic, count(*)::int AS attempts,
               count(*) FILTER (WHERE is_correct = true)::int AS correct
        FROM public.learning_events
        WHERE kid = ${kid}
        GROUP BY kid, subject, topic
        ORDER BY kid, subject, topic
      `
    : await sql`
        SELECT kid, subject, topic, count(*)::int AS attempts,
               count(*) FILTER (WHERE is_correct = true)::int AS correct
        FROM public.learning_events
        WHERE kid IN ('kenton', 'eddey')
        GROUP BY kid, subject, topic
        ORDER BY kid, subject, topic
      `;
  return json(origin, { ok: true, stats: rows });
}

async function handleEventsPost(request, env, origin) {
  const sql = neon(env.DATABASE_URL);
  if (!await authorized(request, env, sql)) {
    return json(origin, { ok: false, error: '未授权' }, 401);
  }

  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > MAX_BODY_BYTES) {
    return json(origin, { ok: false, error: '同步内容过大' }, 413);
  }

  let body;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
      return json(origin, { ok: false, error: '同步内容过大' }, 413);
    }
    body = JSON.parse(text);
  } catch {
    return json(origin, { ok: false, error: 'JSON 格式不正确' }, 400);
  }

  try {
    const rows = readRows(body);
    const added = await insertEvents(sql, rows);
    return json(origin, { ok: true, received: rows.length, added });
  } catch (error) {
    return json(origin, { ok: false, error: error.message || '同步失败' }, 400);
  }
}

async function handlePairingCreate(request, env, origin) {
  const sql = neon(env.DATABASE_URL);
  if (!await authorized(request, env, sql)) {
    return json(origin, { ok: false, error: '未授权' }, 401);
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = randomPairCode();
    const codeHash = await sha256(code);
    const rows = await sql`
      INSERT INTO public.device_pairing_tokens (token_hash, expires_at)
      VALUES (${codeHash}, now() + interval '10 minutes')
      ON CONFLICT (token_hash) DO NOTHING
      RETURNING expires_at
    `;
    if (rows.length === 1) {
      return json(origin, {
        ok: true,
        code,
        display_code: `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`,
        expires_at: rows[0].expires_at,
      });
    }
  }
  return json(origin, { ok: false, error: '暂时无法生成授权码，请重试' }, 503);
}

async function handlePairingExchange(request, env, origin) {
  let body;
  try {
    body = await readJson(request, MAX_PAIR_BODY_BYTES);
  } catch (error) {
    return json(origin, { ok: false, error: error.message }, 400);
  }

  const code = normalizePairCode(body.code);
  if (!code) {
    return json(origin, { ok: false, error: '授权码格式不正确' }, 400);
  }

  const codeHash = await sha256(code);
  const deviceToken = randomDeviceToken();
  const deviceTokenHash = await sha256(deviceToken);
  const label = cleanText(body.label, 80) || '家庭浏览器';
  const sql = neon(env.DATABASE_URL);
  const rows = await sql`
    WITH claimed AS (
      UPDATE public.device_pairing_tokens
      SET used_at = now()
      WHERE token_hash = ${codeHash}
        AND used_at IS NULL
        AND expires_at > now()
      RETURNING id
    )
    INSERT INTO public.authorized_devices (token_hash, label)
    SELECT ${deviceTokenHash}, ${label}
    FROM claimed
    RETURNING id, created_at
  `;

  if (rows.length !== 1) {
    return json(origin, { ok: false, error: '授权码无效、已使用或已过期' }, 401);
  }

  return json(origin, {
    ok: true,
    device_token: deviceToken,
    device_id: String(rows[0].id),
    authorized_at: rows[0].created_at,
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json('', { ok: false, error: 'Origin not allowed' }, 403);
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      if (request.method === 'GET') return await handleGet(request, env, origin);
      if (request.method === 'POST') {
        const pathname = new URL(request.url).pathname;
        if (pathname === '/events') return await handleEventsPost(request, env, origin);
        if (pathname === '/pairing/create') return await handlePairingCreate(request, env, origin);
        if (pathname === '/pairing/exchange') return await handlePairingExchange(request, env, origin);
      }
      return json(origin, { ok: false, error: 'Method not allowed' }, 405);
    } catch (error) {
      console.error('study-portal-api error', error);
      return json(origin, { ok: false, error: '服务暂时不可用' }, 500);
    }
  },
};
