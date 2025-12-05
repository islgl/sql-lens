import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SqlEditor } from './components/SqlEditor';
import { AnalysisCard } from './components/AnalysisCard';
import { analyzeSqlDiff } from './services/geminiService';
import { AnalysisStatus, AnalysisResult, DiffPart } from './types';
import { ArrowRightLeft, Database, Trash2, Play, Sun, Moon } from 'lucide-react';
import * as Diff from 'https://esm.sh/diff';

const App: React.FC = () => {
  const [originalSql, setOriginalSql] = useState<string>("");
  const [modifiedSql, setModifiedSql] = useState<string>("");
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Calculate Diff globally for sync between two editors
  const diffParts: DiffPart[] = useMemo(() => {
     if (!originalSql && !modifiedSql) return [];
     // diffWordsWithSpace preserves spaces which is crucial for SQL legibility
     return Diff.diffWordsWithSpace(originalSql, modifiedSql);
  }, [originalSql, modifiedSql]);

  const handleSwap = useCallback(() => {
    setOriginalSql(modifiedSql);
    setModifiedSql(originalSql);
    setAnalysisStatus(AnalysisStatus.IDLE);
    setAnalysisResult(null);
  }, [modifiedSql, originalSql]);

  const handleClear = useCallback(() => {
    setOriginalSql("");
    setModifiedSql("");
    setAnalysisStatus(AnalysisStatus.IDLE);
    setAnalysisResult(null);
  }, []);

  const handleAnalyze = async () => {
    if (!originalSql || !modifiedSql) return;
    setAnalysisStatus(AnalysisStatus.LOADING);
    try {
      const result = await analyzeSqlDiff(originalSql, modifiedSql);
      setAnalysisResult(result);
      setAnalysisStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setAnalysisStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-md-sys-background text-md-sys-onBackground transition-colors duration-300">
      {/* Material 3 Top App Bar (Small) */}
      <header className="px-4 py-4 md:px-6 flex items-center justify-between sticky top-0 z-50 bg-md-sys-surface/95 backdrop-blur-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-md-sys-primaryContainer flex items-center justify-center text-md-sys-onPrimaryContainer shadow-sm">
            <Database size={20} />
          </div>
          <h1 className="text-xl font-normal text-md-sys-onSurface">SQL Lens</h1>
        </div>
        
        <div className="flex items-center gap-2">
           {/* Dark Mode Toggle */}
           <button 
             onClick={() => setIsDarkMode(!isDarkMode)}
             className="h-10 w-10 flex items-center justify-center rounded-full text-md-sys-onSurfaceVariant hover:bg-md-sys-surfaceVariant/20 transition-colors"
             title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
           >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>

           <div className="h-6 w-px bg-md-sys-outline/20 mx-1"></div>

           <button 
             onClick={handleSwap}
             className="h-10 px-4 rounded-full border border-md-sys-outline/30 text-md-sys-primary hover:bg-md-sys-primaryContainer/30 transition-colors flex items-center gap-2 text-sm font-medium"
             title="Swap contents"
           >
             <ArrowRightLeft size={18} />
             <span className="hidden sm:inline">Swap</span>
           </button>
           <button 
            onClick={handleClear}
            className="h-10 w-10 flex items-center justify-center rounded-full text-md-sys-onSurfaceVariant hover:bg-md-sys-errorContainer hover:text-md-sys-onErrorContainer transition-colors"
            title="Clear all"
           >
             <Trash2 size={20} />
           </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1920px] mx-auto w-full flex flex-col gap-6">
        
        {/* Editors Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px] min-h-[400px]">
          {/* Original SQL */}
          <div className="flex flex-col h-full rounded-3xl bg-md-sys-surfaceVariant/30 overflow-hidden border border-md-sys-outline/10">
            <SqlEditor 
              label="Original"
              value={originalSql}
              onChange={(val) => {
                setOriginalSql(val);
                setAnalysisStatus(AnalysisStatus.IDLE);
              }}
              diff={diffParts}
              mode="original"
              placeholder="-- Enter original SQL..."
            />
          </div>

          {/* Modified SQL */}
          <div className="flex flex-col h-full rounded-3xl bg-md-sys-surfaceVariant/30 overflow-hidden border border-md-sys-outline/10">
            <SqlEditor 
              label="Modified"
              value={modifiedSql}
              onChange={(val) => {
                setModifiedSql(val);
                setAnalysisStatus(AnalysisStatus.IDLE);
              }}
              diff={diffParts}
              mode="modified"
              placeholder="-- Enter modified SQL..."
            />
          </div>
        </div>

        {/* Action Bar / FAB equivalent */}
        <div className="flex justify-center md:justify-end">
           <button
             onClick={handleAnalyze}
             disabled={!originalSql || !modifiedSql || analysisStatus === AnalysisStatus.LOADING}
             className={`
               h-14 px-8 rounded-full bg-md-sys-primary text-md-sys-onPrimary shadow-elevation-2 
               hover:shadow-elevation-3 transition-all flex items-center gap-3 font-medium text-base
               disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed
             `}
           >
             {analysisStatus === AnalysisStatus.LOADING ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <Play size={20} fill="currentColor" />
             )}
             Analyze Difference
           </button>
        </div>

        {/* Results Section */}
        <section className="w-full">
          <AnalysisCard 
            status={analysisStatus}
            result={analysisResult}
            onAnalyze={handleAnalyze}
            hasInput={!!originalSql && !!modifiedSql}
          />
        </section>
      </main>
    </div>
  );
};

export default App;