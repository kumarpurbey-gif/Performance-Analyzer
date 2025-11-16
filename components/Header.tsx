
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 md:px-8 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-green-400 mb-2">
        Extension Performance Analyzer
      </h1>
      <p className="text-lg text-on-surface-secondary">
        Measure the performance impact of your browser extension.
      </p>
    </header>
  );
};
