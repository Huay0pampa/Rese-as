import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function Card({
  title,
  subtitle,
  action,
  children,
  className,
  headerClassName,
  bodyClassName,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl transition-all duration-200 hover:border-slate-700/80',
        className
      )}
    >
      {(title || subtitle || action) && (
        <div
          className={cn(
            'flex items-center justify-between px-6 py-4 border-b border-slate-800/60',
            headerClassName
          )}
        >
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn('p-6', bodyClassName)}>{children}</div>
    </div>
  );
}
