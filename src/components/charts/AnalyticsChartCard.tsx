'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  AnalysisQueryResult,
  AnalysisDimension,
  AnalysisMetric,
  AnalysisOperation,
} from '@/types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { exportChartToImage } from '@/lib/export/exporter';
import {
  BarChart2,
  TrendingUp,
  PieChart as PieIcon,
  Loader2,
  BarChartHorizontal,
  Image as ImageIcon,
  Download,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';


// ── Chart type definitions ──────────────────────────────────────────────────

export type ChartType = 'bar' | 'line' | 'pie';

// Temporal dimensions favour line charts; categorical favour bar
const TEMPORAL_DIMENSIONS: AnalysisDimension[] = ['year', 'month', 'yearMonth'];

export function getDefaultChartType(dimension: AnalysisDimension): ChartType {
  return TEMPORAL_DIMENSIONS.includes(dimension) ? 'line' : 'bar';
}

/** True when a dimension supports pie charts (i.e. groupings with discrete categories) */
export function supportsChartType(type: ChartType, dimension: AnalysisDimension): boolean {
  if (type === 'line') return TEMPORAL_DIMENSIONS.includes(dimension);
  if (type === 'bar') return true;
  if (type === 'pie') return !TEMPORAL_DIMENSIONS.includes(dimension); // pie only for categorical
  return false;
}

// ── Design-system colour palette (not hardcoded per-datum, cycles by index) ─

const PALETTE = [
  '#6366f1', // indigo-500
  '#22d3ee', // cyan-400
  '#34d399', // emerald-400
  '#f59e0b', // amber-400
  '#f87171', // red-400
  '#a78bfa', // violet-400
  '#fb923c', // orange-400
  '#38bdf8', // sky-400
  '#4ade80', // green-400
  '#e879f9', // fuchsia-400
];

const colour = (i: number) => PALETTE[i % PALETTE.length];

// ── Tooltip formatters ──────────────────────────────────────────────────────

function makeValueFormatter(
  metric: AnalysisMetric,
  operation: AnalysisOperation
): (val: number | string | undefined) => string {
  return (val) => {
    if (val === undefined || val === null) return '0';
    const n = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(n)) return '0';
    if (operation === 'count') return formatNumber(n);
    if (metric === 'fobTot' || metric === 'fobUnd2') return formatCurrency(n);
    return formatNumber(n);
  };
}

// ── Custom Tooltip component ────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  formatter: (v: number | string) => string;
  metricLabel: string;
}

function CustomTooltip({ active, payload, label, formatter, metricLabel }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs space-y-1 max-w-xs">
      <p className="font-semibold text-slate-200 truncate" title={label}>{label}</p>
      <p className="text-indigo-400">
        <span className="text-slate-400">{metricLabel}: </span>
        <span className="font-mono font-bold">{formatter(item.value)}</span>
      </p>
    </div>
  );
}

