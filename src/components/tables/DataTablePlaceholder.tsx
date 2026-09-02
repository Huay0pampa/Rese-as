'use client';

import React from 'react';
import { Card } from '../common/Card';
import { NormalizedExportRecord } from '@/types';
import { Table, Download, Filter } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';

export interface DataTablePlaceholderProps {
  records?: NormalizedExportRecord[];
}

export function DataTablePlaceholder({ records = [] }: DataTablePlaceholderProps) {
  const hasData = records.length > 0;
  const displayRecords = records.slice(0, 5); // Display top 5 sample rows when available

  return (
    <Card
      title="Tabulación de Registros Procesados"
      subtitle={
        hasData
          ? `Mostrando ${displayRecords.length} de ${records.length.toLocaleString()} registros normalizados`
          : 'Área reservada para tabla dinámica multi-filtro (PROMPT 02)'
      }
      action={
        <div className="flex items-center space-x-2">
          <button
            disabled={!hasData}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
          </button>
          <button
            disabled={!hasData}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>
        </div>
      }
    >
      {hasData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Exportador</th>
                <th className="py-3 px-4">Partida Aduanera</th>
                <th className="py-3 px-4 text-right">Qty 1</th>
                <th className="py-3 px-4 text-right">FOB Tot (USD)</th>
                <th className="py-3 px-4">País Destino</th>
                <th className="py-3 px-4">Canal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">{formatDate(rec.fecha)}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{rec.exportador}</td>
                  <td className="py-3 px-4 truncate max-w-xs">{rec.descripcionPartida}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatNumber(rec.qty1)}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                    {formatCurrency(rec.fobTot)}
                  </td>
                  <td className="py-3 px-4">{rec.paisDestino}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {rec.canal || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center flex flex-col items-center justify-center space-y-3 text-slate-400">
          <div className="p-3 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/50">
            <Table className="w-6 h-6" />
          </div>
          <p className="text-xs">
            La tabla interactiva se renderizará automáticamente al procesar el archivo Excel.
          </p>
        </div>
      )}
    </Card>
  );
}
