import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-200 border-slate-700',
    success: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
    error: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
    info: 'bg-sky-950/60 text-sky-400 border-sky-800/50',
    outline: 'bg-transparent text-slate-300 border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
