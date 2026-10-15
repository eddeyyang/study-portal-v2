# Preply 课前复习软件 — 开发规范与内容文档

> 这份文档记录了为 Kenton（10岁）和 Eddey（9岁）制作的 Preply 外教课前复习 HTML 软件的**完整设计规范、技术实现和学习内容**。
> 用途：交给 Claude Code 维护、扩展，或基于此规范为新的课程生成新软件。
> 所有软件均为**单文件 HTML**（内嵌 CSS + JS，无外部依赖），可直接在手机/平板/电脑浏览器打开。

---

## 一、产品定位

| 项 | 说明 |
|---|---|
| 使用对象 | 9-10 岁中国小学生（Kenton 10岁 / Eddey 9岁），英语基础一般，不适合大量打字 |
| 使用场景 | Preply 外教课**前** 5-15 分钟快速热身复习 |
| 数据来源 | 每节 Preply 课后报告（PDF 截图或文字）：主题、核心词、薄弱点、发音准确率、外教纠正的错句 |
| 核心目标 | 不是普通背单词，而是**把外教反馈里的真实错误转成孩子能练会的小游戏和句型练习**，带着能说出口的句子进课堂 |
| 交付物 | 每节课一个独立的单文件 HTML 应用 |

### 核心教学逻辑（每次生成软件都要遵循）

1. **先提取课后报告信息**：主题、句型、核心词、孩子表现好/差的点、外教纠正的错误、同义词、语法点、发音问题
2. **再把问题转成孩子能练的能力点**（不要照抄报告术语）：
   - 单词不会认 → 看图/听音选词
   - 会词不会说句 → 句型练习
   - 复数漏 s → 复数修复关
   - 用词不地道 → 地道说法二选一
   - 句子顺序乱 → 拖拽排句
   - 发音不熟 → 听示范 + 慢速跟读
3. **用儿童能懂的话解释每个知识点**（中文 + 例子，不用成人语法术语）

---

## 二、强制默认功能（每个软件都必须有）

这些是长期固定规则，无论哪节课都要自动包含：

### 1. 长按看中文翻译 ★关键
- 所有英文单词/句子支持**长按**（手机 500ms 阈值）或**双击**（电脑）弹出中文翻译气泡
- 外教全英文授课，很多词孩子不认识，这个功能极大降低理解门槛
- 英文文本用 `.en` class 标记，带虚线下划线提示
- 气泡里含一个慢速朗读按钮 🔊

### 2. 缩写字母发音预处理 ★关键
- `PE / TV / USA / UK / CD / DVD / PC / AI` 等缩写，必须用 `.replace()` 转成带空格的字母形式再交给 `speechSynthesis`
- 例：`text.replace(/\bPE\b/g, 'P E')`，否则浏览器把 "PE" 当普通词读错

### 3. 首页"测试声音"按钮 + 无自动朗读 ★关键
- 首页必须有"🔊 测试声音"按钮，用于解锁手机端（尤其 iOS Safari）的朗读权限
- **绝不自动播放任何音频**，所有朗读都由用户点击小喇叭触发

### 4. 选择题答题前不许朗读答案 ★关键（避免报答案 bug）
- 有**唯一正确答案**的选择题（There is/are、复数 s、garage vs car park、地道用词等），**答题前的题目和选项绝对不能被朗读出来**，否则等于报答案
- 实现：用"只翻译不朗读"的标记（`enT()` 函数 + `.noread` class），长按这类英文**只弹中文翻译、不显示朗读按钮**
- **可以正常朗读**的情况：答题后的反馈区、听力判断题（听句子判对错）、读单词选中文这类关卡

### 5. 双人独立存档
- Kenton 和 Eddey 各自独立的 `localStorage` 记录，互不干扰
- key 规则：`preply<课程名>_<kid>`，例如 `preplyActivities_kenton`
- **每个软件用不同的 key 前缀**，不同课程之间也互不干扰

