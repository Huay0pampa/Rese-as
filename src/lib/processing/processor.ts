import { parseExcelFile } from '../excel/parser';
import { validateExportRecords } from '../validation/validator';
import { normalizeExportRecords } from '../normalization/normalizer';
import {
  FileMetadata,
  NormalizedExportRecord,
  RawExportRecord,
  ValidationResult,
} from '@/types';

export interface ProcessedPipelineResult {
  metadata: FileMetadata;
  validation: ValidationResult;
  rawRecords: RawExportRecord[];
  normalizedRecords: NormalizedExportRecord[];
}

/**
 * End-to-end processing pipeline orchestrator.
 * Accepts a File, parses Excel buffer, validates strict headers & row constraints,
 * and transforms data into normalized records.
 */
export async function processExportFile(file: File): Promise<ProcessedPipelineResult> {
  // Step 1: Parse file with XLSX
  const { records: rawRecords, metadata: initialMetadata } = await parseExcelFile(file);

  // Step 2: Validate against official 8-column schema
  const validation = validateExportRecords(rawRecords);

  // Step 3: Normalize valid records
  const normalizedRecords = normalizeExportRecords(validation.validRawRecords);

  // Step 4: Enrich metadata with validation counts
  const metadata: FileMetadata = {
    ...initialMetadata,
    validRows: validation.validRowsCount,
    invalidRows: validation.invalidRowsCount,
  };

  return {
    metadata,
    validation,
    rawRecords,
    normalizedRecords,
  };
}
