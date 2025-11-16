
export interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  cls: number;
  tbt: number;
  loadTime: number;
  speedIndex: number;
}

export interface TestResult {
  baseline: PerformanceMetrics;
  withExtension: PerformanceMetrics;
}

export interface HistoricalData {
  run: number;
  url: string;
  baselineLCP: number;
  extensionLCP: number;
}
