import React, { useState, useEffect, useRef } from 'react';
import { 
  Keyboard, 
  RotateCcw, 
  RefreshCw, 
  History, 
  Zap, 
  Award, 
  Target, 
  Clock, 
  Trash2, 
  Percent,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoryRecord, ChartDataPoint } from './types';
import { PARAGRAPHS, WORD_LIST } from './data';
import StatsChart from './components/StatsChart';
import HistoryList from './components/HistoryList';
import TestConfig from './components/TestConfig';

interface CharState {
  char: string;
  state: 'correct' | 'incorrect' | 'untyped';
  typedChar: string | null;
}

export default function App() {
  // Config state
  const [mode, setMode] = useState<'paragraphs' | 'words'>('paragraphs');
  const [duration, setDuration] = useState<number>(30);
  const [wordsCount, setWordsCount] = useState<10 | 25 | 50 | 100>(25);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(false);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(false);

  // Core test state
  const [targetText, setTargetText] = useState<string>('');
  const [chars, setChars] = useState<CharState[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'typing' | 'finished'>('idle');
  const [isFocused, setIsFocused] = useState<boolean>(true);

  // Detailed timing state
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [secondsPassed, setSecondsPassed] = useState<number>(0);

  // Live Metrics
  const [totalKeypresses, setTotalKeypresses] = useState<number>(0);
  const [correctKeypresses, setCorrectKeypresses] = useState<number>(0);
  const [mistakesCount, setMistakesCount] = useState<number>(0);

  // SVG Chart data
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Local Storage history
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Refs for tracking mutable states in setInterval without closures
  const currentIndexRef = useRef(0);
  const charsRef = useRef<CharState[]>([]);
  const secondsPassedRef = useRef(0);
  const totalKeypressesRef = useRef(0);
  const correctKeypressesRef = useRef(0);
  const mistakesCountRef = useRef(0);
  const timeLeftRef = useRef(30);

  // DOM Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state to refs whenever they modify
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { charsRef.current = chars; }, [chars]);
  useEffect(() => { secondsPassedRef.current = secondsPassed; }, [secondsPassed]);
  useEffect(() => { totalKeypressesRef.current = totalKeypresses; }, [totalKeypresses]);
  useEffect(() => { correctKeypressesRef.current = correctKeypresses; }, [correctKeypresses]);
  useEffect(() => { mistakesCountRef.current = mistakesCount; }, [mistakesCount]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('typing_speed_test_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse history', err);
      }
    }
  }, []);

  // Text Generator
  const generateText = (selectedMode: 'paragraphs' | 'words', count?: number) => {
    let text = '';
    if (selectedMode === 'paragraphs') {
      // Pick a random paragraph
      const filtered = PARAGRAPHS;
      const index = Math.floor(Math.random() * filtered.length);
      text = filtered[index];

      // If numbers are enabled, inject some random numbers or years inside the paragraph
      if (includeNumbers) {
        const words = text.split(' ');
        const processed = words.map(w => {
          if (Math.random() < 0.15) {
            const num = Math.floor(Math.random() * 100) + 1;
            return Math.random() < 0.5 ? `${num} ${w}` : `${w} ${num}`;
          }
          return w;
        });
        text = processed.join(' ');
      }

      // If symbols are enabled, wrap some words or add special punctuation
      if (includeSymbols) {
        const words = text.split(' ');
        const processed = words.map(w => {
          if (w.length > 3 && Math.random() < 0.1) {
            const syms = ['?', '!', ';', ':', '...'];
            const chosen = syms[Math.floor(Math.random() * syms.length)];
            return `${w}${chosen}`;
          }
          if (w.length > 4 && Math.random() < 0.05) {
            return `"${w}"`;
          }
          return w;
        });
        text = processed.join(' ');
      }

      return text;
    } else {
      // Generate words
      const size = count || 25;
      const randomWords: string[] = [];
      for (let i = 0; i < size; i++) {
        let word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        
        // Randomly turn into or add number if enabled
        if (includeNumbers && Math.random() < 0.25) {
          const numType = Math.random();
          if (numType < 0.4) {
            word = (Math.floor(Math.random() * 100)).toString();
          } else if (numType < 0.8) {
            word = (Math.floor(Math.random() * 9000) + 1000).toString(); // e.g. year
          } else {
            word = `${word}${Math.floor(Math.random() * 10)}`;
          }
        }

        // Randomly add symbol punctuation if enabled
        if (includeSymbols && Math.random() < 0.25) {
          const symType = Math.random();
          if (symType < 0.25) {
            word = `${word}.`;
          } else if (symType < 0.5) {
            word = `${word},`;
          } else if (symType < 0.65) {
            word = `"${word}"`;
          } else if (symType < 0.8) {
            word = `(${word})`;
          } else if (symType < 0.9) {
            word = `${word}!`;
          } else {
            word = `${word}?`;
          }
        }

        randomWords.push(word);
      }
      return randomWords.join(' ');
    }
  };

  // Reset function
  const handleReset = () => {
    const freshText = generateText(mode, wordsCount);
    const charArray = freshText.split('').map(c => ({
      char: c,
      state: 'untyped' as const,
      typedChar: null
    }));

    setTargetText(freshText);
    setChars(charArray);
    setCurrentIndex(0);
    setTotalKeypresses(0);
    setCorrectKeypresses(0);
    setMistakesCount(0);
    setSecondsPassed(0);
    
    const initialTime = mode === 'paragraphs' ? duration : 0;
    setTimeLeft(initialTime);
    setChartData([]);
    setStatus('idle');

    // Reset Refs
    currentIndexRef.current = 0;
    charsRef.current = charArray;
    secondsPassedRef.current = 0;
    totalKeypressesRef.current = 0;
    correctKeypressesRef.current = 0;
    mistakesCountRef.current = 0;
    timeLeftRef.current = initialTime;

    // Focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
  };

  // Run handleReset whenever mode/time settings change
  useEffect(() => {
    handleReset();
  }, [mode, duration, wordsCount, includeNumbers, includeSymbols]);

  // General keyboard listener to autofocus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) return;
      if (e.key === 'Escape') {
        handleReset();
        return;
      }
      
      if (document.activeElement !== inputRef.current && status !== 'finished') {
        // Prevent typing in search or other tabs accidentally while focus is gained
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [status, mode, duration, wordsCount]);

  // Core Timer Tick Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (status === 'typing') {
      interval = setInterval(() => {
        const nextSeconds = secondsPassedRef.current + 1;
        secondsPassedRef.current = nextSeconds;
        setSecondsPassed(nextSeconds);

        // Calculate Realtime WPM
        const currentChars = charsRef.current;
        const curIdx = currentIndexRef.current;
        
        let errorsCount = 0;
        for (let i = 0; i < curIdx; i++) {
          if (currentChars[i]?.state === 'incorrect') {
            errorsCount++;
          }
        }

        const elapsedMins = nextSeconds / 60;
        const netWpm = Math.max(0, Math.round(((curIdx - errorsCount) / 5) / elapsedMins));

        // Append chart timeline
        setChartData(prev => [
          ...prev,
          {
            second: nextSeconds,
            wpm: netWpm,
            errors: errorsCount
          }
        ]);

        // Paragraph Countdown Logic
        if (mode === 'paragraphs') {
          const nextTimeLeft = timeLeftRef.current - 1;
          timeLeftRef.current = nextTimeLeft;
          setTimeLeft(nextTimeLeft);

          if (nextTimeLeft <= 0) {
            if (interval) clearInterval(interval);
            finishTest(
              curIdx, 
              currentChars, 
              nextSeconds, 
              totalKeypressesRef.current, 
              correctKeypressesRef.current, 
              mistakesCountRef.current
            );
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, mode]);

  // Conclude the typing session, calculate scores, log records
  const finishTest = (
    finalIndex: number, 
    finalChars: CharState[], 
    finalSeconds: number, 
    finalKeypresses: number, 
    finalCorrectKeypresses: number, 
    finalMistakesCount: number
  ) => {
    setStatus('finished');

    // Calculate final metrics
    const elapsed = mode === 'paragraphs' ? duration : finalSeconds;
    const elapsedMins = elapsed > 0 ? elapsed / 60 : 1 / 60;

    let activeErrors = 0;
    finalChars.slice(0, finalIndex).forEach(c => {
      if (c.state === 'incorrect') activeErrors++;
    });

    const finalWpm = Math.max(0, Math.round(((finalIndex - activeErrors) / 5) / elapsedMins));
    const finalAcc = finalKeypresses > 0 
      ? Math.round((finalCorrectKeypresses / finalKeypresses) * 100) 
      : 100;

    const newRecord: HistoryRecord = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      duration: elapsed,
      wpm: finalWpm,
      accuracy: finalAcc,
      mistakes: finalMistakesCount,
      mode: mode
    };

    setHistory(prev => {
      const updated = [...prev, newRecord];
      localStorage.setItem('typing_speed_test_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Keyboard Event Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape handled by global listener
    if (e.key === 'Escape') return;

    if (status === 'finished') return;

    const charsCopy = [...chars];

    // Backspace Support
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentIndex > 0) {
        if (e.ctrlKey || e.metaKey) {
          // Word-level Backspace: delete all letters up to preceding space
          let tempIdx = currentIndex;
          // If we are currently sitting on a trailing space, erase it first
          if (charsCopy[tempIdx - 1].char === ' ' && tempIdx > 1) {
            tempIdx--;
            charsCopy[tempIdx].state = 'untyped';
            charsCopy[tempIdx].typedChar = null;
          }
          // Backspace through characters
          while (tempIdx > 0 && charsCopy[tempIdx - 1].char !== ' ') {
            tempIdx--;
            charsCopy[tempIdx].state = 'untyped';
            charsCopy[tempIdx].typedChar = null;
          }
          setCurrentIndex(tempIdx);
          currentIndexRef.current = tempIdx;
        } else {
          // Simple single letter Backspace
          const targetIdx = currentIndex - 1;
          charsCopy[targetIdx].state = 'untyped';
          charsCopy[targetIdx].typedChar = null;
          setCurrentIndex(targetIdx);
          currentIndexRef.current = targetIdx;
        }
        setChars(charsCopy);
        charsRef.current = charsCopy;
      }
      return;
    }

    // Normal Character Inputs
    if (e.key.length === 1) {
      e.preventDefault();

      let currentStatus = status;
      if (status === 'idle') {
        currentStatus = 'typing';
        setStatus('typing');
        setSecondsPassed(0);
        setChartData([]);
      }

      const expectedChar = targetText[currentIndex];
      const typedKey = e.key;
      const isCorrect = typedKey === expectedChar;

      // Log progress
      charsCopy[currentIndex].state = isCorrect ? 'correct' : 'incorrect';
      charsCopy[currentIndex].typedChar = typedKey;

      setTotalKeypresses(prev => prev + 1);
      const nextCorrectKeypresses = isCorrect ? correctKeypresses + 1 : correctKeypresses;
      if (isCorrect) {
        setCorrectKeypresses(prev => prev + 1);
      }

      const nextMistakesCount = isCorrect ? mistakesCount : mistakesCount + 1;
      if (!isCorrect) {
        setMistakesCount(prev => prev + 1);
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      currentIndexRef.current = nextIndex;

      setChars(charsCopy);
      charsRef.current = charsCopy;

      // Word Completion Check
      if (nextIndex >= targetText.length) {
        if (mode === 'words') {
          // In Words mode, completion occurs instantly when last character typed
          finishTest(
            nextIndex, 
            charsCopy, 
            secondsPassedRef.current, 
            totalKeypressesRef.current + 1, 
            nextCorrectKeypresses, 
            nextMistakesCount
          );
        } else {
          // Continuous Paragraph typing: automatically append a new paragraph nicely
          const extraSnippet = generateText('paragraphs');
          const extraSnippetChars = extraSnippet.split('').map(c => ({
            char: c,
            state: 'untyped' as const,
            typedChar: null
          }));

          const combinedText = targetText + ' ' + extraSnippet;
          const combinedChars = [
            ...charsCopy,
            { char: ' ', state: 'untyped' as const, typedChar: null },
            ...extraSnippetChars
          ];

          setTargetText(combinedText);
          setChars(combinedChars);
          charsRef.current = combinedChars;
        }
      }
    }
  };

  // Empty function for input onChange to satisfy React React elements requirements
  const handleInputChange = () => {};

  // Clear Session History
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('typing_speed_test_history');
  };

  // Calculate stats for current typing state
  const elapsedSeconds = mode === 'paragraphs' ? (duration - timeLeft) : secondsPassed;
  const elapsedMinutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 1 / 60;
  
  let activeErrors = 0;
  chars.slice(0, currentIndex).forEach(c => {
    if (c.state === 'incorrect') activeErrors++;
  });

  const liveWpm = Math.max(0, Math.round(((currentIndex - activeErrors) / 5) / elapsedMinutes));
  const liveAccuracy = totalKeypresses > 0 
    ? Math.round((correctKeypresses / totalKeypresses) * 100) 
    : 100;

  // Split target text into words structure for wrapping lines beautifully without breaks
  const processWords = () => {
    const wordList: Array<{ chars: Array<{ char: string; absIdx: number }>; space: { char: string; absIdx: number } | null }> = [];
    const splitWords = targetText.split(' ');
    let globalCharIndex = 0;

    for (let w = 0; w < splitWords.length; w++) {
      const wordString = splitWords[w];
      const wordCharsObj = [];
      
      for (let c = 0; c < wordString.length; c++) {
        wordCharsObj.push({
          char: wordString[c],
          absIdx: globalCharIndex
        });
        globalCharIndex++;
      }

      const hasNextSpace = w < splitWords.length - 1;
      let spaceObj = null;
      if (hasNextSpace) {
        spaceObj = {
          char: ' ',
          absIdx: globalCharIndex
        };
        globalCharIndex++;
      }

      wordList.push({
        chars: wordCharsObj,
        space: spaceObj
      });
    }

    return wordList;
  };

  const processedWords = processWords();

  return (
    <div className="flex flex-col min-h-screen px-4 py-8 select-none bg-bg-dark text-mt-text justify-center items-center" id="main-test-layout">
      
      {/* Container Card */}
      <div className="w-full max-w-4xl space-y-6 flex flex-col justify-center">
        
        {/* Header Branding */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-mt-gray/10 pb-5" id="app-workspace-header">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-select/10 border border-amber-select/20 shadow-md">
              <Keyboard className="w-6 h-6 text-amber-select" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold tracking-tight text-white">type</span>
                <span className="font-mono text-xl text-amber-select font-semibold">:speed</span>
                <Sparkles className="w-4 h-4 text-amber-select/80" />
              </div>
              <p className="text-xs font-mono text-mt-gray">Minimalist, premium typing trainer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-bg-charcoal/60 px-2 py-1 rounded text-mt-gray border border-mt-gray/5">
              Press <span className="text-white font-semibold">esc</span> to restart
            </span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {status !== 'finished' ? (
            <motion.div
              key="typing-arena"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              
              {/* Test Options */}
              <TestConfig 
                mode={mode}
                setMode={setMode}
                duration={duration}
                setDuration={setDuration}
                wordsCount={wordsCount}
                setWordsCount={setWordsCount}
                includeNumbers={includeNumbers}
                setIncludeNumbers={setIncludeNumbers}
                includeSymbols={includeSymbols}
                setIncludeSymbols={setIncludeSymbols}
                isDisabled={status === 'typing'}
              />

              {/* Status Header / Live Stats */}
              <div className="flex items-center justify-between px-2 font-mono" id="live-indicator-stats">
                <div className="flex items-center gap-4 text-xs">
                  {mode === 'paragraphs' ? (
                    <div className="flex items-center gap-1.5 text-amber-select bg-amber-select/10 px-3 py-1.5 rounded-lg border border-amber-select/15">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold text-sm w-8">{timeLeft}s</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-mt-correct bg-mt-correct/10 px-3 py-1.5 rounded-lg border border-mt-correct/15">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{currentIndex}/{targetText.length} chars</span>
                    </div>
                  )}

                  {/* Seconds ticked up in words count mode */}
                  {mode === 'words' && status === 'typing' && (
                    <span className="text-mt-gray">{secondsPassed}s ticked</span>
                  )}
                </div>

                <AnimatePresence>
                  {status === 'typing' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-4 text-xs font-semibold"
                    >
                      <span className="text-mt-gray">Live Speed: <strong className="text-amber-select">{liveWpm} WPM</strong></span>
                      <span className="w-1.5 h-1.5 bg-mt-gray/30 rounded-full" />
                      <span className="text-mt-gray">Live Acc: <strong className="text-mt-correct">{liveAccuracy}%</strong></span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Active Typing Screen Canvas */}
              <div 
                onClick={() => inputRef.current?.focus()}
                className="relative bg-bg-charcoal/30 border border-mt-gray/10 rounded-2xl p-6 md:p-8 min-h-[160px] flex items-center shadow-inner cursor-pointer"
                id="arena-touchpoint"
              >
                
                {/* Hidden Input field */}
                <input
                  ref={inputRef}
                  type="text"
                  value=""
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setIsFocused(false)}
                  onFocus={() => setIsFocused(true)}
                  name="typingInput"
                  id="invisible-text-typing-input"
                  className="absolute opacity-0 pointer-events-none w-0 h-0"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                />

                {/* Focus request overlay */}
                {!isFocused && (
                  <div className="absolute inset-0 bg-bg-dark/90 backdrop-blur-[2px] flex items-center justify-center transition-all duration-200 z-10 rounded-2xl">
                    <div className="text-center space-y-2">
                      <p className="text-amber-select font-mono text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                        <span>⌨️</span> Test Paused
                      </p>
                      <p className="text-mt-text font-mono text-sm opacity-90">Click anywhere on this card to focus & continue</p>
                    </div>
                  </div>
                )}

                {/* Canvas Rendered Words */}
                <div className="flex flex-wrap text-lg md:text-2xl font-mono leading-relaxed select-none outline-none text-mt-gray w-full" id="target-typing-words-lines">
                  {processedWords.map((wordObj, wIdx) => (
                    <div key={`word-${wIdx}`} className="flex items-center whitespace-nowrap mb-1 mr-3 md:mr-4">
                      {wordObj.chars.map((charObj) => {
                        const charState = chars[charObj.absIdx];
                        const isActive = charObj.absIdx === currentIndex;
                        
                        let charStyle = "transition-all duration-75 relative rounded-sm ";
                        if (isActive) {
                          charStyle += "text-amber-select bg-amber-select/15 border-l-2 border-amber-select font-bold animate-caret ";
                        } else if (charState?.state === 'correct') {
                          charStyle += "text-mt-text ";
                        } else if (charState?.state === 'incorrect') {
                          charStyle += "char-incorrect text-mt-error ";
                        } else {
                          charStyle += "text-mt-gray ";
                        }
                        
                        return (
                          <span 
                            key={`char-${charObj.absIdx}`} 
                            className={charStyle}
                          >
                            {charObj.char}
                          </span>
                        );
                      })}
                      
                      {/* Space character logic */}
                      {wordObj.space && (() => {
                        const charState = chars[wordObj.space.absIdx];
                        const isActive = wordObj.space.absIdx === currentIndex;
                        
                        let spaceStyle = "transition-all duration-75 relative rounded-sm border-b border-transparent ";
                        if (isActive) {
                          spaceStyle += "text-amber-select bg-amber-select/15 border-l-2 border-amber-select font-bold animate-caret px-0.5 ";
                        } else if (charState?.state === 'correct') {
                          spaceStyle += "text-mt-correct/40 px-0.5 ";
                        } else if (charState?.state === 'incorrect') {
                          spaceStyle += "bg-mt-error/20 text-mt-error border-b border-mt-error px-0.5 ";
                        } else {
                          spaceStyle += "text-transparent px-0.5 ";
                        }
                        
                        return (
                          <span 
                            key={`space-${wordObj.space.absIdx}`} 
                            className={spaceStyle}
                          >
                            ␣
                          </span>
                        );
                      })()}
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom Control Bar */}
              <div className="flex items-center justify-center pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-bg-charcoal/50 border border-mt-gray/10 hover:border-amber-select/40 hover:text-amber-select text-mt-gray text-xs font-mono px-5 py-2.5 rounded-xl sm:w-auto transition-all duration-200 uppercase tracking-wider font-semibold hover:shadow-md"
                  id="reset-typing-room-btn"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart Snippet
                </button>
              </div>

            </motion.div>
          ) : (
            
            // Stats & Results Dashboard view
            <motion.div
              key="results-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="space-y-6"
            >
              
              {/* Core summary grid banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="results-banner-board">
                
                {/* WPM score */}
                <div className="bg-bg-charcoal/40 border border-mt-gray/10 p-5 rounded-2xl text-center space-y-1 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-2 right-2 p-1 bg-amber-select/10 rounded-lg">
                    <Zap className="w-4 h-4 text-amber-select" />
                  </div>
                  <span className="text-xs font-mono text-mt-gray uppercase tracking-wider font-bold">WPM (Net)</span>
                  <p className="text-4xl md:text-5xl font-mono font-black text-amber-select">{liveWpm}</p>
                  <span className="text-[10px] font-mono text-mt-gray opacity-80">Words Per Minute</span>
                </div>

                {/* Keystroke Accuracy */}
                <div className="bg-bg-charcoal/40 border border-mt-gray/10 p-5 rounded-2xl text-center space-y-1 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-2 right-2 p-1 bg-mt-correct/10 rounded-lg">
                    <Percent className="w-4 h-4 text-mt-correct" />
                  </div>
                  <span className="text-xs font-mono text-mt-gray uppercase tracking-wider font-bold">Accuracy</span>
                  <p className="text-4xl md:text-5xl font-mono font-black text-mt-correct">{liveAccuracy}%</p>
                  <span className="text-[10px] font-mono text-mt-gray opacity-80">Correct keys / total</span>
                </div>

                {/* Mistakes volume */}
                <div className="bg-bg-charcoal/40 border border-mt-gray/10 p-5 rounded-2xl text-center space-y-1 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-2 right-2 p-1 bg-mt-error/10 rounded-lg">
                    <XCircle className="w-4 h-4 text-mt-error" />
                  </div>
                  <span className="text-xs font-mono text-mt-gray uppercase tracking-wider font-bold">Mistakes</span>
                  <p className="text-4xl md:text-5xl font-mono font-black text-mt-error">{mistakesCount}</p>
                  <span className="text-[10px] font-mono text-mt-gray opacity-80">Errors registered</span>
                </div>

                {/* Time Elapsed */}
                <div className="bg-bg-charcoal/40 border border-mt-gray/10 p-5 rounded-2xl text-center space-y-1 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-2 right-2 p-1 bg-white/5 rounded-lg">
                    <Clock className="w-4 h-4 text-mt-text" />
                  </div>
                  <span className="text-xs font-mono text-mt-gray uppercase tracking-wider font-bold">Time Taken</span>
                  <p className="text-4xl md:text-5xl font-mono font-black text-white">{elapsedSeconds}s</p>
                  <span className="text-[10px] font-mono text-mt-gray opacity-80">Elapsed seconds</span>
                </div>

              </div>

              {/* Progress Flow Vector Chart */}
              <StatsChart data={chartData} />

              {/* Dynamic feedback panel explaining math and stats */}
              <div className="bg-bg-charcoal/20 border border-mt-gray/10 rounded-xl p-4 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-select shrink-0 mt-0.5" />
                <div className="text-xs font-mono space-y-1">
                  <p className="text-white font-semibold">How are your metrics computed?</p>
                  <p className="text-mt-gray leading-relaxed">
                    <strong>Net WPM</strong> represents your actual corrected input rating, formulated as <code className="text-amber-select bg-bg-dark px-1.5 py-0.5 rounded text-[10px]">((Total Letters Typed - Uncorrected Mistakes) / 5) / (Minutes Taken)</code>. 
                    <strong> Accuracy</strong> is calculated strictly against your total interactive keystrokes <code className="text-mt-correct bg-bg-dark px-1.5 py-0.5 rounded text-[10px]">(Correct Inputs / Total Keypresses) * 100</code> to prioritize precise muscular memory. Correcting your mistakes using <strong className="text-white">Backspace</strong> reverses error counts!
                  </p>
                </div>
              </div>

              {/* Retry Navigation CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-select text-bg-charcoal font-mono font-black uppercase text-sm tracking-wider px-6 py-3 rounded-xl hover:bg-white hover:text-bg-charcoal transition-all shadow-md active:scale-95 duration-150"
                  id="results-retry-cta"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Sessions Log / Leaderboard */}
        <div className="border-t border-mt-gray/10 pt-5 space-y-4" id="sessions-history-section">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-select" />
            <h3 className="font-mono font-bold text-sm uppercase tracking-widest text-white">Your Performance History</h3>
          </div>
          
          <HistoryList 
            history={history} 
            onClearHistory={handleClearHistory} 
          />
        </div>

      </div>

      {/* Styled minimalistic subtle footer */}
      <footer className="mt-12 text-center text-[10px] font-mono text-mt-gray/50 select-none space-y-1">
        <p>Built with React, Tailwind CSS and Motion.</p>
        <p>Press Esc, Tab+Enter, or click the Restart button to wipe and load a fresh text snippet.</p>
      </footer>
    </div>
  );
}
