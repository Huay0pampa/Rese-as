/**
 * Core export data interfaces.
 * Strictly models the 8 official Excel columns without hardcoding row bounds.
 */

/**
 * Raw unvalidated record directly read from Excel file
 */
export interface RawExportRecord {
  'Descripcion de la Partida Aduanera'?: string | number;
  'Fecha'?: string | number | Date;
  'Exportador'?: string | number;
  'Qty 1'?: string | number;
  'U$ FOB Tot'?: string | number;
  'U$ FOB Und 2'?: string | number;
  'Pais de Destino'?: string | number;
  'Canal'?: string | number;
  [key: string]: unknown;
}

/**
 * Detailed temporal breakdown extracted from date field
 */
export interface DateDetails {
  raw: string;
  isoDate: string | null; // YYYY-MM-DD
  year: number | null;
  monthNumber: number | null; // 1 - 12
  monthName: string | null; // Enero, Febrero, ...
  yearMonth: string | null; // YYYY-MM
  isValid: boolean;
}

/**
 * Individual data quality flags per record
 */
export interface RecordQualityFlags {
  isDateValid: boolean;
  isQtyValid: boolean;
  isFobTotValid: boolean;
  isFobUnd2Valid: boolean;
  isTextValid: boolean;
  hasEmptyRequiredFields: boolean;
  isValidOverall: boolean;
  warnings: string[];
}

/**
 * Normalized and validated record used across application logic.
 * Preserves additional non-official columns in extraFields for future use.
 */
export interface NormalizedExportRecord {
  id: string;
  descripcionPartida: string;
  fecha: string; // ISO YYYY-MM-DD or empty
  dateDetails: DateDetails;
  exportador: string;
  qty1: number;
  fobTot: number;
  fobUnd2: number;
  paisDestino: string;
  canal: string;
  qualityFlags: RecordQualityFlags;
  extraFields?: Record<string, unknown>;
}

/**
 * Comprehensive dataset quality diagnostics metrics
 */
export interface FieldQualityMetric {
  field: string;
  label: string;
  total: number;
  valid: number;
  invalidOrEmpty: number;
  percentageValid: number;
}

export interface DataQualityReport {
  totalRecords: number;
  validRecords: number;
  recordsWithInvalidDate: number;
  recordsWithInvalidNumbers: number;
  recordsWithEmptyFields: number;
  completenessScore: number; // 0 - 100 percentage
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  fieldMetrics: FieldQualityMetric[];
  generatedAt: string;
}

/**
 * Metadata container for uploaded Excel / CSV files
 */
export interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: 'xlsx' | 'xls' | 'csv' | 'unknown';
  sheetName: string;
  detectedColumnsCount: number;
  additionalColumns: string[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  uploadedAt: string; // ISO Date String
}

/**
 * File processing status lifecycle states
 */
export type FileProcessingStatus =
  | 'idle'
  | 'loading'
  | 'parsing'
  | 'validating'
  | 'ready'
  | 'error';

/**
 * Full state container for uploaded file session
 */
export interface FileProcessingState {
  file: File | null;
  status: FileProcessingStatus;
  progress: number; // 0 to 100
  metadata: FileMetadata | null;
  qualityReport: DataQualityReport | null;
  normalizedRecords: NormalizedExportRecord[];
  errorMessage: string | null;
}
