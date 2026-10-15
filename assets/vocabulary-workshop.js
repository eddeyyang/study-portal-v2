(() => {
  "use strict";

  const config = window.VOCABULARY_WORKSHOP;
  if (!config || !Array.isArray(config.words)) throw new Error("Vocabulary workshop config is missing.");

  const STORAGE_KEY = config.storageKey;
  const PHASES = ["teach", "guided", "recall", "independent", "repair", "transfer"];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const VOICE_PREFERENCES = Object.freeze([
    /Microsoft (?:Aria|Jenny|Sonia|Libby|Ryan|Guy)/i,
    /Samantha|Daniel|Karen/i,
    /Google UK English Female|Google US English/i,
    /Natural|Premium|Enhanced/i
  ]);
  const wordMap = new Map(config.words.map((word) => [word.id, word]));
  let systemVoices = [];
  let speechToken = 0;
  let phase = "teach";
  let teachIndex = config.focusSource ? Math.max(0, config.words.findIndex(word => word.source === config.focusSource)) : 0;
  let assemblyIndex = 0;
  let guidedWords = [];
  let guidedIndex = 0;
  let guidedStep = 0;
  let guidedOrder = [];
  let recallWords = [];
  let recallIndex = 0;
  let sessionQueue = [];
  let sessionIndex = 0;
  let sessionMode = "today";
  let blockingAttempts = {};
  let referenceSeen = {};
  let repairDraft = "";
  let transferWord = null;
  let transferTries = 0;
  let transferAssisted = false;
  let advancing = false;

  function emptyState() {
    return { schemaVersion: 1, child: config.child, appId: config.appId, version: config.version, words: {}, events: [], completedSessions: 0, updatedAt: new Date().toISOString() };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (parsed?.schemaVersion === 1 && parsed.child === config.child && parsed.appId === config.appId && parsed.version === config.version) return { ...emptyState(), ...parsed, words: parsed.words || {}, events: Array.isArray(parsed.events) ? parsed.events : [] };
    } catch (error) {
      console.warn("Vocabulary progress could not be read.", error);
    }
    return emptyState();
  }

  let state = loadState();

  function saveState() {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderSummary();
  }

  function statusFor(id) {
    if (!state.words[id]) state.words[id] = { attempts: 0, wrong: 0, correctStreak: 0, open: false, mastered: false, referenceSeen: false, last: null };
    return state.words[id];
  }

  function record(word, ok, kind, assisted = false, entered = "") {
    const item = statusFor(word.id);
    item.attempts += 1;
    item.last = new Date().toISOString();
    if (!ok) {
      item.wrong += 1;
      item.correctStreak = 0;
      item.open = true;
      item.mastered = false;
    }
    if (assisted) {
      item.referenceSeen = true;
      item.open = true;
      item.mastered = false;
    }
    state.events.push({ ts: item.last, subject: "英语", activity: `vocabulary-${kind}`, topic: word.unit, item: word.answer, hint: assisted ? "已看提示或答案；不计独立掌握" : "", at: item.last, wordId: word.id, answer: word.answer, source: word.source, kind, ok, assisted, entered });
    if (state.events.length > 500) state.events = state.events.slice(-500);
    saveState();
  }

  function beijingDateKey() {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function stableIndex(value, length) {
    const bytes = new TextEncoder().encode(value);
    let hash = 0x811c9dc5;
    bytes.forEach((byte) => { hash ^= byte; hash = Math.imul(hash, 0x01000193); });
    return (hash >>> 0) % length;
  }

  function dailySurpriseKey(appId, child) {
    return `${appId}|${child}|${beijingDateKey()}|Asia/Shanghai`;
  }

  function todayWords() {
    if (config.focusSource) return config.words.filter(word => word.source === config.focusSource);
    const today = beijingDateKey();
    const exact = config.words.filter((word) => word.date === today);
    if (exact.length) return exact;
    const overdue = config.words.filter((word) => word.date <= today && !statusFor(word.id).mastered);
    return overdue.length ? overdue : config.words.filter((word) => word.source === "school");
  }

  function queueFor(mode) {
    if (mode === "school") return config.words.filter((word) => word.source === "school");
    if (mode === "extra") return config.words.filter((word) => word.source === "extra");
    if (mode === "wrong") return config.words.filter((word) => statusFor(word.id).open);
    return todayWords();
  }

  function answerForms(word) {
    return [word.answer, ...(word.aliases || [])].map(normalizeAnswer);
  }

  function normalizeAnswer(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/…/g, "...")
      .replace(/[’‘]/g, "'")
      .trim()
      .replace(/(?<!\.)\.(?!\.)$/g, "")
      .replace(/[。！？!?]+$/g, "")
      .replace(/\s*\.\.\.\s*/g, " ... ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(word, entered) {
    return answerForms(word).includes(normalizeAnswer(entered));
  }

  function safe(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }

  function shuffledParts(word) {
    return word.chunks.map((text, index) => ({ text, index })).sort((a, b) => {
      const aa = stableIndex(`${word.id}|${a.index}|guided`, 997);
      const bb = stableIndex(`${word.id}|${b.index}|guided`, 997);
      return aa - bb;
    });
  }

  function toast(message) {
    const node = $("#toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
  }

  function hasSystemSpeech() {
    return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  }

  function voiceScore(voice) {
    const name = String(voice?.name || "");
    const lang = String(voice?.lang || "");
    if (!/^en(?:[-_]|$)/i.test(lang)) return -10000;
    let score = /^en[-_]GB/i.test(lang) ? 90 : /^en[-_]US/i.test(lang) ? 85 : /^en[-_](?:AU|CA|IE|NZ)/i.test(lang) ? 70 : 55;
    const preferred = VOICE_PREFERENCES.findIndex((pattern) => pattern.test(name));
    if (preferred >= 0) score += 500 - preferred * 35;
    if (/Natural|Premium|Enhanced/i.test(name)) score += 70;
    if (voice?.localService) score += 25;
    return score;
  }

  function selectEnglishVoice(list = systemVoices) {
    return [...(list || [])]
      .filter((voice) => /^en(?:[-_]|$)/i.test(String(voice?.lang || "")))
      .map((voice, index) => ({ voice, index, score: voiceScore(voice) }))
      .sort((a, b) => b.score - a.score || String(a.voice.name).localeCompare(String(b.voice.name)) || a.index - b.index)[0]?.voice || null;
  }

  function setAudioStatus(message, failed = false) {
    const status = $("#voiceStatus");
    if (!status) return;
    status.textContent = message;
    status.closest(".audio-status")?.classList.toggle("audio-error", failed);
  }

  function refreshSystemVoices(announce = true) {
    if (!hasSystemSpeech()) {
      if (announce) setAudioStatus("这个浏览器没有英语发音功能，请用 Chrome、Edge 或 Safari 打开。", true);
      return null;
    }
    systemVoices = window.speechSynthesis.getVoices() || [];
    const voice = selectEnglishVoice();
    if (announce) {
      setAudioStatus(voice
        ? `已准备：${voice.name}（${voice.lang}）。点按钮才会播放。`
        : "还在读取英语声线，请点“先试听”再试一次。", !voice);
    }
    return voice;
  }

  async function waitForEnglishVoice(token) {
    let voice = refreshSystemVoices(false);
    for (let attempt = 0; !voice && attempt < 16; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (token !== speechToken) throw new Error("cancelled");
      voice = refreshSystemVoices(false);
    }
    return voice;
  }

  function spokenText(word, kind = "word") {
    if (!word) return "";
    return kind === "sentence" ? word.sentence : word.answer;
  }

  function speechPlan(word, kind = "word", times = 1) {
    if (!word) return [];
    if (kind === "sample") return [
      { text: spokenText(word, "word"), kind: "word" },
      { text: spokenText(word, "sentence"), kind: "sentence" }
    ];
    return Array.from({ length: Math.max(1, times) }, () => ({ text: spokenText(word, kind), kind }));
  }

  function createEnglishUtterance(entry, voice) {
    const utterance = new window.SpeechSynthesisUtterance(entry.text);
    utterance.voice = voice;
    utterance.lang = voice.lang || "en-GB";
    utterance.rate = entry.kind === "word" ? 0.72 : 0.86;
    utterance.pitch = 1;
    utterance.volume = 1;
    return utterance;
  }

  function speakUtterance(entry, voice, token) {
    return new Promise((resolve, reject) => {
      if (token !== speechToken) return reject(new Error("cancelled"));
      const utterance = createEnglishUtterance(entry, voice);
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        error ? reject(error) : resolve();
      };
      const timeout = setTimeout(() => finish(new Error("speech-timeout")), Math.max(12000, entry.text.length * 420));
      utterance.onend = () => finish();
      utterance.onerror = (event) => finish(new Error(event?.error || "speech-error"));
      window.speechSynthesis.speak(utterance);
    });
  }

  async function playEnglish(word, kind, button, times = 1) {
    if (!word || !button) return false;
    if (!hasSystemSpeech()) {
      setAudioStatus("这个浏览器没有英语发音功能，请用 Chrome、Edge 或 Safari 打开。", true);
      toast("当前浏览器不能发音，请换 Chrome、Edge 或 Safari");
      return false;
    }
    const token = ++speechToken;
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    button.disabled = true;
    button.classList.add("playing");
    try {
      setAudioStatus("正在准备英语声线……");
      const voice = await waitForEnglishVoice(token);
      if (!voice) throw new Error("no-english-voice");
      const plan = speechPlan(word, kind, times);
      setAudioStatus(`正在播放：${voice.name}（${voice.lang}）`);
      for (const entry of plan) {
        if (token !== speechToken) throw new Error("cancelled");
        await speakUtterance(entry, voice, token);
        if (plan.length > 1) await new Promise((resolve) => setTimeout(resolve, 260));
      }
      setAudioStatus(`播放完成：${voice.name}（${voice.lang}）。可重复播放；如果扬声器仍无声，请换 Chrome、Edge 或 Safari。`);
      return true;
    } catch (error) {
      if (error.message !== "cancelled") {
        setAudioStatus(error.message === "no-english-voice"
          ? "没有找到可用的英语声线，请在系统中启用英语语音，或换 Chrome、Edge、Safari。"
          : "这次没有成功播放。请再点一次；仍无声请换 Chrome、Edge 或 Safari。", true);
        toast("没有成功发音，请看上方提示");
      }
      return false;
    } finally {
      button.disabled = false;
      button.classList.remove("playing");
    }
  }

  function setPhase(next) {
    if (advancing) return;
    if (hasSystemSpeech()) {
      speechToken += 1;
      window.speechSynthesis.cancel();
    }
    phase = next;
    $$("[data-phase]").forEach((node) => node.classList.toggle("active", node.dataset.phase === next));
    $$("[data-route]").forEach((node) => {
      node.classList.toggle("active", node.dataset.route === next);
      const current = PHASES.indexOf(next);
      node.classList.toggle("done", PHASES.indexOf(node.dataset.route) < current);
    });
    if (next === "teach") renderTeach();
    if (next === "guided") startGuided();
    if (next === "recall") startRecall();
    if (next === "independent") renderIndependent();
    if (next === "repair") renderRepair();
    if (next === "transfer") renderTransfer();
    document.querySelector(`[data-phase="${next}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderSummary() {
    const current = todayWords();
    const school = current.filter((word) => word.source === "school").length;
    const extra = current.filter((word) => word.source === "extra").length;
    const mastered = current.filter((word) => statusFor(word.id).mastered).length;
    $("#todayDate").textContent = beijingDateKey();
    $("#schoolCount").textContent = config.focusSource ? config.words.filter(word => word.source === "school").length : school;
    $("#extraCount").textContent = config.focusSource ? config.words.filter(word => word.source === "extra").length : extra;
    $("#masteredCount").textContent = `${mastered}/${current.length}`;
    $("#summaryProgress").style.width = `${current.length ? Math.round(mastered / current.length * 100) : 0}%`;
    $("#todayList").textContent = current.map((word) => word.answer).join(" · ");
  }

  function renderTeachPicker() {
    const select = $("#teachSelect");
    select.innerHTML = config.words.map((word, index) => `<option value="${index}">${word.source === "school" ? "校内" : "课外"} · ${safe(word.answer)} · ${safe(word.zh)}</option>`).join("");
    select.value = String(teachIndex);
  }

  function renderTeach() {
    const word = config.words[teachIndex] || config.words[0];
    assemblyIndex = 0;
    renderTeachPicker();
    $("#teachSource").textContent = word.source === "school" ? word.unit : word.unit;
    $("#teachDate").textContent = word.source === "school" ? `计划 ${word.date}` : "本次整批完成";
    $("#teachWord").textContent = word.display || word.answer;
    $("#teachZh").textContent = word.zh;
    $("#teachWhy").textContent = word.why;
    $("#teachUse").textContent = word.sentence;
    $("#teachUseZh").textContent = word.sentenceZh;
    $("#playTeachWord").setAttribute("aria-label", `慢速听单词：${word.answer}`);
    $("#playTeachSentence").setAttribute("aria-label", `听例句：${word.sentence}`);
    $("#partBank").innerHTML = word.chunks.map((chunk, index) => `<button class="part" type="button" data-chunk-index="${index}">${safe(chunk)}</button>`).join("");
    $("#teachAssembly").className = "assembly empty";
    $("#teachAssembly").replaceChildren();
    $$("[data-chunk-index]", $("#partBank")).forEach((button) => button.addEventListener("click", () => addTeachChunk(Number(button.dataset.chunkIndex), button)));
  }

  function addTeachChunk(index, button) {
    const word = config.words[teachIndex];
    if (index !== assemblyIndex) {
      button.classList.add("wrong");
      setTimeout(() => button.classList.remove("wrong"), 320);
      toast(`先找“${word.chunks[assemblyIndex]}”`);
      return;
    }
    button.classList.add("used");
    button.disabled = true;
    const rail = $("#teachAssembly");
    rail.classList.remove("empty");
    if (assemblyIndex) {
      const plus = document.createElement("span");
      plus.className = "plus";
      plus.textContent = "+";
      rail.append(plus);
    }
    const piece = document.createElement("span");
    piece.className = "assembled-part";
    piece.textContent = word.chunks[assemblyIndex];
    rail.append(piece);
    assemblyIndex += 1;
    if (assemblyIndex === word.chunks.length) toast(`装好：${word.display || word.answer}`);
  }

  function startGuided() {
    guidedWords = todayWords().slice(0, Math.min(4, todayWords().length));
    guidedIndex = 0;
    guidedStep = 0;
    renderGuided();
  }

  function renderGuided() {
    const word = guidedWords[guidedIndex];
    if (!word) { setPhase("recall"); return; }
    guidedOrder = shuffledParts(word);
    $("#guidedCounter").textContent = `${guidedIndex + 1}/${guidedWords.length}`;
    $("#guidedCue").textContent = word.zh;
    $("#guidedHint").textContent = `想一想：${word.why}`;
    $("#guidedRail").className = "guided-rail empty";
    $("#guidedRail").replaceChildren();
    $("#guidedFeedback").className = "feedback";
    $("#guidedNext").hidden = true;
    $("#guidedChoices").innerHTML = guidedOrder.map((part, index) => `<button class="choice" type="button" data-guided-choice="${index}">${safe(part.text)}</button>`).join("");
    $$("[data-guided-choice]", $("#guidedChoices")).forEach((button) => button.addEventListener("click", () => pickGuided(Number(button.dataset.guidedChoice), button)));
  }

  function pickGuided(choiceIndex, button) {
    const word = guidedWords[guidedIndex];
    const picked = guidedOrder[choiceIndex];
    if (picked.index !== guidedStep) {
      button.classList.add("wrong");
      $("#guidedFeedback").className = "feedback show no";
      $("#guidedFeedback").textContent = `先找第 ${guidedStep + 1} 块“${word.chunks[guidedStep]}”。词块有顺序，字母才不会乱。`;
      return;
    }
    button.classList.add("used");
    button.disabled = true;
    const rail = $("#guidedRail");
    rail.classList.remove("empty");
    if (guidedStep) rail.append(Object.assign(document.createElement("span"), { className: "plus", textContent: "+" }));
    rail.append(Object.assign(document.createElement("span"), { className: "assembled-part", textContent: picked.text }));
    guidedStep += 1;
    if (guidedStep === word.chunks.length) {
      $("#guidedFeedback").className = "feedback show ok";
      $("#guidedFeedback").textContent = `组装正确：${word.display || word.answer}。现在把词块连成一个完整拼写。`;
      $("#guidedNext").hidden = false;
    }
  }

  function startRecall() {
    recallWords = todayWords().slice(0, Math.min(5, todayWords().length));
    recallIndex = 0;
    renderRecall();
  }

  function renderRecall() {
    const word = recallWords[recallIndex];
    if (!word) { startSession("today"); return; }
    $("#recallCounter").textContent = `${recallIndex + 1}/${recallWords.length}`;
    $("#recallCue").textContent = word.zh;
    $("#recallHint").textContent = word.why;
    $("#recallAnswer").textContent = word.display || word.answer;
    $("#recallMask").classList.add("covered");
    $("#revealRecall").textContent = "我想好了，揭晓";
    $("#recallMarks").hidden = true;
  }

  function startSession(mode) {
    if (advancing) return;
    sessionMode = mode;
    const selected = queueFor(mode);
    if (!selected.length) {
      toast("错词本是空的，先做今日默写");
      sessionMode = "today";
      sessionQueue = queueFor("today").map((word) => word.id);
    } else {
      sessionQueue = selected.map((word) => word.id);
    }
    sessionIndex = 0;
    blockingAttempts = {};
    referenceSeen = {};
    $$("[data-mode]").forEach((button) => button.classList.toggle("active", button.dataset.mode === sessionMode));
    setPhase("independent");
  }

  function currentSessionWord() {
    return wordMap.get(sessionQueue[sessionIndex]);
  }

  function renderIndependent() {
    const word = currentSessionWord();
    if (!word) { setPhase("transfer"); return; }
    const progress = statusFor(word.id);
    $("#independentCounter").textContent = `${sessionIndex + 1}/${sessionQueue.length}`;
    $("#independentCue").textContent = word.zh;
    $("#independentHint").textContent = word.keyboardHint || "只看中文和用途，自己把完整英文打出来。";
    $("#sourceLabel").textContent = word.source === "school" ? "学校词" : "课外词";
    $("#streakLabel").textContent = progress.open ? `错词回炉 ${progress.correctStreak}/2` : "首次独立";
    const input = $("#spellingInput");
    input.value = "";
    input.disabled = false;
    $("#checkSpelling").disabled = false;
    input.autocomplete = "off";
    $("#spellingFeedback").className = "feedback";
    $("#answerEscape").hidden = true;
    $("#playDictationWord").setAttribute("aria-label", `播放当前默写词，不显示拼写`);
    setTimeout(() => input.focus(), 80);
  }

  function firstDifference(answer, entered) {
    const target = normalizeAnswer(answer);
    const actual = normalizeAnswer(entered);
    const max = Math.max(target.length, actual.length);
    for (let index = 0; index < max; index += 1) if (target[index] !== actual[index]) return index;
    return -1;
  }

  function checkSpelling() {
    if (advancing) return;
    const word = currentSessionWord();
    if (!word) return;
    const entered = $("#spellingInput").value;
    if (!normalizeAnswer(entered)) { toast("先用键盘打出答案"); return; }
    if (isCorrect(word, entered)) {
      const progress = statusFor(word.id);
      const assisted = Boolean(referenceSeen[word.id]);
      record(word, true, "independent", assisted, entered);
      if (!assisted) {
        if (progress.open) {
          progress.correctStreak += 1;
          if (progress.correctStreak >= 2) {
            progress.open = false;
            progress.mastered = true;
            progress.referenceSeen = false;
          } else if (!sessionQueue.slice(sessionIndex + 1).includes(word.id)) {
            sessionQueue.push(word.id);
          }
        } else {
          progress.correctStreak = Math.max(progress.correctStreak, 1);
          progress.mastered = true;
        }
      }
      saveState();
      $("#spellingFeedback").className = "feedback show ok";
      $("#spellingFeedback").textContent = assisted
        ? `拼对了，但刚看过答案，这次只记“经帮助完成”，还在错词本里。`
        : progress.open
          ? `拼对一次。这个错词还要再独立拼对 1 次才毕业。`
          : `拼写正确：${word.display || word.answer}。字母顺序和空格都稳住了。`;
      $("#spellingInput").disabled = true;
      $("#checkSpelling").disabled = true;
      advancing = true;
      setTimeout(() => { advancing = false; advanceSession(); }, 650);
      return;
    }

    blockingAttempts[word.id] = (blockingAttempts[word.id] || 0) + 1;
    record(word, false, "independent", false, entered);
    repairDraft = entered;
    if (blockingAttempts[word.id] >= 2) {
      referenceSeen[word.id] = true;
      const escape = $("#answerEscape");
      escape.hidden = false;
      escape.dataset.referenceAnswer = word.answer;
      $("#referenceAnswer").textContent = word.display || word.answer;
      $("#spellingFeedback").className = "feedback show no";
      $("#spellingFeedback").textContent = "已经卡了两次，不循环。看清参考答案后可以重试，也可以记为待复习并继续。";
    } else {
      setPhase("repair");
    }
  }

  function advanceSession() {
    const word = currentSessionWord();
    if (word) {
      blockingAttempts[word.id] = 0;
      referenceSeen[word.id] = false;
    }
    sessionIndex += 1;
    if (sessionIndex >= sessionQueue.length) {
      state.completedSessions += 1;
      saveState();
      setPhase("transfer");
    } else {
      renderIndependent();
    }
  }

  function renderRepair() {
    const word = currentSessionWord();
    if (!word) { setPhase("independent"); return; }
    // This view shows the full spelling. A retry in this session is assisted.
    referenceSeen[word.id] = true;
    const diff = firstDifference(word.answer, repairDraft);
    $("#repairWord").textContent = repairDraft || "（没有输入）";
    const answer = word.answer;
    $("#letterRow").innerHTML = [...answer].map((letter, index) => `<span class="letter${index === diff ? " bad" : ""}">${letter === " " ? "·" : safe(letter)}</span>`).join("");
    $("#repairReason").textContent = diff < 0 ? word.why : `第 ${diff + 1} 个位置先出了问题。不要整词重抄，只回到“${word.chunks.join(" + ")}”这条拼法。`;
    $("#childGap").textContent = diff < 0 ? "答案格式还没有对齐。" : `先修第 ${diff + 1} 个位置，不重背整页。`;
    $("#childReason").textContent = word.why;
    $("#childCheck").textContent = `遮住答案，按“${word.chunks.join(" + ")}”重新打一次。`;
  }

  function renderTransfer() {
    const mastered = todayWords().filter((word) => statusFor(word.id).mastered);
    transferWord = mastered[stableIndex(`${config.appId}|transfer|${beijingDateKey()}`, mastered.length || 1)] || todayWords()[0] || config.words[0];
    transferTries = 0;
    transferAssisted = false;
    $("#transferPrompt").textContent = transferWord.sentenceCloze;
    $("#transferZh").textContent = transferWord.sentenceZh;
    $("#transferInput").value = "";
    $("#transferInput").disabled = false;
    $("#transferFeedback").className = "feedback";
    $("#playTransferSentence").setAttribute("aria-label", `听完整例句：${transferWord.sentence}`);
    $("#completion").classList.remove("show");
    $("#finishAssisted").hidden = true;
  }

  function checkTransfer() {
    if ($("#transferInput").disabled) return;
    const entered = $("#transferInput").value;
    if (!normalizeAnswer(entered)) { toast("先把句子缺少的词打出来"); return; }
    transferTries += 1;
    if (isCorrect(transferWord, entered)) {
      record(transferWord, true, "transfer", transferAssisted, entered);
      $("#transferFeedback").className = "feedback show ok";
      $("#transferFeedback").textContent = transferAssisted ? "对照提示完成了，下一次再独立试。" : "这个词放进句子也正确。";
      showCompletion(transferAssisted);
    } else {
      record(transferWord, false, "transfer", false, entered);
      $("#transferFeedback").className = "feedback show no";
      $("#transferFeedback").textContent = transferTries >= 2
        ? `参考答案是“${transferWord.display || transferWord.answer}”。看过答案只记待复习，可以结束，不会锁在这里。`
        : `先看句子的意思，再想“${transferWord.chunks.join(" + ")}”。只修第一个不确定的位置。`;
      transferAssisted = true;
      if (transferTries >= 2) $("#finishAssisted").hidden = false;
    }
  }

  function showCompletion(assisted) {
    $("#transferInput").disabled = true;
    $("#finishAssisted").hidden = true;
    const mastered = todayWords().filter((word) => statusFor(word.id).mastered).length;
    const open = config.words.filter((word) => statusFor(word.id).open).length;
    $("#completionTitle").textContent = assisted ? "今天先到这里" : "这一轮练习结束";
    $("#completionCopy").textContent = `当前词表已有 ${mastered}/${todayWords().length} 个通过拼写；错词本还有 ${open} 个。看过答案不算独立通过；长期掌握还要隔天再验。`;
    $("#completion").classList.add("show");
  }

  function renderRecords() {
    const all = config.words.map((word) => ({ word, progress: statusFor(word.id) }));
    const open = all.filter((item) => item.progress.open);
    $("#recordAttempts").textContent = state.events.length;
    $("#recordMastered").textContent = all.filter((item) => item.progress.mastered).length;
    $("#recordOpen").textContent = open.length;
    $("#wrongList").innerHTML = open.length ? open.map(({ word, progress }) => `<div class="wrong-row"><b>${safe(word.display || word.answer)}</b><span>${safe(word.zh)}</span><small>连对 ${progress.correctStreak}/2</small></div>`).join("") : '<div class="feedback show ok">错词本现在是空的。</div>';
  }

  function download(filename, text, type) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    download(`${config.child}-vocabulary-progress.json`, JSON.stringify({ appId: config.appId, child: config.child, exportedAt: new Date().toISOString(), state }, null, 2), "application/json");
  }

  function exportMarkdown() {
    const open = config.words.filter((word) => statusFor(word.id).open);
    const mastered = config.words.filter((word) => statusFor(word.id).mastered);
    let text = `# ${config.name} 单词学习记录\n\n- 导出时间：${new Date().toLocaleString("zh-CN", { hour12: false })}\n- 拼写通过：${mastered.length}/${config.words.length}\n- 待回炉：${open.length}\n\n## 待回炉\n\n`;
    text += open.length ? open.map((word) => `- ${word.display || word.answer}｜${word.zh}｜连续正确 ${statusFor(word.id).correctStreak}/2`).join("\n") : "- 暂无";
    text += "\n\n## 最近尝试\n\n| 时间 | 单词 | 环节 | 结果 |\n|---|---|---|---|\n";
    state.events.slice(-50).forEach((event) => { text += `| ${event.at} | ${event.answer} | ${event.kind} | ${event.ok ? (event.assisted ? "经帮助正确" : "正确") : "错误"} |\n`; });
    download(`${config.child}-vocabulary-report.md`, text, "text/markdown");
  }

  function importProgress(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        const next = payload.state || payload;
        if (next.schemaVersion !== 1 || next.child !== config.child || next.appId !== config.appId || next.version !== config.version || !next.words || typeof next.words !== "object" || Array.isArray(next.words) || !Array.isArray(next.events) || Object.keys(next.words).some(id => !wordMap.has(id))) throw new Error("identity mismatch");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        location.reload();
      } catch (error) {
        toast(`这不是 ${config.name} 的进度文件`);
      }
    };
    reader.readAsText(file);
  }

  function bind() {
    $$("[data-route]").forEach((button) => button.addEventListener("click", () => {
      const next = button.dataset.route;
      if (next === "independent") return startSession(sessionMode);
      if (next === "repair" && !repairDraft) return toast("先做键盘默写；拼错时会来到返修站");
      setPhase(next);
    }));
    $("#teachSelect").addEventListener("change", (event) => { teachIndex = Number(event.target.value); renderTeach(); });
    $("#teachPrev").addEventListener("click", () => { teachIndex = (teachIndex - 1 + config.words.length) % config.words.length; renderTeach(); });
    $("#teachNext").addEventListener("click", () => { teachIndex = (teachIndex + 1) % config.words.length; renderTeach(); });
    $("#startGuided").addEventListener("click", () => setPhase("guided"));
    $("#directStart").addEventListener("click", () => startSession("today"));
    $("#startWeekly")?.addEventListener("click", () => startSession("extra"));
    $("#guidedNext").addEventListener("click", () => { guidedIndex += 1; guidedStep = 0; renderGuided(); });
    $("#toRecall").addEventListener("click", () => setPhase("recall"));
    $("#revealRecall").addEventListener("click", () => {
      const covered = $("#recallMask").classList.toggle("covered");
      $("#recallMarks").hidden = covered;
      $("#revealRecall").textContent = covered ? "我想好了，揭晓" : "再遮住想一遍";
    });
    $$("[data-recall-mark]").forEach((button) => button.addEventListener("click", () => {
      const word = recallWords[recallIndex];
      if (button.dataset.recallMark === "weak") statusFor(word.id).open = true;
      record(word, button.dataset.recallMark === "ok", "recall", false, "self-check");
      recallIndex += 1;
      renderRecall();
    }));
    $$("[data-mode]").forEach((button) => button.addEventListener("click", () => startSession(button.dataset.mode)));
    $("#checkSpelling").addEventListener("click", checkSpelling);
    $("#spellingInput").addEventListener("keydown", (event) => { if (event.key === "Enter") checkSpelling(); });
    $("[data-return-to-question]").addEventListener("click", () => setPhase("independent"));
    $("[data-retry-after-reveal]").addEventListener("click", () => { $("#answerEscape").hidden = true; $("#spellingInput").value = ""; $("#spellingInput").focus(); });
    $("[data-continue-after-reveal]").addEventListener("click", () => {
      const word = currentSessionWord();
      referenceSeen[word.id] = true;
      record(word, false, "reference-continue", true, $("#spellingInput").value);
      advanceSession();
    });
    $("#checkTransfer").addEventListener("click", checkTransfer);
    $("#transferInput").addEventListener("keydown", (event) => { if (event.key === "Enter") checkTransfer(); });
    $("#finishAssisted").addEventListener("click", () => showCompletion(true));
    $("#practiceWrong").addEventListener("click", () => startSession("wrong"));
    $("#restartToday").addEventListener("click", () => startSession("today"));
    $("#openRecords").addEventListener("click", () => { renderRecords(); $("#recordDrawer").classList.add("open"); $("#recordDrawer").setAttribute("aria-hidden", "false"); });
    $("#closeRecords").addEventListener("click", () => { $("#recordDrawer").classList.remove("open"); $("#recordDrawer").setAttribute("aria-hidden", "true"); });
    $("#recordDrawer").addEventListener("click", (event) => { if (event.target === $("#recordDrawer")) $("#closeRecords").click(); });
    $("#exportJson").addEventListener("click", exportJson);
    $("#exportMarkdown").addEventListener("click", exportMarkdown);
    $("#importButton").addEventListener("click", () => $("#importFile").click());
    $("#importFile").addEventListener("change", (event) => { if (event.target.files[0]) importProgress(event.target.files[0]); });
    $("#dailyButton").addEventListener("click", () => {
      const open = $("#dailyButton").getAttribute("aria-expanded") !== "true";
      $("#dailyButton").setAttribute("aria-expanded", String(open));
      $("#dailyText").textContent = open ? config.dailySurprise : "点开看今天的拼写暗号";
    });
    $("#voiceTest").addEventListener("click", () => playEnglish(config.words[0], "sample", $("#voiceTest")));
    $("#playTeachWord").addEventListener("click", () => playEnglish(config.words[teachIndex], "word", $("#playTeachWord")));
    $("#playTeachSentence").addEventListener("click", () => playEnglish(config.words[teachIndex], "sentence", $("#playTeachSentence")));
    $("#playDictationWord").addEventListener("click", () => playEnglish(currentSessionWord(), "word", $("#playDictationWord")));
    $("#playTransferSentence").addEventListener("click", () => playEnglish(transferWord, "sentence", $("#playTransferSentence")));
  }

  config.dailySurprise = config.dailySurprises[stableIndex(dailySurpriseKey(config.appId, config.child), config.dailySurprises.length)];
  $("#appName").textContent = config.name;
  $("#appGrade").textContent = config.grade;
  $("#goalText").textContent = config.goal;
  $("#teacherSource").textContent = config.sourceNote;
  bind();
  if (hasSystemSpeech()) {
    refreshSystemVoices();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener("voiceschanged", () => refreshSystemVoices());
    else window.speechSynthesis.onvoiceschanged = () => refreshSystemVoices();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        speechToken += 1;
        window.speechSynthesis.cancel();
      }
    });
  } else {
    refreshSystemVoices();
  }
  renderSummary();
  renderTeach();
  window.__VOCAB_APP__ = { config, state, setPhase, startSession, normalizeAnswer, isCorrect, storageKey: STORAGE_KEY, hasSystemSpeech, voiceScore, selectEnglishVoice, spokenText, speechPlan, playEnglish };
})();
