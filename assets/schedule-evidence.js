(function attachScheduleEvidence(global) {
  'use strict';

  // Read-only adapter for the existing knowledge-profile projection. No learner
  // records are embedded here, cached in public files, or uploaded by this module.
  const CHILDREN = ['kenton', 'eddey'];
  const STATUSES = ['observed', 'repeated_gap', 'improving', 'resolved'];
  const PLAN_PREFIX = 'study:schedule:school-linked-learning-v1:';
  const MODE_KEY = 'dd:system:parent-test-mode:v1';
  const text = (value, limit = 160) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
  const count = (value) => Number.isSafeInteger(Number(value)) && Number(value) >= 0 ? Number(value) : 0;

  function dateOf(value) {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  }

  function normalizeProfile(response, child) {
    if (!CHILDREN.includes(child) || !response || response.ok !== true || response.kid !== child || !Array.isArray(response.evidence)) {
      throw new Error('当前学情必须是对应孩子的 knowledge-profile 响应。');
    }
    const truncated = response.evidence_truncated === true;
    const evidence = response.evidence.slice(0, 500).filter((row) =>
      row && row.kid === child && row.is_test !== true && row.mode !== 'test' &&
      text(row.knowledge_point) && dateOf(row.last_evidence_at) && STATUSES.includes(row.learning_status)
    ).map((row) => {
      const resolved = !truncated && row.learning_status === 'resolved' && row.needs_review === false &&
        count(row.independent_since_last_gap ?? row.independent_since_last_wrong) >= 2 && count(row.delayed_retest_correct) >= 1;
      return {
        kid: child,
        subject: text(row.subject, 40) || '综合',
        knowledge_point: text(row.knowledge_point),
        learning_status: resolved ? 'resolved' : row.learning_status === 'resolved' ? 'improving' : row.learning_status,
        wrong_evidence: count(row.wrong_evidence),
        review_needed_count: row.schema_version === 'learning-evidence-v1' ? count(row.review_needed_count) : 0,
        last_evidence_at: new Date(row.last_evidence_at).toISOString(),
        last_gap_at: dateOf(row.last_gap_at) ? new Date(row.last_gap_at).toISOString() : null,
        last_wrong_at: dateOf(row.last_wrong_at) ? new Date(row.last_wrong_at).toISOString() : null,
        needs_review: !resolved && (count(row.wrong_evidence) > 0 || (row.schema_version === 'learning-evidence-v1' && row.needs_review === true && count(row.review_needed_count) > 0))
      };
    });
    return { ok: true, kid: child, evidence, evidence_truncated: truncated };
  }

  function normalizeSnapshot(value) {
    if (!value || value.schema !== 'study-schedule-evidence-v1' || !value.profiles || typeof value.profiles !== 'object' || Array.isArray(value.profiles)) {
      throw new Error('学情文件需要 study-schedule-evidence-v1 和按孩子分开的 profiles。');
    }
    const profiles = {};
    for (const child of Object.keys(value.profiles)) {
      if (!CHILDREN.includes(child)) throw new Error('学情文件包含未知孩子。');
      profiles[child] = normalizeProfile(value.profiles[child], child);
    }
    return profiles;
  }

  function currentGoal(profiles, child, date) {
    const rows = profiles?.[child]?.evidence || [];
    return rows.filter((row) => row.needs_review && dateOf(row.last_evidence_at) <= date)
      .sort((left, right) => (right.learning_status === 'repeated_gap') - (left.learning_status === 'repeated_gap') ||
        right.last_evidence_at.localeCompare(left.last_evidence_at) || left.knowledge_point.localeCompare(right.knowledge_point))[0] || null;
  }

  function candidate(profiles, child, date) {
    const goal = currentGoal(profiles, child, date);
    if (!goal) return null;
    return {
      id: `evidence:${goal.subject}:${goal.knowledge_point}:${goal.last_gap_at || goal.last_wrong_at || goal.last_evidence_at}`,
      stage: 'evidence', kind: 'core', badge: goal.wrong_evidence ? '当前错点复查' : '当前待复查', minutes: 5,
      subject: goal.subject, title: goal.knowledge_point,
      text: `回到“${goal.knowledge_point}”的原题，先说清第一处卡点；再遮住答案，独立做一个未看过的同类变式。`,
      note: '订正不等于掌握；未完成的关键目标保留到下一实际窗口，不累加整批旧题。',
      goal: '撤去提示后独立完成，再在另一天复查；点完成只表示做过。',
      question: '这次不看提示，你能说出理由并验算吗？',
      href: `mistakes.html?who=${child}`
    };
  }

  function initialStore(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('状态文件必须是 localStorage 键值对象。');
    const result = {};
    const allowed = /^study:schedule:(?:school-linked-learning-v1:(?:\d{4}-\d{2}-\d{2}:(?:kenton|eddey)|repair:(?:kenton|eddey))|fall-2026-v3:\d{4}-\d{2}-\d{2}:rows)$/;
    for (const [key, raw] of Object.entries(value)) {
      if (!allowed.test(key)) continue;
      const state = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!state || typeof state !== 'object' || Array.isArray(state) || state.is_test === true || state.mode === 'test') throw new Error('日程状态无效或属于测试模式。');
      result[key] = JSON.stringify(state);
    }
    return result;
  }

  function canReadCloud(location, storage, now = Date.now()) {
    if (location?.protocol !== 'https:' || location.hostname !== 'study-portal-eta.vercel.app') return false;
    try {
      const mode = JSON.parse(storage.getItem(MODE_KEY) || 'null');
      return !(mode && Number(mode.expires_at) > now);
    } catch (_) { return false; }
  }

  async function readCloud({ location, storage, fetch, signal }) {
    if (!canReadCloud(location, storage) || typeof fetch !== 'function') return { profiles: {}, status: 'isolated' };
    const profiles = {};
    const unavailable = [];
    await Promise.all(CHILDREN.map(async (child) => {
      try {
        const response = await fetch(`/api/events?mode=knowledge-profile&kid=${child}`, { cache: 'no-store', credentials: 'same-origin', signal });
        if (!response.ok) throw new Error('学情接口暂不可用');
        const profile = normalizeProfile(await response.json(), child);
        // A parent may enter test mode while this request is pending.
        if (canReadCloud(location, storage)) profiles[child] = profile;
      } catch (_) { unavailable.push(child); }
    }));
    if (!canReadCloud(location, storage)) return { profiles: {}, status: 'isolated' };
    return { profiles, status: unavailable.length ? 'partial_or_unavailable' : 'loaded', unavailable };
  }

  global.DDScheduleEvidence = Object.freeze({ PLAN_PREFIX, normalizeProfile, normalizeSnapshot, currentGoal, candidate, initialStore, canReadCloud, readCloud });
})(typeof window === 'undefined' ? globalThis : window);
