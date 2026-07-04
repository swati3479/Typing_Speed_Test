const PARAGRAPHS = [
  "Focus is not about doing everything; it is about choosing the vital few and ignoring the trivial many. In a world full of notifications, tabs, and endless scrolling, the ability to sit peacefully in a quiet room and work on a single problem for hours is a rare superpower.",
  "Simple is better than complex. Complex is better than complicated. Flat is better than nested. Sparse is better than dense. Readability counts. Special cases are not special enough to break the rules. Although practicality beats purity, errors should never pass silently.",
  "The dark mode aesthetic has conquered the world of modern utility design. With deep charcoal slate backgrounds, glowing amber cursors, and subtle neon indicators, the interface of a typing tool becomes a calm oasis, helping you focus purely on the flow of your thoughts.",
  "Consistency is the hallmark of any high-quality workspace. In programming, writing, and design, what separates amateurs from professionals is the quiet discipline of executing small, polished changes day after day, regardless of passing trends or temporary moods.",
  "Typography is the quiet voice of a user interface. Placing the right font pairings, keeping tracking tight, and introducing generous negative space completely transforms a digital canvas from a standard layout into a highly crafted, sensory experience.",
  "Artificial intelligence is transforming how we build software, but the core essence of software craftsmanship remains unchanged. A brilliant program must be elegant, simple, robust, and highly functional, honoring human usability first and foremost.",
  "The quick brown fox jumps over the lazy dog. This textbook pangram has defined typing tests for centuries. Modern tests, however, challenge typists with complex technical concepts, tricky punctuation, and numbers, transforming typing speed into a fine athletic art form.",
  "Continuous learning is the fundamental fuel of a successful career. Technology is a rapidly running river; to stand still is to be swept backwards. Keep writing code, testing your limits, and building real features that solve genuine problems for real users."
];

const WORD_LIST = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "person", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "code", "rust", "react", "html", "css", "type", "speed", "test", "focus", "flow",
  "pixel", "color", "design", "clean", "simple", "editor", "script", "font", "print", "screen",
  "window", "system", "program", "method", "class", "state", "effect", "hook", "layout", "flex",
  "grid", "neon", "amber", "slate", "charcoal", "dark", "light", "theme", "user", "craft",
  "cyber", "future", "mind", "calm", "still", "breath", "loop", "chart", "graph", "metric"
];

const EASY_PARAGRAPHS = [
  "The sun is shining brightly today. It is a good day to go out and play. I like to run in the park.",
  "A cat sat on the mat. The cat was happy. It ate some fish and went to sleep.",
  "We went to the store to buy some food. We bought bread, milk, and eggs. Then we went home.",
  "My friend has a dog. The dog is very big and brown. It likes to fetch the ball when we throw it."
];

const HARD_PARAGRAPHS = [
  "The ubiquitous integration of synchronous paradigms in asynchronous environments necessitates a profound recalibration of our epistemological frameworks. Concurrently, heuristic algorithms orchestrate deterministic paradigms.",
  "Mitochondrial dysfunction exacerbates the physiological deterioration concomitant with senescence, precipitating a cascade of deleterious metabolic transmutations and accelerating apoptosis.",
  "Notwithstanding the seemingly insurmountable infrastructural impediments, the ostensible democratization of cryptographic ledgers ostensibly facilitates unprecedented financial sovereignty.",
  "Supercalifragilisticexpialidocious might be an exaggerated example, yet the propensity for sesquipedalian loquaciousness often obfuscates rather than elucidates the fundamental crux of the discourse."
];

const EASY_WORDS = [
  "cat", "dog", "sun", "run", "fun", "red", "car", "hat", "bat", "sit", "map", "pen", "box", "cup",
  "tree", "bird", "fish", "book", "door", "room", "star", "moon", "milk", "egg", "bread", "water"
];

const HARD_WORDS = [
  "obfuscate", "ephemeral", "cacophony", "serendipity", "ubiquitous", "perspicacious", "magnanimous",
  "idiosyncrasy", "sesquipedalian", "loquacious", "recalcitrant", "obsequious", "fastidious", "sycophant",
  "ineffable", "surreptitious", "ebullient", "mellifluous", "lugubrious", "facetious", "diaphanous"
];

