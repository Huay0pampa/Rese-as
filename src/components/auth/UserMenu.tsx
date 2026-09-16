'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, History, ChevronDown, Database } from 'lucide-react';

export interface UserMenuProps {
  onOpenAuth: () => void;
  onOpenHistory: () => void;
}

export function UserMenu({ onOpenAuth, onOpenHistory }: UserMenuProps) {
  const { user, profile, logout, isConfigured } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!isConfigured) {
    return (
      <button
        onClick={onOpenHistory}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
        title="Ver historial de análisis local"
      >
        <History className="w-3.5 h-3.5 text-blue-400" />
        <span className="hidden sm:inline">Historial</span>
      </button>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenHistory}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
          title="Ver historial de análisis"
        >
          <History className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Historial</span>
        </button>

        <button
          onClick={onOpenAuth}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-sm cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Iniciar Sesión</span>
        </button>
      </div>
    );
  }

  const displayName = profile?.fullName || user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-[10px] font-extrabold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs font-semibold max-w-[100px] truncate hidden sm:inline">
          {displayName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in space-y-1">
          <div className="px-3 py-2 border-b border-slate-800 text-xs">
            <p className="font-bold text-slate-100 truncate">{displayName}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>

          <button
            onClick={() => { setDropdownOpen(false); onOpenHistory(); }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <History className="w-4 h-4 text-blue-400" />
            <span>Mis Análisis Guardados</span>
          </button>

          <div className="px-3 py-1 flex items-center space-x-1.5 text-[10px] text-emerald-400 bg-emerald-950/40 rounded-md border border-emerald-800/40">
            <Database className="w-3 h-3" />
            <span>Persistencia RLS Activa</span>
          </div>

          <button
            onClick={() => { setDropdownOpen(false); logout(); }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
