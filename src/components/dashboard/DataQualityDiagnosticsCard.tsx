'use client';

import React from 'react';
import { DataQualityReport } from '@/types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Activity,
  CheckCircle2,
  CalendarOff,
  Hash,
  AlertTriangle,
  FileCheck2,
  BarChart2,
} from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

export interface DataQualityDiagnosticsCardProps {
  report: DataQualityReport;
}

export function DataQualityDiagnosticsCard({ report }: DataQualityDiagnosticsCardProps) {
  const gradeColors: Record<DataQualityReport['qualityGrade'], { bg: string; text: string; border: string }> = {
    A: { bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-700/60' },
    B: { bg: 'bg-blue-950/80', text: 'text-blue-400', border: 'border-blue-700/60' },
    C: { bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-700/60' },
    D: { bg: 'bg-orange-950/80', text: 'text-orange-400', border: 'border-orange-700/60' },
    F: { bg: 'bg-rose-950/80', text: 'text-rose-400', border: 'border-rose-700/60' },
  };

  const gradeStyle = gradeColors[report.qualityGrade];

  return (
    <Card className="p-6 space-y-6">
      {/* Header with Title and Overall Quality Grade */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/50">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Diagnóstico de Calidad del Archivo</span>
              <Badge variant="outline" className="text-xs">
                Módulo de Normalización
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluación de integridad de datos, tipos y completitud de campos
            </p>
          </div>
        </div>

        {/* Overall Completeness Score & Grade Badge */}
        <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-between sm:justify-end bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Índice de Calidad
            </p>
            <p className="text-lg font-extrabold text-slate-100">
              {report.completenessScore}%
            </p>
          </div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg border font-black text-lg ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}
            title={`Calificación de calidad: ${report.qualityGrade}`}
          >
            {report.qualityGrade}
          </div>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Processed */}
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registros Totales</span>
            <FileCheck2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-100 mt-1">
            {formatNumber(report.totalRecords)}
          </p>
          <p className="text-[10px] text-slate-400">100% Procesados</p>
        </div>

        {/* Valid Records */}
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registros Válidos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-400 mt-1">
            {formatNumber(report.validRecords)}
          </p>
          <p className="text-[10px] text-slate-400">Sin observaciones</p>
        </div>

        {/* Invalid Dates */}
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fechas Inválidas</span>
            <CalendarOff className="w-4 h-4 text-amber-400" />
          </div>
          <p className={`text-lg font-bold mt-1 ${report.recordsWithInvalidDate > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {formatNumber(report.recordsWithInvalidDate)}
          </p>
          <p className="text-[10px] text-slate-400">Formato o valor ausente</p>
        </div>

        {/* Invalid Numeric */}
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Números Erróneos</span>
            <Hash className="w-4 h-4 text-rose-400" />
          </div>
          <p className={`text-lg font-bold mt-1 ${report.recordsWithInvalidNumbers > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {formatNumber(report.recordsWithInvalidNumbers)}
          </p>
          <p className="text-[10px] text-slate-400">Qty / FOB no válidos</p>
        </div>

        {/* Empty Required Fields */}
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Campos Vacíos</span>
            <AlertTriangle className="w-4 h-4 text-sky-400" />
          </div>
          <p className={`text-lg font-bold mt-1 ${report.recordsWithEmptyFields > 0 ? 'text-sky-400' : 'text-slate-200'}`}>
            {formatNumber(report.recordsWithEmptyFields)}
          </p>
          <p className="text-[10px] text-slate-400">Campos clave omitidos</p>
        </div>
      </div>

      {/* Per-Field Integrity Progress Bars */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium border-b border-slate-800/60 pb-2">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <span>Integridad de Datos por Columna Oficial</span>
          </div>
          <span className="text-[11px] text-slate-400">Porcentaje de validez</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {report.fieldMetrics.map((metric) => (
            <div key={metric.field} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{metric.label}</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {metric.percentageValid}% ({formatNumber(metric.valid)}/{formatNumber(metric.total)})
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    metric.percentageValid >= 95
                      ? 'bg-emerald-500'
                      : metric.percentageValid >= 80
                      ? 'bg-blue-500'
                      : metric.percentageValid >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${metric.percentageValid}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
