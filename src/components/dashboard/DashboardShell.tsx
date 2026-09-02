'use client';

import React from 'react';

export interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
