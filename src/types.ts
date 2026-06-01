export interface HistoryRecord {
  id: string;
  timestamp: string;
  duration: number;
  wpm: number;
  accuracy: number;
  mistakes: number;
  mode: 'paragraphs' | 'words';
}

export interface ChartDataPoint {
  second: number;
  wpm: number;
  errors: number;
}
