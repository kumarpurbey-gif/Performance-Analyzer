
import React from 'react';

// Basic markdown to HTML converter
function markdownToHtml(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`{3,}([\s\S]*?)`{3,}/g, '<pre class="bg-gray-900 p-4 rounded-md overflow-x-auto"><code>$1</code></pre>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-700 text-red-300 px-1 rounded">$1</code>')
        .replace(/^\d+\.\s(.*)/gm, '<li class="ml-6">$1</li>')
        .replace(/^- (.*)/gm, '<li class="ml-6">$1</li>')
        .replace(/\n/g, '<br />');
}


interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-surface rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-on-surface">AI Performance Analysis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto prose prose-invert prose-sm sm:prose-base max-w-none">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
          ) : (
            <p>No analysis available.</p>
          )}
        </div>
        <footer className="p-4 border-t border-gray-700 text-right">
            <button onClick={onClose} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg">
                Close
            </button>
        </footer>
      </div>
    </div>
  );
};
