import React from 'react';
import { AnalysisResult, AnalysisStatus } from '../types';
import { Sparkles, AlertCircle, Zap, Lightbulb } from 'lucide-react';

interface AnalysisCardProps {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  onAnalyze: () => void;
  hasInput: boolean;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ status, result, onAnalyze, hasInput }) => {
  
  if (status === AnalysisStatus.IDLE) {
    // Hidden when idle to keep UI clean, or show a placeholder? 
    // M3 philosophy usually suggests "Empty States" are okay, but let's just keep it minimal.
    // The "Analyze" button is now prominent in the main view, so we don't need a card here prompting to analyze.
    return null; 
  }

  if (status === AnalysisStatus.LOADING) {
     return (
      <div className="rounded-3xl p-8 bg-md-sys-surfaceVariant/20 border border-md-sys-outline/10 flex flex-col items-center justify-center animate-pulse min-h-[200px]">
        <div className="h-12 w-12 rounded-full bg-md-sys-primaryContainer mb-4"></div>
        <div className="h-4 w-48 bg-md-sys-surfaceVariant rounded mb-2"></div>
        <div className="h-3 w-32 bg-md-sys-surfaceVariant/50 rounded"></div>
      </div>
    );
  }

  if (status === AnalysisStatus.ERROR) {
    return (
      <div className="bg-md-sys-errorContainer text-md-sys-onErrorContainer rounded-3xl p-6 flex gap-4 items-start shadow-sm">
        <AlertCircle className="shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-lg">Analysis Failed</h3>
          <p className="text-sm mt-1 opacity-90">We couldn't generate insights at this time. Please check your query or API key.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-md-sys-surface rounded-3xl border border-md-sys-outline/10 shadow-elevation-1 overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="px-6 py-5 bg-md-sys-secondaryContainer text-md-sys-onSecondaryContainer flex items-center gap-3">
         <Sparkles size={24} className="text-md-sys-primary" />
         <h3 className="text-xl font-normal">Analysis Results</h3>
      </div>
      
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Summary & Impact */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-md-sys-primary tracking-wider uppercase">Summary</h4>
            <p className="text-md-sys-onSurface text-base leading-relaxed">{result?.summary}</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-md-sys-primary tracking-wider uppercase flex items-center gap-2">
              <Zap size={16} /> Potential Impact
            </h4>
            <div className="bg-md-sys-surfaceVariant/30 p-5 rounded-2xl text-md-sys-onSurfaceVariant text-sm leading-relaxed border border-md-sys-outline/5">
              {result?.impact}
            </div>
          </div>
        </div>

        {/* Tips Column */}
        <div className="bg-md-sys-primaryContainer/20 rounded-2xl p-6 h-fit border border-md-sys-outline/5">
          <h4 className="text-base font-semibold text-md-sys-onSurface mb-4 flex items-center gap-2">
            <Lightbulb size={20} className="text-md-sys-primary" />
            Optimization Tips
          </h4>
          <ul className="space-y-4">
            {result?.optimizationTips.map((tip, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-md-sys-onSurfaceVariant">
                <span className="text-md-sys-primary font-bold text-lg leading-none">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};