### 6. 界面风格
- 单文件 HTML，粉色 / 蓝色 / 黄色 / 薄荷绿配色
- 大按钮、大字体、卡片式布局、手机竖屏友好
- 一屏只做一件事，每关有清楚标题，每题反馈明显

---

## 三、技术实现要点

### 朗读（Web Speech API）

```javascript
// 全局语音状态
let voicesReady = false, enVoice = null, voiceUnlocked = false;

// 异步加载英文语音（手机要等 voices 加载完）
function loadVoices() {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;
  enVoice = voices.find(v => v.lang === 'en-US')
         || voices.find(v => v.lang && v.lang.startsWith('en-US'))
         || voices.find(v => v.lang && v.lang.startsWith('en'))
         || voices[0];
  voicesReady = true;
}
if ('speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined)
    window.speechSynthesis.onvoiceschanged = loadVoices;
  // iOS Safari 长时间不用会暂停，每 10 秒唤醒
  setInterval(() => { if (window.speechSynthesis.paused) window.speechSynthesis.resume(); }, 10000);
}

// 首次点击解锁朗读权限（播放空白音）
function unlockVoice() {
  if (voiceUnlocked || !('speechSynthesis' in window)) return;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); voiceUnlocked = true; } catch(e) {}
}

function speak(text, slow = false) {
  if (!('speechSynthesis' in window)) { alert('请用最新版 Chrome / Safari / Edge 打开'); return; }
  // 缩写字母预处理
  let t = text.replace(/\bPE\b/g,'P E').replace(/\bTV\b/g,'T V')
              .replace(/\bUK\b/g,'U K').replace(/\bUSA\b/g,'U S A')
              .replace(/\bCD\b/g,'C D').replace(/\bDVD\b/g,'D V D')
              .replace(/\bPC\b/g,'P C').replace(/\bAI\b/g,'A I');
  window.speechSynthesis.cancel();        // iOS 必须先 cancel，否则第二次不响
  if (!voicesReady) loadVoices();
  setTimeout(() => {                       // 用 setTimeout 包一层，iOS cancel 后立刻 speak 会失败
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'en-US'; u.rate = slow ? 0.55 : 0.9; u.pitch = 1.05; u.volume = 1;
    if (enVoice) u.voice = enVoice;
    window.speechSynthesis.speak(u); voiceUnlocked = true;
  }, 50);
}
```

**iOS Safari 三大坑（必须处理）：**
1. 首次必须用户手势解锁 → `unlockVoice()` + 测试声音按钮
2. 第二次点不响 → 每次 `speak()` 先 `cancel()`，再 `setTimeout` 包裹
3. 长时间不用会"睡着" → 每 10 秒 `resume()`

### 长按翻译 + 只翻译不朗读

