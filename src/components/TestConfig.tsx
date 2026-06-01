import React from 'react';
import { AlignJustify, Type, Clock, Hash, Percent, Binary } from 'lucide-react';

interface TestConfigProps {
  mode: 'paragraphs' | 'words';
  setMode: (mode: 'paragraphs' | 'words') => void;
  duration: number;
  setDuration: (duration: number) => void;
  wordsCount: 10 | 25 | 50 | 100;
  setWordsCount: (count: 10 | 25 | 50 | 100) => void;
  includeNumbers: boolean;
  setIncludeNumbers: (include: boolean) => void;
  includeSymbols: boolean;
  setIncludeSymbols: (include: boolean) => void;
  isDisabled: boolean;
}

export default function TestConfig({
  mode,
  setMode,
  duration,
  setDuration,
  wordsCount,
  setWordsCount,
  includeNumbers,
  setIncludeNumbers,
  includeSymbols,
  setIncludeSymbols,
  isDisabled
}: TestConfigProps) {
  return (
    <div 
      className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 bg-bg-charcoal/40 rounded-xl border border-mt-gray/10 text-xs font-mono select-none transition-all duration-300 ${
        isDisabled ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      id="test-config-panel"
    >
      {/* Category selector & Toggles row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Main Mode select */}
        <div className="flex items-center gap-1 bg-bg-dark px-1.5 py-1 rounded-lg border border-mt-gray/5">
          <button
            onClick={() => setMode('paragraphs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              mode === 'paragraphs' 
                ? 'bg-amber-select text-bg-charcoal font-semibold shadow-sm' 
                : 'text-mt-gray hover:text-mt-text cursor-pointer'
            }`}
            id="mode-paragraphs-btn"
          >
            <AlignJustify className="w-3.5 h-3.5" />
            Quotes
          </button>
          <button
            onClick={() => setMode('words')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              mode === 'words' 
                ? 'bg-amber-select text-bg-charcoal font-semibold shadow-sm' 
                : 'text-mt-gray hover:text-mt-text cursor-pointer'
            }`}
            id="mode-words-btn"
          >
            <Type className="w-3.5 h-3.5" />
            Random Words
          </button>
        </div>

        {/* Numbers & Symbols Modifiers */}
        <div className="flex items-center gap-1 bg-bg-dark px-1.5 py-1 rounded-lg border border-mt-gray/5">
          <button
            onClick={() => setIncludeNumbers(!includeNumbers)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
              includeNumbers 
                ? 'text-amber-select font-bold bg-amber-select/10' 
                : 'text-mt-gray hover:text-mt-text'
            }`}
            id="toggle-numbers-btn"
            title="Toggle numbers in text"
          >
            <Binary className="w-3.5 h-3.5" />
            numbers
          </button>
          <div className="w-[1px] h-3.5 bg-mt-gray/15 mx-1" />
          <button
            onClick={() => setIncludeSymbols(!includeSymbols)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
              includeSymbols 
                ? 'text-amber-select font-bold bg-amber-select/10' 
                : 'text-mt-gray hover:text-mt-text'
            }`}
            id="toggle-symbols-btn"
            title="Toggle punctuation and symbols"
          >
            <Percent className="w-3.5 h-3.5" />
            symbols
          </button>
        </div>
      </div>

      {/* Constraints selector (Timer vs Word Count) */}
      <div className="flex items-center gap-2">
        {mode === 'paragraphs' ? (
          <div className="flex items-center gap-1 bg-bg-dark px-1.5 py-1 rounded-lg border border-mt-gray/5 overflow-x-auto max-w-full">
            <span className="flex items-center gap-1 pr-2 border-r border-mt-gray/10 text-mt-gray text-[10px] uppercase tracking-wider font-semibold shrink-0">
              <Clock className="w-3 h-3 text-amber-select" />
              Time
            </span>
            {([10, 15, 30, 60, 120, 300] as const).map((secs) => (
              <button
                key={secs}
                onClick={() => setDuration(secs)}
                className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer shrink-0 ${
                  duration === secs 
                    ? 'text-amber-select font-bold bg-amber-select/5' 
                    : 'text-mt-gray hover:text-mt-text'
                }`}
              >
                {secs}s
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-bg-dark px-1.5 py-1 rounded-lg border border-mt-gray/5">
            <span className="flex items-center gap-1 pr-2 border-r border-mt-gray/10 text-mt-gray text-[10px] uppercase tracking-wider font-semibold shrink-0">
              <Hash className="w-3 h-3 text-amber-select" />
              Words
            </span>
            {([10, 25, 50, 100] as const).map((count) => (
              <button
                key={count}
                onClick={() => setWordsCount(count)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer shrink-0 ${
                  wordsCount === count 
                    ? 'text-amber-select font-bold bg-amber-select/5' 
                    : 'text-mt-gray hover:text-mt-text'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
