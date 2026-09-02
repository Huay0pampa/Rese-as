/**
 * Interfaces for dataset analysis, aggregations, metrics, and summaries.
 */

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
