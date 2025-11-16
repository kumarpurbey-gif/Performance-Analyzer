
import React, { useState, useCallback } from 'react';
import { runPerformanceTest } from './services/performanceService';
import { getPerformanceAnalysis } from './services/geminiService';
import type { PerformanceMetrics, TestResult, HistoricalData } from './types';
import { UrlInputForm } from './components/UrlInputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { HistoryChart } from './components/HistoryChart';
import { AnalysisModal } from './components/AnalysisModal';
import { Header } from './components/Header';
import { Spinner } from './components/Spinner';

export default function App(): React.ReactElement {
  const [url, setUrl] = useState<string>('https://react.dev');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleRunTest = useCallback(async (testUrl: string) => {
    setIsLoading(true);
    setError(null);
    setLatestResult(null);
    setAnalysis(null);

    try {
      const [baseline, withExtension] = await Promise.all([
        runPerformanceTest(testUrl, false),
        runPerformanceTest(testUrl, true)
      ]);

      const newResult: TestResult = { baseline, withExtension };
      setLatestResult(newResult);

      setHistoricalData(prev => [...prev, {
        run: prev.length + 1,
        url: testUrl,
        baselineLCP: baseline.lcp,
        extensionLCP: withExtension.lcp,
      }]);
    } catch (err) {
      setError('Failed to run performance test. The target site might be blocking iframe loading or has strict security policies.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGetAnalysis = useCallback(async () => {
    if (!latestResult) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysisText = await getPerformanceAnalysis(latestResult.baseline, latestResult.withExtension);
      setAnalysis(analysisText);
      setIsModalOpen(true);
    } catch (err) {
      setError('Failed to get AI analysis. Please check your Gemini API key and network connection.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [latestResult]);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-surface rounded-xl shadow-2xl p-6 md:p-8 space-y-8">
          <UrlInputForm
            url={url}
            setUrl={setUrl}
            onRunTest={handleRunTest}
            isLoading={isLoading}
          />

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
              <p className="font-bold">An Error Occurred</p>
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 text-on-surface-secondary">
              <Spinner />
              <p className="text-lg animate-pulse">Running performance tests...</p>
              <p className="text-sm">This may take up to 30 seconds.</p>
            </div>
          )}

          {latestResult && !isLoading && (
            <ResultsDisplay
              result={latestResult}
              onGetAnalysis={handleGetAnalysis}
              isAnalyzing={isAnalyzing}
            />
          )}

          {historicalData.length > 1 && !isLoading && (
            <HistoryChart data={historicalData} />
          )}
        </div>
      </main>
      <AnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={analysis}
      />
    </div>
  );
}
