import { analyzeExportDataset } from '@/lib/analysis/analyzer';
import { executeAnalyticsQuery } from '@/lib/analysis/analyticsEngine';
import {
  NormalizedExportRecord,
  AnalysisResult,
  AnalyticsQueryOptions,
  AnalysisQueryResult,
} from '@/types';

/**
 * Service managing statistical calculations and dynamic aggregation analytics.
 */
export class AnalyticsService {
  /**
   * Generates analysis results from normalized export dataset.
   */
  static generateAnalysis(records: NormalizedExportRecord[]): AnalysisResult {
    return analyzeExportDataset(records);
  }

  /**
   * Executes a dynamic analytics query grouping by dimension, metric, and operation.
   */
  static query(
    records: NormalizedExportRecord[],
    options: AnalyticsQueryOptions
  ): AnalysisQueryResult {
    return executeAnalyticsQuery(records, options);
  }
}
