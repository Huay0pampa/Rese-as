'use client';

import React, { useState, useMemo } from 'react';
import {
  NormalizedExportRecord,
  AnalysisDimension,
  AnalysisMetric,
  AnalysisOperation,
  AnalyticsDataPoint,
} from '@/types';
import { executeAnalyticsQuery } from '@/lib/analysis/analyticsEngine';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Table2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  BarChart3,
  Hash,
  Sigma,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

// ── Selectable Options ─────────────────────────────────────────────────────

const DIMENSION_OPTIONS: { value: AnalysisDimension; label: string }[] = [
  { value: 'exportador', label: 'Exportador' },
  { value: 'paisDestino', label: 'País de Destino' },
  { value: 'descripcionPartida', label: 'Partida Aduanera' },
  { value: 'year', label: 'Año' },
  { value: 'month', label: 'Mes' },
  { value: 'yearMonth', label: 'Año - Mes' },
  { value: 'canal', label: 'Canal' },
];

const METRIC_OPTIONS: { value: AnalysisMetric; label: string; isCurrency: boolean }[] = [
  { value: 'fobTot', label: 'U$ FOB Total', isCurrency: true },
  { value: 'qty1', label: 'Cantidad (Qty 1)', isCurrency: false },
  { value: 'fobUnd2', label: 'U$ FOB Und 2', isCurrency: true },
];

