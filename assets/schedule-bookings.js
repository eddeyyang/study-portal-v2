(function attachScheduleBookings(global) {
  'use strict';
  const SCHEMA = 'study-bookings-v1';
  const TEACHERS = Object.freeze({ Bryony: 'kenton', Valeria: 'eddey' });
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
  const minutes = value => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || '')) throw new Error('外教时间无效');
    return Number(value.slice(0,2)) * 60 + Number(value.slice(3));
  };
  function normalize(value) {
    if (!value || value.schema !== SCHEMA || value.timeZone !== 'Asia/Shanghai' || !value.dates || typeof value.dates !== 'object' || Array.isArray(value.dates)) throw new Error('外教预约数据格式无效');
    const dates = {};
    for (const [date, entry] of Object.entries(value.dates)) {
      if (!validDate(date) || !entry || !Number.isFinite(Date.parse(entry.checkedAt)) || !Array.isArray(entry.lessons)) throw new Error('预约核验日期无效');
      const seen = new Set();
      const lessons = entry.lessons.map(row => {
        if (!row || !Object.hasOwn(TEACHERS, row.teacher) || TEACHERS[row.teacher] !== row.child) throw new Error('老师与孩子对应无效');
        if (minutes(row.end) - minutes(row.start) !== 25) throw new Error('当前仅支持已核实的25分钟预约');
        const item = { child: row.child, teacher: row.teacher, start: row.start, end: row.end };
        const key = `${item.child}:${item.start}:${item.end}`;
        if (seen.has(key)) throw new Error('同一预约重复');
        seen.add(key);
        return item;
      }).sort((a,b) => a.start.localeCompare(b.start) || a.child.localeCompare(b.child));
      for (const child of ['kenton', 'eddey']) {
        const own = lessons.filter(row => row.child === child);
        if (own.some((row,index) => index > 0 && minutes(own[index-1].end) > minutes(row.start))) throw new Error('同一孩子预约重叠，须先核对');
      }
      dates[date] = { checkedAt: entry.checkedAt, lessons };
    }
    return { schema: SCHEMA, timeZone: 'Asia/Shanghai', dates };
  }
  function lessonsFor(snapshot, date) {
    const entry = snapshot?.dates?.[date];
    if (!entry) return null;
    return entry.lessons.map(row => ({
      id: `preply-${row.child}-${date.replaceAll('-','')}-${row.start.replace(':','')}`,
      child: row.child, order: Number(row.start.replace(':','')), time: `${row.start}–${row.end}`,
      title: `线上外教 · ${row.teacher}`, kind: 'online', state: 'confirmed', status: '预约已核实',
      note: `已预约；最近核验 ${new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(entry.checkedAt))}，临近开课以 Preply 最新安排为准`
    }));
  }
  function notice(snapshot, date, now = Date.now()) {
    if (date < '2026-10-10') return null;
    const entry = snapshot?.dates?.[date];
    if (!entry) return { type: 'pending', text: '外教预约尚未同步到这个日期；未显示不代表没有课，请按 Preply 最新预约核对。' };
    const checked = new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(entry.checkedAt));
    const stale = now - Date.parse(entry.checkedAt) > 48 * 60 * 60 * 1000;
    return { type: stale ? 'pending' : 'normal', text: `当天外教预约最近核验：${checked}。${stale ? '已超过两天未更新，以下保留上次预约；请核对是否改期或取消。' : '如有临时改期，以 Preply 最新安排为准。'}` };
  }
  global.DDScheduleBookings = Object.freeze({ SCHEMA, TEACHERS, validDate, normalize, lessonsFor, notice });
})(typeof window === 'undefined' ? globalThis : window);
