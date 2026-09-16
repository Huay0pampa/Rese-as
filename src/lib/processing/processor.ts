import { parseExcelFile } from '../excel/parser';
import { validateExportRecords } from '../validation/validator';
import { normalizeExportRecords } from '../normalization/normalizer';
import { computeDataQualityReport } from '../validation/diagnostics';
import {
  FileMetadata,
  NormalizedExportRecord,
  RawExportRecord,
  ValidationResult,
  DataQualityReport,
} from '@/types';

export interface ProcessedPipelineResult {
  metadata: FileMetadata;
  validation: ValidationResult;
  qualityReport: DataQualityReport;
  normalizedRecords: NormalizedExportRecord[];
}

/**
 * End-to-end processing pipeline orchestrator.
 * Accepts a File, parses Excel buffer, validates strict headers & row constraints,
 * normalizes data with full date breakdown, and computes quality diagnostics.
 */
export async function processExportFile(file: File): Promise<ProcessedPipelineResult> {
  // Step 1: Parse file with XLSX
  const { records: rawRecords, metadata: initialMetadata } = await parseExcelFile(file);

  // Step 2: Validate against official 8-column schema
  const validation = validateExportRecords(rawRecords);

  // Step 3: Normalize all records (both valid and raw fallback records to preserve full dataset)
  const normalizedRecords = normalizeExportRecords(rawRecords);

  // Step 4: Compute comprehensive dataset quality diagnostics
  const qualityReport = computeDataQualityReport(normalizedRecords);

  // Step 5: Enrich metadata with validation and quality counts
  const metadata: FileMetadata = {
    ...initialMetadata,
    validRows: qualityReport.validRecords,
    invalidRows: qualityReport.totalRecords - qualityReport.validRecords,
  };

  return {
    metadata,
    validation,
    qualityReport,
    normalizedRecords,
  };
}
