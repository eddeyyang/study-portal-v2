(function attachPaperArchive(global) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const STORE_NAME = 'papers';
  const DATABASE_VERSION = 1;
  const FORMAL_DATABASE = 'study_portal_private_papers_v1';
  const TEST_DATABASE = 'study_portal_private_papers_test_v1';
  const dbPromises = new Map();

  function text(value, maxLength = 2000) {
    return String(value == null ? '' : value).trim().slice(0, maxLength);
  }

  function validChild(value) {
    const child = text(value, 16).toLowerCase();
    return child === 'kenton' || child === 'eddey' ? child : '';
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

  function uid(prefix) {
    const random = global.crypto && typeof global.crypto.randomUUID === 'function'
      ? global.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix || 'paper'}-${random}`;
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, number(value)));
  }

  function normalizeBounds(bounds) {
    const source = bounds && typeof bounds === 'object' ? bounds : {};
    const x = clamp(source.x, 0, 1);
    const y = clamp(source.y, 0, 1);
    return {
      x,
      y,
      width: clamp(source.width, 0.01, 1 - x),
      height: clamp(source.height, 0.01, 1 - y)
    };
  }

  function normalizeAnswer(value) {
    return text(value, 2000)
      .toLowerCase()
      .replace(/[，。！？、；：,.!?;:'"“”‘’（）()\[\]{}]/g, '')
      .replace(/\s+/g, '');
  }

  function answerMatches(answer, reference) {
    const actual = normalizeAnswer(answer);
    if (!actual) return false;
    const accepted = text(reference, 2000)
      .split(/\s*\|\|\s*|\n+/)
      .map(normalizeAnswer)
      .filter(Boolean);
    return accepted.includes(actual);
  }

  function qualityAdvice(metrics) {
    const width = number(metrics && metrics.width);
    const height = number(metrics && metrics.height);
    const brightness = number(metrics && metrics.brightness, 128);
    const sharpness = number(metrics && metrics.sharpness, 12);
    const longest = Math.max(width, height);
    const issues = [];
    let severe = false;

    if (longest < 1200) issues.push('照片分辨率偏低');
    if (longest < 800) severe = true;
    if (brightness < 48) issues.push('画面偏暗，请增加光线');
    if (brightness > 224) issues.push('画面过亮，可能有反光');
    if (brightness < 28 || brightness > 242) severe = true;
    if (sharpness < 7) issues.push('文字边缘偏模糊，请稳住手机');
    if (sharpness < 3.5) severe = true;

    if (!issues.length) {
      return { level: 'good', label: '清晰度良好', issues: [], canContinue: true };
    }
    return {
      level: severe ? 'retake' : 'warn',
      label: severe ? '建议重拍这一页' : '可以继续，但建议检查',
      issues,
      canContinue: !severe
    };
  }

  const PAPER_TYPE_RULES = [
    { type: '期末考试', pattern: /期末|final/i, order: 10 },
    { type: '期中考试', pattern: /期中|midterm/i, order: 20 },
    { type: '月考', pattern: /月考|monthly/i, order: 30 },
    { type: '单元测验', pattern: /单元|unit\s*\d|chapter/i, order: 40 },
    { type: '模拟冲刺', pattern: /模拟|冲刺|mock|practice\s*test/i, order: 50 },
    { type: '日常作业', pattern: /作业|练习|worksheet|homework/i, order: 60 },
    { type: '编程练习', pattern: /小码王|核桃|c\+\+|编程|coding/i, order: 70 }
  ];

  const SUBJECT_ORDER = ['语文', '数学', '英语', '编程', '综合'];

  function classifyPaper(inputValue) {
    const input = inputValue && typeof inputValue === 'object' ? inputValue : {};
    const sourceText = [input.title, input.fileName, input.headerText, input.subject].map(value => text(value, 300)).join(' ');
    const matched = PAPER_TYPE_RULES.find(rule => rule.pattern.test(sourceText));
    return matched
      ? { type: matched.type, order: matched.order, source: 'keyword-rule' }
      : { type: '错题整理', order: 80, source: 'portal-default' };
  }

  function paperOrganization(inputValue) {
    const paper = inputValue && typeof inputValue === 'object' ? inputValue : {};
    const child = validChild(paper.child);
    const subject = SUBJECT_ORDER.includes(text(paper.subject, 40)) ? text(paper.subject, 40) : '综合';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(text(paper.paperDate, 10))
      ? text(paper.paperDate, 10)
      : '';
    const month = date ? date.slice(0, 7) : 'date-pending';
    const classification = classifyPaper({
      title: paper.title,
      fileName: Array.isArray(paper.pages) ? paper.pages.map(page => page && page.name).join(' ') : '',
      headerText: [
        paper.headerText,
        ...(Array.isArray(paper.questions)
          ? paper.questions.slice(0, 8).map(question => question && question.questionText)
          : [])
      ].map(value => text(value, 400)).join(' '),
      subject
    });
    const subjectOrder = Math.max(0, SUBJECT_ORDER.indexOf(subject));
    const subjectRank = 99 - subjectOrder;
    const typeRank = 999 - classification.order;
    return {
      paperType: classification.type,
      classificationSource: classification.source,
      archivePath: `${child || 'child-pending'}/${subject}/${month}/${classification.type}`,
      sortKey: `${date || '0000-00-00'}|${String(subjectRank).padStart(2, '0')}|${String(typeRank).padStart(3, '0')}|${text(paper.title, 120)}`
    };
  }

  const SUBJECT_METHODS = {
    '数学': {
      kenton: {
        diagnosis: '先区分“规则不会”还是“条件、单位或步骤没有落实”。',
        steps: ['圈出全部条件和问题', '把数量关系写成式子，再计算', '用估算、逆运算和单位做三重检查'],
        memoryHook: '条件 → 关系 → 计算 → 单位。少一格都不交卷。',
        transfer: '换一个数字或条件，先说关系不急着算。'
      },
      eddey: {
        diagnosis: '先把长题拆成看得见的三小步，不把“不会”和“没看清”混在一起。',
        steps: ['圈关键词：谁、多少、求什么', '画小图或线段，再列一个式子', '算完指着单位读一遍答案'],
        memoryHook: '找词 → 画图 → 列式 → 检查单位。',
        transfer: '把题目换成生活里的东西，再按同样三步说一遍。'
      }
    },
    '英语': {
      kenton: {
        diagnosis: '先定位句子结构，再检查时态、语序、词形和完整回答。',
        steps: ['找连接词、时间词和主语', '确定句型骨架与动词形式', '写完整句，再检查三单、大小写和标点'],
        memoryHook: '先骨架，后变形，最后完整输出。',
        transfer: '保留句型，只替换主语或时间词再说一句。'
      },
      eddey: {
        diagnosis: '先找一个最明显的信号词，再把句子放进熟悉的骨架。',
        steps: ['圈时间词和主语', '选句型：肯定、否定还是提问', '变动词，慢慢朗读一遍'],
        memoryHook: '时间词找时态，主语决定小变化。',
        transfer: '换一个人物，用同一个句型口头说一句。'
      }
    },
    '语文': {
      kenton: {
        diagnosis: '先判断题目限制，再用原文证据组织完整表达。',
        steps: ['圈出题目中的范围和要求', '回原文定位关键词与证据句', '用自己的话完整回答并回扣问题'],
        memoryHook: '题目要什么，证据就回答什么。',
        transfer: '换一处原文证据，说明为什么也能支持答案。'
      },
      eddey: {
        diagnosis: '先把问题说成一句简单的话，再去原文找对应词句。',
        steps: ['读题后说：它在问什么', '回原文找同义词或关键句', '用“因为……所以……”说完整'],
        memoryHook: '问什么 → 找哪里 → 说完整。',
        transfer: '指着另一句原文，说说它能不能当证据。'
      }
    },
    '编程': {
      kenton: {
        diagnosis: '把题意、变量变化和边界条件分开检查，避免只会写框架却漏条件。',
        steps: ['写清输入、输出和变量含义', '拿一个小样例逐步走变量', '检查分支、循环边界和特殊情况'],
        memoryHook: '先手算样例，再让代码照着走。',
        transfer: '换一个最小值或边界值，预测每一步变量。'
      },
      eddey: {
        diagnosis: '先把程序题翻译成几句生活步骤，再对应到代码。',
        steps: ['说清电脑先拿到什么', '一次只写一个动作或判断', '用最小样例逐行检查'],
        memoryHook: '一句人话，对应一段代码。',
        transfer: '换一个小输入，口头当一次“小电脑”。'
      }
    },
    '综合': {
      kenton: {
        diagnosis: '先确认错误落在概念、条件、步骤还是表达，再定点修复。',
        steps: ['复述题目要求', '指出出错的具体一步', '重新完成并说出检查方法'],
        memoryHook: '找到错在哪一步，比只改答案更重要。',
        transfer: '换一个条件，说明方法哪里不变。'
      },
      eddey: {
        diagnosis: '一次只找一个卡点，先说清楚再动手。',
        steps: ['说它要我做什么', '指出哪一步卡住了', '照正确步骤重新做一次'],
        memoryHook: '看清一小步，做好一小步。',
        transfer: '换一个简单例子，再走同样步骤。'
      }
    }
  };

  const ERROR_REPAIRS = {
    '审题漏条件': '这次不先算，先把所有限制条件逐个打勾。',
    '概念混淆': '把两个容易混淆的概念各说一句，并指出它们的分界线。',
    '步骤遗漏': '把步骤编号；少一步就退回上一格补齐。',
    '计算或拼写': '方法不变，放慢最后一步并做一次反向检查。',
    '表达不完整': '答案必须带上对象、结论和必要依据，不只写关键词。',
    '暂不确定': '先用原题表现确认真正卡点，暂时不贴“粗心”标签。'
  };

  function buildTeaching(question, childValue) {
    const child = validChild(childValue) || 'eddey';
    const subject = SUBJECT_METHODS[text(question && question.subject, 20)]
      ? text(question.subject, 20)
      : '综合';
    const method = SUBJECT_METHODS[subject][child];
    const errorType = text(question && question.errorType, 40) || '暂不确定';
    const knowledgeTag = text(question && question.knowledgeTag, 120) || '这个知识点';
    const rootCause = text(question && question.rootCause, 400);
    const parentHint = text(question && question.parentHint, 500);
    const repair = ERROR_REPAIRS[errorType] || ERROR_REPAIRS['暂不确定'];
    const childLead = child === 'kenton'
      ? '先别急着看答案。用一句话说出这题的结构，再动手。'
      : '我们一次只做一小步。先指给我看题目在问什么。';

    return {
      schemaVersion: SCHEMA_VERSION,
      child,
      subject,
      levelLabel: child === 'kenton' ? '结构化挑战讲解' : '短步骤图像化讲解',
      knowledgeTag,
      diagnosis: rootCause || method.diagnosis,
      explanation: [childLead, repair, parentHint].filter(Boolean).join(' '),
      steps: method.steps.slice(),
      memoryHook: method.memoryHook,
      recallPrompt: child === 'kenton'
        ? `合上提示，说出“${knowledgeTag}”的判断条件和检查点。`
        : `不用看答案，说出“${knowledgeTag}”第一步先找什么。`,
      originalPrompt: '回到同一道原题，独立完成；如果做错，先修复，再回到这道原题重做。',
      transferPrompt: method.transfer,
      checkPrompt: child === 'kenton'
        ? '最后检查：条件、步骤、单位或句子形式是否全部落地？'
        : '最后指着答案检查：我有没有漏掉题目要的东西？'
    };
  }

  function lessonHref(child, paperId, questionId) {
    const query = new URLSearchParams({ who: validChild(child), paper: text(paperId, 120) });
    if (questionId) query.set('question', text(questionId, 120));
    return `paper-lesson.html?${query.toString()}`;
  }

  function eventId(paperId, questionId) {
    return `paper-evidence-${stableHash(`${paperId}|${questionId}|v1`)}`;
  }

  function paperToEvents(paperValue) {
    const paper = paperValue && typeof paperValue === 'object' ? paperValue : {};
    const child = validChild(paper.child);
    if (!child) throw new Error('卷子必须明确属于 Kenton 或 Eddey');
    const questions = Array.isArray(paper.questions) ? paper.questions.slice(0, 30) : [];
    if (!questions.length) throw new Error('卷子至少需要一道已确认错题');
    const unconfirmed = questions.find(question => question && question.parentConfirmed !== true);
    if (unconfirmed) throw new Error(`第 ${text(unconfirmed.number, 30) || '?'} 题尚未经过家长确认`);
    const unclassified = questions.find(question => !text(question && question.knowledgeTag, 150));
    if (unclassified) throw new Error(`第 ${text(unclassified.number, 30) || '?'} 题还没有知识点分类`);
    const confirmedAt = text(paper.confirmedAt, 40) || new Date().toISOString();
    const paperId = text(paper.id, 120);
    if (!paperId) throw new Error('卷子缺少稳定编号');

    const organization = paperOrganization(paper);
    const events = questions.map((question, index) => {
      const questionId = text(question.id, 120) || `q-${index + 1}`;
      const teaching = question.teaching && typeof question.teaching === 'object'
        ? question.teaching
        : buildTeaching({ ...question, subject: paper.subject }, child);
      const item = text(question.questionText, 1800) || `${text(paper.title, 120) || '错题卷'} 第${text(question.number, 20) || index + 1}题`;
      const topic = text(question.knowledgeTag, 150) || text(question.errorType, 80) || '待确认知识点';
      return {
        client_event_id: eventId(paperId, questionId),
        ts: confirmedAt,
        kid: child,
        subject: text(paper.subject, 40) || '综合',
        activity: 'paper_mistake_confirmed',
        topic,
        item,
        ok: false,
        hint: text(teaching.explanation, 900),
        source: 'paper-intake/parent-confirmed',
        payload: {
          schema_version: SCHEMA_VERSION,
          evidence_source: 'paper',
          paper_id: paperId,
          paper_title: text(paper.title, 160) || '未命名错题卷',
          paper_date: text(paper.paperDate, 10),
          paper_type: text(paper.paperType || organization.paperType, 80),
          archive_path: text(paper.archivePath || organization.archivePath, 240),
          sort_key: text(paper.sortKey || organization.sortKey, 240),
          classification_source: text(paper.classificationSource || organization.classificationSource, 40),
          page_count: Array.isArray(paper.pages) ? paper.pages.length : 0,
          question_id: questionId,
          question_number: text(question.number, 30) || String(index + 1),
          page_id: text(question.pageId, 120),
          bounds: normalizeBounds(question.bounds),
          question_text: text(question.questionText, 1800),
          student_answer: text(question.studentAnswer, 600),
          correct_answer: text(question.correctAnswer, 800),
          answer_mode: text(question.answerMode, 30) || (text(question.correctAnswer, 800) ? 'exact' : 'self_check'),
          knowledge_tag: topic,
          error_type: text(question.errorType, 80) || '暂不确定',
          root_cause: text(question.rootCause, 600),
          root_cause_status: text(question.rootCause, 600) ? 'parent_confirmed' : 'not_yet_confirmed',
          parent_hint: text(question.parentHint, 600),
          parent_confirmed: question.parentConfirmed === true,
          ocr: {
            attempted: Boolean(question.ocr && question.ocr.attempted),
            confidence: clamp(question.ocr && question.ocr.confidence, 0, 1),
            needs_parent_check: Boolean(question.ocr && question.ocr.needsParentCheck),
            parent_confirmed: question.parentConfirmed === true
          },
          teaching: {
            level_label: text(teaching.levelLabel, 80),
            diagnosis: text(teaching.diagnosis, 600),
            explanation: text(teaching.explanation, 900),
            steps: Array.isArray(teaching.steps) ? teaching.steps.slice(0, 5).map(step => text(step, 260)) : [],
            memory_hook: text(teaching.memoryHook, 400),
            recall_prompt: text(teaching.recallPrompt, 500),
            original_prompt: text(teaching.originalPrompt, 500),
            transfer_prompt: text(teaching.transferPrompt, 500),
            check_prompt: text(teaching.checkPrompt, 500)
          },
          lesson_href: lessonHref(child, paperId, questionId),
          original_image_storage: 'device_only',
          need_review: true
        }
      };
    });

    const removed = Array.isArray(paper.removedQuestions) ? paper.removedQuestions.slice(0, 30) : [];
    removed.forEach((question) => {
      const questionId = text(question && question.id, 120);
      if (!questionId) return;
      events.push({
        client_event_id: eventId(paperId, questionId),
        ts: text(question.removedAt, 40) || confirmedAt,
        kid: child,
        subject: text(paper.subject, 40) || '综合',
        activity: 'paper_mistake_removed',
        topic: '家长修正误标',
        item: '家长已移除误标错题',
        ok: null,
        hint: '',
        source: 'paper-intake/parent-confirmed',
        payload: {
          schema_version: SCHEMA_VERSION,
          evidence_source: 'paper',
          paper_id: paperId,
          question_id: questionId,
          removed: true,
          original_image_storage: 'device_only'
        }
      });
    });
    return events;
  }

  function cloudRowsToPaper(rowsValue, childValue, paperIdValue) {
    const child = validChild(childValue);
    const paperId = text(paperIdValue, 120);
    if (!child || !paperId) return null;
    const rows = (Array.isArray(rowsValue) ? rowsValue : []).filter((row) => {
      const payload = row && row.payload && typeof row.payload === 'object' ? row.payload : {};
      return validChild(row && (row.kid || row.child)) === child &&
        text(row && row.activity, 60) === 'paper_mistake_confirmed' &&
        text(payload.paper_id, 120) === paperId && payload.removed !== true;
    });
    if (!rows.length) return null;
    const firstPayload = rows[0].payload;
    const questions = rows.map((row, index) => {
      const payload = row.payload || {};
      const teachingPayload = payload.teaching || {};
      const question = {
        id: text(payload.question_id, 120) || `cloud-q-${index + 1}`,
        number: text(payload.question_number, 30) || String(index + 1),
        pageId: text(payload.page_id, 120),
        bounds: normalizeBounds(payload.bounds),
        questionText: text(payload.question_text || row.item, 1800),
        studentAnswer: text(payload.student_answer, 600),
        correctAnswer: text(payload.correct_answer, 800),
        answerMode: text(payload.answer_mode, 30) || (text(payload.correct_answer, 800) ? 'exact' : 'self_check'),
        knowledgeTag: text(payload.knowledge_tag || row.topic, 150),
        errorType: text(payload.error_type, 80) || '暂不确定',
        rootCause: text(payload.root_cause, 600),
        parentHint: text(payload.parent_hint, 600),
        parentConfirmed: payload.parent_confirmed === true,
        ocr: payload.ocr || {},
        subject: text(row.subject, 40) || '综合'
      };
      question.teaching = {
        levelLabel: text(teachingPayload.level_label, 80),
        diagnosis: text(teachingPayload.diagnosis, 600),
        explanation: text(teachingPayload.explanation, 900),
        steps: Array.isArray(teachingPayload.steps) ? teachingPayload.steps.map(step => text(step, 260)) : [],
        memoryHook: text(teachingPayload.memory_hook, 400),
        recallPrompt: text(teachingPayload.recall_prompt, 500),
        originalPrompt: text(teachingPayload.original_prompt, 500),
        transferPrompt: text(teachingPayload.transfer_prompt, 500),
        checkPrompt: text(teachingPayload.check_prompt, 500)
      };
      if (!question.teaching.steps.length) question.teaching = buildTeaching(question, child);
      return question;
    }).sort((left, right) => String(left.number).localeCompare(String(right.number), 'zh-CN', { numeric: true }));

    return {
      schemaVersion: SCHEMA_VERSION,
      id: paperId,
      child,
      subject: text(rows[0].subject, 40) || '综合',
      title: text(firstPayload.paper_title, 160) || '错题卷',
      paperDate: text(firstPayload.paper_date, 10),
      paperType: text(firstPayload.paper_type, 80) || '错题整理',
      archivePath: text(firstPayload.archive_path, 240),
      sortKey: text(firstPayload.sort_key, 240),
      status: 'confirmed',
      confirmedAt: text(rows[0].ts || rows[0].occurred_at, 40),
      pages: [],
      questions,
      cloudOnly: true
    };
  }

  function databaseName() {
    const sync = global.DDLearningSync;
    return sync && typeof sync.isTest === 'function' && sync.isTest()
      ? TEST_DATABASE
      : FORMAL_DATABASE;
  }

  function openDatabase() {
    if (!global.indexedDB) return Promise.reject(new Error('当前浏览器不支持本机卷子档案'));
    const name = databaseName();
    if (dbPromises.has(name)) return dbPromises.get(name);
    const promise = new Promise((resolve, reject) => {
      const request = global.indexedDB.open(name, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        const store = database.objectStoreNames.contains(STORE_NAME)
          ? request.transaction.objectStore(STORE_NAME)
          : database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        if (!store.indexNames.contains('child')) store.createIndex('child', 'child', { unique: false });
        if (!store.indexNames.contains('status')) store.createIndex('status', 'status', { unique: false });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('本机卷子档案打开失败'));
    });
    dbPromises.set(name, promise);
    return promise;
  }

  async function storeRequest(mode, action) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('本机卷子档案操作失败'));
    });
  }

  async function savePaper(paperValue) {
    const paper = paperValue && typeof paperValue === 'object' ? paperValue : {};
    const child = validChild(paper.child);
    if (!child) throw new Error('请先选择哥哥或弟弟');
    const now = new Date().toISOString();
    const organization = paperOrganization(paper);
    const record = {
      ...paper,
      schemaVersion: SCHEMA_VERSION,
      id: text(paper.id, 120) || `${child}:${uid('paper')}`,
      child,
      title: text(paper.title, 160) || '未命名错题卷',
      subject: text(paper.subject, 40) || '综合',
      paperType: organization.paperType,
      classificationSource: organization.classificationSource,
      archivePath: organization.archivePath,
      sortKey: organization.sortKey,
      status: paper.status === 'confirmed' ? 'confirmed' : 'draft',
      pages: Array.isArray(paper.pages) ? paper.pages.slice(0, 5) : [],
      questions: Array.isArray(paper.questions) ? paper.questions.slice(0, 30) : [],
      removedQuestions: Array.isArray(paper.removedQuestions) ? paper.removedQuestions.slice(0, 30) : [],
      createdAt: text(paper.createdAt, 40) || now,
      updatedAt: now
    };
    await storeRequest('readwrite', store => store.put(record));
    return record;
  }

  async function getPaper(id) {
    return storeRequest('readonly', store => store.get(text(id, 120)));
  }

  async function listPapers(childValue) {
    const child = validChild(childValue);
    if (!child) return [];
    const records = await storeRequest('readonly', store => store.index('child').getAll(child));
    return (Array.isArray(records) ? records : []).sort(comparePapers);
  }

  function comparePapers(leftValue, rightValue) {
    const left = leftValue && typeof leftValue === 'object' ? leftValue : {};
    const right = rightValue && typeof rightValue === 'object' ? rightValue : {};
    const leftSort = text(left.sortKey || paperOrganization(left).sortKey, 240);
    const rightSort = text(right.sortKey || paperOrganization(right).sortKey, 240);
    const organized = rightSort.localeCompare(leftSort, 'zh-CN', { numeric: true });
    if (organized) return organized;
    return text(right.updatedAt || right.confirmedAt || right.createdAt, 40)
      .localeCompare(text(left.updatedAt || left.confirmedAt || left.createdAt, 40));
  }

  async function removePaper(id) {
    return storeRequest('readwrite', store => store.delete(text(id, 120)));
  }

  global.DDPaperArchive = Object.freeze({
    SCHEMA_VERSION,
    answerMatches,
    buildTeaching,
    classifyPaper,
    cloudRowsToPaper,
    comparePapers,
    eventId,
    getPaper,
    lessonHref,
    listPapers,
    normalizeAnswer,
    normalizeBounds,
    paperToEvents,
    paperOrganization,
    qualityAdvice,
    removePaper,
    savePaper,
    stableHash,
    uid,
    validChild
  });
})(typeof window === 'undefined' ? globalThis : window);
