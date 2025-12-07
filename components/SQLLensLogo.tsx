import React from 'react';
import { Database, Search, Eye, Scan } from 'lucide-react';

interface SQLLensLogoProps {
  variant?: 'database-lens' | 'minimalist' | 'circular' | 'scan' | 'text-only';
  theme: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
}

export function SQLLensLogo({ variant = 'database-lens', theme, size = 'medium' }: SQLLensLogoProps) {
  // Map hardcoded colors to our theme variables where appropriate to ensure consistency
  // or keep them as designed if they are specific brand colors.
  // The user provided specific colors, so we will use them, but we might want to ensure they look good.
  
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const accentColor = theme === 'dark' ? 'text-cyan-400' : 'text-blue-600';
  const iconColor = theme === 'dark' ? 'text-cyan-400' : 'text-blue-600';
  
  const sizes = {
    small: { container: 'h-8', text: 'text-lg', icon: 20 },
    medium: { container: 'h-10', text: 'text-xl', icon: 24 }, // Adjusted to match previous header size roughly
    large: { container: 'h-16', text: 'text-3xl', icon: 36 }
  };

  const currentSize = sizes[size];

  if (variant === 'database-lens') {
    return (
      <div className={`flex items-center gap-3 ${currentSize.container}`}>
        <div className="relative">
          <Database className={iconColor} size={currentSize.icon} strokeWidth={2} />
          <div className="absolute -top-1 -right-1 bg-md-sys-surface rounded-full p-0.5 shadow-sm">
            <Search className={iconColor} size={currentSize.icon * 0.6} strokeWidth={2.5} />
          </div>
        </div>
        <div className={`flex items-baseline gap-0.5 ${currentSize.text} font-bold tracking-tight`}>
          <span className={textColor}>SQL</span>
          <span className={accentColor}>Lens</span>
        </div>
      </div>
    );
  }

  if (variant === 'minimalist') {
    return (
      <div className={`flex items-center gap-2.5 ${currentSize.container}`}>
        <div className={`${accentColor} relative`}>
          <svg width={currentSize.icon} height={currentSize.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        </div>
        <div className={`${currentSize.text} font-bold tracking-tight`}>
          <span className={textColor}>SQL</span>
          <span className={accentColor}>Lens</span>
        </div>
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div className={`flex items-center gap-3 ${currentSize.container}`}>
        <div className={`relative ${accentColor}`}>
          <svg width={currentSize.icon} height={currentSize.icon} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
            <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className={`${currentSize.text} font-bold tracking-tight`}>
          <span className={textColor}>SQL</span>
          <span className={accentColor}>Lens</span>
        </div>
      </div>
    );
  }

  if (variant === 'scan') {
    return (
      <div className={`flex items-center gap-3 ${currentSize.container}`}>
        <div className={`relative ${accentColor}`}>
          <Scan size={currentSize.icon} strokeWidth={2} />
        </div>
        <div className={`${currentSize.text} font-bold tracking-tight`}>
          <span className={textColor}>SQL</span>
          <span className={accentColor}>Lens</span>
        </div>
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <div className={`flex items-center ${currentSize.container}`}>
        <div className={`${currentSize.text} tracking-tight font-bold`}>
          <span className={`${textColor}`}>SQL</span>
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">Lens</span>
        </div>
      </div>
    );
  }

  return null;
}

