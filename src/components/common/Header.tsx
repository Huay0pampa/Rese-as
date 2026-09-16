import React from 'react';
import { Ship, Upload, FileSpreadsheet } from 'lucide-react';
import { Badge } from './Badge';
import { UserMenu } from '../auth/UserMenu';

export interface HeaderProps {
  hasFile?: boolean;
  onResetFile?: () => void;
  onOpenAuth?: () => void;
  onOpenHistory?: () => void;
}

export function Header({ hasFile = false, onResetFile, onOpenAuth = () => {}, onOpenHistory = () => {} }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/20 text-blue-400 border border-blue-500/30 shadow-inner">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                  Analizador de Exportaciones
                </h1>
                <Badge variant="info">PROMPT 10</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Plataforma de Inteligencia Comercial & Logística
              </p>
            </div>
          </div>

          {/* Actions & System Indicators */}
          <div className="flex items-center space-x-3">
            {hasFile && onResetFile && (
              <button
                onClick={onResetFile}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-blue-300 bg-blue-950/60 border border-blue-800/60 hover:bg-blue-900/80 hover:text-white transition-all shadow-sm cursor-pointer"
                title="Cargar un nuevo archivo Excel o CSV"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Cargar nuevo archivo</span>
              </button>
            )}

            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Esquema: 8 Columnas Oficiales</span>
            </div>

            {/* User Profile / History Menu */}
            <UserMenu onOpenAuth={onOpenAuth} onOpenHistory={onOpenHistory} />
          </div>
        </div>
      </div>
    </header>
  );
}


