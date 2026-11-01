/* 考前脑图 · Claude 设计版（2026-11-01）
   一屏一张真正的脑图：中心是本科，分支是单元（带主线），叶子是关键关系。
   节点两种标记：★ 知识重点、红圈"错 N"错题重点（数学直接按这学期错题本统计，语文按订正记录）。
   点节点：一句关键关系 + 关系链 → 马上出题（知识题 + 这学期错过的原题重做），当场判对错。
   「快速过一遍」：错题多、没做过的节点优先，抽 10 题，几分钟做完告诉你还要再看哪几个节点。
   知识节点来自正式站同步的 assets/review-atlas/content.js 与 memory.js；v2 自己加的东西在 overlay.js。
   记录按孩子、科目、正式/测试分开存在这台设备：sp2.exam-map:<who>:<subject>:<formal|test>；做完一轮自动上报学情链路。 */
(() => {
'use strict';
const params = new URLSearchParams(location.search);
const CHILD = { kenton: { label: '哥哥', en: 'Kenton', initial: 'K', grade: '五年级上' }, eddey: { label: '弟弟', en: 'Eddey', initial: 'E', grade: '四年级上' } };
const SUBJECTS = { chinese: '语文', math: '数学', english: '英语' };
const TEST = ['1', 'true'].includes(params.get('test')) || params.get('mode') === 'test';
const OV = window.ExamMapOverlay || {};
let who = ['kenton', 'eddey'].includes(params.get('who')) ? params.get('who') : (['kenton', 'eddey'].includes(params.get('child')) ? params.get('child') : null);
let subject = SUBJECTS[params.get('subject')] ? params.get('subject') : 'math';
let graph = null, state = null, storageOK = true, quiz = null, banks = {};

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Intl.DateTimeFormat('en-CA').format(new Date());
const KEY = () => `sp2.exam-map:${who}:${subject}:${TEST ? 'test' : 'formal'}`;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const icons = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6M8 12h12"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8Z"/></svg>'
};

/* ---------- 记录 ---------- */
function fresh() { return { v: 1, who, subject, mode: TEST ? 'test' : 'formal', nodes: {}, rounds: [] }; }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY()) || 'null'); if (s && s.v === 1 && s.who === who && s.subject === subject) { state = s; return; } } catch (e) { } state = fresh(); }
function save() { try { localStorage.setItem(KEY(), JSON.stringify(state)); storageOK = true; } catch (e) { storageOK = false; } }
function rec(id) { return state.nodes[id] || (state.nodes[id] = { asked: 0, right: 0, wrong: 0, lastAt: null, lastClean: null }); }
function nodeStatus(id) { const r = state.nodes[id]; if (!r || !r.asked) return 'new'; return r.lastClean ? 'pass' : 'again'; }

