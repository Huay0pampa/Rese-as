/**
 * Interfaces for dynamic dataset analysis, aggregations, metrics, and summaries.
 */

/**
 * Selectable dimensions for grouping data
 */
export type AnalysisDimension =
  | 'year'
  | 'month'
  | 'yearMonth'
  | 'descripcionPartida'
  | 'exportador'
  | 'paisDestino'
  | 'canal';

/**
 * Selectable quantitative metrics
 */
export type AnalysisMetric = 'qty1' | 'fobTot' | 'fobUnd2';

/**
 * Selectable mathematical operations
 */
export type AnalysisOperation = 'sum' | 'avg' | 'min' | 'max' | 'count';

/**
 * Sorting field options
 */
export type SortField = 'category' | 'value' | 'recordCount';

/**
 * Sorting direction options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Query options configuration for dynamic analytics
 */
export interface AnalyticsQueryOptions {
  dimension: AnalysisDimension;
  metric: AnalysisMetric;
  operation: AnalysisOperation;
  sortField?: SortField;
  sortOrder?: SortOrder;
  limit?: number; // Optional limit (e.g. top 10)
}

/**
 * Single aggregated result item produced by the analytics engine
 */
export interface AnalyticsDataPoint {
  category: string;
  value: number; // Raw floating point value with full internal precision
  formattedValue: string; // Presentation formatted string (currency or numeric)
  recordCount: number;
  percentageOfTotal: number; // 0 - 100%
  sortKey: string | number; // Internal key for chronological or numeric sorting
}

/**
 * Overall query result returned by the analytics engine
 */
export interface AnalysisQueryResult {
  dimension: AnalysisDimension;
  dimensionLabel: string;
  metric: AnalysisMetric;
  metricLabel: string;
  operation: AnalysisOperation;
  operationLabel: string;
  data: AnalyticsDataPoint[];
  grandTotal: number; // Sum or total across all groups
  totalRecordsProcessed: number;
  totalGroups: number;
  executionTimeMs: number;
}

/**
 * Top-level summary metric totals
 */
export interface SummaryMetrics {
  totalRecords: number;
  totalFobUSD: number;
  totalQuantity: number;
  avgFobPerUnit: number;
  uniqueExportersCount: number;
  uniqueDestinationsCount: number;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

/**
 * Aggregated item for charts and grouping tables
 */
export interface AggregatedDataItem {
  label: string;
  totalFobUSD: number;
  totalQuantity: number;
  recordCount: number;
  percentageFob: number;
}

/**
 * Time series data point for temporal charts
 */
export interface TimeSeriesDataPoint {
  date: string;
  totalFobUSD: number;
  totalQuantity: number;
  recordCount: number;
}

/**
 * Comprehensive analysis container
 */
export interface AnalysisResult {
  metrics: SummaryMetrics;
  topExporters: AggregatedDataItem[];
  topDestinations: AggregatedDataItem[];
  topCustomsHeadings: AggregatedDataItem[];
  timeSeries: TimeSeriesDataPoint[];
  channelDistribution: AggregatedDataItem[];
  generatedAt: string;
}
