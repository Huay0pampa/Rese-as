'use client';

import React from 'react';
import { FileMetadata } from '@/types';
import { FileSpreadsheet, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatFileSize } from '@/utils/formatters';
import { Badge } from '../common/Badge';

export interface FileStatusCardProps {
  metadata: FileMetadata;
  onReset: () => void;
}

export function FileStatusCard({ metadata, onReset }: FileStatusCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* File Info */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-slate-100">{metadata.fileName}</h4>
              <Badge variant="success" className="uppercase text-[10px]">
                {metadata.fileType}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tamaño: {formatFileSize(metadata.fileSize)} • Procesado el:{' '}
              {new Date(metadata.uploadedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Row Counts & Reset */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 text-xs bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metadata.validRows.toLocaleString()} válidos</span>
            </div>
            {metadata.invalidRows > 0 && (
              <>
                <span className="text-slate-700">|</span>
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{metadata.invalidRows.toLocaleString()} descartados</span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1.5"
            title="Cargar otro archivo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo Archivo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