```javascript
// en(): 可长按翻译 + 可朗读
function en(text) {
  const safe = String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<span class="en">${safe}</span>`;
}
// enT(): 只翻译、不朗读（用于有唯一答案的选择题题目和选项）
function enT(text) {
  const safe = String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<span class="en noread">${safe}</span>`;
}

// 气泡：noRead 为 true 时不渲染朗读按钮
function showTranslationBubble(text, x, y, noRead) {
  const trans = getTranslation(text);
  if (!trans) return;
  const speakBtn = noRead ? '' : `<button class="bubble-speak" onclick="...speak('${text}', true)">🔊 听</button>`;
  // ...弹出气泡，含 英文原文 + 中文翻译 + (可选)朗读按钮
}

// 长按检测：touchstart 计时 500ms，touchmove/touchend 取消
// 检测 el.classList.contains('noread') 决定 noRead 参数
```

`DICT` 是一个中英对照字典对象，`getTranslation()` 先整句匹配、再小写匹配、最后逐词组合翻译。

### 进度记录（localStorage）

```javascript
let history = { wrong:[], pronCount:{}, days:[], totalCorrect:0, totalTried:0 };

function saveProgress() {
  localStorage.setItem('preply<课程>_' + currentKid,
    JSON.stringify({ stars, history, lastDate: new Date().toISOString() }));
}
function logWrong(tag, q, your, right) { history.wrong.push({tag,q,your,right,time:Date.now()}); history.totalTried++; saveProgress(); }
function logRight() { history.totalCorrect++; history.totalTried++; stars++; saveProgress(); }
```

错题按 `tag`（错因分类）记录，家长页据此统计最薄弱的点并给建议。

---

## 四、应用结构

### 三种模式

| 模式 | 内容 | 时长 |
|---|---|---|
| 📚 每日复习 | 全部关卡（约 11 关） | 8-10 分钟 |
| ⚡ 课前 5 分钟冲刺 | 精选重点关卡（核心语法 + 复数 + 发音 + 对话） | ~5 分钟 |
| 📒 错题回看 | 自动调出最近答错的题再练一遍 | 视错题量 |

冲刺模式用 `_short` 后缀的关卡（题量减半），如 `there_short` / `plural_short` / `pron_short` / `dialog_short`。

### 关卡引擎

```javascript
let stageSeq = [];   // 当前模式的关卡序列
let seqIdx = 0;      // 当前在第几关
let subIdx = 0;      // 关卡内第几题
let subState = {};   // 关卡内临时状态

function runStage() { /* 根据 stageSeq[seqIdx] switch 到对应 render 函数 */ }
function nextStage() { seqIdx++; updateProgress(); runStage(); }
```

每个关卡有一个 `render<关卡>()` 入口和 `render<关卡>One()` 渲染单题、`pick<关卡>(i)` 处理作答。

### 通用关卡类型库（可复用模板）

| 类型 | 说明 | 朗读规则 |
|---|---|---|
| 听音选词 | 点喇叭听英文词 → 选中文意思 | 读单词 ✅（不算答案） |
| 词分类 | 看词选类别（房间/活动、科目/非科目、陆上/天上交通等） | 读词 ✅ |
| There is/are / 二选一语法 | 填空选 is/are、should/shouldn't 等 | 题目选项 ❌（用 enT），反馈 ✅ |
| 复数 s 修复 / 改错关 | 先看错句→看对句→练同类题（也用于一般句子改错） | 题目选项 ❌，讲解/反馈 ✅ |
| **过去式（Past Simple）** | 三选一选正确过去式（go→went, eat→ate, 规则加 -ed），带知识点提示框 | 题目选项 ❌（用 enT），反馈 ✅ |
| 听音判对错 | 听句子判断 True/False（模仿课堂听力） | 句子 ✅（听是题目核心） |
| 同义词配对 | 左右两列点选配对 | 词 ✅ |
| 地道说法 / 介词冠词二选一 | 选更自然的说法、选 by/the/a | 题目选项 ❌，反馈 ✅ |
| 发音跟读 | 听示范/慢速 + "我跟读了"计次 | 读词 ✅ |
| 拖拽排句子 | 点单词卡按顺序拼句 + 分步提示 | 答后读完整句 ✅ |
| 外教对话模拟 | 老师问、孩子点选回答，结尾生成口语小总结 | 读问题/回答 ✅ |

**新增关卡（过去式）的实现要点**（首次出现在 `preply-travel-vocabulary.html`）：
- 数据数组 `Q_PASTTENSE`，每题 `{ q, opts, a, explain }`，选项是动词的不同形式
- 三个函数：`renderPastTense(limit)` / `renderPastTenseOne()` / `pickPastTense(i)`，仿照二选一语法关卡，但选项为三选一
- 题目和选项用 `enT()`（不报答案），顶部有橙色知识点提示框区分规则/不规则动词
- 注册：`stageSeq` 中加 `'pasttense'`（建议放在听力判断后）；`runStage` 的 switch 加 `case 'pasttense': renderPastTense(); break;` 和 `case 'pasttense_short': renderPastTense(4); break;`
- 错题 tag 用 `'过去式'`，家长页对应建议：列出常见不规则动词变化

### 家长页

显示：累计星星、正确率、练习天数、**错因分类统计**（按 tag）、发音练习次数、最近 5 道错题、针对最薄弱点的下次建议。底部有"清空记录"按钮。

---

## 五、已交付软件清单

| 文件 | 课程主题 | localStorage key |
|---|---|---|
| `preply-review.html` | 情绪与感觉（Feelings）— 最早的示例版 | `preply_<kid>` |
| `preply-school-routines-v3.html` | 学校科目和课堂日常（School Subjects & Routines） | `preplyV2_<kid>` |
| `preply-rooms-and-houses.html` | 描述房间和房屋（Describing Rooms & Houses） | `preplyRooms_<kid>` |
| `preply-rooms-and-activities.html` | 房间和好玩的活动（Rooms & Fun Activities） | `preplyActivities_<kid>` |
| `preply-travel-vocabulary.html` | 交通出行 + should 建议 + 过去式（Travel & Transport）— 合并两节课 | `preplyTravel_<kid>` |
| `preply-choosing-travel-destinations.html` | 选旅行目的地（Choosing Travel Destinations） | `preplyCTD_<kid>` |
| `preply-summer-comparisons.html` | 夏天 + 比较级（Summer Comparisons） | `preplySC_<kid>` |
| `preply-going-to-beach.html` | going to 将来计划 + 海滩描述（Practicing 'going to'）— **最新，含预合成真人音** | `preplyGT_<kid>` |

> 注：`preply-travel-vocabulary.html` 由两节课合并而成 —— "Everyday Travel Vocabulary"（日常旅行词汇）+ "Transport and 'should' advice"（交通工具和 should 建议）。它是目前唯一一个**合并多节课**的软件，也是新增"过去式关卡"的首个软件，可作为后续合并课程的范例。

---

## 六、各节课的学习内容（数据明细）

> 以下是每个软件内置的题库内容，按课程整理。新增课程时按相同结构追加。

### 课程 1：Feelings & Emotions（情绪与感觉）

- **核心词**：happy, sad, embarrassed, jealous, confused, bored, relaxed, nervous, scared, tired
- **核心句型**：I feel ... when ... / He/She is ... because ...
- **薄弱点**：
  - 代词错误：用 One 代替 He/She（`One is embarrassed` → `He is embarrassed`）
  - 介词错误：`on English class` → `in English class`
  - because 后接原因说不完整
  - 情绪词混淆

### 课程 2：School Subjects & Classroom Routines（学校科目和课堂日常）

- **核心词**：math, English, science, music, art, PE, social studies, computer studies, lesson, homework, lunch, break time, classroom
- **核心句型**：Today we have ... / We don't have ... / are having
- **薄弱点（外教纠正的真实错句）**：
  - be + doing：`They are have lessons.` → `They are having lessons.`
  - 动词乱叠：`I play sing.` → `I sing.`
  - 代词 that/it：`we haven't got that` → `we don't have it`
  - 句子顺序乱：`I could they we doesn't laugh.` → `I could make them laugh.`
  - cost/course 混淆 + 介词：`Science is a cost English.` → `Science is a course in English.`
- **发音弱点**：excited 24% / school 29% / picture 31% / friendly 64%

### 课程 3：Describing Rooms & Houses（描述房间和房屋）

- **核心词（9个）**：kitchen(A1), holiday(A1), degree(A2), garden(A1), dining room(A2), mirror(B2), amazing(B1), verify(B2), comfortable(A2)
- **同义词**：bathroom↔restroom / sofa↔couch / bag↔backpack
- **核心知识点**：There is（单数）/ There are（复数）
- **薄弱点（外教纠正的真实错句）**：
  - 复数 s：`There are four bedroom.` → `bedrooms`；`two bathroom` → `bathrooms`
  - 用词：`can't listen or see the video` → `can't watch or hear`
  - 冠词 + 所有格：`today is tell children holiday` → `today is a holiday for children`
- **发音弱点**：kitchen 65% / degree 43% / garden 48% / holiday 54%

### 课程 4：Rooms & Fun Activities（房间和好玩的活动）— 最新

- **核心词（9个）**：bedroom(A1), balcony(A2), dining(A2), kitchen(A1), garage(A2), tree house(A2), computer(A1), swimming(A1), slide(A1)
- **同义词**：amazing↔incredible / fun↔enjoyable / only↔just
- **核心知识点**：There is（单数）/ There are（复数）；楼层（second floor）；garage vs car park
- **课堂三大主题**：
  1. 听力判断房子信息（楼层有没有阳台、garage vs car park 用图区分）
  2. 数房间（卧室/浴室/餐厅），纠正复数
  3. 谈论好玩的活动（swimming / slide / tree house），鼓励长句 "I like swimming in the pool"
- **薄弱点（外教纠正的真实错句）**：
  - 复数 s：`three bathroom` → `bathrooms`；`four bedroom` → `bedrooms`
  - 地道用词：`I have a computer license.` → `I'm certified in computer skills.`
  - 地道用词：`We have computer class.` → `We take computer classes.`
- **发音弱点**：swimming 69% / rooms 40% / bathroom 46% / second 65%
- **表现良好**：`The Second Floor is amazing.` / `There is only one dining room.`（主谓一致正确）

**第 4 课的 11 关序列**（代码实际值，供参考）：
```
每日复习: listen, category, there, plural, hannah, synonyms, watchhear(=garage), article(=wordform), pron, drag, dialog, done
冲刺模式: there_short, plural_short, pron_short, dialog_short, done
```
> 注：第 4 课复用了第 3 课的代码框架，`watchhear` 关卡函数实际承载 garage vs car park 内容，`article` 关卡函数实际承载"地道说法"内容（函数名沿用，数据已替换）。

### 课程 5：Travel & Transport + should 建议 + 过去式 — **最新（合并两节课）**

> 这是首个**合并多节课**的软件，也是首个新增"过去式关卡"的软件。文件 `preply-travel-vocabulary.html`，key 前缀 `preplyTravel_`。

合并的两节 Preply 课：
- **5A · Everyday Travel Vocabulary（日常旅行词汇）**
- **5B · Transport and 'should' advice（交通工具和 should 建议）**

- **核心词汇（两课合并）**：transport(B1), motorbike(A2), supercar(B2), timetable(A2), bus stop(A1), comfortable(A2), sore(A2), delicious(A2), destination(B1/A2), boarding pass(A2), pilot(A2), expensive(A2), homework(A1), tired(A1), exciting(A2), passenger(A2), suitcase(A2), air hostess
- **同义词（两课合并，6 对）**：like↔enjoy / take↔ride / go↔travel / many↔numerous / problems↔issues / walk↔stroll
- **核心知识点（两个）**：
  1. **Modal verbs（should / shouldn't）**：给建议。You should sleep for eight hours. / You shouldn't eat chocolate every day.
  2. **Past simple tense（过去式）— 新增重点**：说过去的事。不规则 go→went, eat→ate, take→took, make→made；规则加 -ed（walk→walked, wait→waited）。I went to the shopping mall. / I ate sushi.
- **薄弱点（两课外教纠正的真实错句，已全进改错关）**：
  - `I use a bus car.` → `I take the bus.`（地道说法）
  - `I love traveling car.` → `I love traveling by car.`（介词 by）
  - `He is bus driver and bus man.` → `He is a busman.`（加 a + 合并）
  - `I want to be No.` → `I want to be number one.`（缩写读全）
  - `John take bus to school.` → `John takes the bus to school.`（动词加 s + the）
  - `Can you think bus driver is expensive.` → `Do you think the bus driver is expensive?`（问句 + the）
  - `He wants to every in London.` → `He wants to be in London.`（用 be）
- **发音弱点（两课合并，取最差）**：timetable 31% / expensive 33% / destination 34% / comfortable 34% / passengers 36% / motorbike 49%
- **表现良好**：`I go to school by car.`（by 介词）/ `He is a bus driver.`（冠词 a）/ `You should not eat chocolate.`（should not）/ `I take the bus to school every day.`（the + every day）/ `I have been to Australia.`（现在完成时）

**第 5 课的 12 关序列**（代码实际值）：
```
每日复习: listen, category(陆上vs天上), there(=should/shouldn't), plural(=改错关), hannah(=判对错), pasttense(过去式·新增), synonyms, watchhear(=by+冠词), article(=地道说法/问句), pron, drag, dialog, done
冲刺模式: there_short, plural_short, pasttense_short, pron_short, dialog_short, done
```
> 注：沿用前几课框架，`there` 关卡承载 should/shouldn't，`plural` 关卡（看错→看对→练格式）承载句子改错，`watchhear` 承载 by+冠词，`article` 承载地道说法/问句。`pasttense` 是**新写的关卡**（见第四部分"通用关卡类型库"的实现要点）。

### 课程 8：Practicing 'going to'（going to 将来计划 + 海滩描述）— **最新**

> 文件 `preply-going-to-beach.html`。旧数据 key 前缀为 `preplyGT_`；v2 自动迁移到 `dd:<kid>:preply-going-to:v2`。课程日期 2026-07-09（Denys，50 分钟，孩子发言 23 分钟/49%）。
> 首个准备接入**预合成真人音**的新版软件：`_manifest.json` 已维护完整清单；当前仓库仍无 Aria mp3，故 `AUDIO_DIR` 暂为空并直接回退浏览器 TTS，避免逐句 404。回爸爸电脑按清单生成后再恢复 `audio/preply-going-to/`。

- **核心词汇（12个）**：sand castle(A2), beach ball(A2), sunglasses(A2), swimming shorts(A2), bikini(A2), flip flop(A2), starfish(A2), shell(A2), boat(A1), medium(A2), rainy(A2), cool(B1)
- **同义词（3对）**：holiday↔break / homework↔assignments / small↔tiny
- **核心知识点**：
  1. **Future with going to**：说将来计划 = be(am/is/are) + going to + 动词原形。I am going to drink Coca Cola tomorrow. / They are going to live in Argentina next month.
  2. **be 配人称**：I→am，He/She→is，You/We/They→are，Oliver and I（=我们）→are。课上换人称造句。
  3. **现在进行时 ≠ 将来计划**：are eating（正在吃）→ are going to eat（明天打算吃）。课堂练习就是"把现在的句子改成 going to + tomorrow/next week/month"。
  4. **缩写**：I am going to → I'm going to（课上专门练了）。
- **课堂三大环节**：① 描述海滩图片（说物品/数人数/天气 sunny not rainy/感受 happy hot cool）② going to 说计划（换人称+改时态）③ 发音纠错（choral repetition 全班跟读）
- **薄弱点（外教纠正的真实错句）**：
  - 时态：`Oliver and I are eating chocolate tomorrow.` → `are going to eat`（现在进行时≠将来计划）
  - 单复数+列举：`He bought an umbrella and a hat, sunglasses, and a shoe.` → `an umbrella, a hat, sunglasses, and a pair of shoes.`（列举用逗号+鞋子论 a pair of）
  - 语序/动词：外教纠正到 `He is going to visit Spain next week.`（going to 前别丢 be）
- **发音弱点**：burgers 39% / eating 57% / medium 59% / sunglasses 66%
- **表现良好（外教夸了）**：`He is going to eat a hamburger for dinner tomorrow.`（时态）/ `I can see a car and three people.`、`many colors`、`two people`（单复数，含不规则 people）/ `I like a small cat.`（冠词）

**第 8 课的模块序列**（新框架：模块地图自由选，不再是线性关卡）：
```
recap(学了啥) → machine(going to 造句机：人称×动作芯片，be 自动变身) → timemachine(将来时光机：are eating→are going to eat 分步动画)
→ contract(缩写压缩机 I am→I'm) → pron(发音诊所+录音自测) → hospital(句子小医院·真实纠错)
→ beach(海滩寻宝·可点场景) → syn(同义词升级器) → vocab(单词翻卡) → quiz(小测验) → report(家长页)
```

### 课程 9：Practicing 'going to' plans（露营与滑雪）— 2026-07-18 合并升级

> 继续使用 `preply-going-to-beach.html`，不覆盖第 8 课海滩模块；首页按 `07·18 新课复习 → 07·09 旧课回看` 分组。两娃共用同一软件，但 v2 存储键、尝试、错题本和导出均按孩子隔离。

- **课堂路线**：① 跟读并修正 going to 句子；② 露营词汇与短对话；③ 初识滑雪词汇并看图说话。
- **核心结构**：`subject + be(am/is/are) + going to + 动词原形 + time`。
- **27词原序收录**：library, air conditioner, tent, camp, campfire, backpack, walking boot, sock, rain jacket, cap, glove, sleeping bag, rucksack, rain coat, skiing, snowboarding, cable car, mountain, snow, scarf, pole, goggle, ski, sushi, camping, excited, trainer。
- **5条正向反馈**：going to go on a camping trip / share a tent with Amy / go camping on holiday / My family is going to come / camp with my mom。
- **4条改进**：husband's 所有格；Walking→walking；campaign→camping 并修语序；transfer/to→travel/too。
- **证据校正**：报告把 `I'm not going to wear Walking boots.` 改成 `I won't wear walking boots.`；软件明确说明原 going to 结构本身正确，语法必改只有句中小写，`won't` 是更自然的风格改写。
- **新增模块**：计划小火车、露营打包台、滑雪路线图、课堂反馈实验室、27词图卡、独立对话任务、错题两连对回炉；家长页补 JSON/Markdown 导出与同孩子 JSON 导入。

---

## 七、新增课程的工作流

每收到一节新课的 Preply 报告：

1. **提取**：主题、核心词（含 CEFR 等级）、同义词、核心知识点、外教纠正的错句、发音准确率、表现良好的点
2. **复制最新软件做基础**（目前是 `preply-travel-vocabulary.html`，它已含过去式关卡，是最完整的范例），保留全部框架和强制默认功能
3. **替换数据块**：`Q_LISTEN` / `Q_CATEGORY` / `Q_THERE` / `Q_PLURAL` / `Q_HANNAH` / `Q_PASTTENSE` / `Q_SYNONYMS` / 各专项关卡 / `Q_PRON` / `Q_DRAG` / `Q_DIALOG` / `DICT`（词典）
4. **更新**：首页标题文案、`localStorage` key 前缀（新课用新前缀，避免和旧课冲突）、家长页"给家长的话"和建议逻辑
5. **检查清单**：
   - [ ] 有唯一答案的选择题题目和选项用 `enT()`（不报答案）
   - [ ] 缩写字母在 `speak()` 里有转换
   - [ ] 首页有测试声音按钮，无自动朗读
   - [ ] 双人 key 独立、和旧课不冲突
   - [ ] `DICT` 词典覆盖本课所有英文词
   - [ ] JS 语法校验通过（`node --check`）

---

## 八、命名与文件约定（给 Claude Code）

- 每节课一个独立 HTML 文件，命名 `preply-<主题英文短横线>.html`
- localStorage key 前缀 `preply<驼峰主题>_`，每课唯一
- 单文件，不拆分，不引外部资源
- 代码保留中文注释，方便后续按 Kenton / Eddey 扩展不同难度
- **合并多节课时**（如 `preply-travel-vocabulary.html` 合并了旅行+交通两课）：保持同一文件名和 key（孩子进度不丢），把两课的词汇/同义词/改错/发音题库合并去重，关卡数据数组各自扩充；若新课带来全新知识点（如过去式），按"通用关卡类型库"的实现要点新增独立关卡并注册进 `stageSeq` 和 `runStage` 的 switch。
