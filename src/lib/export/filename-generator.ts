import { AnalysisDimension, AnalysisMetric, AnalysisOperation } from '@/types';

/**
 * Sanitize strings for filenames (removes accents, replaces spaces & non-alphanumeric with underscores)
 */
export function sanitizeFilenamePart(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_') // replace non-alphanumeric with _
    .replace(/^_+|_+$/g, ''); // trim leading/trailing underscores
}

export interface FilenameOptions {
  prefix?: string; // e.g. 'analisis_exportaciones', 'reporte_exportaciones', 'grafico_exportaciones'
  dimension?: AnalysisDimension | string;
  metric?: AnalysisMetric | string;
  operation?: AnalysisOperation | string;
  years?: (number | string)[];
  chartType?: string;
  extension?: string;
}

/**
 * Generate a descriptive, human-readable filename based on active analysis options.
 * Example output: 'analisis_exportaciones_2025_exportador_fob_sum'
 */
export function generateDescriptiveFilename({
  prefix = 'analisis_exportaciones',
  dimension,
  metric,
  operation,
  years,
  chartType,
  extension,
}: FilenameOptions): string {
  const parts: string[] = [sanitizeFilenamePart(prefix)];

  // Append active years if present
  if (years && years.length > 0) {
    const yearPart = years.slice(0, 3).join('_');
    parts.push(sanitizeFilenamePart(yearPart));
  }

  // Append dimension (e.g. exportador, paisdestino, year, month)
  if (dimension) {
    parts.push(sanitizeFilenamePart(String(dimension)));
  }

  // Append metric (e.g. fob, qty1, fobund2)
  if (metric) {
    parts.push(sanitizeFilenamePart(String(metric)));
  }

  // Append operation (e.g. sum, avg, count)
  if (operation) {
    parts.push(sanitizeFilenamePart(String(operation)));
  }

  // Append chart type if specified (e.g. bar, line, pie)
  if (chartType) {
    parts.push(sanitizeFilenamePart(String(chartType)));
  }

  const baseName = parts.filter(Boolean).join('_');
  return extension ? `${baseName}.${extension.replace(/^\./, '')}` : baseName;
}