// ── Pie custom label ────────────────────────────────────────────────────────

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) {
  if (percent < 0.03) return null; // skip tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

// ── Props ───────────────────────────────────────────────────────────────────

export interface AnalyticsChartCardProps {
  queryResult: AnalysisQueryResult | null;
  dimension: AnalysisDimension;
  metric: AnalysisMetric;
  operation: AnalysisOperation;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  isLoading?: boolean;
  maxBars?: number; // limit labels in categorical charts
}

// ── Component ───────────────────────────────────────────────────────────────

export const AnalyticsChartCard = React.memo(function AnalyticsChartCard({
  queryResult,
  dimension,
  metric,
  operation,
  chartType,
  onChartTypeChange,
  isLoading = false,
  maxBars = 20,
}: AnalyticsChartCardProps) {
  const formatValue = makeValueFormatter(metric, operation);

  // Trim long category labels for axis ticks
  const trimLabel = (label: string, max = 18) =>
    label.length > max ? label.substring(0, max - 1) + '…' : label;

  // Limit to top N by value for readability in bar/pie
  const chartData = queryResult
    ? queryResult.data.slice(0, TEMPORAL_DIMENSIONS.includes(dimension) ? 999 : maxBars).map((dp) => ({
        name: dp.category,
        value: dp.value,
        recordCount: dp.recordCount,
        pct: dp.percentageOfTotal,
      }))
    : [];

  const metricLabel = queryResult?.metricLabel ?? '';
  const operationLabel = queryResult?.operationLabel ?? '';
  const dimensionLabel = queryResult?.dimensionLabel ?? '';

  // ── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span className="text-sm">Generando gráfico...</span>
        </div>
        <div className="mt-4 h-64 bg-slate-800/40 rounded-xl animate-pulse" />
      </Card>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────
  if (!queryResult || chartData.length === 0) {
    return (
      <Card className="p-10 flex flex-col items-center justify-center space-y-3 text-center">
        <BarChart2 className="w-10 h-10 text-slate-700" />
        <p className="text-slate-400 text-sm font-medium">Sin datos para graficar</p>
        <p className="text-slate-600 text-xs">Carga un archivo Excel para ver el gráfico</p>
      </Card>
    );
  }

  // ── Chart type toggle buttons ──────────────────────────────────────────
  const ChartToggle = () => (
    <div className="flex items-center gap-1 bg-slate-900/80 rounded-lg p-1 border border-slate-800">
      {(['bar', 'line', 'pie'] as ChartType[]).map((type) => {
        const enabled = supportsChartType(type, dimension);
        const Icon = type === 'bar' ? BarChartHorizontal : type === 'line' ? TrendingUp : PieIcon;
        return (
          <button
            key={type}
            onClick={() => enabled && onChartTypeChange(type)}
            disabled={!enabled}
            title={enabled ? `Vista ${type}` : `No disponible para ${dimensionLabel}`}
            className={`p-1.5 rounded-md transition-all ${
              chartType === type
                ? 'bg-indigo-600 text-white shadow'
                : enabled
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-700 cursor-not-allowed'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );

  // ── Shared axis / grid styles ──────────────────────────────────────────
  const axisStyle = { fontSize: 11, fill: '#94a3b8', fontFamily: 'inherit' };
  const gridStyle = { stroke: '#1e293b', strokeDasharray: '3 3' };

  // ── Chart render ───────────────────────────────────────────────────────
  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 60 }}>
            <CartesianGrid {...gridStyle} />
            <XAxis
              dataKey="name"
              tick={axisStyle}
              angle={-35}
              textAnchor="end"
              interval={0}
              tickFormatter={(v) => trimLabel(v, 12)}
            />
            <YAxis tick={axisStyle} tickFormatter={(v) => formatValue(v)} width={90} />
            <Tooltip
              content={<CustomTooltip formatter={formatValue} metricLabel={`${operationLabel} · ${metricLabel}`} />}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }} />
            <Line
              type="monotone"
              dataKey="value"
              name={`${operationLabel} · ${metricLabel}`}
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#818cf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 80 }}>
            <CartesianGrid {...gridStyle} />
            <XAxis
              dataKey="name"
              tick={axisStyle}
              angle={-40}
              textAnchor="end"
              interval={0}
              tickFormatter={(v) => trimLabel(v, 16)}
            />
            <YAxis tick={axisStyle} tickFormatter={(v) => formatValue(v)} width={90} />
            <Tooltip
              content={<CustomTooltip formatter={formatValue} metricLabel={`${operationLabel} · ${metricLabel}`} />}
            />
            <Bar dataKey="value" name={`${operationLabel} · ${metricLabel}`} radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colour(index)} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              labelLine={false}
              label={renderPieLabel as React.ComponentProps<typeof Pie>['label']}
            >
              {chartData.map((_, index) => (
                <Cell key={`pie-cell-${index}`} fill={colour(index)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatValue(value as number | string | undefined), metricLabel]}
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 12,
                fontSize: 12,
              }}
              itemStyle={{ color: '#e2e8f0' }}
              labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
              formatter={(value) => trimLabel(value, 28)}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    try {
      await exportChartToImage(chartContainerRef.current, {
        dimension,
        metric,
        operation,
        chartType,
      }, 'png');
    } catch (err) {
      console.error('Error al exportar gráfico como imagen:', err);
    }
  };

  // ── Full render ────────────────────────────────────────────────────────
  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-violet-950/60 text-violet-400 border border-violet-800/50">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Gráfico de Resultados
                <Badge variant="outline" className="text-xs">Recharts</Badge>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                <span className="text-violet-400 font-medium">{operationLabel}</span>
                {' de '}
                <span className="text-violet-400 font-medium">{metricLabel}</span>
                {' por '}
                <span className="text-violet-400 font-medium">{dimensionLabel}</span>
                {queryResult.data.length > maxBars && !TEMPORAL_DIMENSIONS.includes(dimension) && (
                  <span className="text-slate-500"> · mostrando top {maxBars}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="text-xs">
              {queryResult.totalGroups} grupos · {formatNumber(queryResult.totalRecordsProcessed)} registros
            </Badge>
            <button
              onClick={handleDownloadImage}
              title="Descargar Gráfico como Imagen PNG"
              className="px-2 py-1 rounded text-[11px] font-medium text-violet-300 hover:bg-violet-950/50 border border-violet-800/50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
              <span>Guardar Imagen</span>
            </button>
            <ChartToggle />
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div ref={chartContainerRef} className="px-4 pt-4 pb-2 bg-slate-950">
        {renderChart()}
      </div>


      {/* Footer note for truncated data */}
      {queryResult.data.length > maxBars && !TEMPORAL_DIMENSIONS.includes(dimension) && (
        <p className="px-5 pb-3 text-[10px] text-slate-600 text-center">
          Se muestran los {maxBars} primeros grupos ordenados por valor. Cambia a &quot;Tabla&quot; para ver todos.
        </p>
      )}
    </Card>
  );
});
