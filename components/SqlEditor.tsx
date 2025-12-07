import React, { useRef, useEffect, useState } from 'react';
import { DiffPart } from '../types';
import { Copy, Check, AlertCircle, Wand2 } from 'lucide-react';
import { SqlDialect, DIALECT_KEYWORDS } from './sqlDialects';
import { validateSql, ValidationError } from '../utils/sqlValidator';
import { format } from 'sql-formatter';

interface SqlEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  diff?: DiffPart[];
  mode?: 'original' | 'modified';
  placeholder?: string;
  dialect?: SqlDialect;
}

const highlightSyntax = (text: string, dialect: SqlDialect = 'standard'): React.ReactNode[] => {
  if (!text) return [];
  const regex = /(--.*)|('[^']*')|(\b\d+\b)|(\b[a-zA-Z_]\w*\b)|(\s+)|(.)/g;
  const keywords = DIALECT_KEYWORDS[dialect];
  
  const tokens: React.ReactNode[] = [];
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    const [full, comment, string, number, word, space] = match;
    const key = i++;

    if (comment) {
      tokens.push(<span key={key} className="text-syntax-comment italic">{full}</span>);
    } else if (string) {
      tokens.push(<span key={key} className="text-syntax-string">{full}</span>);
    } else if (number) {
      tokens.push(<span key={key} className="text-syntax-number">{full}</span>);
    } else if (word) {
      if (keywords.has(word.toUpperCase())) {
        tokens.push(<span key={key} className="text-syntax-keyword font-bold">{full}</span>);
      } else {
         // Basic heuristics for functions and variables - could be improved with better parser
         if (/^[A-Z][a-zA-Z0-9_]*$/.test(word)) { // PascalCase often types/tables in some conventions, or just caps
             tokens.push(<span key={key} className="text-syntax-default">{full}</span>);
         } else if (/^[a-z][a-zA-Z0-9_]*$/.test(word) && text[match.index + word.length] === '(') {
             tokens.push(<span key={key} className="text-syntax-function font-medium">{full}</span>);
         } else {
             tokens.push(<span key={key} className="text-syntax-default">{full}</span>);
         }
      }
    } else if (space) {
        tokens.push(<span key={key}>{full}</span>);
    } else {
        tokens.push(<span key={key} className="text-syntax-default">{full}</span>);
    }
  }
  return tokens;
};

export const SqlEditor: React.FC<SqlEditorProps> = ({ 
  label, 
  value, 
  onChange, 
  diff,
  mode = 'original',
  placeholder,
  dialect = 'standard'
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
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

  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

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

  useEffect(() => {
    handleScroll();
  }, [value]);

  const renderBackdrop = () => {
    if (!diff || diff.length === 0) {
        return highlightSyntax(value, dialect);
    }

    return diff.map((part, index) => {
       const highlightedContent = highlightSyntax(part.value, dialect);

       if (mode === 'original') {
         if (part.added) return null; 
         if (part.removed) {
           return (
             <span key={index} className="bg-diff-del text-diff-delText">
               {highlightedContent}
             </span>
           );
         }
         return <span key={index}>{highlightedContent}</span>;
       } else {
         if (part.removed) return null; 
         if (part.added) {
           return (
             <span key={index} className="bg-diff-add text-diff-addText">
               {highlightedContent}
             </span>
           );
         }
         return <span key={index}>{highlightedContent}</span>;
       }
    });
  };

  const renderLineNumbers = () => {
    const lineCount = value.split('\n').length;
    return Array.from({ length: lineCount }, (_, i) => (
      <div key={i} className="text-right pr-4 pl-3 select-none text-md-sys-onSurfaceVariant/40 text-sm h-6">
        {i + 1}
      </div>
    ));
  };

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
      <div className="relative flex-1 w-full overflow-hidden bg-md-sys-surface flex">
        {/* Line Numbers */}
        <div 
           ref={lineNumbersRef}
           className="shrink-0 pt-6 font-mono leading-6 bg-md-sys-surfaceVariant/10 border-r border-md-sys-outline/10 overflow-hidden text-right select-none"
           aria-hidden="true"
        >
          {renderLineNumbers()}
        </div>

        <div className="relative flex-1 h-full overflow-hidden">
            <div 
              ref={backdropRef}
              className="absolute inset-0 p-6 font-mono text-sm leading-6 whitespace-pre-wrap break-words bg-transparent pointer-events-none overflow-hidden select-none"
              aria-hidden="true"
            >
              {renderBackdrop()}
            </div>

            <textarea
              ref={textareaRef}
              className="absolute inset-0 w-full h-full p-6 font-mono text-sm leading-6 whitespace-pre-wrap break-words bg-transparent text-transparent caret-md-sys-primary outline-none resize-none placeholder:text-md-sys-onSurfaceVariant/40 selection:bg-md-sys-primaryContainer/50"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScroll}
              placeholder={placeholder}
              spellCheck={false}
            />
        </div>
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
    </div>
  );
};