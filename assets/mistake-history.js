(function attachMistakeHistory(global) {
  'use strict';

  const SUBJECT_ORDER = ['语文', '数学', '英语', '编程', 'AI/科学', '综合'];

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function normalized(value) {
    return text(value).replace(/\s+/g, ' ').toLowerCase();
  }

  function beijingDate(value) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(parsed);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function stableHash(value) {
    let hash = 2166136261;
    const input = String(value);
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function unique(values) {
    return [...new Set(values.map(text).filter(Boolean))];
  }

  function sourceLabel(source) {
    const value = text(source);
    if (/^paper-intake\//i.test(value)) return '卷子上传 · 家长确认';
    if (/^paper-lesson\.html/i.test(value)) return '卷子讲解作答';
    if (/^apps\/.+\.html(?:[?#].*)?$/i.test(value)) return '学习软件';
    if (/^teacher-feedback\//i.test(value)) return '老师反馈';
    if (/^manual-parent-observation\//i.test(value)) return '家长记录';
    if (/^xiaomawang\/parent-feedback\//i.test(value)) return '家长记录 · 小码王';
    if (/parent-feedback/i.test(value)) return '家长反馈';
    return value ? '系统学习记录' : '历史学习记录';
  }

  function appLink(source) {
    const value = text(source);
    if (
      /^apps\/[a-z0-9_./-]+\.html(?:[?#][a-z0-9_=&%.-]+)?$/i.test(value) &&
      !value.includes('..')
    ) return value;
    return '';
  }

  function lessonLink(value) {
    const href = text(value);
    if (
      /^paper-lesson\.html\?who=(?:kenton|eddey)&paper=[a-z0-9:%_.-]+(?:&question=[a-z0-9%_.:-]+)?$/i.test(href) &&
      !href.includes('..')
    ) return href;
    return '';
  }

  function topicScore(topic, item) {
    let score = topic.length;
    if (!topic) score += 1000;
    if (normalized(topic) === normalized(item)) score += 200;
    if (/Kenton|Eddey|学习作答|学习软件|调度站|预习馆/.test(topic)) score += 120;
    return score;
  }

  function preferredTopic(rows, item) {
    const topics = unique(rows.map(row => row.topic));
    topics.sort((left, right) => topicScore(left, item) - topicScore(right, item));
    return topics[0] || '待回炉知识点';
  }

  function usefulError(row, child, archivedIds) {
    if (!row || text(row.kid).toLowerCase() !== child) return false;
    if (row.ok !== false && row.is_correct !== false) return false;
    const payload = row.payload && typeof row.payload === 'object' ? row.payload : {};
    if ([row, payload].some(value => ['is_test', 'isTest', 'automatic_test'].some(key => value[key] === true || value[key] === 'true') ||
      /^(test|preview|local|untrusted|parent-test)$/i.test(text(value.mode))) || row.activity === 'connection_test') return false;
    if (archivedIds.has(text(row.client_event_id))) return false;
    if (normalized(row.item) === '学习作答' && !text(row.hint)) return false;
    return Boolean(text(row.item) || text(row.topic));
  }

  function cloudHistoryItems(rows, child, staticItems) {
    const archivedIds = new Set(
      staticItems
        .map(item => item && item.neon && item.neon.client_event_id)
        .map(text)
        .filter(Boolean)
    );
    const grouped = new Map();

    rows
      .filter(row => usefulError(row, child, archivedIds))
      .forEach(row => {
        const subject = text(row.subject) || '综合';
        const item = text(row.item) || text(row.topic) || '未命名题目';
        const payload = row.payload && typeof row.payload === 'object' ? row.payload : {};
        const paperKey = text(payload.paper_id) && text(payload.question_id)
          ? `paper:${text(payload.paper_id)}:${text(payload.question_id)}`
          : '';
        const key = `${subject}\u0000${paperKey || JSON.stringify([normalized(row.source), normalized(item)])}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(row);
      });

    return [...grouped.entries()].map(([key, group]) => {
      const ordered = group.slice().sort(
        (left, right) => new Date(left.ts || 0) - new Date(right.ts || 0)
      );
      const first = ordered[0];
      const latest = ordered[ordered.length - 1];
      const item = text(latest.item) || text(first.item) || text(latest.topic);
      const subject = text(latest.subject) || text(first.subject) || '综合';
      const hints = unique(ordered.map(row => row.hint));
      const sources = unique(ordered.map(row => row.source));
      const topics = unique(ordered.map(row => row.topic));
      const topic = preferredTopic(ordered, item);
      const payloads = ordered.map(row => row.payload && typeof row.payload === 'object' ? row.payload : {});
      const paperPayload = payloads.find(payload => text(payload.evidence_source) === 'paper') || {};
      const rootCause = unique(payloads.map(payload => payload.root_cause))[0];
      const firstSeen = beijingDate(first.ts);
      const lastSeen = beijingDate(latest.ts);
      const evidence = latest.evidence_summary && typeof latest.evidence_summary === 'object' ? latest.evidence_summary : {};
      const resolved = ordered.every(row => {
        const summary = row.evidence_summary || {};
        return summary.schema_version === 'learning-evidence-v1' && summary.learning_status === 'resolved' && summary.needs_review === false && summary.evidence_truncated !== true;
      });
      const corrected = Number(evidence.correction_count) > 0;
      const reviewSteps = [];
      if (hints[0]) reviewSteps.push(`先回看提示：${hints[0]}`);
      reviewSteps.push('回到原题，先说出判断方法，再独立完成。');
      reviewSteps.push('隔天再独立检查；订正与延迟复测分别保留，不把即时重做当作掌握。');

      return {
        id: `neon-history:${child}:${stableHash(key)}`,
        child,
        title: topic,
        subject,
        topic,
        topics,
        added: lastSeen,
        firstSeen,
        lastSeen,
        source: unique(sources.map(sourceLabel)).join(' · '),
        sourcePaths: sources,
        status: resolved ? 'resolved' : 'not_mastered',
        statusLabel: resolved ? '延迟复测已有证据' : corrected ? '已订正 · 待复测' : '待回炉',
        needReview: !resolved,
        evidenceSummary: evidence,
        errorCount: Math.max(ordered.length, Number(evidence.wrong_evidence) || 0),
        summary: [item, rootCause || hints[0]].filter(Boolean).join(rootCause ? '　卡点：' : '　提示：'),
        reviewSteps,
        file: lessonLink(paperPayload.lesson_href) || sources.map(appLink).find(Boolean) || '',
        recordFile: '',
        originKind: text(paperPayload.evidence_source) === 'paper' ? 'paper-confirmed' : 'neon-history',
        paperId: text(paperPayload.paper_id),
        questionId: text(paperPayload.question_id)
      };
    });
  }

  function subjectIndex(subject) {
    const index = SUBJECT_ORDER.indexOf(subject);
    return index === -1 ? SUBJECT_ORDER.length : index;
  }

  function sortItems(items) {
    return items.slice().sort((left, right) => {
      const dateOrder = text(right.added).localeCompare(text(left.added));
      if (dateOrder) return dateOrder;
      const subjectOrder = subjectIndex(left.subject) - subjectIndex(right.subject);
      if (subjectOrder) return subjectOrder;
      return text(left.title || left.topic).localeCompare(text(right.title || right.topic), 'zh-CN');
    });
  }

  function mergeHistory(staticItems, rows, child) {
    const normalizedChild = text(child).toLowerCase();
    if (normalizedChild !== 'kenton' && normalizedChild !== 'eddey') return [];
    const safeStatic = Array.isArray(staticItems)
      ? staticItems.filter(item => item && (!item.child || text(item.child).toLowerCase() === normalizedChild)).map(item => ({
          ...item,
          child: normalizedChild,
          originKind: item.originKind || 'cnb-archive',
          errorCount: Number(item.errorCount) || 1,
          firstSeen: item.firstSeen || item.added || '',
          lastSeen: item.lastSeen || item.added || ''
        }))
      : [];
    const cloud = cloudHistoryItems(
      Array.isArray(rows) ? rows : [],
      normalizedChild,
      safeStatic
    );
    return sortItems([...safeStatic, ...cloud]);
  }

  function groupBySubject(items) {
    const groups = new Map();
    sortItems(Array.isArray(items) ? items : []).forEach(item => {
      const subject = text(item.subject) || '综合';
      if (!groups.has(subject)) groups.set(subject, []);
      groups.get(subject).push(item);
    });
    return [...groups.entries()]
      .sort((left, right) => subjectIndex(left[0]) - subjectIndex(right[0]))
      .map(([subject, records]) => ({ subject, records }));
  }

  function summarizeRows(rows, child) {
    const items = mergeHistory([], rows, child);
    const bySubject = {};
    items.forEach(item => {
      const subject = item.subject || '综合';
      bySubject[subject] = (bySubject[subject] || 0) + 1;
    });
    return { child: text(child).toLowerCase(), total: items.length, bySubject };
  }

  global.DDMistakeHistory = Object.freeze({
    beijingDate,
    groupBySubject,
    mergeHistory,
    lessonLink,
    sourceLabel,
    summarizeRows
  });
})(typeof window === 'undefined' ? globalThis : window);
