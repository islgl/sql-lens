import React, { useRef, useEffect, useState } from 'react';
import { DiffPart } from '../types';
import { Copy, Check } from 'lucide-react';

interface SqlEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  diff?: DiffPart[];
  mode?: 'original' | 'modified';
  placeholder?: string;
}

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT',
  'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'BETWEEN', 'LIKE',
  'LIMIT', 'OFFSET', 'ORDER', 'BY', 'GROUP', 'HAVING', 'AS', 'CASE', 'WHEN', 'THEN',
  'ELSE', 'END', 'UNION', 'ALL', 'DISTINCT', 'EXISTS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'CAST', 'CONVERT', 'COALESCE', 'DATE', 'TIME', 'TIMESTAMP', 'INTERVAL', 'CONSTRAINT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES'
]);

const highlightSyntax = (text: string): React.ReactNode[] => {
  if (!text) return [];
  const regex = /(--.*)|('[^']*')|(\b\d+\b)|(\b[a-zA-Z_]\w*\b)|(\s+)|(.)/g;
  
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
      if (SQL_KEYWORDS.has(word.toUpperCase())) {
        tokens.push(<span key={key} className="text-syntax-keyword font-bold">{full}</span>);
      } else {
        tokens.push(<span key={key} className="text-syntax-default">{full}</span>);
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
  placeholder
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  useEffect(() => {
    handleScroll();
  }, [value]);

  const renderBackdrop = () => {
    if (!diff || diff.length === 0) {
        return highlightSyntax(value);
    }

    return diff.map((part, index) => {
       const highlightedContent = highlightSyntax(part.value);

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

  return (
    <div className="flex flex-col h-full bg-md-sys-surface md:bg-md-sys-surface/50 relative group transition-all duration-300">
      {/* Header / Toolbar */}
      <div className="px-5 py-3 flex justify-between items-center border-b border-md-sys-outline/10 bg-md-sys-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${mode === 'original' ? 'bg-red-400' : 'bg-green-400'}`} />
          <span className="text-sm font-medium text-md-sys-onSurfaceVariant tracking-wide">
            {label}
          </span>
        </div>
        
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
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      
      {/* Editor Area */}
      <div className="relative flex-1 w-full overflow-hidden bg-md-sys-surface">
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
  );
};