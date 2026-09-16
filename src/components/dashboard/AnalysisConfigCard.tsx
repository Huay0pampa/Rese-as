'use client';

import React from 'react';
import { Card } from '../common/Card';
import { AnalysisDimension, AnalysisMetric, AnalysisOperation } from '@/types';
import { SlidersHorizontal, Layers, Calculator, BarChart2 } from 'lucide-react';

export interface AnalysisConfigCardProps {
  dimension: AnalysisDimension;
  metric: AnalysisMetric;
  operation: AnalysisOperation;
  onDimensionChange: (dim: AnalysisDimension) => void;
  onMetricChange: (metric: AnalysisMetric) => void;
  onOperationChange: (op: AnalysisOperation) => void;
}

const DIMENSION_OPTIONS: { label: string; value: AnalysisDimension }[] = [
  { label: 'Exportador', value: 'exportador' },
  { label: 'País de Destino', value: 'paisDestino' },
  { label: 'Partida Aduanera', value: 'descripcionPartida' },
  { label: 'Canal Aduanero', value: 'canal' },
  { label: 'Año (Temporal)', value: 'year' },
  { label: 'Mes (Temporal)', value: 'month' },
  { label: 'Año-Mes (Serie)', value: 'yearMonth' },
];

const METRIC_OPTIONS: { label: string; value: AnalysisMetric }[] = [
  { label: 'Valor FOB USD ($)', value: 'fobTot' },
  { label: 'Volumen Total (Qty 1)', value: 'qty1' },
  { label: 'FOB Unitario 2 ($/u)', value: 'fobUnd2' },
];

const OPERATION_OPTIONS: { label: string; value: AnalysisOperation }[] = [
  { label: 'Suma Total (∑)', value: 'sum' },
  { label: 'Promedio (x̄)', value: 'avg' },
  { label: 'Valor Mínimo (Min)', value: 'min' },
  { label: 'Valor Máximo (Max)', value: 'max' },
  { label: 'Conteo de Reg. (N)', value: 'count' },
];


export function AnalysisConfigCard({
  dimension,
  metric,
  operation,
  onDimensionChange,
  onMetricChange,
  onOperationChange,
}: AnalysisConfigCardProps) {
  return (
    <Card className="bg-slate-900/80 border-slate-800 shadow-lg shadow-black/20 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">
              Configuración del Análisis
            </h3>
            <p className="text-[11px] text-slate-400">
              Personaliza la agrupación, métrica calculada y tipo de agregación
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Agrupar Por */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>AGRUPAR POR</span>
          </label>
          <select
            value={dimension}
            onChange={(e) => onDimensionChange(e.target.value as AnalysisDimension)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
          >
            {DIMENSION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Métrica */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>MÉTRICA</span>
          </label>
          <select
            value={metric}
            onChange={(e) => onMetricChange(e.target.value as AnalysisMetric)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
          >
            {METRIC_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Operación */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Calculator className="w-3.5 h-3.5 text-purple-400" />
            <span>OPERACIÓN</span>
          </label>
          <select
            value={operation}
            onChange={(e) => onOperationChange(e.target.value as AnalysisOperation)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
          >
            {OPERATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

    </Card>
  );
}
