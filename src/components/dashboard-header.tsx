'use client';

import React from 'react';
import Link from 'next/link';
import { QrCode, PlusCircle, Building2, ExternalLink, Sparkles, Home, LogOut } from 'lucide-react';
import { Tenant } from '@/types';

interface DashboardHeaderProps {
  tenants: Tenant[];
  currentTenantId: string;
  onSelectTenant: (id: string) => void;
}

export function DashboardHeader({ tenants, currentTenantId, onSelectTenant }: DashboardHeaderProps) {
  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-white font-black text-lg tracking-tight group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              QR Reviews SaaS
            </span>
          </Link>

          <span className="hidden md:inline text-slate-700">|</span>

          {/* Tenant Selector Dropdown */}
          {tenants.length > 0 && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <select
                value={currentTenantId}
                onChange={(e) => onSelectTenant(e.target.value)}
                aria-label="Seleccionar Negocio"
                className="bg-slate-950 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.mode === 'DIRECT' ? '5⭐ Directo' : 'Smart Landing'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/onboarding"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Negocio / QR</span>
          </Link>

          {currentTenant && (
            <a
              href={`/r/${currentTenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700/60 transition-colors"
            >
              <span>Probar QR</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
