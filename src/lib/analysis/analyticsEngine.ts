import {
  NormalizedExportRecord,
  AnalysisDimension,
  AnalysisMetric,
  AnalysisOperation,
  AnalyticsQueryOptions,
  AnalyticsDataPoint,
  AnalysisQueryResult,
} from '@/types';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const DIMENSION_LABELS: Record<AnalysisDimension, string> = {
  year: 'Año',
  month: 'Mes',
  yearMonth: 'Año - Mes',
  descripcionPartida: 'Descripción de Partida Aduanera',
  exportador: 'Exportador',
  paisDestino: 'País de Destino',
  canal: 'Canal',
};

const METRIC_LABELS: Record<AnalysisMetric, string> = {
  qty1: 'Cantidad (Qty 1)',
  fobTot: 'U$ FOB Total',
  fobUnd2: 'U$ FOB Und 2',
};

const OPERATION_LABELS: Record<AnalysisOperation, string> = {
  sum: 'Suma Total',
  avg: 'Promedio',
  min: 'Valor Mínimo',
  max: 'Valor Máximo',
  count: 'Conteo de Registros',
};

interface Accumulator {
  category: string;
  sortKey: string | number;
  sum: number;
  min: number;
  max: number;
  count: number;
}

/**
 * Generic, data-driven analytics aggregation engine.
 * Computes dynamic groupings, mathematical operations, and chronological sorting without hardcoded values.
 * Optimized: uses incremental accumulators (no per-record value arrays) to minimize memory usage.
 */
export function executeAnalyticsQuery(
  records: NormalizedExportRecord[],
  options: AnalyticsQueryOptions
): AnalysisQueryResult {
  const startTime = performance.now();

  const {
    dimension,
    metric,
    operation,
    sortField = 'value',
    sortOrder = 'desc',
    limit,
  } = options;

  if (records.length === 0) {
    return {
      dimension,
      dimensionLabel: DIMENSION_LABELS[dimension],
      metric,
      metricLabel: METRIC_LABELS[metric],
      operation,
      operationLabel: OPERATION_LABELS[operation],
      data: [],
      grandTotal: 0,
      totalRecordsProcessed: 0,
      totalGroups: 0,
      executionTimeMs: 0,
    };
  }

  const map = new Map<string, Accumulator>();

  for (let i = 0, len = records.length; i < len; i++) {
    const rec = records[i];
    // 1. Determine category key and sort key
    let category = '';
    let sortKey: string | number = '';

    switch (dimension) {
      case 'year':
        category = rec.dateDetails.year ? String(rec.dateDetails.year) : 'Sin Año';
        sortKey = rec.dateDetails.year ?? 9999;
        break;
      case 'month':
        category = rec.dateDetails.monthName || 'Sin Mes';
        sortKey = rec.dateDetails.monthNumber ?? 99; // 1-12 chronological ordering
        break;
      case 'yearMonth':
        category = rec.dateDetails.yearMonth || 'Sin Período';
        sortKey = rec.dateDetails.yearMonth || '9999-99';
        break;
      case 'descripcionPartida':
        category = rec.descripcionPartida || '(Sin Descripción)';
        sortKey = category;
        break;
      case 'exportador':
        category = rec.exportador || '(Sin Exportador)';
        sortKey = category;
        break;
      case 'paisDestino':
        category = rec.paisDestino || '(Sin Destino)';
        sortKey = category;
        break;
      case 'canal':
        category = rec.canal || 'N/A';
        sortKey = category;
        break;
    }

    // 2. Extract numeric metric value
    let val = 0;
    switch (metric) {
      case 'qty1':
        val = rec.qty1 || 0;
        break;
      case 'fobTot':
        val = rec.fobTot || 0;
        break;
      case 'fobUnd2':
        val = rec.fobUnd2 || 0;
        break;
    }

    // 3. Accumulate in Map (incremental — no value arrays)
    let acc = map.get(category);
    if (!acc) {
      acc = {
        category,
        sortKey,
        sum: 0,
        min: val,
        max: val,
        count: 0,
      };
      map.set(category, acc);
    }

    acc.sum += val;
    acc.count++;
    if (val < acc.min) acc.min = val;
    if (val > acc.max) acc.max = val;
  }

  // 4. Calculate final operated value per category
  let grandTotal = 0;

  const dataPoints: AnalyticsDataPoint[] = Array.from(map.values()).map((acc) => {
    let finalValue = 0;

    switch (operation) {
      case 'sum':
        finalValue = acc.sum;
        break;
      case 'avg':
        finalValue = acc.count > 0 ? acc.sum / acc.count : 0;
        break;
      case 'min':
        finalValue = acc.min;
        break;
      case 'max':
        finalValue = acc.max;
        break;
      case 'count':
        finalValue = acc.count;
        break;
    }

    grandTotal += acc.sum;

    let formattedValue = '';
    if (operation === 'count') {
      formattedValue = formatNumber(finalValue);
    } else if (metric === 'fobTot' || metric === 'fobUnd2') {
      formattedValue = formatCurrency(finalValue);
    } else {
      formattedValue = formatNumber(finalValue);
    }

    return {
      category: acc.category,
      value: finalValue,
      formattedValue,
      recordCount: acc.count,
      percentageOfTotal: 0, // Will be computed after sorting
      sortKey: acc.sortKey,
    };
  });

  // 5. Compute percentage of grand total
  dataPoints.forEach((dp) => {
    dp.percentageOfTotal =
      grandTotal > 0 ? Math.round((dp.value / grandTotal) * 1000) / 10 : 0;
  });

  // 6. Sort data points
  dataPoints.sort((a, b) => {
    // Special chronological month / temporal sorting when dimension is temporal and sortField is category
    if (
      (dimension === 'month' || dimension === 'year' || dimension === 'yearMonth') &&
      sortField === 'category'
    ) {
      if (typeof a.sortKey === 'number' && typeof b.sortKey === 'number') {
        return sortOrder === 'asc' ? a.sortKey - b.sortKey : b.sortKey - a.sortKey;
      }
      const strA = String(a.sortKey);
      const strB = String(b.sortKey);
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    }

    if (sortField === 'category') {
      return sortOrder === 'asc'
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }

    if (sortField === 'recordCount') {
      return sortOrder === 'asc'
        ? a.recordCount - b.recordCount
        : b.recordCount - a.recordCount;
    }

    // Default: Sort by value
    return sortOrder === 'asc' ? a.value - b.value : b.value - a.value;
  });

  // 7. Apply optional limit
  const finalData = limit && limit > 0 ? dataPoints.slice(0, limit) : dataPoints;

  const endTime = performance.now();

  return {
    dimension,
    dimensionLabel: DIMENSION_LABELS[dimension],
    metric,
    metricLabel: METRIC_LABELS[metric],
    operation,
    operationLabel: OPERATION_LABELS[operation],
    data: finalData,
    grandTotal,
    totalRecordsProcessed: records.length,
    totalGroups: map.size,
    executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
  };
}