const OPERATION_OPTIONS: { value: AnalysisOperation; label: string }[] = [
  { value: 'sum', label: 'Suma' },
  { value: 'avg', label: 'Promedio' },
  { value: 'min', label: 'Mínimo' },
  { value: 'max', label: 'Máximo' },
  { value: 'count', label: 'Conteo' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── Sort Types & Icon ─────────────────────────────────────────────────────

type SortCol = 'category' | 'value' | 'recordCount' | 'percentage';
type SortDir = 'asc' | 'desc';

interface SortIconProps {
  col: SortCol;
  activeCol: SortCol;
  dir: SortDir;
}

function SortIcon({ col, activeCol, dir }: SortIconProps) {
  if (activeCol !== col) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600 ml-1" />;
  return dir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-indigo-400 ml-1" />
    : <ChevronDown className="w-3.5 h-3.5 text-indigo-400 ml-1" />;
}

interface SortState {
  col: SortCol;
  dir: SortDir;
}

// ── Props ──────────────────────────────────────────────────────────────────

export interface AnalyticsDataTableCardProps {
  records: NormalizedExportRecord[];
  isLoading?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────

export function AnalyticsDataTableCard({ records, isLoading = false }: AnalyticsDataTableCardProps) {
  const [dimension, setDimension] = useState<AnalysisDimension>('exportador');
  const [metric, setMetric] = useState<AnalysisMetric>('fobTot');
  const [operation, setOperation] = useState<AnalysisOperation>('sum');
  const [tableSearch, setTableSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ col: 'value', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Reset to page 1 when controls change
  const handleDimension = (v: AnalysisDimension) => { setDimension(v); setPage(1); setTableSearch(''); };
  const handleMetric = (v: AnalysisMetric) => { setMetric(v); setPage(1); };
  const handleOperation = (v: AnalysisOperation) => { setOperation(v); setPage(1); };
  const handleSearch = (v: string) => { setTableSearch(v); setPage(1); };

  const isCurrency = useMemo(
    () => METRIC_OPTIONS.find((m) => m.value === metric)?.isCurrency ?? false,
    [metric]
  );

  // ── Execute query ────────────────────────────────────────────────────────
  const queryResult = useMemo(() => {
    if (records.length === 0) return null;
    return executeAnalyticsQuery(records, {
      dimension,
      metric,
      operation,
      sortField: 'value',
      sortOrder: 'desc',
    });
  }, [records, dimension, metric, operation]);

  // ── Table-level search ───────────────────────────────────────────────────
  const searched: AnalyticsDataPoint[] = useMemo(() => {
    if (!queryResult) return [];
    if (!tableSearch.trim()) return queryResult.data;
    const q = tableSearch.toLowerCase();
    return queryResult.data.filter((dp) =>
      dp.category.toLowerCase().includes(q)
    );
  }, [queryResult, tableSearch]);

  // ── Column sorting ───────────────────────────────────────────────────────
  const sorted: AnalyticsDataPoint[] = useMemo(() => {
    return [...searched].sort((a, b) => {
      let cmp = 0;
      if (sort.col === 'category') {
        cmp = a.category.localeCompare(b.category);
      } else if (sort.col === 'value') {
        cmp = a.value - b.value;
      } else if (sort.col === 'recordCount') {
        cmp = a.recordCount - b.recordCount;
      } else if (sort.col === 'percentage') {
        cmp = a.percentageOfTotal - b.percentageOfTotal;
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [searched, sort]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize]
  );

  // ── Grand Totals ─────────────────────────────────────────────────────────
  const grandTotalValue = useMemo(
    () => searched.reduce((acc, dp) => acc + dp.value, 0),
    [searched]
  );
  const grandTotalRecords = useMemo(
    () => searched.reduce((acc, dp) => acc + dp.recordCount, 0),
    [searched]
  );

  // ── Sort toggle helper ───────────────────────────────────────────────────
  const toggleSort = (col: SortCol) => {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: 'desc' }
    );
    setPage(1);
  };


  const formatValue = (v: number) =>
    operation === 'count' ? formatNumber(v) : isCurrency ? formatCurrency(v) : formatNumber(v);

  const dimensionLabel = DIMENSION_OPTIONS.find((d) => d.value === dimension)?.label ?? '';
  const metricLabel = METRIC_OPTIONS.find((m) => m.value === metric)?.label ?? '';
  const operationLabel = OPERATION_OPTIONS.find((o) => o.value === operation)?.label ?? '';

  // ── Render States ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span className="text-sm">Calculando resultados...</span>
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-slate-800/60 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="p-10 flex flex-col items-center justify-center space-y-3 text-center">
        <Table2 className="w-10 h-10 text-slate-700" />
        <p className="text-slate-400 text-sm font-medium">Sin datos disponibles</p>
        <p className="text-slate-600 text-xs">Carga un archivo Excel para ver la tabla de resultados</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      {/* ── Header & Controls ── */}
      <div className="px-5 pt-5 pb-4 space-y-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/50">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Tabla de Resultados
                <Badge variant="outline" className="text-xs">Motor Analítico</Badge>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Agrupado por <span className="text-indigo-400 font-medium">{dimensionLabel}</span>
                {' · '}<span className="text-indigo-400 font-medium">{operationLabel}</span>
                {' de '}<span className="text-indigo-400 font-medium">{metricLabel}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="info">
              <Sigma className="w-3 h-3 mr-1" />
              {queryResult ? queryResult.totalGroups : 0} grupos
            </Badge>
            <Badge variant="default">
              <Hash className="w-3 h-3 mr-1" />
              {queryResult ? formatNumber(queryResult.totalRecordsProcessed) : 0} registros
            </Badge>
          </div>
        </div>

        {/* Control Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agrupar por</label>
            <select
              value={dimension}
              onChange={(e) => handleDimension(e.target.value as AnalysisDimension)}
              className="w-full bg-slate-900/80 text-slate-200 text-xs rounded-lg px-2.5 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
            >
              {DIMENSION_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Métrica</label>
            <select
              value={metric}
              onChange={(e) => handleMetric(e.target.value as AnalysisMetric)}
              className="w-full bg-slate-900/80 text-slate-200 text-xs rounded-lg px-2.5 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
            >
              {METRIC_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operación</label>
            <select
              value={operation}
              onChange={(e) => handleOperation(e.target.value as AnalysisOperation)}
              className="w-full bg-slate-900/80 text-slate-200 text-xs rounded-lg px-2.5 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
            >
              {OPERATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          {/* Table search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Buscar en tabla</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder={`Filtrar ${dimensionLabel}...`}
                value={tableSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-slate-900/80 text-slate-200 placeholder-slate-600 text-xs rounded-lg pl-8 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Empty search state ── */}
      {searched.length === 0 && records.length > 0 && (
        <div className="px-5 py-10 flex flex-col items-center space-y-2 text-center">
          <AlertCircle className="w-8 h-8 text-amber-600" />
          <p className="text-slate-400 text-sm">Sin resultados para <span className="text-amber-400 font-medium">&quot;{tableSearch}&quot;</span></p>
          <button
            onClick={() => handleSearch('')}
            className="text-xs text-indigo-400 hover:underline mt-1"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* ── Table ── */}
      {sorted.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800">
                  <th className="px-5 py-3 text-left w-8 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    #
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:text-slate-200 transition-colors text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                    onClick={() => toggleSort('category')}
                  >
                    <span className="flex items-center">
                      {dimensionLabel}
                      <SortIcon col="category" activeCol={sort.col} dir={sort.dir} />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-right cursor-pointer hover:text-slate-200 transition-colors text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                    onClick={() => toggleSort('value')}
                  >
                    <span className="flex items-center justify-end">
                      {operationLabel} · {metricLabel}
                      <SortIcon col="value" activeCol={sort.col} dir={sort.dir} />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-right cursor-pointer hover:text-slate-200 transition-colors text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                    onClick={() => toggleSort('recordCount')}
                  >
                    <span className="flex items-center justify-end">
                      Registros
                      <SortIcon col="recordCount" activeCol={sort.col} dir={sort.dir} />
                    </span>
                  </th>
                  <th
                    className="px-5 py-3 text-right cursor-pointer hover:text-slate-200 transition-colors text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                    onClick={() => toggleSort('percentage')}
                  >
                    <span className="flex items-center justify-end">
                      % del Total
                      <SortIcon col="percentage" activeCol={sort.col} dir={sort.dir} />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginated.map((dp, idx) => {
                  const rowNum = (page - 1) * pageSize + idx + 1;
                  const pct = grandTotalValue > 0
                    ? Math.round((dp.value / grandTotalValue) * 1000) / 10
                    : 0;
                  return (
                    <tr
                      key={dp.category}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-5 py-3 text-[11px] text-slate-600 font-mono">{rowNum}</td>
                      <td className="px-4 py-3 text-slate-200 text-xs max-w-xs">
                        <span className="line-clamp-2 leading-relaxed" title={dp.category}>
                          {dp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-xs">
                        <span className={isCurrency && operation !== 'count' ? 'text-emerald-400' : 'text-slate-200'}>
                          {formatValue(dp.value)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-300 font-mono">
                        {formatNumber(dp.recordCount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="hidden sm:block w-16 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono w-12 text-right">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Grand Total Row */}
              <tfoot>
                <tr className="bg-slate-900/80 border-t-2 border-indigo-800/50">
                  <td className="px-5 py-3"></td>
                  <td className="px-4 py-3 text-xs font-bold text-indigo-300 uppercase tracking-wide">
                    {searched.length < (queryResult?.data.length ?? 0)
                      ? `TOTAL FILTRADO (${searched.length} de ${queryResult?.totalGroups ?? 0})`
                      : `TOTAL GENERAL (${searched.length} grupos)`}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-xs text-indigo-300">
                    {operation !== 'count'
                      ? (isCurrency ? formatCurrency(grandTotalValue) : formatNumber(grandTotalValue))
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-xs text-indigo-300">
                    {formatNumber(grandTotalRecords)}
                  </td>
                  <td className="px-5 py-3 text-right text-xs font-bold text-indigo-300">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── Pagination Controls ── */}
          <div className="px-5 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Filas por página:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-slate-900 text-slate-300 text-xs rounded-md px-2 py-1 border border-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-xs text-slate-500">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} de {formatNumber(sorted.length)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Primera página"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page number pills */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p: number;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded text-xs font-medium transition-all ${
                      p === page
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Última página"
              >
                »
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
