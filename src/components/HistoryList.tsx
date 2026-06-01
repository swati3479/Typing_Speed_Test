import React from 'react';
import { Trash2, TrendingUp, Award, Clock } from 'lucide-react';
import { HistoryRecord } from '../types';

interface HistoryListProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
}

export default function HistoryList({ history, onClearHistory }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="bg-bg-charcoal/20 border border-mt-gray/10 rounded-xl p-6 text-center" id="history-empty-state">
        <TrendingUp className="mx-auto text-mt-gray/30 w-8 h-8 mb-2" />
        <p className="text-sm font-mono text-mt-gray">No local typing tests logged yet.</p>
        <p className="text-xs font-mono text-mt-gray/60 mt-1">Complete a test to log your speed and accuracy!</p>
      </div>
    );
  }

  // Calculate some aggregate metrics
  const speeds = history.map(h => h.wpm);
  const bestWpm = Math.max(...speeds);
  const averageWpm = Math.round(speeds.reduce((acc, curr) => acc + curr, 0) / speeds.length);
  const averageAcc = Math.round(history.map(h => h.accuracy).reduce((acc, curr) => acc + curr, 0) / history.length);

  return (
    <div className="space-y-4" id="history-container">
      {/* Session Aggregates */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-charcoal/40 border border-mt-gray/5 p-3 rounded-lg text-center flex flex-col justify-center">
          <div className="text-[10px] text-mt-gray font-mono uppercase tracking-wider flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-select" />
            Best Speed
          </div>
          <p className="text-xl font-semibold font-mono text-amber-select mt-1">{bestWpm} <span className="text-xs opacity-70">WPM</span></p>
        </div>
        <div className="bg-bg-charcoal/40 border border-mt-gray/5 p-3 rounded-lg text-center flex flex-col justify-center">
          <div className="text-[10px] text-mt-gray font-mono uppercase tracking-wider">Average Speed</div>
          <p className="text-xl font-semibold font-mono text-mt-text mt-1">{averageWpm} <span className="text-xs opacity-70">WPM</span></p>
        </div>
        <div className="bg-bg-charcoal/40 border border-mt-gray/5 p-3 rounded-lg text-center flex flex-col justify-center">
          <div className="text-[10px] text-mt-gray font-mono uppercase tracking-wider">Average Acc</div>
          <p className="text-xl font-semibold font-mono text-mt-correct mt-1">{averageAcc}%</p>
        </div>
      </div>

      {/* History table */}
      <div className="bg-bg-charcoal/30 border border-mt-gray/10 rounded-xl overflow-hidden shadow-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-mt-gray/10 bg-bg-charcoal/40">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-mt-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-mt-gray" />
            Results Log ({history.length})
          </h4>
          <button
            onClick={onClearHistory}
            className="text-mt-error/70 hover:text-mt-error text-xs font-mono transition-colors flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-mt-error/15"
            title="Clear all local history"
            id="clear-all-history-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left font-mono text-sm border-collapse" id="history-table">
            <thead>
              <tr className="text-mt-gray text-[10px] uppercase tracking-wider bg-bg-charcoal/25 border-b border-mt-gray/10">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Mode</th>
                <th className="px-4 py-2">Speed</th>
                <th className="px-4 py-2">Accuracy</th>
                <th className="px-4 py-2">Mistakes</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0).reverse().map((record) => {
                const dateObj = new Date(record.timestamp);
                const formattedDate = dateObj.toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                
                return (
                  <tr 
                    key={record.id} 
                    className="border-b border-mt-gray/5 hover:bg-bg-charcoal/20 transition-all group font-medium"
                  >
                    <td className="px-4 py-2 text-mt-gray text-xs truncate max-w-[120px]" title={dateObj.toLocaleString()}>
                      {formattedDate}
                    </td>
                    <td className="px-4 py-2 text-xs text-mt-gray">
                      <span className="bg-bg-dark/60 text-mt-text px-1.5 py-0.5 rounded text-[10px] border border-mt-gray/5">
                        {record.mode} ({record.duration}s)
                      </span>
                    </td>
                    <td className="px-4 py-2 text-amber-select font-semibold">
                      {record.wpm} WPM
                    </td>
                    <td className="px-4 py-2 text-mt-correct">
                      {record.accuracy}%
                    </td>
                    <td className="px-4 py-2 text-mt-error text-xs">
                      {record.mistakes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
