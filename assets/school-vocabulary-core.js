// Pure scheduling and marking rules, shared by both children's separate apps.
export const VERSION = 1;
export const MAX_SECONDS = 900;
export function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function addDays(day, amount) {
  const date = new Date(day + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}
export function normalize(value) {
  return String(value).normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'")
    .replace(/[‐‑–—]/g, '-').replace(/(?:\.{2,}|…)/g, ' ... ')
    .replace(/\s+/g, ' ').trim();
}
export function isCorrect(value, item) {
  return (item.accepted || [item.en]).some(answer => normalize(value) === normalize(answer));
}
export function freshState(child, throughUnit = 3) {
  return { version: VERSION, child, throughUnit, words: {}, days: {} };
}
export function eligible(data, state) {
  return data.items.filter(item => item.schedule && item.unit <= state.throughUnit);
}
export function planDay(data, state, day) {
  if (state.days[day]) return state.days[day];
  const items = eligible(data, state);
  const reviews = items.filter(item => state.words[item.id] && state.words[item.id].due <= day)
    .sort((a, b) => state.words[a.id].due.localeCompare(state.words[b.id].due) || state.words[a.id].streak - state.words[b.id].streak || b.unit - a.unit).slice(0, 5);
  const newItems = items.filter(item => !state.words[item.id]).sort((a, b) => b.unit - a.unit || (a.tier === 'school' ? -1 : 0) - (b.tier === 'school' ? -1 : 0)).slice(0, 5);
  // Interleave due review and new words. A fixed daily queue prevents reloads adding new work.
  const queue = [];
  for (let i = 0; i < Math.max(reviews.length, newItems.length); i++) {
    if (reviews[i]) queue.push(question(reviews[i].id, 'review'));
    if (newItems[i]) queue.push(question(newItems[i].id, 'new'));
  }
  return state.days[day] = { seconds: 0, queue, index: 0, closed: !queue.length, newCount: newItems.length, reviewCount: reviews.length, finishId: null, syncStatus: 'local' };
}
function question(id, mode) {
  return { id, mode, draft: '', original: '', attempts: 0, revealed: false, done: false, independent: false, outcome: null, stage: 'question' };
}
export function currentQuestion(session) { return session.queue[session.index] || null; }
export function remaining(session) { return Math.max(0, MAX_SECONDS - session.seconds); }
export function addTime(session, seconds) {
  session.seconds = Math.min(MAX_SECONDS, session.seconds + Math.max(0, Number(seconds) || 0));
  if (session.seconds >= MAX_SECONDS) session.closed = true;
  return remaining(session);
}
export function reveal(session) {
  const q = currentQuestion(session);
  if (!q || q.done || session.closed) return false;
  q.revealed = true; q.stage = 'answer';
  return true;
}
export function submit(data, state, day, input) {
  const s = state.days[day], q = currentQuestion(s);
  if (!q || q.done || q.attempts >= 2 || s.closed || remaining(s) <= 0) return { blocked: true };
  if (!String(input).trim()) return { empty: true };
  const item = data.items.find(word => word.id === q.id);
  q.draft = String(input).slice(0, 150); q.attempts++;
  if (q.attempts === 1) q.original = q.draft;
  const ok = isCorrect(q.draft, item);
  if (ok) {
    const independent = !q.revealed && q.attempts === 1 && q.mode !== 'recall';
    finish(state, day, q, independent, independent ? 'independent' : 'supported');
    q.stage = 'correct';
  } else { q.revealed = true; q.stage = 'answer'; }
  return { ok, independent: q.independent };
}
function finish(state, day, q, independent, outcome) {
  q.done = true; q.independent = independent; q.outcome = outcome;
  // A same-session retry is useful practice, never another independent success.
  if (q.mode === 'recall') return;
  const prior = state.words[q.id] || { streak: 0, successes: 0, lastIndependent: null };
  const separateDay = independent && prior.lastIndependent !== day;
  const streak = separateDay ? Math.min(4, prior.streak + 1) : independent ? prior.streak : 0;
  state.words[q.id] = {
    streak, successes: prior.successes + (separateDay ? 1 : 0),
    lastIndependent: separateDay ? day : prior.lastIndependent,
    lastDay: day, due: addDays(day, independent ? [1, 1, 3, 7, 14][streak] : 1),
    lastOutcome: outcome
  };
  if (!independent) {
    const s = state.days[day];
    // One delayed recall only, and only when two other questions separate the tries.
    if (s.queue.length - s.index - 1 >= 2 && !s.queue.some(p => p.id === q.id && p.mode === 'recall')) s.queue.push(question(q.id, 'recall'));
  }
}
export function skip(state, day) {
  const s = state.days[day], q = currentQuestion(s);
  if (!q || q.done || s.closed) return false;
  q.revealed = true; finish(state, day, q, false, 'review'); advance(s); return true;
}
export function advance(session) {
  if (!currentQuestion(session)?.done) return false;
  session.index++;
  if (session.index >= session.queue.length) session.closed = true;
  return true;
}
export function summary(session) {
  const initial = session.queue.filter(q => q.mode !== 'recall');
  return { total: initial.length, completed: initial.filter(q => q.done).length,
    independent: initial.filter(q => q.independent).length,
    review: initial.filter(q => q.done && !q.independent).map(q => q.id),
    pending: initial.filter(q => !q.done).length, seconds: Math.round(session.seconds) };
}
export function validateState(raw, data) {
  if (!raw || raw.version !== VERSION || raw.child !== data.child || !Number.isInteger(raw.throughUnit) || raw.throughUnit < 1 || raw.throughUnit > 10) throw new Error('记录的孩子或版本不匹配。');
  if (!raw.words || !raw.days || Array.isArray(raw.words) || Array.isArray(raw.days)) throw new Error('记录格式不完整。');
  const ids = new Set(data.items.map(x => x.id)), validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
  for (const [id, value] of Object.entries(raw.words)) {
    if (!ids.has(id) || !value || !validDate(value.due) || !validDate(value.lastDay) || !Number.isInteger(value.streak) || value.streak < 0 || value.streak > 4 || !Number.isInteger(value.successes) || value.successes < 0) throw new Error('单词进度记录无效。');
  }
  for (const [day, s] of Object.entries(raw.days)) {
    if (!validDate(day) || !s || !Number.isFinite(s.seconds) || s.seconds < 0 || s.seconds > MAX_SECONDS || !Array.isArray(s.queue) || s.queue.length > 20 || !Number.isInteger(s.index) || s.index < 0 || s.index > s.queue.length) throw new Error('每日记录无效。');
    for (const q of s.queue) if (!ids.has(q.id) || !['new','review','recall'].includes(q.mode) || typeof q.draft !== 'string' || q.draft.length > 150 || typeof q.original !== 'string' || q.original.length > 150 || !Number.isInteger(q.attempts) || q.attempts < 0 || q.attempts > 2 || !['question','answer','correct'].includes(q.stage)) throw new Error('作答记录无效。');
  }
  // Re-parse removes prototypes. Rendering always uses textContent.
  return JSON.parse(JSON.stringify(raw));
}
export function mergeState(current, incoming, data) {
  const other = validateState(incoming, data), result = validateState(current, data);
  for (const [id, value] of Object.entries(other.words)) if (!result.words[id] || result.words[id].lastDay < value.lastDay) result.words[id] = value;
  for (const [day, s] of Object.entries(other.days)) {
    const old = result.days[day];
    if (!old) result.days[day] = s;
    else {
      const chosen = s.index > old.index ? s : old;
      chosen.seconds = Math.max(old.seconds, s.seconds);
      chosen.closed = old.closed || s.closed || chosen.seconds >= MAX_SECONDS;
      result.days[day] = chosen;
    }
  }
  return result;
}
