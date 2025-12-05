import React, { useMemo } from 'react';
import * as Diff from 'https://esm.sh/diff';
import { DiffPart } from '../types';

interface DiffViewerProps {
  original: string;
  modified: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified }) => {
  const diffs = useMemo(() => {
    // Use diffWords for a more granular, human-readable SQL diff
    // Alternatively diffLines is better for massive queries
    return Diff.diffWordsWithSpace(original, modified);
  }, [original, modified]);

  if (!original && !modified) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
        Enter SQL to see differences
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
         <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visual Difference</span>
      </div>
      
      <div className="p-6 font-mono text-sm leading-7 overflow-y-auto flex-1 whitespace-pre-wrap">
        {diffs.map((part: DiffPart, index: number) => {
          if (part.added) {
            return (
              <span 
                key={index} 
                className="bg-diff-add text-diff-addText px-1 py-0.5 rounded mx-0.5 border border-green-200/50"
              >
                {part.value}
              </span>
            );
          }
          if (part.removed) {
            return (
              <span 
                key={index} 
                className="bg-diff-del text-diff-delText px-1 py-0.5 rounded mx-0.5 border border-red-200/50 line-through decoration-red-400/50 decoration-2"
              >
                {part.value}
              </span>
            );
          }
          return <span key={index} className="text-slate-600">{part.value}</span>;
        })}
      </div>
    </div>
  );
};
