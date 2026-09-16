'use client';

import { useState, useMemo } from 'react';
import {
  NormalizedExportRecord,
  AnalysisDimension,
  AnalysisMetric,
  AnalysisOperation,
  AnalysisQueryResult,
} from '@/types';
import { executeAnalyticsQuery } from '@/lib/analysis/analyticsEngine';
import {
  ChartType,
  getDefaultChartType,
  supportsChartType,
} from '@/components/charts/AnalyticsChartCard';

export interface AnalyticsDashboardState {
  dimension: AnalysisDimension;
  metric: AnalysisMetric;
  operation: AnalysisOperation;
  chartType: ChartType;
  queryResult: AnalysisQueryResult | null;
  setDimension: (d: AnalysisDimension) => void;
  setMetric: (m: AnalysisMetric) => void;
  setOperation: (o: AnalysisOperation) => void;
  setChartType: (t: ChartType) => void;
}

/**
 * Shared hook that owns dimension/metric/operation/chartType state and
 * executes the analytics query once. Both the table and the chart consume
 * the same `queryResult` — no duplicated calculation.
 */
export function useAnalyticsDashboard(
  records: NormalizedExportRecord[]
): AnalyticsDashboardState {
  const [dimension, setDimensionRaw] = useState<AnalysisDimension>('exportador');
  const [metric, setMetric] = useState<AnalysisMetric>('fobTot');
  const [operation, setOperation] = useState<AnalysisOperation>('sum');
  const [chartType, setChartTypeRaw] = useState<ChartType>('bar');

  // When dimension changes, auto-select appropriate default chart type
  const setDimension = (d: AnalysisDimension) => {
    setDimensionRaw(d);
    const preferred = getDefaultChartType(d);
    setChartTypeRaw(preferred);
  };

  // When chart type changes, only allow if supported for current dimension
  const setChartType = (t: ChartType) => {
    if (supportsChartType(t, dimension)) {
      setChartTypeRaw(t);
    }
  };

  const queryResult: AnalysisQueryResult | null = useMemo(() => {
    if (records.length === 0) return null;
    return executeAnalyticsQuery(records, {
      dimension,
      metric,
      operation,
      sortField: 'value',
      sortOrder: 'desc',
    });
  }, [records, dimension, metric, operation]);

  return {
    dimension,
    metric,
    operation,
    chartType,
    queryResult,
    setDimension,
    setMetric,
    setOperation,
    setChartType,
  };
}
