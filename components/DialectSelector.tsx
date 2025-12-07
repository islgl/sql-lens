import React, { useState, useRef, useEffect } from 'react';
import { SqlDialect } from './sqlDialects';
import { ChevronDown, Database, Check } from 'lucide-react';

interface DialectSelectorProps {
  value: SqlDialect;
  onChange: (value: SqlDialect) => void;
}

const DIALECTS: { id: SqlDialect; name: string; logo?: string; icon?: React.ReactNode }[] = [
  { 
    id: 'standard', 
    name: 'Standard SQL', 
    icon: <Database size={18} className="text-slate-500" /> 
  },
  { 
    id: 'mysql', 
    name: 'MySQL', 
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' 
  },
  { 
    id: 'postgresql', 
    name: 'PostgreSQL', 
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' 
  },
  { 
    id: 'spark', 
    name: 'Spark SQL', 
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachespark/apachespark-original.svg' 
  }
];

export const DialectSelector: React.FC<DialectSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDialect = DIALECTS.find(d => d.id === value) || DIALECTS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 h-10 pl-3 pr-3 rounded-xl border transition-all duration-200 active:scale-95
          ${isOpen 
            ? 'border-md-sys-primary/50 ring-2 ring-md-sys-primary/10 bg-md-sys-surface' 
            : 'border-md-sys-outline/20 bg-md-sys-surface hover:bg-md-sys-onSurface/5 hover:border-md-sys-outline/40'
          }
        `}
      >
        <div className="flex items-center justify-center w-5 h-5 overflow-hidden">
          {selectedDialect.logo ? (
            <img src={selectedDialect.logo} alt={selectedDialect.name} className="w-full h-full object-contain" />
          ) : (
            selectedDialect.icon
          )}
        </div>
        <span className="text-sm font-medium text-md-sys-onSurface hidden sm:inline-block">
          {selectedDialect.name}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-md-sys-onSurfaceVariant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`
          absolute top-full left-0 mt-2 w-56 p-1.5 rounded-2xl bg-md-sys-surface border border-md-sys-outline/10 shadow-xl shadow-black/10 z-[100]
          origin-top-left transition-all duration-200 ease-out
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        `}
      >
        {DIALECTS.map((dialect) => (
          <button
            key={dialect.id}
            onClick={() => {
              onChange(dialect.id);
              setIsOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors
              ${value === dialect.id 
                ? 'bg-md-sys-secondaryContainer text-md-sys-onSecondaryContainer' 
                : 'text-md-sys-onSurface hover:bg-md-sys-surfaceVariant/50'
              }
            `}
          >
            <div className="flex items-center justify-center w-5 h-5 shrink-0">
              {dialect.logo ? (
                <img src={dialect.logo} alt={dialect.name} className="w-full h-full object-contain" />
              ) : (
                dialect.icon
              )}
            </div>
            <span className="flex-1 text-sm font-medium truncate">{dialect.name}</span>
            {value === dialect.id && <Check size={16} className="shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
};

