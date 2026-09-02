import { analyzeExportDataset } from '@/lib/analysis/analyzer';
import { NormalizedExportRecord, AnalysisResult } from '@/types';

/**
 * Service managing statistical calculations and aggregation analytics.
 */
export class AnalyticsService {
  /**
   * Generates analysis results from normalized export dataset.
   */
  static generateAnalysis(records: NormalizedExportRecord[]): AnalysisResult {
    return analyzeExportDataset(records);
  }
}
