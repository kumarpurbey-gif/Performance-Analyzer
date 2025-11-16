
import React from 'react';
import type { TestResult, PerformanceMetrics } from '../types';
import { WandIcon } from './icons/WandIcon';
import { Spinner } from './Spinner';

interface ResultsDisplayProps {
  result: TestResult;
  onGetAnalysis: () => void;
  isAnalyzing: boolean;
}

const MetricRow: React.FC<{ label: string; unit: string; baselineValue: number; extensionValue: number }> = ({ label, unit, baselineValue, extensionValue }) => {
  const delta = extensionValue - baselineValue;
  const percentageDelta = baselineValue > 0 ? (delta / baselineValue) * 100 : 0;
  
  let deltaColorClass = 'text-gray-400';
  if (percentageDelta > 10) deltaColorClass = 'text-red-400';
  else if (percentageDelta < -5) deltaColorClass = 'text-green-400';
  
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <tr className="border-b border-gray-700">
      <td className="py-4 px-2 sm:px-4 font-semibold">{label}</td>
      <td className="py-4 px-2 sm:px-4 text-center">{baselineValue.toFixed(0)}{unit}</td>
      <td className="py-4 px-2 sm:px-4 text-center">{extensionValue.toFixed(0)}{unit}</td>
      <td className={`py-4 px-2 sm:px-4 text-center font-mono ${deltaColorClass}`}>
        {deltaSign}{delta.toFixed(0)}{unit} ({deltaSign}{percentageDelta.toFixed(1)}%)
      </td>
    </tr>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onGetAnalysis, isAnalyzing }) => {
  const metrics: Array<{ key: keyof PerformanceMetrics; label: string; unit: string }> = [
    { key: 'lcp', label: 'Largest Contentful Paint', unit: 'ms' },
    { key: 'fcp', label: 'First Contentful Paint', unit: 'ms' },
    { key: 'tbt', label: 'Total Blocking Time', unit: 'ms' },
    { key: 'loadTime', label: 'Page Load Time', unit: 'ms' },
    { key: 'cls', label: 'Cumulative Layout Shift', unit: '' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-on-surface">Performance Results</h2>
        <button
            onClick={onGetAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-gray-500 disabled:cursor-wait"
        >
            {isAnalyzing ? <Spinner /> : <WandIcon />}
            {isAnalyzing ? 'Analyzing...' : 'Get AI Analysis'}
        </button>
      </div>
      <div className="overflow-x-auto bg-gray-900/50 rounded-lg border border-gray-700">
        <table className="w-full text-left text-on-surface-secondary">
          <thead className="bg-gray-800 text-sm uppercase text-on-surface">
            <tr>
              <th className="py-3 px-2 sm:px-4">Metric</th>
              <th className="py-3 px-2 sm:px-4 text-center">Baseline</th>
              <th className="py-3 px-2 sm:px-4 text-center">With Extension</th>
              <th className="py-3 px-2 sm:px-4 text-center">Impact (Delta)</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(metric => (
              <MetricRow 
                key={metric.key} 
                label={metric.label} 
                unit={metric.unit}
                baselineValue={result.baseline[metric.key]} 
                extensionValue={result.withExtension[metric.key]} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
