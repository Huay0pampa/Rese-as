'use client';

import React from 'react';
import { SummaryMetrics } from '@/types';
import { Card } from '../common/Card';
import { DollarSign, Package, Building2, Globe2, FileText, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';

export interface SummaryPlaceholderProps {
  metrics?: SummaryMetrics;
}

export const SummaryPlaceholder = React.memo(function SummaryPlaceholder({ metrics }: SummaryPlaceholderProps) {
  const hasData = Boolean(metrics && metrics.totalRecords > 0);

  const formattedPeriod = React.useMemo(() => {
    if (!hasData || !metrics?.dateRange) return 'Sin datos';
    const { startDate, endDate } = metrics.dateRange;
    if (startDate && endDate) {
      const startYear = startDate.substring(0, 4);
      const endYear = endDate.substring(0, 4);
      if (startYear === endYear) {
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
      return `${startYear} - ${endYear}`;
    }
    return 'Periodo Único';
  }, [hasData, metrics?.dateRange]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {/* 1. Registros */}
      <Card className="bg-slate-900/70 border-slate-800/80 relative overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Registros
            </p>
            <h4 className="text-xl font-bold text-slate-100 mt-1">
              {hasData ? formatNumber(metrics?.totalRecords) : '0'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              Operaciones válidas
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/70 text-slate-300 border border-slate-700/50">
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
      </Card>

      {/* 2. Período */}
      <Card className="bg-slate-900/70 border-slate-800/80 relative overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Período
            </p>
            <h4 className="text-sm font-bold text-slate-100 mt-2 line-clamp-1">
              {formattedPeriod}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Rango temporal</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/70 text-slate-300 border border-slate-700/50">
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
      </Card>

      {/* 3. Exportadores Únicos */}
      <Card className="bg-slate-900/70 border-slate-800/80 relative overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Exportadores
            </p>
            <h4 className="text-xl font-bold text-slate-100 mt-1">
              {hasData ? formatNumber(metrics?.uniqueExportersCount) : '0'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Empresas registradas</p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
      </Card>

      {/* 4. Países de Destino */}
      <Card className="bg-slate-900/70 border-slate-800/80 relative overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Países
            </p>
            <h4 className="text-xl font-bold text-slate-100 mt-1">
              {hasData ? formatNumber(metrics?.uniqueDestinationsCount) : '0'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Mercados globales</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40">
            <Globe2 className="w-4 h-4" />
          </div>
        </div>
      </Card>

      {/* 5. FOB Total */}
      <Card className="bg-slate-900/70 border-slate-800/80 relative overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              FOB Total (USD)
            </p>
            <h4 className="text-lg font-bold text-emerald-400 mt-1 truncate">
              {hasData ? formatCurrency(metrics?.totalFobUSD) : '$0.00'}
            </h4>
            {hasData && (
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                Prom: {formatCurrency(metrics?.avgFobPerUnit)}
              </p>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </Card>

      {/* 6. Qty Total */}
      <Card className="bg-slate-900/70 border-slate-800/80 relative overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Qty Total
            </p>
            <h4 className="text-xl font-bold text-blue-400 mt-1">
              {hasData ? formatNumber(metrics?.totalQuantity) : '0'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Volumen unidades</p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/40">
            <Package className="w-4 h-4" />
          </div>
        </div>
      </Card>
    </div>
  );
});

