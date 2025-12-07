import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SqlEditor } from './components/SqlEditor';
import { DiffPart } from './types';
import { Trash2, Sun, Moon, FileDiff, Github } from 'lucide-react';
import * as Diff from 'https://esm.sh/diff';
import { SqlDialect } from './components/sqlDialects';
import { DialectSelector } from './components/DialectSelector';
import { SQLLensLogo } from './components/SQLLensLogo';

const App: React.FC = () => {
  const [originalSql, setOriginalSql] = useState<string>("");
  const [modifiedSql, setModifiedSql] = useState<string>("");
  const [selectedDialect, setSelectedDialect] = useState<SqlDialect>('standard');
  const [showDiff, setShowDiff] = useState(false);

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
     if (!showDiff || !originalSql || !modifiedSql) return [];
     // diffWordsWithSpace preserves spaces which is crucial for SQL legibility
     return Diff.diffWordsWithSpace(originalSql, modifiedSql);
  }, [originalSql, modifiedSql, showDiff]);

  const handleClear = useCallback(() => {
    setOriginalSql("");
    setModifiedSql("");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-md-sys-background text-md-sys-onBackground transition-colors duration-300 h-screen overflow-hidden">
      {/* Material 3 Top App Bar (Small) */}
      <header className="shrink-0 px-4 py-3 md:px-6 flex items-center justify-between border-b border-md-sys-outline/5 bg-md-sys-surface/80 backdrop-blur-md transition-colors duration-300 relative z-50">
        <div className="flex items-center gap-3">
          <SQLLensLogo 
            variant="database-lens" 
            theme={isDarkMode ? 'dark' : 'light'} 
            size="medium" 
          />
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Dialect Selector */}
          <DialectSelector 
            value={selectedDialect} 
            onChange={setSelectedDialect} 
          />

          <div className="h-6 w-px bg-md-sys-outline/10 mx-2"></div>

           {/* Diff Toggle */}
           <button 
             onClick={() => setShowDiff(!showDiff)}
             className={`h-10 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium border active:scale-95
               ${showDiff 
                 ? 'bg-md-sys-primary text-md-sys-onPrimary border-transparent shadow-md shadow-md-sys-primary/20' 
                 : 'bg-transparent border-transparent text-md-sys-onSurfaceVariant hover:bg-md-sys-onSurface/5 hover:text-md-sys-onSurface'
               }
             `}
             title={showDiff ? "Hide Diff" : "Show Diff"}
           >
             <FileDiff size={18} />
             <span className="hidden sm:inline">Diff</span>
           </button>

           <div className="h-6 w-px bg-md-sys-outline/10 mx-2"></div>

           <button 
            onClick={handleClear}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-md-sys-onSurfaceVariant hover:text-md-sys-error hover:bg-md-sys-error/10 transition-all duration-200 active:scale-95"
            title="Clear all"
           >
             <Trash2 size={20} />
           </button>

           {/* Dark Mode Toggle */}
           <button 
             onClick={() => setIsDarkMode(!isDarkMode)}
             className="h-10 w-10 flex items-center justify-center rounded-xl text-md-sys-onSurfaceVariant hover:text-md-sys-primary hover:bg-md-sys-primary/10 transition-all duration-200 active:scale-95"
             title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
           >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>

           <a 
             href="https://github.com/islgl/sql-lens"
             target="_blank"
             rel="noopener noreferrer"
             className="h-10 w-10 flex items-center justify-center rounded-xl text-md-sys-onSurfaceVariant hover:text-md-sys-primary hover:bg-md-sys-primary/10 transition-all duration-200 active:scale-95"
             title="GitHub"
           >
             <Github size={20} />
           </a>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1920px] mx-auto w-full flex flex-col min-h-0">
        {/* Editors Container */}
        <div className={`grid gap-4 flex-1 min-h-0 ${showDiff ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Original SQL */}
          <div className="flex flex-col h-full rounded-2xl bg-md-sys-surface border border-md-sys-outline/5 shadow-xl shadow-black/5 overflow-hidden transition-all duration-300">
            <SqlEditor 
              label={showDiff ? "Original" : "SQL Editor"}
              value={originalSql}
              onChange={setOriginalSql}
              diff={diffParts}
              mode="original"
              placeholder={showDiff ? "-- Enter original SQL..." : "-- Enter SQL..."}
              dialect={selectedDialect}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Modified SQL */}
          {showDiff && (
            <div className="flex flex-col h-full rounded-2xl bg-md-sys-surface border border-md-sys-outline/5 shadow-xl shadow-black/5 overflow-hidden transition-all duration-300">
              <SqlEditor 
                label="Modified"
                value={modifiedSql}
                onChange={setModifiedSql}
                diff={diffParts}
                mode="modified"
                placeholder="-- Enter modified SQL..."
                dialect={selectedDialect}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
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