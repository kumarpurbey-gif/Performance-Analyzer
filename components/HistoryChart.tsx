
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoricalData } from '../types';

interface HistoryChartProps {
  data: HistoricalData[];
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
  return (
    <div className="space-y-4 pt-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-on-surface">LCP History</h2>
      <div className="w-full h-80 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="run" stroke="#9ca3af" label={{ value: 'Test Run', position: 'insideBottom', offset: -15, fill: '#9ca3af' }} />
            <YAxis stroke="#9ca3af" label={{ value: 'LCP (ms)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #4b5563',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
            <Line type="monotone" dataKey="baselineLCP" name="Baseline LCP" stroke="#34d399" activeDot={{ r: 8 }} strokeWidth={2} />
            <Line type="monotone" dataKey="extensionLCP" name="Extension LCP" stroke="#fb923c" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
