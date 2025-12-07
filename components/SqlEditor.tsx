import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DiffPart } from '../types';
import { Copy, Check, AlertCircle, Wand2 } from 'lucide-react';
import { SqlDialect } from './sqlDialects';
import { validateSql, ValidationError } from '../utils/sqlValidator';
import { format } from 'sql-formatter';
import CodeMirror, { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@uiw/react-codemirror';
import { sql, StandardSQL, MySQL, PostgreSQL } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { oneLight } from './oneLight';
import { granularFold } from '../utils/granularFold';
import { RangeSetBuilder } from '@codemirror/state';

interface SqlEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  diff?: DiffPart[];
  mode?: 'original' | 'modified';
  placeholder?: string;
  dialect?: SqlDialect;
  isDarkMode?: boolean;
}

const createDiffExtension = (diff: DiffPart[] | undefined, mode: 'original' | 'modified') => {
  return ViewPlugin.fromClass(class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.computeDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.computeDecorations(update.view);
      }
    }

    computeDecorations(view: EditorView): DecorationSet {
      if (!diff || diff.length === 0) return Decoration.none;

      const builder = new RangeSetBuilder<Decoration>();
      let pos = 0;

      for (const part of diff) {
        const length = part.value.length;
        // In original mode, skip added parts (they don't exist in text)
        // In modified mode, skip removed parts (they don't exist in text)
        if ((mode === 'original' && part.added) || (mode === 'modified' && part.removed)) {
            continue;
        }

        if ((mode === 'original' && part.removed) || (mode === 'modified' && part.added)) {
           // This part exists in the text AND needs highlighting
           const className = mode === 'original' ? 'cm-diff-del' : 'cm-diff-add';
           // Ensure we don't go out of bounds (though diff logic should ensure sync)
           if (pos + length <= view.state.doc.length) {
                builder.add(pos, pos + length, Decoration.mark({ class: className }));
           }
        }
        
        pos += length;
      }
      
      return builder.finish();
    }
  }, {
    decorations: v => v.decorations
  });
};

export const SqlEditor: React.FC<SqlEditorProps> = ({ 
  label, 
  value, 
  onChange, 
  diff,
  mode = 'original',
  placeholder,
  dialect = 'standard',
  isDarkMode = false
}) => {
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!value) {
        setErrors([]);
        return;
      }
      const validationErrors = validateSql(value, dialect);
      setErrors(validationErrors);
    }, 600);

    return () => clearTimeout(timer);
  }, [value, dialect]);

  const handleCopy = async () => {
    if (!value) return;
    try {
      let textToCopy = value;
      try {
        textToCopy = format(value, {
          language: dialect === 'standard' ? 'sql' : dialect as any,
          tabWidth: 2,
          keywordCase: 'upper',
        });
      } catch (formatErr) {
        console.warn('Formatting failed before copy, copying original text.', formatErr);
        // Fallback to original value if formatting fails
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleFormat = () => {
    if (!value) return;
    try {
      const formatted = format(value, {
        language: dialect === 'standard' ? 'sql' : dialect as any,
        tabWidth: 2,
        keywordCase: 'upper',
      });
      onChange(formatted);
    } catch (err) {
      console.error('Failed to format!', err);
    }
  };

  const extensions = useMemo(() => {
      const dialectMap = {
        standard: StandardSQL,
        mysql: MySQL,
        postgresql: PostgreSQL,
        spark: StandardSQL // Spark is not explicitly supported, fallback to Standard
      };
      
      const exts = [
        sql({ dialect: dialectMap[dialect] || StandardSQL }),
        granularFold
      ];
      if (diff && diff.length > 0) {
          exts.push(createDiffExtension(diff, mode));
      }
      return exts;
  }, [diff, mode, dialect]);

  // Determine theme based on isDarkMode prop (or system preference if not passed)
  // Since we don't have isDarkMode passed yet, we can check document class
  const theme = useMemo(() => {
      // Small hack to detect if 'dark' class is on html element, 
      // ideally passed as prop from App. But for now we use the passed prop or default.
      return isDarkMode ? oneDark : oneLight;
  }, [isDarkMode]);

  return (
    <div className="flex flex-col h-full bg-md-sys-surface md:bg-md-sys-surface/50 relative group transition-all duration-300">
      {/* Header / Toolbar */}
      <div className="px-5 py-3 flex justify-between items-center border-b border-md-sys-outline/10 bg-md-sys-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${mode === 'original' ? 'bg-red-400' : 'bg-green-400'}`} />
          <span className="text-sm font-medium text-md-sys-onSurfaceVariant tracking-wide">
            {label}
          </span>
          {errors.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-md-sys-errorContainer text-md-sys-onErrorContainer text-xs font-medium animate-in fade-in zoom-in duration-200">
               <AlertCircle size={12} />
               <span>{errors.length}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={handleFormat}
            disabled={!value}
            className={`
              flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
              ${!value ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer text-md-sys-onSurfaceVariant hover:bg-md-sys-onSurfaceVariant/10'}
            `}
            title="Format SQL"
          >
            <Wand2 size={16} />
          </button>

          <button  
            onClick={handleCopy}
            disabled={!value}
            className={`
              flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
              ${copied 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                : 'text-md-sys-onSurfaceVariant hover:bg-md-sys-onSurfaceVariant/10'
              }
              ${!value ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title="Copy to clipboard"
          >
            <Check size={16} className={copied ? "scale-100" : "scale-0 hidden"} />
            <Copy size={16} className={copied ? "scale-0 hidden" : "scale-100"} />
          </button>
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="relative flex-1 w-full overflow-hidden bg-md-sys-surface flex flex-col">
        <CodeMirror
            value={value}
            height="100%"
            theme={theme}
            extensions={extensions}
            onChange={onChange}
            placeholder={placeholder}
            basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: false,
                highlightActiveLineGutter: false,
            }}
            className="flex-1 h-full text-sm font-mono"
        />
      </div>

      {/* Error Panel */}
      {errors.length > 0 && (
        <div className="shrink-0 border-t border-md-sys-error/20 bg-md-sys-errorContainer/10 max-h-32 overflow-y-auto backdrop-blur-sm transition-all duration-300">
          {errors.map((err, i) => (
            <div key={i} className="px-5 py-2 flex items-start gap-2 text-xs text-md-sys-error hover:bg-md-sys-errorContainer/20 transition-colors border-b border-md-sys-error/5 last:border-0 font-mono">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="opacity-80 font-bold">Line {err.startLine}, Col {err.startColumn}</span>
                <span className="break-all">{err.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        .cm-diff-add { background-color: var(--diff-add-bg); color: var(--diff-add-text); }
        .cm-diff-del { background-color: var(--diff-del-bg); color: var(--diff-del-text); }
        .cm-editor { height: 100%; outline: none; }
        .cm-scroller { overflow: auto !important; }
      `}</style>
    </div>
  );
};