import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SqlEditor } from './components/SqlEditor';
import { DiffPart } from './types';
import { Trash2, Sun, Moon, FileDiff } from 'lucide-react';
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
      <header className="shrink-0 px-4 py-3 md:px-6 flex items-center justify-between border-b-2 border-md-sys-outline/10 bg-md-sys-surface/95 backdrop-blur-sm transition-colors duration-300 relative z-50">
        <div className="flex items-center gap-3">
          <SQLLensLogo 
            variant="database-lens" 
            theme={isDarkMode ? 'dark' : 'light'} 
            size="medium" 
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Dialect Selector */}
          <DialectSelector 
            value={selectedDialect} 
            onChange={setSelectedDialect} 
          />

          <div className="h-6 w-px bg-md-sys-outline/20 mx-1"></div>

           {/* Diff Toggle */}
           <button 
             onClick={() => setShowDiff(!showDiff)}
             className={`h-10 px-3 rounded-full border-2 transition-all flex items-center gap-2 text-sm font-medium
               ${showDiff 
                 ? 'border-md-sys-primary/30 bg-md-sys-primaryContainer/30 text-md-sys-primary' 
                 : 'border-md-sys-outline/30 text-md-sys-onSurfaceVariant dark:text-md-sys-onSurface hover:bg-md-sys-surfaceVariant/20'
               }
             `}
             title={showDiff ? "Hide Diff" : "Show Diff"}
           >
             <FileDiff size={18} />
             <span className="hidden sm:inline">Diff</span>
           </button>

           <div className="h-6 w-px bg-md-sys-outline/20 mx-1"></div>

           <button 
            onClick={handleClear}
            className="h-10 w-10 flex items-center justify-center rounded-full text-md-sys-onSurfaceVariant dark:text-md-sys-onSurface transition-all duration-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            title="Clear all"
           >
             <Trash2 size={20} />
           </button>

           {/* Dark Mode Toggle */}
           <button 
             onClick={() => setIsDarkMode(!isDarkMode)}
             className={`h-10 w-10 flex items-center justify-center rounded-full text-md-sys-onSurfaceVariant dark:text-md-sys-onSurface transition-all duration-300
               ${isDarkMode 
                 ? 'dark:hover:bg-amber-400/20 dark:hover:text-amber-300' 
                 : 'hover:bg-indigo-100 hover:text-indigo-600'
               }
             `}
             title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
           >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1920px] mx-auto w-full flex flex-col min-h-0">
        {/* Editors Container */}
        <div className={`grid gap-4 flex-1 min-h-0 ${showDiff ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Original SQL */}
          <div className="flex flex-col h-full rounded-xl bg-md-sys-surfaceVariant/30 overflow-hidden border-2 border-md-sys-outline/10 shadow-elevation-1">
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
            <div className="flex flex-col h-full rounded-xl bg-md-sys-surfaceVariant/30 overflow-hidden border-2 border-md-sys-outline/10 shadow-elevation-1">
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