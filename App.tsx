import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SqlEditor } from './components/SqlEditor';
import { DiffPart } from './types';
import { ArrowRightLeft, Trash2, Sun, Moon, Database } from 'lucide-react';
import * as Diff from 'https://esm.sh/diff';
import { SqlDialect } from './components/sqlDialects';

const App: React.FC = () => {
  const [originalSql, setOriginalSql] = useState<string>("");
  const [modifiedSql, setModifiedSql] = useState<string>("");
  const [selectedDialect, setSelectedDialect] = useState<SqlDialect>('standard');

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
     if (!originalSql || !modifiedSql) return [];
     // diffWordsWithSpace preserves spaces which is crucial for SQL legibility
     return Diff.diffWordsWithSpace(originalSql, modifiedSql);
  }, [originalSql, modifiedSql]);

  const handleSwap = useCallback(() => {
    setOriginalSql(modifiedSql);
    setModifiedSql(originalSql);
  }, [modifiedSql, originalSql]);

  const handleClear = useCallback(() => {
    setOriginalSql("");
    setModifiedSql("");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-md-sys-background text-md-sys-onBackground transition-colors duration-300 h-screen overflow-hidden">
      {/* Material 3 Top App Bar (Small) */}
      <header className="shrink-0 px-4 py-3 md:px-6 flex items-center justify-between border-b border-md-sys-outline/10 bg-md-sys-surface/95 backdrop-blur-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-md-sys-primaryContainer flex items-center justify-center text-md-sys-onPrimaryContainer shadow-sm overflow-hidden">
            <img 
              src="https://cdn.jsdelivr.net/gh/islgl/img-hosting/imgs/logo-128x128.svg" 
              alt="SQL Lens Logo" 
              className="w-6 h-6"
            />
          </div>
          <h1 className="text-xl font-normal text-md-sys-onSurface">SQL Lens</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Dialect Selector */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-md-sys-onSurfaceVariant">
              <Database size={16} />
            </div>
            <select
              value={selectedDialect}
              onChange={(e) => setSelectedDialect(e.target.value as SqlDialect)}
              className="appearance-none pl-9 pr-8 h-10 rounded-full bg-md-sys-surfaceVariant/30 border border-md-sys-outline/10 text-sm font-medium text-md-sys-onSurface hover:bg-md-sys-surfaceVariant/50 focus:outline-none focus:ring-2 focus:ring-md-sys-primary/50 transition-all cursor-pointer"
            >
              <option value="standard">Standard SQL</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="spark">Spark SQL</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-md-sys-onSurfaceVariant">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="h-6 w-px bg-md-sys-outline/20 mx-1"></div>

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

      <main className="flex-1 p-4 md:p-6 max-w-[1920px] mx-auto w-full flex flex-col min-h-0">
        {/* Editors Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Original SQL */}
          <div className="flex flex-col h-full rounded-3xl bg-md-sys-surfaceVariant/30 overflow-hidden border border-md-sys-outline/10 shadow-elevation-1">
            <SqlEditor 
              label="Original"
              value={originalSql}
              onChange={setOriginalSql}
              diff={diffParts}
              mode="original"
              placeholder="-- Enter original SQL..."
              dialect={selectedDialect}
            />
          </div>

          {/* Modified SQL */}
          <div className="flex flex-col h-full rounded-3xl bg-md-sys-surfaceVariant/30 overflow-hidden border border-md-sys-outline/10 shadow-elevation-1">
            <SqlEditor 
              label="Modified"
              value={modifiedSql}
              onChange={setModifiedSql}
              diff={diffParts}
              mode="modified"
              placeholder="-- Enter modified SQL..."
              dialect={selectedDialect}
            />
          </div>
        </div>
      </main>

      {/* Footer Watermark */}
      <footer className="shrink-0 px-4 py-3 md:px-6 flex items-center justify-center gap-4 text-xs text-md-sys-onSurfaceVariant/60 border-t border-md-sys-outline/5 bg-md-sys-surface/50 backdrop-blur-sm transition-colors duration-300">
        <span>
          Build via{' '}
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-md-sys-primary hover:text-md-sys-primary/80 hover:underline transition-colors duration-200"
          >
            Google AI Studio
          </a>
        </span>
        <span className="text-md-sys-outline/30">•</span>
        <span>
          Maintained by{' '}
          <a
            href="https://github.com/islgl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-md-sys-primary hover:text-md-sys-primary/80 hover:underline transition-colors duration-200"
          >
            islgl
          </a>
        </span>
      </footer>
    </div>
  );
};

export default App;