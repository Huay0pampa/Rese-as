'use client';

import React from 'react';
import { FileMetadata } from '@/types';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { formatFileSize, formatNumber } from '@/utils/formatters';
import { Badge } from '../common/Badge';

export interface FileStatusCardProps {
  metadata: FileMetadata;
  onReset: () => void;
}

export function FileStatusCard({ metadata, onReset }: FileStatusCardProps) {
  return (
    <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-5 backdrop-blur-md space-y-4">
      {/* Success Notification Banner */}
      <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
        <div className="flex items-center space-x-2 text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <h3 className="text-sm font-bold tracking-wide">
            Archivo cargado correctamente.
          </h3>
        </div>
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1.5"
          title="Cargar otro archivo Excel"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Cargar otro archivo</span>
        </button>
      </div>

      {/* Main File & Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
        {/* File Name & Type */}
        <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="p-2 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/50">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="truncate">
            <p className="text-[11px] text-slate-400">Archivo</p>
            <p className="text-xs font-semibold text-slate-100 truncate" title={metadata.fileName}>
              {metadata.fileName}
            </p>
            <p className="text-[10px] text-slate-400">{formatFileSize(metadata.fileSize)}</p>
          </div>
        </div>

        {/* Quantity of Records */}
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <p className="text-[11px] text-slate-400">Cantidad de registros</p>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">
            {formatNumber(metadata.totalRows)}
          </p>
          <p className="text-[10px] text-slate-400">Filas leídas dinámicamente</p>
        </div>

        {/* Columns Detected */}
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <p className="text-[11px] text-slate-400">Columnas detectadas</p>
          <div className="flex items-center space-x-2 mt-0.5">
            <p className="text-sm font-bold text-slate-100">
              {metadata.detectedColumnsCount}
            </p>
            {metadata.additionalColumns.length > 0 && (
              <Badge variant="info" className="text-[10px] px-1.5 py-0">
                +{metadata.additionalColumns.length} extra
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-slate-400">Mapeadas por nombre</p>
        </div>

        {/* Sheet Name */}
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <p className="text-[11px] text-slate-400">Nombre de la hoja</p>
          <div className="flex items-center space-x-1.5 mt-0.5 text-slate-200">
            <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <p className="text-xs font-semibold truncate" title={metadata.sheetName}>
              {metadata.sheetName}
            </p>
          </div>
          <p className="text-[10px] text-slate-400">Hoja activa procesada</p>
        </div>

        {/* Status indicator / Additional columns detail */}
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
          <p className="text-[11px] text-slate-400">Estado del Dataset</p>
          <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dataset en Memoria</span>
          </div>
          <p className="text-[10px] text-slate-400">Listo para tabulación</p>
        </div>
      </div>

      {/* Additional Columns Preserved Callout */}
      {metadata.additionalColumns.length > 0 && (
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Columnas adicionales conservadas:</strong>{' '}
              {metadata.additionalColumns.join(', ')}
            </span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Conservadas para uso futuro
          </Badge>
        </div>
      )}
    </div>
  );
}
