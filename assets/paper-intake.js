(function paperIntakePage() {
  'use strict';

  const archive = window.DDPaperArchive;
  const sync = window.DDLearningSync;
  const $ = (id) => document.getElementById(id);
  const query = new URLSearchParams(location.search);
  const initialChild = archive.validChild(query.get('who'));
  const initialPaperId = String(query.get('paper') || '').trim().slice(0, 120);
  const childMeta = {
    kenton: { name: 'Kenton', label: '哥哥', emoji: '🦁', accent: '#36c5d6', dark: '#127889', soft: '#e3fbff' },
    eddey: { name: 'Eddey', label: '弟弟', emoji: '🐯', accent: '#ff8a5b', dark: '#a84a25', soft: '#fff0e6' }
  };
  const editableIds = [
    'questionNumber', 'errorType', 'questionText', 'studentAnswer',
    'correctAnswer', 'knowledgeTag', 'rootCause', 'parentHint'
  ];

  let paper = {
    schemaVersion: archive.SCHEMA_VERSION,
    id: '',
    child: initialChild,
    subject: '数学',
    title: '',
    paperDate: beijingToday(),
    status: 'draft',
    pages: [],
    questions: [],
    removedQuestions: [],
    createdAt: new Date().toISOString()
  };
  let currentPageId = '';
  let selectedQuestionId = '';
  let currentImageUrl = '';
  let drawing = false;
  let drawStart = null;
  let draftBox = null;
  let saveTimer = 0;
  let ocrRunning = false;

  function beijingToday() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
  }

  function child() {
    return archive.validChild(paper.child);
  }

  function selectedPage() {
    return paper.pages.find((page) => page.id === currentPageId) || paper.pages[0] || null;
  }

  function selectedQuestion() {
    return paper.questions.find((question) => question.id === selectedQuestionId) || null;
  }

  function setAccent() {
    const meta = childMeta[child()] || { emoji: '📷', accent: '#ff8a5b', dark: '#9a4424', soft: '#fff0e6' };
    document.documentElement.style.setProperty('--paper-accent', meta.accent);
    document.documentElement.style.setProperty('--paper-accent-dark', meta.dark);
    document.documentElement.style.setProperty('--paper-soft', meta.soft);
    $('heroEmoji').textContent = meta.emoji;
    document.title = child() ? `${meta.name} · 上传错题卷` : '上传错题卷 · 家庭学习门户';
    document.querySelectorAll('[data-child]').forEach((button) => {
      button.classList.toggle('selected', button.dataset.child === child());
      button.setAttribute('aria-pressed', button.dataset.child === child() ? 'true' : 'false');
    });
    const suffix = child() ? `?who=${encodeURIComponent(child())}` : '';
    $('backLink').href = child() ? `mistakes.html${suffix}` : 'parent.html';
    $('returnArchive').href = `mistakes.html${suffix}`;
    $('openArchive').href = `mistakes.html${suffix}`;
  }

  function ensurePaperId() {
    if (!paper.id && child()) paper.id = `${child()}:${archive.uid('paper')}`;
    return paper.id;
  }

  function updateAddress() {
    if (!paper.id || !child()) return;
    const next = new URL(location.href);
    next.searchParams.set('who', child());
    next.searchParams.set('paper', paper.id);
    history.replaceState(null, '', next);
  }

  function markDraft() {
    if (paper.status === 'confirmed') paper.status = 'draft';
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => persistDraft().catch(showSaveError), 420);
  }

  function showSaveError(error) {
    $('confirmStatus').textContent = `本机保存失败：${error.message || error}`;
  }

  async function persistDraft() {
    if (!child()) return null;
    ensurePaperId();
    paper = await archive.savePaper(paper);
    updateAddress();
    return paper;
  }

  function renderProgress() {
    const step = paper.status === 'confirmed'
      ? 3
      : paper.questions.length
        ? 2
        : paper.pages.length
          ? 2
          : 1;
    document.querySelectorAll('[data-progress]').forEach((item) => {
      item.classList.toggle('active', Number(item.dataset.progress) === step);
    });
  }

  function qualityText(page) {
    const quality = page && page.quality ? page.quality : archive.qualityAdvice({});
    const icon = quality.level === 'good' ? '✅' : quality.level === 'retake' ? '📷' : '⚠️';
    const details = Array.isArray(quality.issues) && quality.issues.length
      ? quality.issues.join('；')
      : '页面角度、亮度和文字边缘可以继续使用。';
    const privacy = page && page.privacyCrop && page.privacyCrop.applied
      ? ` 已自动裁掉顶部 ${Math.round(page.privacyCrop.ratio * 100)}% 的姓名栏。`
      : '';
    return `<span>${icon}</span><span><strong>${escapeHtml(quality.label)}</strong>${escapeHtml(details + privacy)}</span>`;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderPageTabs() {
    const tabs = $('pageTabs');
    tabs.innerHTML = '';
    paper.pages.forEach((page, index) => {
      const count = paper.questions.filter((question) => question.pageId === page.id).length;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `page-tab${page.id === currentPageId ? ' selected' : ''}`;
      button.textContent = `第 ${index + 1} 页 · ${count}题${page.quality && page.quality.level === 'retake' ? ' ⚠️' : ''}`;
      button.onclick = () => {
        stopDrawing();
        currentPageId = page.id;
        const pageQuestion = paper.questions.find((question) => question.pageId === page.id);
        selectedQuestionId = pageQuestion ? pageQuestion.id : '';
        renderWorkspace();
      };
      tabs.appendChild(button);
    });
  }

  function renderBoxes() {
    const overlay = $('paperOverlay');
    overlay.querySelectorAll('.mistake-box').forEach((box) => box.remove());
    const questions = paper.questions.filter((question) => question.pageId === currentPageId);
    questions.forEach((question, index) => {
      const bounds = archive.normalizeBounds(question.bounds);
      const box = document.createElement('button');
      box.type = 'button';
      box.className = `mistake-box${question.id === selectedQuestionId ? ' selected' : ''}`;
      box.style.left = `${bounds.x * 100}%`;
      box.style.top = `${bounds.y * 100}%`;
      box.style.width = `${bounds.width * 100}%`;
      box.style.height = `${bounds.height * 100}%`;
      box.setAttribute('aria-label', `选择第 ${question.number || index + 1} 题`);
      const label = document.createElement('span');
      label.textContent = question.number || String(index + 1);
      box.appendChild(label);
      box.onclick = (event) => {
        event.stopPropagation();
        if (drawing) return;
        selectedQuestionId = question.id;
        renderBoxes();
        renderEditor();
        renderQuestionList();
      };
      overlay.appendChild(box);
    });
  }

  function revokeImageUrl() {
    if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
    currentImageUrl = '';
  }

  function renderWorkspace() {
    renderPageTabs();
    const page = selectedPage();
    $('markingCard').hidden = !paper.pages.length;
    $('questionListCard').hidden = !paper.questions.length;
    if (!page) {
      revokeImageUrl();
      $('stageEmpty').hidden = false;
      $('canvasWrap').hidden = true;
      $('qualityBanner').innerHTML = '';
      renderEditor();
      renderQuestionList();
      renderProgress();
      updateConfirmState();
      return;
    }
    currentPageId = page.id;
    revokeImageUrl();
    currentImageUrl = URL.createObjectURL(page.blob);
    $('paperImage').src = currentImageUrl;
    $('stageEmpty').hidden = true;
    $('canvasWrap').hidden = false;
    const banner = $('qualityBanner');
    banner.className = `quality-banner ${page.quality && page.quality.level !== 'good' ? page.quality.level : ''}`.trim();
    banner.innerHTML = qualityText(page);
    renderBoxes();
    renderEditor();
    renderQuestionList();
    renderProgress();
    updateConfirmState();
  }

  function renderEditor() {
    const question = selectedQuestion();
    $('editorEmpty').hidden = Boolean(question);
    $('editorForm').hidden = !question;
    if (!question) return;
    $('editorTitle').textContent = `确认第 ${question.number || '?'} 题`;
    $('questionNumber').value = question.number || '';
    $('errorType').value = question.errorType || '暂不确定';
    $('questionText').value = question.questionText || '';
    $('studentAnswer').value = question.studentAnswer || '';
    $('correctAnswer').value = question.correctAnswer || '';
    $('knowledgeTag').value = question.knowledgeTag || '';
    $('rootCause').value = question.rootCause || '';
    $('parentHint').value = question.parentHint || '';
    $('parentConfirmed').checked = question.parentConfirmed === true;
    renderOcrStatus(question);
    renderTeachingPreview(question);
  }

  function renderOcrStatus(question) {
    const status = $('ocrStatus');
    status.className = 'ocr-status';
    if (!question.ocr || !question.ocr.attempted) {
      status.textContent = '识别模型只在浏览器运行；首次使用会下载免费模型，照片不会上传。';
      return;
    }
    const percent = Math.round((Number(question.ocr.confidence) || 0) * 100);
    if (question.ocr.failed) {
      status.classList.add('error');
      status.textContent = '本机识别没有成功，请直接手动输入；框选和后续讲解不受影响。';
    } else if (question.ocr.needsParentCheck) {
      status.classList.add('warn');
      status.textContent = `本机识别置信度约 ${percent}%：请逐字核对，尤其是手写答案、数字和运算符。`;
    } else {
      status.classList.add('good');
      status.textContent = `本机识别置信度约 ${percent}%：仍需家长对照原卷后确认。`;
    }
  }

  function readEditor(question, keepConfirmation) {
    question.number = $('questionNumber').value.trim().slice(0, 20);
    question.errorType = $('errorType').value;
    question.questionText = $('questionText').value.trim().slice(0, 1800);
    question.studentAnswer = $('studentAnswer').value.trim().slice(0, 600);
    question.correctAnswer = $('correctAnswer').value.trim().slice(0, 800);
    question.answerMode = question.correctAnswer ? 'exact' : 'self_check';
    question.knowledgeTag = $('knowledgeTag').value.trim().slice(0, 120);
    question.rootCause = $('rootCause').value.trim().slice(0, 600);
    question.parentHint = $('parentHint').value.trim().slice(0, 600);
    question.parentConfirmed = keepConfirmation ? $('parentConfirmed').checked : false;
    question.subject = paper.subject;
    question.teaching = archive.buildTeaching(question, child());
    return question;
  }

  function renderTeachingPreview(question) {
    const teaching = archive.buildTeaching({ ...question, subject: paper.subject }, child());
    question.teaching = teaching;
    $('teachingPreview').innerHTML = `<b>${escapeHtml(teaching.levelLabel)}</b><br>${escapeHtml(teaching.explanation)}<br><b>记忆钩子：</b>${escapeHtml(teaching.memoryHook)}`;
  }

  function renderQuestionList() {
    const list = $('questionList');
    list.innerHTML = '';
    paper.questions.forEach((question, index) => {
      const row = document.createElement('article');
      row.className = `question-row${question.id === selectedQuestionId ? ' selected' : ''}`;
      const number = document.createElement('div');
      number.className = 'question-number';
      number.textContent = question.number || String(index + 1);
      const copy = document.createElement('div');
      const title = document.createElement('h4');
      title.textContent = question.knowledgeTag || '知识点待补充';
      const meta = document.createElement('p');
      meta.textContent = `${question.errorType || '暂不确定'} · ${question.parentConfirmed ? '家长已确认' : '还需确认'}`;
      copy.append(title, meta);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '检查';
      button.onclick = () => {
        currentPageId = question.pageId;
        selectedQuestionId = question.id;
        renderWorkspace();
        $('questionEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      row.append(number, copy, button);
      list.appendChild(row);
    });
  }

  function updateConfirmState() {
    const valid = Boolean(
      child() && paper.pages.length && paper.questions.length &&
      paper.questions.every((question) => question.parentConfirmed === true && question.knowledgeTag)
    );
    $('confirmPaper').disabled = !valid;
    if (!child()) $('confirmStatus').textContent = '请先选择哥哥或弟弟。';
    else if (!paper.pages.length) $('confirmStatus').textContent = '请先上传至少一页卷子。';
    else if (!paper.questions.length) $('confirmStatus').textContent = '请在卷子上框出至少一道错题。';
    else {
      const pending = paper.questions.filter((question) => !question.parentConfirmed || !question.knowledgeTag).length;
      $('confirmStatus').textContent = pending
        ? `还有 ${pending} 道错题需要补充知识点并由家长确认。`
        : `已确认 ${paper.questions.length} 道错题，可以生成讲解入口。`;
    }
  }

  function stopDrawing() {
    drawing = false;
    drawStart = null;
    if (draftBox) draftBox.remove();
    draftBox = null;
    $('paperOverlay').classList.remove('drawing');
    $('drawBox').disabled = false;
    $('drawBox').textContent = '＋ 框选一道错题';
    $('cancelDraw').hidden = true;
  }

  function startDrawing() {
    if (!selectedPage()) return;
    drawing = true;
    selectedQuestionId = '';
    renderBoxes();
    renderEditor();
    $('paperOverlay').classList.add('drawing');
    $('drawBox').disabled = true;
    $('drawBox').textContent = '请在卷子上拖出红框';
    $('cancelDraw').hidden = false;
  }

  function relativePoint(event) {
    const rect = $('paperOverlay').getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    };
  }

  function updateDraftBox(point) {
    if (!draftBox || !drawStart) return;
    const x = Math.min(drawStart.x, point.x);
    const y = Math.min(drawStart.y, point.y);
    const width = Math.abs(point.x - drawStart.x);
    const height = Math.abs(point.y - drawStart.y);
    Object.assign(draftBox.style, {
      left: `${x * 100}%`, top: `${y * 100}%`, width: `${width * 100}%`, height: `${height * 100}%`
    });
  }

  function finishBox(point) {
    const start = drawStart;
    if (!start) return stopDrawing();
    const bounds = archive.normalizeBounds({
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y)
    });
    if (bounds.width < 0.04 || bounds.height < 0.025) {
      stopDrawing();
      $('uploadStatus').textContent = '红框太小，请重新拖动并完整包住一道题。';
      return;
    }
    const question = {
      id: archive.uid('question'),
      pageId: currentPageId,
      bounds,
      number: String(paper.questions.length + 1),
      subject: paper.subject,
      questionText: '',
      studentAnswer: '',
      correctAnswer: '',
      answerMode: 'self_check',
      knowledgeTag: '',
      errorType: '暂不确定',
      rootCause: '',
      parentHint: '',
      parentConfirmed: false,
      ocr: { attempted: false, confidence: 0, needsParentCheck: true },
      createdAt: new Date().toISOString()
    };
    question.teaching = archive.buildTeaching(question, child());
    paper.questions.push(question);
    selectedQuestionId = question.id;
    markDraft();
    stopDrawing();
    renderWorkspace();
    persistDraft().catch(showSaveError);
    $('questionEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function decodeImage(file) {
    if ('createImageBitmap' in window) {
      try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); }
      catch (_) { return createImageBitmap(file); }
    }
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片无法打开')); };
      image.src = url;
    });
  }

  function analyzeCanvas(canvas) {
    const sample = document.createElement('canvas');
    const scale = Math.min(1, 240 / Math.max(canvas.width, canvas.height));
    sample.width = Math.max(1, Math.round(canvas.width * scale));
    sample.height = Math.max(1, Math.round(canvas.height * scale));
    const context = sample.getContext('2d', { willReadFrequently: true });
    context.drawImage(canvas, 0, 0, sample.width, sample.height);
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    const gray = new Float32Array(sample.width * sample.height);
    let brightness = 0;
    for (let index = 0, pixel = 0; index < pixels.length; index += 4, pixel += 1) {
      const value = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
      gray[pixel] = value;
      brightness += value;
    }
    brightness /= Math.max(1, gray.length);
    let edges = 0;
    let edgeCount = 0;
    for (let y = 1; y < sample.height; y += 1) {
      for (let x = 1; x < sample.width; x += 1) {
        const at = y * sample.width + x;
        edges += Math.abs(gray[at] - gray[at - 1]) + Math.abs(gray[at] - gray[at - sample.width]);
        edgeCount += 2;
      }
    }
    return { brightness, sharpness: edges / Math.max(1, edgeCount) };
  }

  function canvasBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('图片压缩失败')), 'image/jpeg', 0.86);
    });
  }

  async function prepareImage(file, index) {
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type) || file.size > 15 * 1024 * 1024) {
      throw new Error(`${file.name || `第${index + 1}张`}不是支持的图片，或超过 15MB`);
    }
    const image = await decodeImage(file);
    const originalWidth = image.width;
    const originalHeight = image.height;
    const privacyHeaderRatio = 0.1;
    const sourceY = Math.max(1, Math.round(originalHeight * privacyHeaderRatio));
    const visibleHeight = Math.max(1, originalHeight - sourceY);
    const scale = Math.min(1, 2200 / Math.max(originalWidth, visibleHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(originalWidth * scale));
    canvas.height = Math.max(1, Math.round(visibleHeight * scale));
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, sourceY, originalWidth, visibleHeight, 0, 0, canvas.width, canvas.height);
    if (typeof image.close === 'function') image.close();
    const metrics = analyzeCanvas(canvas);
    const blob = await canvasBlob(canvas);
    const quality = archive.qualityAdvice({ width: originalWidth, height: originalHeight, ...metrics });
    return {
      id: archive.uid('page'),
      name: String(file.name || `paper-page-${index + 1}`).slice(0, 120),
      mime: blob.type,
      size: blob.size,
      width: canvas.width,
      height: canvas.height,
      originalWidth,
      originalHeight,
      privacyCrop: {
        applied: true,
        mode: 'top_name_header',
        ratio: privacyHeaderRatio,
        child: child()
      },
      quality: { ...quality, brightness: metrics.brightness, sharpness: metrics.sharpness },
      blob,
      createdAt: new Date().toISOString()
    };
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (!child()) {
      $('uploadStatus').textContent = '请先选择哥哥或弟弟，再上传卷子。';
      $('paperMetaCard').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const available = 5 - paper.pages.length;
    if (available <= 0) {
      $('uploadStatus').textContent = '一张卷子最多保存 5 页；请先删除不需要的页面。';
      return;
    }
    const picked = files.slice(0, available);
    const firstNewPageIndex = paper.pages.length;
    $('uploadZone').classList.add('drag');
    try {
      for (let index = 0; index < picked.length; index += 1) {
        $('uploadStatus').textContent = `正在本机处理第 ${index + 1}/${picked.length} 页…`;
        const page = await prepareImage(picked[index], firstNewPageIndex + index);
        paper.pages.push(page);
        currentPageId = page.id;
      }
      markDraft();
      ensurePaperId();
      if (!paper.title) paper.title = `${paper.paperDate || beijingToday()} ${paper.subject}错题卷`;
      $('paperTitle').value = paper.title;
      await persistDraft();
      $('uploadStatus').textContent = `已在本机保存 ${paper.pages.length} 页。下一步请框出错题。`;
      renderWorkspace();
      $('markingCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      $('uploadStatus').textContent = `图片处理失败：${error.message || error}`;
    } finally {
      $('uploadZone').classList.remove('drag');
      $('paperFiles').value = '';
    }
  }

  async function cropQuestion(page, boundsValue) {
    const bitmap = await createImageBitmap(page.blob);
    const bounds = archive.normalizeBounds(boundsValue);
    const sourceX = Math.max(0, Math.floor(bitmap.width * bounds.x));
    const sourceY = Math.max(0, Math.floor(bitmap.height * bounds.y));
    const sourceWidth = Math.max(1, Math.floor(bitmap.width * bounds.width));
    const sourceHeight = Math.max(1, Math.floor(bitmap.height * bounds.height));
    const scale = Math.min(1, 1400 / Math.max(sourceWidth, sourceHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvasBlob(canvas);
  }

  async function runOcr() {
    if (ocrRunning) return;
    const question = selectedQuestion();
    const page = selectedPage();
    if (!question || !page) return;
    ocrRunning = true;
    $('runOcr').disabled = true;
    $('runOcr').textContent = '正在本机识别…';
    $('ocrStatus').className = 'ocr-status warn';
    $('ocrStatus').textContent = '首次使用需要从本站下载免费识别模型，可能要等一会儿；处理过程不会上传卷子。';
    try {
      const crop = await cropQuestion(page, question.bounds);
      const module = await import('./paper-ocr/index.js');
      const result = await module.recognizePaperCrop(crop);
      question.ocr = {
        attempted: true,
        confidence: Number(result.confidence) || 0,
        needsParentCheck: Number(result.confidence) < 0.82,
        recognizedAt: new Date().toISOString(),
        processedLocally: true
      };
      if (!result.text) {
        question.ocr.needsParentCheck = true;
        $('ocrStatus').className = 'ocr-status warn';
        $('ocrStatus').textContent = '没有识别到可靠文字。请直接手动输入并对照原卷确认。';
      } else {
        const current = $('questionText').value.trim();
        if (!current || confirm('已经识别出题目文字。是否用识别结果填入题目框？')) {
          $('questionText').value = result.text;
          question.questionText = result.text.slice(0, 1800);
        }
        question.parentConfirmed = false;
        $('parentConfirmed').checked = false;
        renderOcrStatus(question);
      }
      readEditor(question, false);
      renderTeachingPreview(question);
      markDraft();
      await persistDraft();
      renderQuestionList();
      updateConfirmState();
    } catch (error) {
      console.error('[paper-ocr] 本机识别初始化或推理失败', error);
      question.ocr = { attempted: true, failed: true, confidence: 0, needsParentCheck: true };
      $('ocrStatus').className = 'ocr-status error';
      $('ocrStatus').textContent = '本机识别暂时不可用。请手动输入；框选、讲解和 Neon 记录仍可继续。';
      await persistDraft().catch(() => {});
    } finally {
      ocrRunning = false;
      $('runOcr').disabled = false;
      $('runOcr').textContent = '🔍 本机识别印刷文字';
    }
  }

  async function saveQuestion() {
    const question = selectedQuestion();
    if (!question) return;
    readEditor(question, true);
    if (!question.number) question.number = String(paper.questions.indexOf(question) + 1);
    if (!question.knowledgeTag) {
      $('confirmStatus').textContent = '请至少填写这道题背后的知识点，方便长期归类。';
      $('knowledgeTag').focus();
      return;
    }
    if (!question.parentConfirmed) {
      $('confirmStatus').textContent = '请对照原卷后勾选“我已确认”，模糊字迹不能直接进入正式档案。';
      $('parentConfirmed').focus();
      return;
    }
    markDraft();
    await persistDraft();
    renderWorkspace();
    $('confirmStatus').textContent = `第 ${question.number} 题已保存并由家长确认。`;
  }

  async function deleteQuestion() {
    const question = selectedQuestion();
    if (!question || !confirm(`删除第 ${question.number || '?'} 题的红框和记录吗？`)) return;
    if (paper.confirmedAt) {
      paper.removedQuestions = paper.removedQuestions || [];
      paper.removedQuestions.push({ id: question.id, removedAt: new Date().toISOString() });
    }
    paper.questions = paper.questions.filter((item) => item.id !== question.id);
    selectedQuestionId = '';
    markDraft();
    await persistDraft();
    renderWorkspace();
  }

  async function removePage() {
    const page = selectedPage();
    if (!page) return;
    const count = paper.questions.filter((question) => question.pageId === page.id).length;
    if (!confirm(`删除这一页${count ? `以及上面的 ${count} 道错题` : ''}吗？`)) return;
    const removed = paper.questions.filter((question) => question.pageId === page.id);
    if (paper.confirmedAt && removed.length) {
      paper.removedQuestions = paper.removedQuestions || [];
      removed.forEach((question) => paper.removedQuestions.push({ id: question.id, removedAt: new Date().toISOString() }));
    }
    paper.questions = paper.questions.filter((question) => question.pageId !== page.id);
    paper.pages = paper.pages.filter((item) => item.id !== page.id);
    currentPageId = paper.pages[0] ? paper.pages[0].id : '';
    selectedQuestionId = '';
    markDraft();
    await persistDraft();
    renderWorkspace();
  }

  async function confirmPaper() {
    const question = selectedQuestion();
    if (question) readEditor(question, true);
    updateConfirmState();
    if ($('confirmPaper').disabled) return;
    $('confirmPaper').disabled = true;
    $('confirmStatus').textContent = '正在本机保存，并准备匿名化学习证据…';
    try {
      paper.status = 'confirmed';
      paper.confirmedAt = new Date().toISOString();
      paper.questions.forEach((item) => {
        item.subject = paper.subject;
        item.teaching = archive.buildTeaching(item, child());
      });
      paper = await archive.savePaper(paper);
      const organization = archive.paperOrganization(paper);
      const events = archive.paperToEvents(paper);
      const environment = sync && typeof sync.environment === 'function' ? sync.environment() : { mode: 'local' };
      const testMode = !sync || (typeof sync.isTest === 'function' && sync.isTest());
      let syncResult = { ok: false, pending: events.length };
      if (!testMode) {
        events.forEach((event) => sync.recordAttempt(event));
        sync.complete({
          kid: child(),
          subject: paper.subject,
          topic: '卷子错题确认',
          item: `家长确认 ${paper.questions.length} 道卷子错题`,
          source: 'paper-intake.html',
          payload: {
            schema_version: archive.SCHEMA_VERSION,
            evidence_source: 'paper',
            paper_id: paper.id,
            question_count: paper.questions.length,
            original_image_storage: 'device_only'
          }
        });
        syncResult = await sync.flush();
      }
      paper.syncStatus = !testMode && syncResult && syncResult.ok && !syncResult.pending ? 'synced' : 'local';
      paper = await archive.savePaper(paper);
      const href = archive.lessonHref(child(), paper.id);
      $('openLesson').href = href;
      $('successText').textContent = environment.mode === 'production' && paper.syncStatus === 'synced'
        ? `已保存 ${paper.questions.length} 道错题，Neon 已收到结构化记录；后台已归入“${organization.archivePath}”。`
        : `已在本机保存 ${paper.questions.length} 道错题，并归入“${organization.archivePath}”。当前是测试或预览环境，没有写入正式 Neon。`;
      $('successCard').hidden = false;
      $('confirmCard').hidden = true;
      $('successCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
      renderProgress();
    } catch (error) {
      paper.status = 'draft';
      $('confirmStatus').textContent = `生成入口未完成：${error.message || error}`;
      updateConfirmState();
    }
  }

  function bindEvents() {
    document.querySelectorAll('[data-child]').forEach((button) => {
      button.onclick = async () => {
        const next = archive.validChild(button.dataset.child);
        if (child() === next) return;
        if ((paper.pages.length || paper.questions.length) && !confirm('更换孩子会清空当前未完成内容，并为另一位孩子新建卷子。确定继续吗？')) return;
        if (paper.pages.length || paper.questions.length) {
          paper.pages = [];
          paper.questions = [];
          paper.removedQuestions = [];
          paper.id = '';
        }
        paper.child = next;
        ensurePaperId();
        setAccent();
        renderWorkspace();
        await persistDraft();
      };
    });

    $('paperSubject').onchange = () => {
      paper.subject = $('paperSubject').value;
      paper.questions.forEach((question) => {
        question.subject = paper.subject;
        question.teaching = archive.buildTeaching(question, child());
        question.parentConfirmed = false;
      });
      markDraft();
      renderEditor();
      renderQuestionList();
      updateConfirmState();
      scheduleSave();
    };
    $('paperDate').onchange = () => { paper.paperDate = $('paperDate').value; markDraft(); scheduleSave(); };
    $('paperTitle').oninput = () => { paper.title = $('paperTitle').value.trim().slice(0, 160); markDraft(); scheduleSave(); };
    $('paperFiles').onchange = (event) => addFiles(event.target.files);
    $('uploadZone').ondragover = (event) => { event.preventDefault(); $('uploadZone').classList.add('drag'); };
    $('uploadZone').ondragleave = () => $('uploadZone').classList.remove('drag');
    $('uploadZone').ondrop = (event) => { event.preventDefault(); $('uploadZone').classList.remove('drag'); addFiles(event.dataTransfer.files); };
    $('drawBox').onclick = startDrawing;
    $('cancelDraw').onclick = stopDrawing;
    $('removePage').onclick = removePage;
    $('runOcr').onclick = runOcr;
    $('saveQuestion').onclick = saveQuestion;
    $('deleteQuestion').onclick = deleteQuestion;
    $('confirmPaper').onclick = confirmPaper;

    editableIds.forEach((id) => {
      $(id).addEventListener(id === 'errorType' ? 'change' : 'input', () => {
        const question = selectedQuestion();
        if (!question) return;
        readEditor(question, false);
        $('parentConfirmed').checked = false;
        markDraft();
        renderTeachingPreview(question);
        renderQuestionList();
        updateConfirmState();
        scheduleSave();
      });
    });
    $('parentConfirmed').onchange = () => {
      const question = selectedQuestion();
      if (!question) return;
      readEditor(question, true);
      markDraft();
      renderQuestionList();
      updateConfirmState();
      scheduleSave();
    };

    const overlay = $('paperOverlay');
    overlay.addEventListener('pointerdown', (event) => {
      if (!drawing) return;
      event.preventDefault();
      drawStart = relativePoint(event);
      draftBox = document.createElement('div');
      draftBox.className = 'draft-box';
      overlay.appendChild(draftBox);
      overlay.setPointerCapture(event.pointerId);
      updateDraftBox(drawStart);
    });
    overlay.addEventListener('pointermove', (event) => {
      if (!drawing || !drawStart) return;
      event.preventDefault();
      updateDraftBox(relativePoint(event));
    });
    overlay.addEventListener('pointerup', (event) => {
      if (!drawing || !drawStart) return;
      event.preventDefault();
      finishBox(relativePoint(event));
    });
    overlay.addEventListener('pointercancel', stopDrawing);
    window.addEventListener('beforeunload', revokeImageUrl);
  }

  function populateMeta() {
    $('paperSubject').value = paper.subject || '数学';
    $('paperDate').value = paper.paperDate || beijingToday();
    $('paperTitle').value = paper.title || '';
  }

  async function init() {
    bindEvents();
    if (initialPaperId) {
      try {
        const stored = await archive.getPaper(initialPaperId);
        if (stored && (!initialChild || stored.child === initialChild)) paper = stored;
      } catch (error) {
        $('uploadStatus').textContent = `原有本机草稿没有读到：${error.message || error}`;
      }
    }
    if (child()) ensurePaperId();
    currentPageId = paper.pages[0] ? paper.pages[0].id : '';
    selectedQuestionId = paper.questions[0] ? paper.questions[0].id : '';
    setAccent();
    if (initialChild) {
      const choice = document.querySelector('.child-choice');
      if (choice) choice.style.gridTemplateColumns = '1fr';
      document.querySelectorAll('[data-child]').forEach((button) => {
        button.hidden = button.dataset.child !== initialChild;
        button.disabled = true;
        if (button.dataset.child === initialChild) button.title = '已由进入的孩子档案确定';
      });
    }
    populateMeta();
    renderWorkspace();
    if (paper.status === 'confirmed') {
      $('confirmStatus').textContent = '这张卷子已确认。修改任意内容后需要重新确认并同步。';
    }
  }

  init();
})();