// App State
let state = {
  theme: 'dark',
  soundEnabled: true,
  difficulty: 'medium', // 'easy' | 'medium' | 'hard'
  mode: 'paragraphs', // 'paragraphs' | 'words'
  duration: 30,
  wordsCount: 25,
  includeNumbers: false,
  includeSymbols: false,

  targetText: '',
  chars: [],
  currentIndex: 0,
  status: 'idle', // 'idle' | 'typing' | 'finished' | 'paused'
  isFocused: true,
  lastKeystrokeTime: 0,

  timeLeft: 30,
  secondsPassed: 0,

  totalKeypresses: 0,
  correctKeypresses: 0,
  mistakesCount: 0,

  chartData: [],
  history: []
};

let timerInterval = null;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playClickSound(isError = false) {
  if (!state.soundEnabled) return;
  initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  if (isError) {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.08);
  }
}

// DOM Elements
const els = {
  typingArena: document.getElementById('typing-arena'),
  resultsDashboard: document.getElementById('results-dashboard'),
  configBtns: document.querySelectorAll('.config-btn'),
  durationConfig: document.getElementById('duration-config'),
  wordsConfig: document.getElementById('words-config'),
  
  timerBadge: document.getElementById('timer-badge'),
  timeLeftVal: document.getElementById('time-left-val'),
  liveMetrics: document.getElementById('live-metrics'),
  liveWpm: document.getElementById('live-wpm'),
  liveAcc: document.getElementById('live-acc'),

  typingCanvas: document.getElementById('typing-canvas'),
  hiddenInput: document.getElementById('hidden-input'),
  focusOverlay: document.getElementById('focus-overlay'),
  wordsDisplay: document.getElementById('words-display'),

  restartBtn: document.getElementById('restart-btn'),
  resultsRetryBtn: document.getElementById('results-retry-btn'),
  clearHistoryBtn: document.getElementById('clear-history-btn'),
  historyList: document.getElementById('history-list'),

  resultWpm: document.getElementById('result-wpm'),
  resultAcc: document.getElementById('result-acc'),
  resultMistakes: document.getElementById('result-mistakes'),
  resultTime: document.getElementById('result-time'),
  chartContainer: document.getElementById('chart-container'),
  themeBtn: document.getElementById('theme-btn'),
  themeIcon: document.getElementById('theme-icon'),
  customDurInput: document.getElementById('custom-duration-input'),
  customWordsInput: document.getElementById('custom-words-input'),
  resultsDownloadBtn: document.getElementById('results-download-btn'),
};

// Initialize
function init() {
  loadTheme();
  loadHistory();
  bindEvents();
  handleReset();
}

