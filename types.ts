export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
  count?: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AnalysisResult {
  summary: string;
  impact: string;
  optimizationTips: string[];
}
