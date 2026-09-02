import {
  NormalizedExportRecord,
  AnalysisResult,
  SummaryMetrics,
  AggregatedDataItem,
  TimeSeriesDataPoint,
} from '@/types';

/**
 * Computes top-level summary metrics dynamically from any dataset.
 * Does NOT assume fixed rows or hardcoded entities.
 */
export function computeSummaryMetrics(
  records: NormalizedExportRecord[]
): SummaryMetrics {
  if (records.length === 0) {
    return {
      totalRecords: 0,
      totalFobUSD: 0,
      totalQuantity: 0,
      avgFobPerUnit: 0,
      uniqueExportersCount: 0,
      uniqueDestinationsCount: 0,
      dateRange: { startDate: null, endDate: null },
    };
  }

  let totalFobUSD = 0;
  let totalQuantity = 0;
  const exportersSet = new Set<string>();
  const destinationsSet = new Set<string>();
  let minDate: string | null = null;
  let maxDate: string | null = null;

  records.forEach((rec) => {
    totalFobUSD += rec.fobTot || 0;
    totalQuantity += rec.qty1 || 0;

    if (rec.exportador) exportersSet.add(rec.exportador);
    if (rec.paisDestino) destinationsSet.add(rec.paisDestino);

    if (rec.fecha) {
      if (!minDate || rec.fecha < minDate) minDate = rec.fecha;
      if (!maxDate || rec.fecha > maxDate) maxDate = rec.fecha;
    }
  });

  const avgFobPerUnit = totalQuantity > 0 ? totalFobUSD / totalQuantity : 0;

  return {
    totalRecords: records.length,
    totalFobUSD,
    totalQuantity,
    avgFobPerUnit,
    uniqueExportersCount: exportersSet.size,
    uniqueDestinationsCount: destinationsSet.size,
    dateRange: {
      startDate: minDate,
      endDate: maxDate,
    },
  };
}

/**
 * Interface / Shell for comprehensive dataset analysis calculation.
 */
export function analyzeExportDataset(
  records: NormalizedExportRecord[]
): AnalysisResult {
  const metrics = computeSummaryMetrics(records);

  // Architecture shell for future prompts (Prompt 02+)
  const topExporters: AggregatedDataItem[] = [];
  const topDestinations: AggregatedDataItem[] = [];
  const topCustomsHeadings: AggregatedDataItem[] = [];
  const timeSeries: TimeSeriesDataPoint[] = [];
  const channelDistribution: AggregatedDataItem[] = [];

  return {
    metrics,
    topExporters,
    topDestinations,
    topCustomsHeadings,
    timeSeries,
    channelDistribution,
    generatedAt: new Date().toISOString(),
  };
}