function loadTheme() {
  const savedTheme = localStorage.getItem('typing_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    state.theme = 'light';
    updateThemeIcon();
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  if (state.theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
  localStorage.setItem('typing_theme', state.theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  if (state.theme === 'light') {
    els.themeIcon.innerHTML = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`;
  } else {
    els.themeIcon.innerHTML = `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`;
  }
}

function loadHistory() {
  const saved = localStorage.getItem('typing_speed_test_history');
  if (saved) {
    try {
      state.history = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  renderHistory();
}

function saveHistory() {
  localStorage.setItem('typing_speed_test_history', JSON.stringify(state.history));
}

function bindEvents() {
  // Config Buttons
  els.configBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (state.status === 'typing') return; // Disable changing config while typing
      const opt = btn.dataset.opt;
      const val = btn.dataset.val;

      if (opt === 'mode') {
        state.mode = val;
        // Update active class
        document.querySelectorAll(`[data-opt="mode"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (val === 'words') {
          els.durationConfig.classList.add('hidden');
          els.wordsConfig.classList.remove('hidden');
        } else {
          els.durationConfig.classList.remove('hidden');
          els.wordsConfig.classList.add('hidden');
        }
      } else if (opt === 'duration') {
        if (val === 'custom') {
          els.customDurInput.classList.remove('hidden');
          els.customDurInput.focus();
          document.querySelectorAll(`[data-opt="duration"]`).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          return;
        } else {
          els.customDurInput.classList.add('hidden');
          state.duration = parseInt(val, 10);
          document.querySelectorAll(`[data-opt="duration"]`).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      } else if (opt === 'wordsCount') {
        if (val === 'custom') {
          els.customWordsInput.classList.remove('hidden');
          els.customWordsInput.focus();
          document.querySelectorAll(`[data-opt="wordsCount"]`).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          return;
        } else {
          els.customWordsInput.classList.add('hidden');
          state.wordsCount = parseInt(val, 10);
          document.querySelectorAll(`[data-opt="wordsCount"]`).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      } else if (opt === 'numbers') {
        state.includeNumbers = !state.includeNumbers;
        btn.classList.toggle('active');
      } else if (opt === 'symbols') {
        state.includeSymbols = !state.includeSymbols;
        btn.classList.toggle('active');
      } else if (opt === 'difficulty') {
        state.difficulty = val;
        document.querySelectorAll(`[data-opt="difficulty"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      } else if (opt === 'sound') {
        state.soundEnabled = !state.soundEnabled;
        btn.classList.toggle('active');
        btn.textContent = state.soundEnabled ? '🔊 Sound: On' : '🔊 Sound: Off';
        if (state.soundEnabled) initAudio();
        return; // Don't reset for sound
      }
      handleReset();
    });
  });

  // Custom inputs
  els.customDurInput.addEventListener('change', (e) => {
    let val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      state.duration = val * 60;
      handleReset();
    }
  });

  els.customWordsInput.addEventListener('change', (e) => {
    let val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      state.wordsCount = val;
      handleReset();
    }
  });

  // Theme Toggle
  els.themeBtn.addEventListener('click', toggleTheme);

  // Typing Area
  els.typingCanvas.addEventListener('click', () => {
    els.hiddenInput.focus();
  });

  els.hiddenInput.addEventListener('focus', () => {
    state.isFocused = true;
    els.focusOverlay.classList.add('hidden');
    if (state.status === 'paused') {
      state.status = 'typing';
      startTimer();
    }
  });

  els.hiddenInput.addEventListener('blur', () => {
    state.isFocused = false;
    if (state.status === 'typing' || state.status === 'idle') {
      els.focusOverlay.classList.remove('hidden');
      if (state.status === 'typing') {
        state.status = 'paused';
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  });

  els.hiddenInput.addEventListener('keydown', handleKeyDown);

  // Global Keys
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.altKey || e.ctrlKey) return;
    if (e.key === 'Escape') {
      handleReset();
      return;
    }
    
    // When paused, pressing any normal key resumes focus (which triggers resume)
    if (document.activeElement !== els.hiddenInput && state.status !== 'finished') {
      els.hiddenInput.focus();
    }
  });

  // Buttons
  els.restartBtn.addEventListener('click', handleReset);
  els.resultsRetryBtn.addEventListener('click', handleReset);
  
  els.resultsDownloadBtn.addEventListener('click', () => {
    playClickSound();
    downloadStats();
  });

  els.clearHistoryBtn.addEventListener('click', () => {
    state.history = [];
    saveHistory();
    renderHistory();
  });
}

function generateText() {
  let text = '';
  if (state.mode === 'paragraphs') {
    const pList = state.difficulty === 'easy' ? EASY_PARAGRAPHS : (state.difficulty === 'hard' ? HARD_PARAGRAPHS : PARAGRAPHS);
    text = pList[Math.floor(Math.random() * pList.length)];
    if (state.includeNumbers) {
      text = text.split(' ').map(w => Math.random() < 0.15 ? `${Math.floor(Math.random() * 100) + 1} ${w}` : w).join(' ');
    }
    if (state.includeSymbols) {
      const syms = ['?', '!', ';', ':', '...'];
      text = text.split(' ').map(w => {
        if (w.length > 3 && Math.random() < 0.1) return w + syms[Math.floor(Math.random() * syms.length)];
        if (w.length > 4 && Math.random() < 0.05) return `"${w}"`;
        return w;
      }).join(' ');
    }
  } else {
    const wList = state.difficulty === 'easy' ? EASY_WORDS : (state.difficulty === 'hard' ? HARD_WORDS : WORD_LIST);
    const randomWords = [];
    for (let i = 0; i < state.wordsCount; i++) {
      let word = wList[Math.floor(Math.random() * wList.length)];
      if (state.includeNumbers && Math.random() < 0.25) {
        word = Math.random() < 0.5 ? Math.floor(Math.random() * 100).toString() : word + Math.floor(Math.random() * 10);
      }
      if (state.includeSymbols && Math.random() < 0.25) {
        const sym = ['.', ',', '"', '!', '?'][Math.floor(Math.random() * 5)];
        word = sym === '"' ? `"${word}"` : word + sym;
      }
      randomWords.push(word);
    }
    text = randomWords.join(' ');
  }
  return text;
}

function handleReset() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;

  state.targetText = generateText();
  state.chars = state.targetText.split('').map(char => ({ char, state: 'untyped' }));
  state.currentIndex = 0;
  state.status = 'idle';
  state.timeLeft = state.mode === 'paragraphs' ? state.duration : 0;
  state.secondsPassed = 0;
  state.totalKeypresses = 0;
  state.correctKeypresses = 0;
  state.mistakesCount = 0;
  state.chartData = [];
  state.lastKeystrokeTime = Date.now();

  // Update UI
  els.typingArena.classList.remove('hidden');
  els.resultsDashboard.classList.add('hidden');
  els.hiddenInput.value = '';
  
  if (state.mode === 'paragraphs') {
    els.timerBadge.classList.remove('words-mode');
    els.timerBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span id="time-left-val">${state.timeLeft}s</span>`;
  } else {
    els.timerBadge.classList.add('words-mode');
    els.timerBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span id="time-left-val">0/${state.targetText.length} chars</span>`;
  }
  
  els.liveMetrics.classList.add('hidden');
  
  renderWords();
  
  setTimeout(() => els.hiddenInput.focus(), 10);
}

function handleKeyDown(e) {
  if (state.status === 'finished') return;
  if (e.key === 'Escape') return;

  state.lastKeystrokeTime = Date.now();

  if (e.key === 'Backspace') {
    playClickSound();
    e.preventDefault();
    if (state.currentIndex > 0) {
      if (e.ctrlKey || e.metaKey) {
        let tempIdx = state.currentIndex;
        if (state.chars[tempIdx - 1].char === ' ' && tempIdx > 1) {
          tempIdx--;
          state.chars[tempIdx].state = 'untyped';
        }
        while (tempIdx > 0 && state.chars[tempIdx - 1].char !== ' ') {
          tempIdx--;
          state.chars[tempIdx].state = 'untyped';
        }
        state.currentIndex = tempIdx;
      } else {
        state.currentIndex--;
        state.chars[state.currentIndex].state = 'untyped';
      }
      renderWords();
    }
    return;
  }

  if (e.key.length === 1) {
    e.preventDefault();

    if (state.status === 'idle' || state.status === 'paused') {
      state.status = 'typing';
      startTimer();
      els.liveMetrics.classList.remove('hidden');
    }

    const expected = state.chars[state.currentIndex].char;
    const isCorrect = e.key === expected;

    playClickSound(!isCorrect);

    state.chars[state.currentIndex].state = isCorrect ? 'correct' : 'incorrect';
    state.totalKeypresses++;
    if (isCorrect) state.correctKeypresses++;
    else state.mistakesCount++;

    state.currentIndex++;

    // Expand text if we are at the end and in paragraphs mode
    if (state.currentIndex >= state.targetText.length) {
      if (state.mode === 'words') {
        finishTest();
      } else {
        const more = generateText();
        state.targetText += ' ' + more;
        state.chars.push({ char: ' ', state: 'untyped' });
        more.split('').forEach(c => state.chars.push({ char: c, state: 'untyped' }));
      }
    }
    
    updateLiveStats();
    renderWords();
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (Date.now() - state.lastKeystrokeTime > 4000) {
      els.hiddenInput.blur(); // Auto pause on inactivity
      return;
    }

    state.secondsPassed++;
    
    // Add to chart
    let errors = 0;
    for (let i = 0; i < state.currentIndex; i++) {
      if (state.chars[i].state === 'incorrect') errors++;
    }
    const elapsedMins = state.secondsPassed / 60;
    const netWpm = Math.max(0, Math.round(((state.currentIndex - errors) / 5) / elapsedMins));
    
    state.chartData.push({ second: state.secondsPassed, wpm: netWpm, errors });
    
    if (state.mode === 'paragraphs') {
      state.timeLeft--;
      document.getElementById('time-left-val').textContent = `${state.timeLeft}s`;
      if (state.timeLeft <= 0) {
        finishTest();
      }
    } else {
      // In words mode, we just track secondsPassed, time-left-val shows progress
      document.getElementById('time-left-val').textContent = `${state.currentIndex}/${state.targetText.length} chars`;
    }
    updateLiveStats();
  }, 1000);
}

function updateLiveStats() {
  const elapsed = state.mode === 'paragraphs' ? (state.duration - state.timeLeft) : state.secondsPassed;
  const mins = elapsed > 0 ? elapsed / 60 : 1/60;
  
  let errors = 0;
  for (let i = 0; i < state.currentIndex; i++) {
    if (state.chars[i].state === 'incorrect') errors++;
  }
  
  const wpm = Math.max(0, Math.round(((state.currentIndex - errors) / 5) / mins));
  const acc = state.totalKeypresses > 0 ? Math.round((state.correctKeypresses / state.totalKeypresses) * 100) : 100;
  
  els.liveWpm.textContent = `${wpm} WPM`;
  els.liveAcc.textContent = `${acc}%`;

  if (state.mode === 'words') {
    document.getElementById('time-left-val').textContent = `${state.currentIndex}/${state.targetText.length} chars`;
  }
}

function renderWords() {
  const words = [];
  let currentWord = [];
  
  for (let i = 0; i < state.chars.length; i++) {
    if (state.chars[i].char === ' ') {
      words.push({ chars: currentWord, space: { idx: i, ...state.chars[i] } });
      currentWord = [];
    } else {
      currentWord.push({ idx: i, ...state.chars[i] });
    }
  }
  if (currentWord.length > 0) {
    words.push({ chars: currentWord, space: null });
  }

  // To prevent rendering thousands of elements, we slice around the cursor
  // For simplicity in vanilla JS, we just render all or limit if very large
  const startWordIdx = Math.max(0, words.findIndex(w => w.chars.some(c => c.idx === state.currentIndex) || (w.space && w.space.idx === state.currentIndex)) - 10);
  const endWordIdx = Math.min(words.length, startWordIdx + 30);
  
  const renderSet = words.slice(startWordIdx, endWordIdx);

  let html = '';
  for (const w of renderSet) {
    html += `<div class="word">`;
    for (const c of w.chars) {
      let cls = 'char ';
      if (c.idx === state.currentIndex) cls += 'active ';
      else if (c.state === 'correct') cls += 'correct ';
      else if (c.state === 'incorrect') cls += 'incorrect ';
      html += `<span class="${cls}">${c.char}</span>`;
    }
    if (w.space) {
      let cls = 'char space ';
      if (w.space.idx === state.currentIndex) cls += 'active ';
      else if (w.space.state === 'incorrect') cls += 'incorrect ';
      html += `<span class="${cls}"> </span>`;
    }
    html += `</div>`;
  }
  
  els.wordsDisplay.innerHTML = html;
}

function finishTest() {
  clearInterval(timerInterval);
  state.status = 'finished';

  const elapsed = state.mode === 'paragraphs' ? state.duration : state.secondsPassed;
  const mins = elapsed > 0 ? elapsed / 60 : 1/60;
  
  let errors = 0;
  for (let i = 0; i < state.currentIndex; i++) {
    if (state.chars[i].state === 'incorrect') errors++;
  }
  
  const wpm = Math.max(0, Math.round(((state.currentIndex - errors) / 5) / mins));
  const acc = state.totalKeypresses > 0 ? Math.round((state.correctKeypresses / state.totalKeypresses) * 100) : 100;

  const record = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    duration: elapsed,
    wpm,
    accuracy: acc,
    mistakes: state.mistakesCount,
    mode: state.mode
  };

  state.history.push(record);
  saveHistory();
  renderHistory();

  // Show Results
  els.typingArena.classList.add('hidden');
  els.resultsDashboard.classList.remove('hidden');

  els.resultWpm.textContent = wpm;
  els.resultAcc.textContent = `${acc}%`;
  els.resultMistakes.textContent = state.mistakesCount;
  els.resultTime.textContent = `${elapsed}s`;

  drawChart();
}

function renderHistory() {
  if (state.history.length === 0) {
    els.historyList.innerHTML = `<div class="history-item"><span style="color:var(--color-gray);font-size:0.75rem;">No history yet. Take a test!</span></div>`;
    return;
  }

  els.historyList.innerHTML = [...state.history].reverse().map(h => {
    const d = new Date(h.timestamp);
    const dateStr = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}`;
    return `
      <div class="history-item">
        <div class="history-item-left">
          <span class="history-date">${dateStr}</span>
          <span class="history-mode">${h.mode} • ${h.duration}s</span>
        </div>
        <div class="history-stats">
          <div class="h-stat">
            <span class="h-val text-amber">${h.wpm}</span>
            <span class="h-lbl">WPM</span>
          </div>
          <div class="h-stat">
            <span class="h-val text-correct">${h.accuracy}%</span>
            <span class="h-lbl">ACC</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function drawChart() {
  if (state.chartData.length < 2) {
    els.chartContainer.innerHTML = `<div style="color:var(--color-gray);font-size:0.875rem;text-align:center;padding-top:100px;">Not enough data to draw chart</div>`;
    return;
  }

  const w = els.chartContainer.clientWidth - 40;
  const h = 200;
  const pad = 20;

  const maxWpm = Math.max(...state.chartData.map(d => d.wpm), 50);
  const maxTime = state.chartData[state.chartData.length - 1].second;

  const getX = (sec) => pad + (sec / maxTime) * (w - pad * 2);
  const getY = (val) => h - pad - (val / maxWpm) * (h - pad * 2);

  let pathD = `M ${getX(state.chartData[0].second)} ${getY(state.chartData[0].wpm)}`;
  let areaD = `M ${getX(state.chartData[0].second)} ${getY(state.chartData[0].wpm)}`;

  const pointsHtml = state.chartData.map(d => {
    pathD += ` L ${getX(d.second)} ${getY(d.wpm)}`;
    areaD += ` L ${getX(d.second)} ${getY(d.wpm)}`;
    if (d.errors > 0) {
      return `<circle cx="${getX(d.second)}" cy="${getY(d.wpm)}" r="3" class="chart-error-dot" />`;
    }
    return '';
  }).join('');

  areaD += ` L ${getX(state.chartData[state.chartData.length - 1].second)} ${h - pad} L ${getX(state.chartData[0].second)} ${h - pad} Z`;

  const svg = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}">
      <!-- Axes -->
      <line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" class="chart-axis" />
      <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${h-pad}" class="chart-axis" />
      
      <!-- Labels -->
      <text x="${pad-5}" y="${pad}" text-anchor="end" alignment-baseline="middle" class="chart-text">${Math.round(maxWpm)}</text>
      <text x="${pad-5}" y="${h-pad}" text-anchor="end" alignment-baseline="middle" class="chart-text">0</text>
      <text x="${w-pad}" y="${h-pad+15}" text-anchor="middle" class="chart-text">${maxTime}s</text>
      
      <!-- Data -->
      <path d="${areaD}" class="chart-area" />
      <path d="${pathD}" class="chart-line" />
      ${pointsHtml}
    </svg>
  `;

  els.chartContainer.innerHTML = svg;
}

function downloadStats() {
  const dateStr = new Date().toLocaleString();
  const summary = `Typing Speed Test Results
Date: ${dateStr}

Mode: ${state.mode === 'words' ? `${state.wordsCount} words` : `${state.duration} seconds`}
Difficulty: ${state.difficulty}
Numbers: ${state.includeNumbers ? 'Yes' : 'No'}
Symbols: ${state.includeSymbols ? 'Yes' : 'No'}

WPM (Words Per Minute): ${els.resultWpm.textContent}
Accuracy: ${els.resultAcc.textContent}
Mistakes: ${els.resultMistakes.textContent}
Time Taken: ${els.resultTime.textContent}

Keep practicing!
`;

  const blob = new Blob([summary], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `typing-stats-${new Date().getTime()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

init();
