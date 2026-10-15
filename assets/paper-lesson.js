(function paperLessonPage() {
  'use strict';

  const archive = window.DDPaperArchive;
  const sync = window.DDLearningSync;
  const $ = (id) => document.getElementById(id);
  const query = new URLSearchParams(location.search);
  const child = archive.validChild(query.get('who'));
  const paperId = String(query.get('paper') || '').trim().slice(0, 120);
  const requestedQuestionId = String(query.get('question') || '').trim().slice(0, 120);
  const childMeta = {
    kenton: { name: 'Kenton', emoji: '🦁', accent: '#36c5d6', dark: '#127889', soft: '#e3fbff' },
    eddey: { name: 'Eddey', emoji: '🐯', accent: '#ff8a5b', dark: '#a84a25', soft: '#fff0e6' }
  };
  const STAGE_GROUPS = {
    look: 'look', diagnose: 'look', teach: 'learn', recall: 'learn',
    answer: 'return', repair: 'return', transfer: 'return'
  };

  let paper = null;
  let selectedQuestionId = '';
  let stage = 'look';
  let usedHint = false;
  let sessionTouched = new Set();
  let cropUrl = '';
  let progress = { schemaVersion: 2, questions: {}, updatedAt: '' };

  function meta() {
    return childMeta[child] || childMeta.eddey;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function progressKey() {
    return `dd:paper-progress:v1:${child}:${paperId}`;
  }

  function loadProgress() {
    try {
      const stored = JSON.parse(localStorage.getItem(progressKey()) || 'null');
      if (stored && stored.questions && typeof stored.questions === 'object') {
        progress = stored;
        Object.values(progress.questions).forEach(state => {
          // Old counters did not retain delayed-retest evidence.
          if (progress.schemaVersion !== 2) {
            state.legacyIndependentCorrect = Number(state.independentCorrect) || 0;
            state.legacyResolved = state.resolved === true;
            state.independentCorrect = 0;
          }
          state.resolved = false;
        });
        progress.schemaVersion = 2;
      }
    } catch (_) {}
  }

  function saveProgress() {
    progress.updatedAt = new Date().toISOString();
    localStorage.setItem(progressKey(), JSON.stringify(progress));
  }

  function questionProgress(questionId) {
    if (!progress.questions[questionId]) {
      progress.questions[questionId] = {
        independentCorrect: 0,
        rounds: 0,
        visited: false,
        resolved: false,
        lastAt: ''
      };
    }
    return progress.questions[questionId];
  }

  function selectedQuestion() {
    return paper && paper.questions.find((question) => question.id === selectedQuestionId) || null;
  }

  function teachingFor(question) {
    const stored = question && question.teaching;
    if (stored && Array.isArray(stored.steps) && stored.steps.length) return stored;
    return archive.buildTeaching({ ...question, subject: paper.subject }, child);
  }

  function setAccent() {
    const value = meta();
    document.documentElement.style.setProperty('--paper-accent', value.accent);
    document.documentElement.style.setProperty('--paper-accent-dark', value.dark);
    document.documentElement.style.setProperty('--paper-soft', value.soft);
    $('lessonEmoji').textContent = value.emoji;
    $('lessonBack').href = `mistakes.html?who=${encodeURIComponent(child)}`;
    $('backToArchive').href = `mistakes.html?who=${encodeURIComponent(child)}`;
  }

  function updateStageProgress() {
    const group = STAGE_GROUPS[stage] || 'look';
    document.querySelectorAll('[data-lesson-progress]').forEach((item) => {
      item.classList.toggle('active', item.dataset.lessonProgress === group);
    });
  }

  function masteryHtml(questionId) {
    const state = questionProgress(questionId);
    return `<div class="mastery-meter">本机独立作答：${state.independentCorrect} 次 <span class="mastery-dots"><i class="${state.independentCorrect >= 1 ? 'on' : ''}"></i><i class="${state.independentCorrect >= 2 ? 'on' : ''}"></i></span><br>提示后做对记为订正；是否解决还要看隔天独立复测。</div>`;
  }

  function renderQuestionList() {
    const list = $('lessonQuestionList');
    list.innerHTML = '';
    paper.questions.forEach((question, index) => {
      const state = questionProgress(question.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `lesson-question${question.id === selectedQuestionId ? ' active' : ''}${state.resolved ? ' resolved' : ''}`;
      button.innerHTML = `<b>第 ${escapeHtml(question.number || index + 1)} 题 · ${escapeHtml(question.knowledgeTag || '待回炉')}</b><span>独立作答 ${state.independentCorrect} 次 · 待隔天复测</span>`;
      button.onclick = () => selectQuestion(question.id);
      list.appendChild(button);
    });
  }

  function revokeCrop() {
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    cropUrl = '';
  }

  async function makeCrop(question) {
    revokeCrop();
    const page = paper.pages.find((item) => item.id === question.pageId);
    if (!page || !page.blob || typeof createImageBitmap !== 'function') return '';
    const bitmap = await createImageBitmap(page.blob);
    const bounds = archive.normalizeBounds(question.bounds);
    const paddingX = Math.min(0.02, bounds.x, 1 - bounds.x - bounds.width);
    const paddingY = Math.min(0.015, bounds.y, 1 - bounds.y - bounds.height);
    const x = Math.max(0, bounds.x - Math.max(0, paddingX));
    const y = Math.max(0, bounds.y - Math.max(0, paddingY));
    const width = Math.min(1 - x, bounds.width + Math.max(0, paddingX) * 2);
    const height = Math.min(1 - y, bounds.height + Math.max(0, paddingY) * 2);
    const sx = Math.floor(bitmap.width * x);
    const sy = Math.floor(bitmap.height * y);
    const sw = Math.max(1, Math.floor(bitmap.width * width));
    const sh = Math.max(1, Math.floor(bitmap.height * height));
    const scale = Math.min(1, 1400 / Math.max(sw, sh));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    if (!blob) return '';
    cropUrl = URL.createObjectURL(blob);
    return cropUrl;
  }

  async function originalHtml(question) {
    const url = await makeCrop(question).catch(() => '');
    const fallback = question.questionText
      ? `<div class="original-text">${escapeHtml(question.questionText)}</div>`
      : '<div class="original-text">请看上传设备上的原卷红框区域；这道题的题干尚未录入文字。</div>';
    return `<div class="original-view">${url ? `<div class="original-crop"><img src="${url}" alt="第 ${escapeHtml(question.number)} 题原卷区域"></div>` : fallback}</div>`;
  }

  function button(label, action, kind = 'primary') {
    return `<button class="paper-btn ${kind}" type="button" data-action="${action}">${label}</button>`;
  }

  async function renderStage() {
    const question = selectedQuestion();
    if (!question) return;
    updateStageProgress();
    renderQuestionList();
    const teaching = teachingFor(question);
    const original = (stage === 'look' || stage === 'answer' || stage === 'repair')
      ? await originalHtml(question)
      : '';
    let html = '';

    if (stage === 'look') {
      html = `
        <span class="lesson-stage-tag">第 1 步 · 只看原题</span>
        <h2>第 ${escapeHtml(question.number || '?')} 题，先找它到底在问什么</h2>
        <p class="lead">${child === 'kenton' ? '先说结构和条件，不急着算或写答案。' : '用手指圈出关键词，一次只看一小步。'}</p>
        ${original}
        <div class="lesson-panel"><h3>先自己观察</h3>不看正确答案，指出题目里的对象、条件和问题。想清楚后再继续。</div>
        ${masteryHtml(question.id)}
        <div class="lesson-actions">${button('我看清题目了 →', 'diagnose')}</div>`;
    } else if (stage === 'diagnose') {
      html = `
        <span class="lesson-stage-tag">第 2 步 · 找卡点</span>
        <h2>这题主要卡在：${escapeHtml(question.knowledgeTag || '待确认知识点')}</h2>
        <p class="lead">不是简单贴“粗心”标签，而是找到哪一步还没有自动化。</p>
        <div class="lesson-panel"><h3>${escapeHtml(question.errorType || '暂不确定')}</h3>${escapeHtml(teaching.diagnosis)}</div>
        <div class="lesson-actions">${button('看看正确方法 →', 'teach')}</div>`;
    } else if (stage === 'teach') {
      html = `
        <span class="lesson-stage-tag">第 3 步 · 分步讲懂</span>
        <h2>${escapeHtml(teaching.levelLabel || '适合你的讲解')}</h2>
        <p class="lead">${escapeHtml(teaching.explanation)}</p>
        <ol class="lesson-steps">${(teaching.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
        <div class="lesson-panel"><h3>记忆钩子</h3>${escapeHtml(teaching.memoryHook)}</div>
        <div class="lesson-actions">${button('合上提示，我来说 →', 'recall')}</div>`;
    } else if (stage === 'recall') {
      html = `
        <span class="lesson-stage-tag">第 4 步 · 遮住回忆</span>
        <h2>不看上一步，把方法说出来</h2>
        <p class="lead">${escapeHtml(teaching.recallPrompt)}</p>
        <div class="lesson-panel"><h3>可以说，也可以打几个关键词</h3><textarea class="lesson-answer" id="recallAnswer" rows="3" placeholder="这里不用写完整答案，只写你记住的方法"></textarea></div>
        <div class="lesson-actions">${button('我已经说清楚了 →', 'answer')}</div>`;
    } else if (stage === 'answer') {
      const exact = question.answerMode !== 'self_check' && question.correctAnswer;
      html = `
        <span class="lesson-stage-tag">第 5 步 · 回到同一道原题</span>
        <h2>现在独立重做第 ${escapeHtml(question.number || '?')} 题</h2>
        <p class="lead">${escapeHtml(teaching.originalPrompt)}</p>
        ${original}
        <div class="lesson-panel"><h3>写下这次答案</h3><textarea class="lesson-answer" id="originalAnswer" rows="4" autocomplete="off" placeholder="${exact ? '输入完整答案后核对' : '先独立完成，再按实际结果选择'}"></textarea></div>
        <div class="lesson-actions">${exact
          ? button('核对答案', 'check-answer', 'good')
          : `${button('我独立做对了', 'self-correct', 'good')}${button('我还没做对', 'self-wrong', 'danger')}`
        }</div>
        ${masteryHtml(question.id)}`;
    } else if (stage === 'repair') {
      html = `
        <span class="lesson-stage-tag">修复站 · 先修复再回原题</span>
        <h2>先把出错的一步补上</h2>
        <p class="lead">看答案不是结束。看完必须收起，再回到同一道原题重做。</p>
        ${original}
        <div class="repair-compare">
          <div><b>孩子原来的答案</b>${escapeHtml(question.studentAnswer || '原答案未录入')}</div>
          <div><b>正确答案或参考</b>${escapeHtml(question.correctAnswer || '请按家长确认标准自行对照')}</div>
        </div>
        <div class="lesson-panel"><h3>只修这一点</h3>${escapeHtml(teaching.explanation)}<br><br><b>${escapeHtml(teaching.memoryHook)}</b></div>
        <div class="lesson-actions">${button('收起答案，回到同一道原题 →', 'retry-same')}</div>`;
    } else if (stage === 'transfer') {
      // This practice screen does not collect delayed retests.
      html = `
        <span class="lesson-stage-tag">第 6 步 · 迁移与检查</span>
        <h2>${usedHint ? '这次订正完成，隔天再独立检查' : '这次独立完成，隔天再来检查'}</h2>
        <p class="lead">${escapeHtml(teaching.transferPrompt)}</p>
        <div class="lesson-panel"><h3>最后自己检查</h3>${escapeHtml(teaching.checkPrompt)}</div>
        ${masteryHtml(question.id)}
        <div class="lesson-actions">
          ${button('遮住提示，自己再做一次', 'new-round', 'primary')}
          ${button(nextQuestion(question.id) ? '先去下一题' : '完成这一轮', nextQuestion(question.id) ? 'next-question' : 'finish-session', 'ghost')}
        </div>`;
    }

    $('lessonStage').innerHTML = html;
    bindStageActions();
  }

  function setStage(next) {
    stage = next;
    $('lessonStatus').textContent = '';
    renderStage();
    $('lessonStage').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function recordEvent(question, correct, options = {}) {
    if (!sync || typeof sync.recordAttempt !== 'function') return false;
    return sync.recordAttempt({
      kid: child,
      subject: paper.subject,
      activity: options.activity || 'paper_original_attempt',
      topic: question.knowledgeTag || question.errorType || '卷子错题',
      item: question.questionText || `${paper.title} 第${question.number || '?'}题`,
      ok: correct,
      hint: options.hint || '',
      source: 'paper-lesson.html',
      payload: {
        schema_version: archive.SCHEMA_VERSION,
        evidence_source: 'portal',
        paper_id: paper.id,
        paper_question_id: question.id,
        independent: options.independent === true,
        used_hint: options.usedHint === true,
        knowledge_tag: question.knowledgeTag || '',
        lesson_stage: stage
      }
    });
  }

  function handleCorrect(question, independent) {
    const state = questionProgress(question.id);
    if (independent === true && !usedHint) state.independentCorrect += 1;
    state.resolved = false;
    state.visited = true;
    state.lastAt = new Date().toISOString();
    sessionTouched.add(question.id);
    saveProgress();
    recordEvent(question, true, { independent, usedHint });
    stage = 'transfer';
    renderStage();
  }

  function handleWrong(question) {
    const state = questionProgress(question.id);
    state.independentCorrect = 0;
    state.resolved = false;
    state.visited = true;
    state.lastAt = new Date().toISOString();
    sessionTouched.add(question.id);
    saveProgress();
    recordEvent(question, false, { independent: false, usedHint: false, hint: teachingFor(question).memoryHook });
    usedHint = true;
    stage = 'repair';
    renderStage();
  }

  function bindStageActions() {
    $('lessonStage').querySelectorAll('[data-action]').forEach((control) => {
      control.onclick = async () => {
        const action = control.dataset.action;
        const question = selectedQuestion();
        if (!question) return;
        if (['check-answer', 'self-correct', 'self-wrong'].includes(action) && stage !== 'answer') return;
        if (action === 'teach') usedHint = true;
        if (action === 'diagnose' || action === 'teach' || action === 'recall' || action === 'answer') {
          if (action === 'answer') {
            const recall = $('recallAnswer');
            recordEvent(question, null, { activity: 'paper_method_recall', hint: recall ? recall.value.slice(0, 300) : '' });
          }
          setStage(action);
          return;
        }
        if (action === 'check-answer') {
          const answer = $('originalAnswer').value;
          if (!answer.trim()) {
            $('lessonStatus').textContent = '先写下完整答案，再核对。';
            $('originalAnswer').focus();
            return;
          }
          if (archive.answerMatches(answer, question.correctAnswer)) {
            handleCorrect(question, !usedHint);
          } else {
            handleWrong(question);
          }
          return;
        }
        if (action === 'self-correct') { handleCorrect(question, !usedHint); return; }
        if (action === 'self-wrong') { handleWrong(question); return; }
        if (action === 'retry-same') {
          usedHint = true;
          setStage('answer');
          return;
        }
        if (action === 'new-round') {
          const state = questionProgress(question.id);
          state.rounds += 1;
          saveProgress();
          usedHint = false;
          setStage('answer');
          return;
        }
        if (action === 'next-question') {
          const next = nextQuestion(question.id);
          if (next) selectQuestion(next.id);
          return;
        }
        if (action === 'finish-session') await finishSession();
      };
    });
  }

  function nextQuestion(questionId) {
    const index = paper.questions.findIndex((question) => question.id === questionId);
    if (index < 0) return paper.questions[0] || null;
    return paper.questions[index + 1] || null;
  }

  function selectQuestion(questionId) {
    if (!paper.questions.some((question) => question.id === questionId)) return;
    selectedQuestionId = questionId;
    stage = 'look';
    usedHint = false;
    const state = questionProgress(questionId);
    state.rounds += 1;
    state.lastAt = new Date().toISOString();
    saveProgress();
    renderStage();
  }

  async function finishSession() {
    const touched = sessionTouched.size;
    let result = { ok: false, pending: 0 };
    if (sync && typeof sync.complete === 'function') {
      const saved = sync.complete({
        kid: child,
        subject: paper.subject,
        topic: `卷子回炉：${paper.title}`,
        item: `完成 ${touched || 1} 道卷子错题讲解`,
        source: 'paper-lesson.html',
        payload: {
          schema_version: archive.SCHEMA_VERSION,
          evidence_source: 'portal',
          paper_id: paper.id,
          reviewed_questions: Array.from(sessionTouched),
          resolved_questions: paper.questions
            .filter((question) => questionProgress(question.id).resolved)
            .map((question) => question.id)
        }
      });
      if (saved && typeof sync.flush === 'function') result = await sync.flush();
    }
    const environment = sync && typeof sync.environment === 'function' ? sync.environment() : { mode: 'local' };
    $('lessonCompleteText').textContent = environment.mode === 'production' && result && result.ok && !result.pending
      ? `本轮学习与独立作答已经同步。已做过 ${touched} 道；订正与独立作答分别保留，仍需隔天复测。`
      : `本轮进度已保存在当前设备。已做过 ${touched} 道，仍需隔天复测；测试或预览环境不会写入正式 Neon。`;
    $('lessonLayout').hidden = true;
    $('lessonComplete').hidden = false;
    $('lessonComplete').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showError(message) {
    $('lessonLoading').innerHTML = `<div class="editor-empty">⚠️ ${escapeHtml(message)}<br><br><a class="paper-btn ghost" href="mistakes.html?who=${encodeURIComponent(child || 'eddey')}">返回错题档案</a></div>`;
  }

  async function loadFromCloud() {
    const environment = sync && typeof sync.environment === 'function' ? sync.environment() : { mode: 'local' };
    if (environment.mode !== 'production') return null;
    const response = await fetch(`/api/events?mode=paper&kid=${encodeURIComponent(child)}&paper_id=${encodeURIComponent(paperId)}`, { cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || '云端卷子读取失败');
    if (data.paper && data.paper.id) return data.paper;
    return archive.cloudRowsToPaper(data.mistakes || data.events || [], child, paperId);
  }

  async function init() {
    if (!child || !paperId) {
      showError('入口缺少正确的孩子或卷子编号。');
      return;
    }
    setAccent();
    loadProgress();
    try {
      const local = await archive.getPaper(paperId).catch(() => null);
      if (local && local.child === child) paper = local;
      if (!paper) paper = await loadFromCloud();
      if (!paper || paper.child !== child || !Array.isArray(paper.questions) || !paper.questions.length) {
        throw new Error('这张卷子的已确认错题还没有读到。请让家长先完成确认。');
      }
      paper.questions.forEach((question) => {
        question.subject = paper.subject;
        if (!question.teaching || !Array.isArray(question.teaching.steps) || !question.teaching.steps.length) {
          question.teaching = archive.buildTeaching(question, child);
        }
      });
      $('paperTitle').textContent = paper.title;
      $('topTitle').textContent = `${meta().name} · 卷子错题讲解`;
      $('paperIntro').textContent = child === 'kenton'
        ? '先说结构和条件，再按步骤完成；答错后修复，并返回同一道原题。'
        : '一次只做一小步；答错先修好，再回到刚才那一道原题。';
      $('imagePrivacyNote').hidden = Boolean(paper.pages && paper.pages.some((page) => page.blob));
      selectedQuestionId = paper.questions.some((question) => question.id === requestedQuestionId)
        ? requestedQuestionId
        : paper.questions[0].id;
      $('lessonLoading').hidden = true;
      $('lessonLayout').hidden = false;
      renderQuestionList();
      await renderStage();
      recordEvent(selectedQuestion(), null, { activity: 'paper_lesson_opened' });
    } catch (error) {
      showError(error.message || String(error));
    }
  }

  $('continueLesson').onclick = () => {
    $('lessonComplete').hidden = true;
    $('lessonLayout').hidden = false;
    sessionTouched = new Set();
    selectQuestion(selectedQuestionId || paper.questions[0].id);
  };
  window.addEventListener('beforeunload', revokeCrop);
  init();
})();
