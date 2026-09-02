'use client';

import React from 'react';
import { SummaryMetrics } from '@/types';
import { Card } from '../common/Card';
import { DollarSign, Package, Building2, Globe2 } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';

export interface SummaryPlaceholderProps {
  metrics?: SummaryMetrics;
}

export function SummaryPlaceholder({ metrics }: SummaryPlaceholderProps) {
  const hasData = Boolean(metrics && metrics.totalRecords > 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total FOB USD */}
      <Card className="bg-slate-900/60 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total FOB (USD)</p>
            <h4 className="text-xl font-bold text-slate-100 mt-1">
              {hasData ? formatCurrency(metrics?.totalFobUSD) : '$0.00'}
            </h4>
            {hasData && (
              <p className="text-[11px] text-slate-400 mt-1">
                FOB Prom. Unit: {formatCurrency(metrics?.avgFobPerUnit)}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </Card>

      {/* Metric 2: Total Quantity */}
      <Card className="bg-slate-900/60 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Volumen Total (Qty 1)</p>
            <h4 className="text-xl font-bold text-slate-100 mt-1">
              {hasData ? formatNumber(metrics?.totalQuantity) : '0'}
            </h4>
            {hasData && (
              <p className="text-[11px] text-slate-400 mt-1">
                Registros: {formatNumber(metrics?.totalRecords)}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/40">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </Card>

      {/* Metric 3: Exporters Count */}
      <Card className="bg-slate-900/60 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Exportadores Únicos</p>
            <h4 className="text-xl font-bold text-slate-100 mt-1">
              {hasData ? formatNumber(metrics?.uniqueExportersCount) : '0'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">Empresas registradas</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </Card>

      {/* Metric 4: Destinations Count */}
      <Card className="bg-slate-900/60 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Mercados de Destino</p>
            <h4 className="text-xl font-bold text-slate-100 mt-1">
              {hasData ? formatNumber(metrics?.uniqueDestinationsCount) : '0'}
            </h4>
            {hasData && metrics?.dateRange.startDate && (
              <p className="text-[11px] text-slate-400 mt-1">
                {formatDate(metrics.dateRange.startDate)} - {formatDate(metrics.dateRange.endDate)}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40">
            <Globe2 className="w-5 h-5" />
          </div>
        </div>
      </Card>
    </div>
  );
}