/* ---------- 数据：把正式站的知识点、背默清单、错题本拼成一张图 ---------- */
async function loadBank() {
  if (subject !== 'math') return null;
  if (banks[who]) return banks[who];
  try { const r = await fetch(`../../../data/learning/${who}_math_mistakes_20261024.json`, { cache: 'no-store' }); if (!r.ok) throw 0; banks[who] = await r.json(); } catch (e) { banks[who] = { items: [], syllabus: [] }; }
  return banks[who];
}
function chainOf(t) {
  const m = t.model || {};
  if (OV.chains && OV.chains[t.id]) return { passage: '', rows: OV.chains[t.id] };
  if (m.states && m.states.length) return { passage: m.passage || '', rows: m.states.map(s => ({ label: s.label, parts: s.parts })) };
  return { passage: '', rows: [] };
}
function buildGraph(bank) {
  const data = window.ReviewAtlasData, mem = window.ReviewAtlasMemory || {};
  const child = data.children[who];
  const units = child.units[subject], topics = child.topics[subject];
  const keys = (OV.keyNodes?.[who]?.[subject]) || {};
  const notes = (OV.notes?.[who]?.[subject]) || {};
  const nodes = new Map();
  const mk = (t, extra = {}) => ({ id: t.id, title: t.title, unit: t.unit, source: t.source, idea: t.idea, recall: t.recall, tip: t.tip, chain: chainOf(t), questions: (t.questions || []).map(q => ({ ...q, kind: 'atlas' })), bankItems: [], mistakes: 0, key: keys[t.id] || '', note: notes[t.id] || null, ...extra });
  topics.forEach(t => nodes.set(t.id, mk(t)));
  const branches = units.map((u, i) => ({ id: `u${i + 1}`, unit: i + 1, label: u[0], desc: u[1], chain: u[2], leaves: topics.filter(t => t.unit === i + 1).map(t => t.id) }));
  // 错题本：补充节点 + 每题落到节点
  if (subject === 'math' && bank) {
    const syl = new Map((bank.syllabus || []).map(s => [s.category, s]));
    (OV.extraNodes?.[who] || []).forEach(x => {
      const s = syl.get(x.category) || {};
      nodes.set(x.id, mk({ id: x.id, title: x.title || s.title, unit: x.unit, source: '本学期数学错题本 · 学习路线', idea: s.coreInsight || '', recall: s.check || '', tip: '', model: { type: 'relation', states: [{ label: '步骤', parts: s.sequence || [] }] }, questions: [] }, { category: x.category, key: keys[x.id] || '' }));
      if (x.unit > 0 && branches[x.unit - 1]) branches[x.unit - 1].leaves.push(x.id);
    });
    const xb = OV.extraBranch?.[who];
    const extras0 = (OV.extraNodes?.[who] || []).filter(x => x.unit === 0).map(x => x.id);
    if (xb && extras0.length) branches.push({ id: 'ux', unit: 0, label: xb[0], desc: xb[1], chain: xb[2], leaves: extras0 });
    const assign = OV.assignMath?.[who];
    for (const it of (bank.items || [])) {
      if (it.status !== 'ready' || it.kind === 'manual') continue;
      const id = assign ? assign(it) : null; const n = id && nodes.get(id); if (!n) continue;
      n.mistakes++; n.bankItems.push(it);
    }
    for (const n of nodes.values()) if (n.bankItems.length) { const cat = n.bankItems[0].category; const s = syl.get(cat); n.bankInsight = s?.coreInsight || ''; n.breakpoints = topBreakpoints(n.bankItems); }
  }
  // 背默 / 单词分支（来自正式站的读写背清单）
  const list = (mem[who] || {})[subject] || [];
  if (list.length) {
    const byUnit = new Map();
    for (const it of list) { if (!byUnit.has(it.unit)) byUnit.set(it.unit, []); byUnit.get(it.unit).push(it); }
    const p = (who === 'kenton' ? 'k' : 'e') + (subject === 'chinese' ? 'c' : 'e');
    const leaves = [];
    for (const [u, items] of [...byUnit.entries()].sort((a, b) => a[0] - b[0])) {
      const id = `${p}-memory-${u}`;
      const recite = items.filter(i => i.recitation), words = items.filter(i => !i.recitation);
      const title = subject === 'chinese' ? `第${u}单元 词语${recite.length ? ' · 背默 ' + recite.length + ' 篇' : ''}` : `Unit ${u} 单词词组 ${words.length}`;
      nodes.set(id, { id, title, unit: u, source: subject === 'chinese' ? '课内词语表 · 教辅背默清单' : '课本 Words to use · 教辅词表', idea: subject === 'chinese' ? (recite.length ? '看拼音写词语，默写段落抓住易错字。' : '看拼音写词语，字形、字音一起过。') : '中文意思 → 拼出英文；词组整个记。', recall: subject === 'chinese' ? '哪几个字最容易写错？' : '哪些词是整个词组一起用的？', tip: '', chain: { passage: '', rows: recite.slice(0, 4).map(r => ({ label: r.title || r.lesson, parts: [r.examHint || '按原文默写'] })) }, questions: [], memoryItems: items, mistakes: notes[id]?.count || 0, key: '', note: notes[id] || null, memory: true });
      leaves.push(id);
    }
    branches.push({ id: 'um', unit: 0, label: subject === 'chinese' ? '词语与背默' : '单词与词组', desc: subject === 'chinese' ? '看拼音写词语 · 必背默写' : '按单元过词', chain: subject === 'chinese' ? '拼音 → 字形 → 整段默写' : '中文 → 拼写 → 句子里用', leaves });
  }
  for (const n of nodes.values()) if (n.note && !n.mistakes) n.mistakes = n.note.count || 0;
  return { center: { label: SUBJECTS[subject], sub: CHILD[who].grade }, branches, nodes };
}
function topBreakpoints(items) {
  const c = new Map();
  for (const it of items) { const b = it.diagnosis?.breakpoint; if (!b) continue; c.set(b, (c.get(b) || 0) + (it.priority === 'important' ? 2 : 1)); }
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
}

