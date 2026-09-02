import React from 'react';
import { Ship, Database, FileSpreadsheet } from 'lucide-react';
import { Badge } from './Badge';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                  Analizador de Exportaciones
                </h1>
                <Badge variant="info">PROMPT 01</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Plataforma de Inteligencia Comercial & Logística
              </p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Esquema: 8 Columnas Oficiales</span>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Supabase Architecture Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
