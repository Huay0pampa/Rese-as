'use client';

import React from 'react';
import { Card } from '../common/Card';
import { AlertTriangle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { OFFICIAL_EXCEL_HEADERS } from '@/lib/constants/schema';

export interface IncompatibleFileStateProps {
  errorMessage: string;
  onRetry: () => void;
}

export function IncompatibleFileState({ errorMessage, onRetry }: IncompatibleFileStateProps) {
  return (
    <Card className="bg-amber-950/20 border-amber-500/30 p-6 sm:p-8 max-w-2xl mx-auto shadow-xl">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ring-8 ring-amber-500/5">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-100">
            Archivo Incompatible o Estructura No Válida
          </h3>
          <p className="text-xs text-amber-200/80 max-w-md mx-auto leading-relaxed">
            {errorMessage}
          </p>
        </div>

        <div className="w-full bg-slate-900/90 border border-amber-900/40 rounded-xl p-4 text-left space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Las 8 Columnas Oficiales Requeridas son:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {OFFICIAL_EXCEL_HEADERS.map((col: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-400">
                  {idx + 1}
                </span>
                <span className="truncate">{col}</span>
              </div>
            ))}
          </div>
        </div>


        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Intentar con otro archivo</span>
        </button>
      </div>
    </Card>
  );
}