/* ---------- 出题 ---------- */
function memoryQuestions(n, count) {
  const items = n.memoryItems || [];
  const out = [];
  if (subject === 'chinese') {
    const words = shuffle(items.filter(i => !i.recitation && i.pinyin && i.text.length <= 4));
    const recite = shuffle(items.filter(i => i.recitation && i.text));
    for (const w of words.slice(0, Math.max(2, count - Math.min(2, recite.length)))) out.push({ kind: 'word', prompt: `看拼音写词语：${w.pinyin}`, answer: w.text, aliases: [], why: `${w.text}（${w.pinyin}）· ${w.lesson}` });
    for (const r of recite.slice(0, 2)) { const q = blankOf(r); if (q) out.push(q); }
  } else {
    const ws = shuffle(items.filter(i => i.text && i.meaning));
    for (const w of ws.slice(0, count)) out.push({ kind: 'word', prompt: `写出英文：${w.meaning}`, answer: w.text, aliases: w.accepted || [], why: `${w.text} — ${w.meaning}${w.lesson ? ' · ' + w.lesson : ''}`, lang: 'en' });
  }
  return shuffle(out).slice(0, count);
}
function blankOf(r) {
  const text = String(r.text || '').replace(/\s+/g, '');
  const sents = text.split(/[，。？！；：、]/).filter(s => s.length >= 4);
  if (!sents.length) return null;
  const hintChars = (r.examHint || '').replace(/[^一-鿿]/g, '').split('').filter(ch => text.includes(ch) && !/注意|别写|不是|意为|与|不同|本册|为|的|是|和/.test(ch));
  let sent = sents[Math.floor(Math.random() * sents.length)], pos = -1;
  for (const ch of shuffle(hintChars)) { const s = sents.find(x => x.includes(ch)); if (s) { sent = s; pos = s.indexOf(ch); break; } }
  if (pos < 0) pos = Math.floor(Math.random() * Math.max(1, sent.length - 1));
  const len = Math.min(2, sent.length - pos);
  const ans = sent.slice(pos, pos + len);
  const shown = sent.slice(0, pos) + '____' + sent.slice(pos + len);
  return { kind: 'blank', prompt: `默写填空（${r.title || r.lesson}）：\n${shown}`, answer: ans, aliases: [], why: `${sent}${r.examHint ? ' · ' + r.examHint : ''}` };
}
function nodeQuestions(n, { knowledge = 3, bank = 2 } = {}) {
  const out = [];
  if (n.memory) return memoryQuestions(n, knowledge + bank);
  const ks = shuffle(n.questions).sort((a, b) => (a.type === 'open') - (b.type === 'open'));
  out.push(...ks.slice(0, knowledge));
  const r = state.nodes[n.id] || {};
  const used = new Set(r.usedBank || []);
  const pool = n.bankItems.filter(it => !used.has(it.id)), pool2 = n.bankItems;
  const picks = shuffle(pool.length >= bank ? pool : pool2).sort((a, b) => (b.priority === 'important') - (a.priority === 'important')).slice(0, bank);
  for (const it of picks) out.push(bankQuestion(it));
  return out;
}
function bankQuestion(it) {
  return { kind: 'bank', id: it.id, type: it.kind === 'choice' ? 'choice' : it.kind === 'number' ? 'number' : 'text', prompt: it.prompt, options: it.options, answer: it.kind === 'choice' ? (it.options || []).findIndex(o => (it.answers || []).includes(o)) : (it.answers || [])[0], answers: it.answers || [], unit: it.unit || '', why: it.explanation || '', hint: it.hint || '', image: it.image ? String(it.image).replace(/^\.\.\//, '../../../') : '', imageAlt: it.diagramAlt || it.visual?.alt || '', requiredDecimals: it.requiredDecimals, source: it.source?.label || '', title: it.title || '' };
}

/* ---------- 判题 ---------- */
const FULL = { '＋': '+', '－': '-', '−': '-', '—': '-', '×': '*', 'x': '*', 'X': '*', '÷': '/', '（': '(', '）': ')', '＝': '=', '，': ',', '、': ',', '。': '', '．': '.', '：': ':', '’': "'", '‘': "'" };
const normText = s => String(s ?? '').trim().replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/./g, c => FULL[c] ?? c).replace(/\s+/g, ' ').replace(/[.?!]+$/, '').toLowerCase();
const normNumStr = s => String(s ?? '').trim().replace(/[０-９．]/g, c => c === '．' ? '.' : String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[,，\s]/g, '').replace(/[－−—]/g, '-').replace(/[^0-9.\-/]/g, '');
const decimalsOf = s => { const m = s.match(/\.(\d+)$/); return m ? m[1].length : 0; };
function numEqual(a, b) { if (a.includes('/') && !b.includes('/')) { const [p, q] = a.split('/').map(Number); return Math.abs(p / q - Number(b)) < 1e-9; } return a !== '' && b !== '' && !isNaN(Number(a)) && !isNaN(Number(b)) && Math.abs(Number(a) - Number(b)) < 1e-9; }
function judge(q, raw) {
  const t = q.type || (q.kind === 'word' || q.kind === 'blank' ? 'text' : 'text');
  if (t === 'choice') return Number(raw) === Number(q.answer);
  if (t === 'number') {
    const got = normNumStr(raw); if (!got) return false;
    const list = q.answers?.length ? q.answers : [q.answer];
    for (const a of list) { if (!numEqual(got, normNumStr(a))) continue; if (q.requiredDecimals != null && decimalsOf(got) !== q.requiredDecimals) return false; return true; }
    return false;
  }
  const g = normText(raw).replace(/\s/g, ''); if (!g) return false;
  const list = [q.answer, ...(q.aliases || []), ...(q.answers || [])].filter(x => x != null && x !== '').map(a => normText(a).replace(/\s/g, ''));
  if (list.includes(g)) return true;
  // 逗号序列：逐项比较数字
  const gp = g.split(','), ok = list.some(a => { const ap = a.split(','); return ap.length === gp.length && ap.every((x, i) => x === gp[i] || numEqual(normNumStr(gp[i]), normNumStr(x))); });
  return ok;
}

/* ---------- 画脑图 ---------- */
function measure(text, size) { let w = 0; for (const ch of String(text)) w += /[一-鿿，。！？；：、“”（）《》—…]/.test(ch) ? size : /[A-Z]/.test(ch) ? size * .68 : /[a-z0-9]/.test(ch) ? size * .56 : size * .45; return w; }
function wrapText(text, size, maxW, maxLines = 2) {
  // 中文逐字折行；英文按整词折行（空格处），词太长再逐字
  const tokens = String(text).match(/[A-Za-z0-9'’.,-]+\s*|[^A-Za-z0-9]/g) || [];
  const lines = []; let cur = '';
  for (const tk of tokens) {
    if (measure((cur + tk).trimEnd(), size) <= maxW || !cur) {
      if (measure(tk.trimEnd(), size) > maxW) { for (const ch of tk) { if (measure(cur + ch, size) > maxW && cur) { lines.push(cur.trimEnd()); cur = ch; } else cur += ch; } }
      else cur += tk;
    } else { lines.push(cur.trimEnd()); cur = tk; }
  }
  if (cur.trim()) lines.push(cur.trimEnd());
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…'; }
  return lines;
}
function layout(g, W) {
  const wide = W >= 760;
  // 分支框按文字量定宽：标题 13px、主线 10px；放不下的主线折成两行
  const bMax = wide ? 168 : 124;
  const bdim = new Map();
  for (const b of g.branches) {
    const natural = Math.max(measure(b.label, 13), measure(b.chain, 10)) + 20;
    const bw = Math.max(96, Math.min(bMax, natural));
    const labelLines = wrapText(b.label, 13, bw - 16, 2), chainLines = wrapText(b.chain, 10, bw - 16, 2);
    bdim.set(b.id, { labelLines, bw, chainLines, h: 8 + labelLines.length * 17 + chainLines.length * 13 + 8 });
  }
  const branchCol = Math.max(...[...bdim.values()].map(d => d.bw));
  const S = wide ? { leafFont: 14, leafW: Math.min(250, (W - 112) / 2 - branchCol - 52), branchW: branchCol, centerW: 112, gapX: 26, leafH: 42, leafGap: 10, groupGap: 24 } : { leafFont: 12.5, leafW: W - 44 - 12 - branchCol - 12, branchW: branchCol, centerW: 44, gapX: 12, leafH: 40, leafGap: 8, groupGap: 20 };
  const nodes = [], links = [];
  const sides = wide ? splitSides(g.branches) : [g.branches];
  let maxH = 0;
  sides.forEach((branches, si) => {
    const left = wide && si === 1;
    let y = 10;
    for (const b of branches) {
      const ys = [];
      for (const lid of b.leaves) {
        const n = g.nodes.get(lid);
        const textW = S.leafW - 30 - (n.key ? 17 : 0) - (wide ? (n.mistakes ? 44 : 10) : 10);
        const lines = wrapText(n.title, S.leafFont, textW); const h = lines.length > 1 ? S.leafH + 16 : S.leafH;
        nodes.push({ kind: 'leaf', id: lid, n, lines, y, h, side: left ? 'L' : 'R' }); ys.push(y + h / 2); y += h + S.leafGap;
      }
      if (!ys.length) { ys.push(y + S.leafH / 2); y += S.leafH + S.leafGap; }
      const by = (ys[0] + ys[ys.length - 1]) / 2, d = bdim.get(b.id);
      nodes.push({ kind: 'branch', id: b.id, b, d, y: by - d.h / 2, h: d.h, side: left ? 'L' : 'R' });
      y += S.groupGap - S.leafGap;
    }
    maxH = Math.max(maxH, y);
  });
  const H = Math.max(maxH, 160);
  const cy = H / 2;
  const cx = wide ? W / 2 : S.centerW / 2;
  for (const nd of nodes) {
    const sign = nd.side === 'L' ? -1 : 1;
    if (nd.kind === 'branch') { nd.w = S.branchW; nd.x = wide ? cx + sign * (S.centerW / 2 + S.gapX) - (sign < 0 ? nd.w : 0) : S.centerW + S.gapX; }
    else { nd.w = S.leafW; nd.x = wide ? cx + sign * (S.centerW / 2 + S.gapX + S.branchW + S.gapX) - (sign < 0 ? nd.w : 0) : S.centerW + S.gapX + S.branchW + S.gapX; }
  }
  for (const b of nodes.filter(n => n.kind === 'branch')) {
    const sign = b.side === 'L' ? -1 : 1;
    const bx = sign > 0 ? b.x : b.x + b.w, bxFar = sign > 0 ? b.x + b.w : b.x;
    links.push({ x1: cx, y1: cy, x2: bx, y2: b.y + b.h / 2, kind: 'trunk' });
    for (const lid of b.b.leaves) { const l = nodes.find(n => n.kind === 'leaf' && n.id === lid); const lx = sign > 0 ? l.x : l.x + l.w; links.push({ x1: bxFar, y1: b.y + b.h / 2, x2: lx, y2: l.y + l.h / 2, kind: 'twig' }); }
  }
  return { W, H, cx, cy, S, nodes, links, wide };
}
function splitSides(branches) { const R = [], L = []; let r = 0, l = 0; for (const b of branches) { if (r <= l) { R.push(b); r += b.leaves.length + 1; } else { L.push(b); l += b.leaves.length + 1; } } return [R, L]; }
function renderMap() {
  const host = $('#map'); if (!host) return;
  const W = Math.max(320, Math.floor(host.clientWidth));
  const L = layout(graph, W);
  const path = k => `M${k.x1},${k.y1} C${(k.x1 + k.x2) / 2},${k.y1} ${(k.x1 + k.x2) / 2},${k.y2} ${k.x2},${k.y2}`;
  let s = `<svg class="mind" viewBox="0 0 ${L.W} ${L.H}" width="${L.W}" height="${L.H}" role="img" aria-label="${esc(SUBJECTS[subject])}知识脑图">`;
  s += `<g class="links">${L.links.map(k => `<path class="${k.kind}" d="${path(k)}"/>`).join('')}</g>`;
  // 中心
  const cw = L.S.centerW, ch = L.wide ? 64 : 92;
  s += `<g class="center" transform="translate(${L.cx - cw / 2},${L.cy - ch / 2})"><rect width="${cw}" height="${ch}" rx="${L.wide ? 16 : 14}"/>`;
  if (L.wide) s += `<text x="${cw / 2}" y="30" text-anchor="middle" class="c-main">${esc(graph.center.label)}</text><text x="${cw / 2}" y="50" text-anchor="middle" class="c-sub">${esc(graph.center.sub)}</text>`;
  else s += `<text x="${cw / 2}" y="${ch / 2}" text-anchor="middle" dominant-baseline="central" class="c-main">${esc(graph.center.label)}</text>`;
  s += `</g>`;
  for (const nd of L.nodes) {
    if (nd.kind === 'branch') {
      const b = nd.b, hot = b.leaves.some(id => graph.nodes.get(id).mistakes);
      s += `<g class="branch${hot ? ' hot' : ''}" transform="translate(${nd.x},${nd.y})"><rect width="${nd.w}" height="${nd.h}" rx="12"/><text x="10" y="20" class="b-main">${nd.d.labelLines.map((ln, i) => `<tspan x="10" dy="${i ? 17 : 0}">${esc(ln)}</tspan>`).join('')}</text><text x="10" y="${20 + nd.d.labelLines.length * 17 - 1}" class="b-chain">${nd.d.chainLines.map((ln, i) => `<tspan x="10" dy="${i ? 13 : 0}">${esc(ln)}</tspan>`).join('')}</text></g>`;
    } else {
      const n = nd.n, st = nodeStatus(n.id);
      s += `<g class="leaf st-${st}${n.mistakes ? ' has-mist' : ''}" data-node="${esc(n.id)}" tabindex="0" role="button" aria-label="${esc(n.title)}${n.mistakes ? '，错题 ' + n.mistakes : ''}" transform="translate(${nd.x},${nd.y})"><rect class="leaf-bg" width="${nd.w}" height="${nd.h}" rx="11"/>`;
      s += `<circle class="dot" cx="16" cy="${nd.h / 2}" r="5"/>${st === 'pass' ? `<path class="dot-check" d="m13 ${nd.h / 2} 2 2 4-4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` : ''}`;
      let tx = 30;
      if (n.key) { s += `<path class="star" transform="translate(${tx - 2},${nd.h / 2 - 7}) scale(.58)" d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8Z"/>`; tx += 17; }
      const lh = L.S.leafFont + 3, y0 = nd.h / 2 - ((nd.lines.length - 1) * lh) / 2;
      s += `<text x="${tx}" y="${y0}" class="l-title" dominant-baseline="central">${nd.lines.map((ln, i) => `<tspan x="${tx}" dy="${i ? lh : 0}">${esc(ln)}</tspan>`).join('')}</text>`;
      if (n.mistakes) { const label = `错${n.mistakes}`, bw = measure(label, 11) + 12; const bx = L.wide ? nd.w - bw - 8 : nd.w - bw - 6, by = L.wide ? nd.h / 2 - 10 : -9; s += `<g class="mist" transform="translate(${bx},${by})"><rect width="${bw}" height="20" rx="10"/><text x="${bw / 2}" y="10" text-anchor="middle" dominant-baseline="central">${esc(label)}</text></g>`; }
      s += `</g>`;
    }
  }
  s += `</svg>`;
  host.innerHTML = s;
}

/* ---------- 画面 ---------- */
function chooser() {
  document.body.dataset.screen = 'choose';
  $('#app').innerHTML = `<header class="topbar"><a class="icon-btn" href="../../../index.html" aria-label="回学习门户">${icons.back}</a><div class="crumb"><b>考前脑图</b><small>先选是谁在复习</small></div></header>
  <section class="choose"><h1>谁来复习？</h1><div class="who-grid"><button class="who kenton" data-act="who" data-who="kenton"><i>K</i><b>哥哥 Kenton</b><small>五年级上</small></button><button class="who eddey" data-act="who" data-who="eddey"><i>E</i><b>弟弟 Eddey</b><small>四年级上</small></button></div><p class="note">两个人的记录分开存，互不影响。家长测试请在网址后加 <code>?test=1</code>。</p></section>`;
}
function home() {
  document.body.dataset.screen = 'map'; document.body.dataset.who = who;
  const total = graph.nodes.size, passed = [...graph.nodes.keys()].filter(id => nodeStatus(id) === 'pass').length, again = [...graph.nodes.keys()].filter(id => nodeStatus(id) === 'again').length;
  const mist = [...graph.nodes.values()].reduce((a, n) => a + n.mistakes, 0);
  const rem = OV.reminders?.[who]?.[subject] || [];
  $('#app').innerHTML = `<header class="topbar"><a class="icon-btn" href="../../../index.html" aria-label="回学习门户">${icons.back}</a><div class="crumb"><b>${esc(CHILD[who].label)} · ${esc(SUBJECTS[subject])}脑图</b><small>考前复习 · ${esc(CHILD[who].grade)} · ${total} 节点${mist ? ' · 错题 ' + mist : ''}</small></div>${TEST ? '<span class="test-chip">测试，不计入</span>' : ''}<button class="me-chip" data-act="switch" title="换一个人"><i>${CHILD[who].initial}</i><span class="t">${esc(CHILD[who].en)}</span></button></header>
  <nav class="tabs" aria-label="科目">${Object.entries(SUBJECTS).map(([k, v]) => `<button class="tab${k === subject ? ' on' : ''}" data-act="subject" data-subject="${k}" aria-pressed="${k === subject}">${v}</button>`).join('')}</nav>
  <section class="bar"><button class="primary" data-act="quick">${icons.bolt}快速过一遍 · 10 题</button><button class="ghost no-print" data-act="print">${icons.print}打印</button><span class="stat num">过关 ${passed} · 再看 ${again} · 未做 ${total - passed - again}</span></section>
  <section id="map" class="map-host" aria-live="polite"></section>
  <section class="legend"><span><i class="lg-star">${icons.star}</i>知识重点</span><span><i class="lg-mist">错N</i>错题重点（这学期错过的题数）</span><span><i class="lg-dot new"></i>未做</span><span><i class="lg-dot again"></i>再看</span><span><i class="lg-dot pass"></i>过关</span></section>
  ${rem.length ? `<section class="reminders"><h2>考场三件事</h2><ol>${rem.map(r => `<li>${esc(r)}</li>`).join('')}</ol></section>` : ''}
  <section class="src"><p>知识节点来自正式站《知识连起来》的同步内容；${subject === 'math' ? '错题数按这学期数学错题本逐题归类统计' : (mist ? '错题重点来自 10 月订正记录' : '语文、英语还没有结构化错题记录，有记录后会自动标出')}。点任一节点：先看关系，再做 5 题。${storageOK ? '' : '这台设备不能保存记录，本次结果只在当前页面有效。'}</p></section>`;
  renderMap();
}

/* ---------- 节点面板 ---------- */
function openNode(id) {
  const n = graph.nodes.get(id); if (!n) return;
  const r = state.nodes[id];
  const chainHtml = n.chain.rows.length ? `<div class="chain">${n.chain.passage ? `<p class="passage">${esc(n.chain.passage)}</p>` : ''}${n.chain.rows.map(row => `<div class="row"><b>${esc(row.label)}</b><span>${row.parts.map(p => `<em>${esc(p)}</em>`).join('<i class="arr">→</i>')}</span></div>`).join('')}</div>` : '';
  let mist = '';
  if (n.bankItems?.length) mist = `<section class="mist-box"><h3><span class="pill">错 ${n.mistakes}</span>这学期在这里错过 ${n.mistakes} 题</h3>${n.bankInsight ? `<p class="insight">${esc(n.bankInsight)}</p>` : ''}${n.breakpoints?.length ? `<ul>${n.breakpoints.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</section>`;
  else if (n.note) mist = `<section class="mist-box"><h3><span class="pill">错 ${n.note.count}</span>订正记录里的错因</h3><ul>${n.note.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul><p class="tiny">${esc(n.note.source)}</p></section>`;
  const memList = n.memory ? memorySummary(n) : '';
  const hist = r?.asked ? `<p class="tiny">做过 ${r.asked} 题，对 ${r.right}，错 ${r.wrong}；最近 ${r.lastAt ? r.lastAt.slice(0, 10) : ''}${r.lastClean ? ' 全对' : ' 有错'}</p>` : '';
  sheet(`<header class="sh-head"><div><small>${esc(SUBJECTS[subject])}${n.unit ? ' · 第 ' + n.unit + ' 单元' : ''}${n.key ? ' · <b class="k">★ ' + esc(n.key) + '</b>' : ''}</small><h2>${esc(n.title)}</h2></div><button class="icon-btn" data-act="close" aria-label="关闭">${icons.x}</button></header>
  <p class="idea">${esc(n.idea)}</p>${n.recall ? `<p class="recall">追问：${esc(n.recall)}</p>` : ''}
  ${chainHtml}${memList}${mist}${n.tip ? `<p class="tip">提醒：${esc(n.tip)}</p>` : ''}${hist}
  <div class="sh-actions"><button class="primary" data-act="quiz" data-node="${esc(n.id)}">${icons.bolt}开始出题 · 5 题</button></div><p class="tiny src">${esc(n.source || '')}</p>`);
}
function memorySummary(n) {
  const items = n.memoryItems || [], recite = items.filter(i => i.recitation), words = items.filter(i => !i.recitation);
  let h = '';
  if (recite.length) h += `<details class="mem"><summary>必背默写 ${recite.length} 篇（点开看易错字）</summary><ul>${recite.map(r => `<li><b>${esc(r.title || r.lesson)}</b>${r.examHint ? `<span>${esc(r.examHint)}</span>` : ''}</li>`).join('')}</ul></details>`;
  if (words.length) h += `<details class="mem"><summary>${subject === 'chinese' ? '词语' : '单词词组'} ${words.length} 个（点开看清单）</summary><p class="wordcloud">${words.map(w => `<span>${esc(w.text)}${w.meaning ? `<i>${esc(w.meaning)}</i>` : ''}</span>`).join('')}</p></details>`;
  return h;
}
function sheet(html) { const el = $('#sheet'); el.innerHTML = `<div class="sh-panel" role="dialog" aria-modal="true">${html}</div>`; el.hidden = false; document.body.classList.add('sheet-open'); el.scrollTop = 0; const f = el.querySelector('input,textarea,button.primary'); if (f && f.tagName !== 'BUTTON') setTimeout(() => f.focus(), 50); }
function closeSheet() { $('#sheet').hidden = true; $('#sheet').innerHTML = ''; document.body.classList.remove('sheet-open'); quiz = null; }

/* ---------- 答题 ---------- */
function startQuiz(nodeId) {
  const n = graph.nodes.get(nodeId);
  const qs = nodeQuestions(n).map(q => ({ ...q, node: nodeId }));
  if (!qs.length) { toast('这个节点还没有题'); return; }
  quiz = { id: `${today()}-${Math.random().toString(36).slice(2, 8)}`, kind: 'node', nodeId, qs, i: 0, results: [], label: n.title };
  showQ();
}
function startQuick() {
  const ids = [...graph.nodes.keys()];
  const score = id => { const n = graph.nodes.get(id), st = nodeStatus(id); return (n.mistakes ? 40 + Math.min(n.mistakes, 30) : 0) + (st === 'new' ? 25 : st === 'again' ? 35 : 0) + (n.key ? 10 : 0) + Math.random() * 12; };
  const order = ids.sort((a, b) => score(b) - score(a));
  const qs = [];
  for (const id of order) { if (qs.length >= 10) break; const n = graph.nodes.get(id); let pool = nodeQuestions(n, { knowledge: 3, bank: 2 }).filter(q => q.type !== 'open'); if (!pool.length) pool = nodeQuestions(n); if (pool.length) qs.push({ ...pool[0], node: id }); }
  if (qs.length < 10) for (const id of order) { if (qs.length >= 10) break; const n = graph.nodes.get(id); const extra = nodeQuestions(n, { knowledge: 3, bank: 2 }).filter(q => !qs.some(x => x.node === id && x.prompt === q.prompt)); if (extra.length) qs.push({ ...extra[0], node: id }); }
  quiz = { id: `${today()}-${Math.random().toString(36).slice(2, 8)}`, kind: 'quick', qs, i: 0, results: [], label: '快速过一遍' };
  showQ();
}
function showQ() {
  const q = quiz.qs[quiz.i], n = graph.nodes.get(q.node), total = quiz.qs.length;
  const t = q.type || 'text';
  let body = '';
  if (t === 'choice') body = `<div class="options">${(q.options || []).map((o, i) => `<button class="option" data-act="pick" data-i="${i}"><span class="letter">${'ABCD'[i] || i + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
  else if (t === 'open') body = `<textarea id="ans" class="answer" rows="4" placeholder="用自己的话写，一两句就行"></textarea><div class="q-actions"><button class="primary" data-act="reveal">写好了，看参考</button></div>`;
  else body = `<div class="field"><input id="ans" class="answer${t === 'number' ? ' num' : ''}" ${t === 'number' ? 'inputmode="decimal"' : (q.lang === 'en' ? 'lang="en" autocapitalize="off" autocorrect="off" spellcheck="false"' : '')} autocomplete="off" enterkeyhint="done" placeholder="${t === 'number' ? '填结果' : '填在这里'}">${q.unit ? `<span class="unit">${esc(q.unit)}</span>` : ''}</div>${q.requiredDecimals != null ? `<p class="tiny">要求保留 ${q.requiredDecimals} 位小数，末尾的 0 也要写。</p>` : ''}<div class="q-actions"><button class="primary" data-act="submit">${icons.check}确定</button></div>`;
  sheet(`<header class="sh-head"><div><small>${quiz.kind === 'quick' ? '快速过一遍' : esc(n.title)} · 第 ${quiz.i + 1} / ${total} 题${q.kind === 'bank' ? ' · <b class="k red">这学期错过的原题</b>' : q.kind === 'blank' ? ' · 默写' : q.kind === 'word' ? (subject === 'english' ? ' · 单词拼写' : ' · 看拼音写词语') : ''}</small>${quiz.kind === 'quick' ? `<h2 class="small">${esc(n.title)}</h2>` : ''}</div><button class="icon-btn" data-act="close" aria-label="关闭">${icons.x}</button></header>
  <div class="track">${quiz.qs.map((_, i) => `<span class="${i < quiz.i ? (quiz.results[i]?.ok ? 'ok' : 'no') : i === quiz.i ? 'cur' : ''}"></span>`).join('')}</div>
  ${q.image ? `<figure class="qimg"><img src="${esc(q.image)}" alt="${esc(q.imageAlt || '题图')}"></figure>` : ''}
  <p class="prompt">${esc(q.prompt)}</p>${body}<div id="fb"></div>`);
}
function answerQ(raw, selfOk) {
  const q = quiz.qs[quiz.i];
  const ok = q.type === 'open' ? !!selfOk : judge(q, raw);
  quiz.results[quiz.i] = { ok, answer: String(raw ?? '').slice(0, 80), self: q.type === 'open' };
  const r = rec(q.node); r.asked++; if (ok) r.right++; else r.wrong++; r.lastAt = new Date().toISOString();
  if (q.kind === 'bank') { r.usedBank = [...new Set([...(r.usedBank || []), q.id])].slice(-40); }
  save();
  const n = graph.nodes.get(q.node);
  const ansText = q.type === 'choice' ? (q.options || [])[q.answer] : (q.answer ?? (q.answers || [])[0]);
  $('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><p class="verdict">${ok ? icons.check + '对了' : icons.x + '不对'}</p>${!ok ? `<p>参考答案：<b>${esc(ansText)}${q.unit ? ' ' + esc(q.unit) : ''}</b></p>` : ''}${q.why ? `<p>${esc(q.why)}</p>` : ''}${!ok && q.hint ? `<p class="hint">关键关系：${esc(q.hint)}</p>` : ''}${!ok && n.idea && q.kind !== 'bank' ? `<p class="hint">关键关系：${esc(n.idea)}</p>` : ''}${q.source ? `<p class="tiny">出处：${esc(q.source)}</p>` : ''}</div><div class="q-actions"><button class="primary" data-act="next">${quiz.i + 1 < quiz.qs.length ? '下一题' : '看结果'}</button></div>`;
  $('#sheet').querySelectorAll('.option, #ans, [data-act=submit], [data-act=reveal]').forEach(el => { el.disabled = true; });
  const nb = $('#fb .primary'); if (nb) nb.focus();
}
function reveal() {
  const q = quiz.qs[quiz.i];
  $('#fb').innerHTML = `<div class="fb ref"><p><b>参考：</b>${esc(q.answer)}</p><p class="tiny">对照下面几条，答到了就勾上：</p><div class="checks">${(q.checks || []).map((c, i) => `<label><input type="checkbox" data-check="${i}"><span>${esc(c)}</span></label>`).join('')}</div><div class="q-actions"><button class="primary" data-act="selfjudge">就按勾的算</button></div></div>`;
  $('#sheet').querySelector('[data-act=reveal]').disabled = true;
}
function finishQuiz() {
  const rs = quiz.results, right = rs.filter(r => r.ok).length;
  const byNode = new Map();
  quiz.qs.forEach((q, i) => { const e = byNode.get(q.node) || { ok: 0, no: 0 }; rs[i]?.ok ? e.ok++ : e.no++; byNode.set(q.node, e); });
  for (const [id, e] of byNode) { const r = rec(id); r.lastClean = e.no === 0; }
  state.rounds.push({ id: quiz.id, at: new Date().toISOString(), kind: quiz.kind, total: rs.length, right });
  state.rounds = state.rounds.slice(-60); save();
  report(byNode, right);
  const again = [...byNode.entries()].filter(([, e]) => e.no).map(([id]) => graph.nodes.get(id));
  sheet(`<header class="sh-head"><div><small>${esc(quiz.label)}</small><h2>${right} / ${rs.length} 对${right === rs.length ? '，全部过关' : ''}</h2></div><button class="icon-btn" data-act="close" aria-label="关闭">${icons.x}</button></header>
  ${again.length ? `<section class="again"><h3>还要再看的节点</h3>${again.map(n => `<button class="again-item" data-act="open" data-node="${esc(n.id)}"><b>${esc(n.title)}</b><span>${esc(n.idea)}</span></button>`).join('')}</section>` : '<p class="idea">这一轮没有错。明天换一组题再做一次，才算真的记住。</p>'}
  <div class="sh-actions"><button class="primary" data-act="close">回到脑图</button>${quiz.kind === 'quick' ? '<button class="ghost" data-act="quick">再来 10 题</button>' : `<button class="ghost" data-act="quiz" data-node="${esc(quiz.nodeId)}">换题再做</button>`}<button class="ghost" data-act="share">发给爸爸</button></div>`);
  quiz = { ...quiz, done: true };
  renderMapSoon();
}
function reportText(byNode, right, total) {
  const lines = [`${CHILD[who].label}${SUBJECTS[subject]}考前脑图 · ${quiz.label}：${right}/${total} 对（${today()}${TEST ? '，测试' : ''}）`];
  for (const [id, e] of byNode) { const n = graph.nodes.get(id); lines.push(`${e.no ? '✗' : '✓'} ${n.title}：对 ${e.ok}${e.no ? '，错 ' + e.no : ''}`); }
  return lines.join('\n');
}
function report(byNode, right) {
  quiz.text = reportText(byNode, right, quiz.qs.length);
  if (!window.V2Records) return;
  try { window.V2Records.enqueue({ app: 'exam-map', who, subject, mode: TEST ? 'test' : 'formal', roundId: quiz.id, label: quiz.label, total: quiz.qs.length, right, items: quiz.qs.map((q, i) => ({ node: q.node, title: graph.nodes.get(q.node).title, kind: q.kind, id: q.id || '', result: quiz.results[i]?.ok ? 'right' : 'wrong', self: !!quiz.results[i]?.self, answer: quiz.results[i]?.answer || '' })), text: quiz.text }); } catch (e) { }
}
let rafMap = 0; function renderMapSoon() { cancelAnimationFrame(rafMap); rafMap = requestAnimationFrame(() => { renderMap(); refreshStats(); }); }
function refreshStats() { const el = $('.bar .stat'); if (!el || !graph) return; const ids = [...graph.nodes.keys()], passed = ids.filter(id => nodeStatus(id) === 'pass').length, again = ids.filter(id => nodeStatus(id) === 'again').length; el.textContent = `过关 ${passed} · 再看 ${again} · 未做 ${ids.length - passed - again}`; }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2200); }

/* ---------- 事件 ---------- */
document.addEventListener('click', async e => {
  const leaf = e.target.closest('.leaf[data-node]'); if (leaf) { openNode(leaf.dataset.node); return; }
  const btn = e.target.closest('[data-act]'); if (!btn) return;
  const act = btn.dataset.act;
  if (act === 'who') { who = btn.dataset.who; history.replaceState(null, '', `?who=${who}&subject=${subject}${TEST ? '&test=1' : ''}`); await boot(); return; }
  if (act === 'switch') { who = null; chooser(); return; }
  if (act === 'subject') { subject = btn.dataset.subject; history.replaceState(null, '', `?who=${who}&subject=${subject}${TEST ? '&test=1' : ''}`); await boot(); return; }
  if (act === 'print') { window.print(); return; }
  if (act === 'quick') { startQuick(); return; }
  if (act === 'quiz') { startQuiz(btn.dataset.node); return; }
  if (act === 'open') { openNode(btn.dataset.node); return; }
  if (act === 'close') { closeSheet(); renderMapSoon(); return; }
  if (act === 'pick') { answerQ(btn.dataset.i); return; }
  if (act === 'submit') { const v = $('#ans')?.value || ''; if (!v.trim()) { $('#ans')?.focus(); return; } answerQ(v); return; }
  if (act === 'reveal') { reveal(); return; }
  if (act === 'selfjudge') { const boxes = [...$('#sheet').querySelectorAll('[data-check]')]; const ok = boxes.length > 0 && boxes.every(b => b.checked); answerQ($('#ans')?.value || '', ok); return; }
  if (act === 'next') { if (quiz.i + 1 < quiz.qs.length) { quiz.i++; showQ(); } else finishQuiz(); return; }
  if (act === 'share') { window.V2Records?.share(`${CHILD[who].label}${SUBJECTS[subject]}考前脑图结果`, quiz?.text || ''); return; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'ans' && e.target.tagName === 'INPUT') { e.preventDefault(); $('#sheet [data-act=submit]')?.click(); }
  if (e.key === 'Escape' && !$('#sheet').hidden) { closeSheet(); renderMapSoon(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('leaf')) { e.preventDefault(); openNode(e.target.dataset.node); }
});
$('#sheet').addEventListener('click', e => { if (e.target === e.currentTarget) { closeSheet(); renderMapSoon(); } });
let rsz = 0; window.addEventListener('resize', () => { clearTimeout(rsz); rsz = setTimeout(renderMap, 120); });

/* ---------- 启动 ---------- */
async function boot() {
  if (!who) { chooser(); return; }
  document.body.dataset.who = who;
  if (!window.ReviewAtlasData) { $('#app').innerHTML = '<p class="note" style="margin-top:40px">知识点数据没有加载到（assets/review-atlas/content.js）。</p>'; return; }
  load();
  const bank = await loadBank();
  graph = buildGraph(bank);
  closeSheet();
  home();
  window.V2Records?.flush?.();
}
boot();
})();
