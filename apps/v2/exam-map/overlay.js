/* 考前脑图 · v2 自有的"叠加层"数据（Claude 设计版，2026-11-01）
   脑图的知识节点来自正式站同步来的 assets/review-atlas/content.js；
   这里只放 v2 自己加的东西：错题本分类怎样落到节点上、几种互动模型的文字关系链、
   错题本没覆盖到的补充节点、语文错因记录、考场提醒、知识重点标记。
   不含任何原卷照片、真名、学校信息。 */
window.ExamMapOverlay = {
  /* 数学错题本（data/learning/<who>_math_mistakes_20261024.json）每道题落到哪个节点。
     先按 category，再用 prompt 里的关键词细分；返回节点 id。 */
  assignMath: {
    kenton(item) {
      const p = item.prompt || '', c = item.category;
      if (c === '小数计算') return /÷/.test(p) ? 'km-quotient' : 'km-scale';
      if (c === '数位与验算') return 'km-zero';
      if (c === '运算规律') return 'km-law';
      if (c === '近似数') return 'km-round';
      if (c === '数量关系') return /汇率|美元|欧元|港币|日元|英镑|人民币|元兑/.test(p) ? 'km-exchange' : /电费|水费|天然气|度电|立方米|表|用电|用水/.test(p) ? 'km-meter' : 'km-rate';
      if (c === '平均数与统计') return /折线|统计图|图中|看图/.test(p) ? 'km-data' : /两组|合起来|男生|女生|全班|一共.*人/.test(p) ? 'km-weight' : 'km-average';
      if (c === '图形与单位') return 'kx-shape';
      if (c === '枚举与条件') return 'kx-enum';
      return null;
    },
    eddey(item) {
      const p = item.prompt || '', c = item.category;
      if (c === '计算与检查') return 'ex-calc';
      if (c === '运算顺序与括号') return 'em-order';
      if (c === '运算律与等价变形') return (/×/.test(p) && /[+＋\-－]/.test(p)) || /分配/.test(p) ? 'em-distribute' : 'em-associate';
      if (c === '倒推与逆运算') return 'em-inverse';
      if (c === '数量关系与应用') return 'em-meaning';
      if (c === '方向与看图') return 'em-direction';
      if (c === '单位与完整表达') return 'em-check';
      return null;
    }
  },

  /* 正式站没有、错题本里却有的知识点：用错题本的"学习路线"(syllabus) 建成节点。
     category → 节点；unit 指放在脑图哪条分支（按正式站的单元序号；0 = 新开一条"错题本专项"分支）。 */
  extraNodes: {
    kenton: [
      { id: 'kx-shape', category: '图形与单位', unit: 0, title: '周长看外圈，面积看铺满' },
      { id: 'kx-enum', category: '枚举与条件', unit: 0, title: '把条件列全，再一个个试' }
    ],
    eddey: [
      { id: 'ex-calc', category: '计算与检查', unit: 1, title: '每一步算稳，再用逆运算查' }
    ]
  },
  extraBranch: { kenton: ['错题本专项', '图形与单位 · 枚举与条件', '看清所求 → 列全条件 → 逐个验'], eddey: null },

  /* 正式站用图形互动表示的几个模型，脑图里改用文字关系链一眼看完。 */
  chains: {
    'km-scale': [
      { label: '× 0.4', parts: ['把 6 看成一整份', '取它的十分之四', '6 × 0.4 = 2.4，比 6 小'] },
      { label: '× 2', parts: ['两整份', '6 × 2 = 12，比 6 大'] },
      { label: '小数点', parts: ['先按整数算 6 × 4 = 24', '因数共 1 位小数', '积点回 1 位 → 2.4'] }
    ],
    'km-quotient': [
      { label: '1.8 ÷ 0.3', parts: ['除数 0.3 要变成 3，乘 10', '被除数也乘 10 → 18', '18 ÷ 3 = 6'] },
      { label: '只动除数', parts: ['1.8 ÷ 3', '题目已经变了', '商 0.6，错'] }
    ],
    'km-law': [
      { label: '分配律', parts: ['2.5 × (4 + 0.2)', '2.5 × 4 ＋ 2.5 × 0.2', '10 + 0.5 = 10.5'] },
      { label: '漏乘', parts: ['2.5 × 4 + 0.2', '0.2 没有乘到', '10.2，错'] }
    ],
    'km-average': [
      { label: '移多补少', parts: ['5、9、7 页', '总量 21 不变', '21 ÷ 3 = 7'] },
      { label: '不是原数', parts: ['没有谁正好读 7 页', '7 是"重新分"出来的'] }
    ],
    'em-distribute': [
      { label: '每份都乘', parts: ['25 × (4 + 2)', '25 × 4 ＋ 25 × 2', '100 + 50 = 150'] },
      { label: '漏乘', parts: ['25 × 4 + 2', '2 没有乘到', '102，错'] }
    ],
    'em-direction': [
      { label: '谁相对谁', parts: ['先定观察点（以谁为中心）', '"A 在 B 的东北"，以 B 为中心', '反过来：B 在 A 的西南'] },
      { label: '风向', parts: ['北风', '从北边吹来', '不是吹向北边'] }
    ]
  },

  /* 知识重点（★）：考前必须过的节点，及一句理由。 */
  keyNodes: {
    kenton: {
      math: { 'km-scale': '小数乘法的大小和点位', 'km-quotient': '小数除法先动除数', 'km-round': '近似数最容易丢末尾 0', 'km-rate': '单价 × 数量，应用题主干' },
      chinese: { 'kc-question': '简答题先看问什么', 'kc-cause': '概括只留主线', 'kc-poem': '古诗画面连到情怀' },
      english: { 'ke-plan': 'be going to 句型', 'ke-sense': '感官动词 + 形容词', 'ke-reading': '疑问词决定找什么' }
    },
    eddey: {
      math: { 'em-order': '运算顺序和括号', 'em-inverse': '倒推找原来的量', 'em-meaning': '中间量是谁', 'em-direction': '方向以谁为中心' },
      chinese: { 'ec-question': '题问几件答几件', 'ec-cause': '概括只划本段', 'ec-word': '词语放回语境' },
      english: { 'ee-there': 'There is / are 看名词', 'ee-now': '一般现在 vs 正在进行', 'ee-some': 'some / any' }
    }
  },

  /* 语文、英语目前没有结构化的错题本，这里放家长交来的订正记录归纳（只写错因模式，不写卷名、题号）。 */
  notes: {
    eddey: {
      chinese: {
        'ec-question': { count: 2, source: '10 月校内阅读练习订正', lines: ['题目问两件事（为什么、怎么样），只答了一件；"怎么样"要回原文找机制。', '评价人物写成复述情节，没有评价词：答法是"评价词 + 文中事例"。'] },
        'ec-cause': { count: 3, source: '10 月校内阅读练习订正', lines: ['概括某一段，把下一段的内容也写进去了——概括只划本段。', '实验步骤题给了三个空，没按三个阶段分，还写了原文没有的步骤。', '写实验目的漏了"真的能"三个字——观点要说完整。'] },
        'ec-word': { count: 1, source: '10 月校内阅读练习订正', lines: ['"体无完肤"按字面义选，没有放回文中语境（文中指石头被勒得坑坑洼洼）。'] },
        'ec-precise': { count: 1, source: '10 月校内阅读练习订正', lines: ['判断题：原文"有火种、吃烤熟的食物"被换成"吃了味道鲜美的食物"，没逐句对原文就打了 ✓。'] },
        'ec-memory-4': { count: 2, source: '10 月校内练习订正', lines: ['"尽管"的"尽"读 jǐn，不读 jìn。', '《精卫填海》"常衔西山之木石"曾写成"常衔于西山之木"：多了"于"，漏了"石"。'] }
      }
    }
  },

  /* 考试范围（家长告知）：只到第几单元，之后的单元在脑图里收起。没写的科目按正式站全部内容。 */
  examScope: {
    kenton: { english: 4 },
    eddey: { english: 4 }
  },
  examScopeNote: '家长 2026-11-01：英语考试只到 Unit 4',

  /* 考场提醒：脑图下方三条，考前最后看一眼。 */
  reminders: {
    kenton: {
      math: ['先估大小再动笔；小数点最后点回去。', '算完用乘法验算，商里的 0 别丢。', '单位、近似数的要求圈出来，答完回看一眼。'],
      chinese: ['先圈题目问什么、问几件，再回原文划句。', '概括只划本段；评价 = 评价词 + 事例。', '交卷前数空，判断题逐句对原文。'],
      english: ['先看主语，再定 be / do 的形式。', '疑问词决定答案找什么：what / where / how。', '答句写完整句，别只写一个词。']
    },
    eddey: {
      math: ['有括号先算括号；同级从左到右。', '倒推题先撤销最后一步。', '方向题先定"以谁为中心"，再说方向。'],
      chinese: ['圈题干：问什么、问几件；每件都答。', '回原文划句：概括只划本段，判断逐句对。', '交卷前数空，一个也别漏。'],
      english: ['There is / are：先看后面的名词单复数。', '正在进行要有 be + 动词 ing。', '问句看开头：Is / Are / Do / Does 怎么答就怎么回。']
    }
  }
};
