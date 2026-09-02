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
 * Normalized and validated record used across application logic
 */
export interface NormalizedExportRecord {
  id: string;
  descripcionPartida: string;
  fecha: string; // ISO YYYY-MM-DD
  exportador: string;
  qty1: number;
  fobTot: number;
  fobUnd2: number;
  paisDestino: string;
  canal: string;
}

/**
 * Metadata container for uploaded Excel / CSV files
 */
export interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: 'xlsx' | 'xls' | 'csv' | 'unknown';
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
  rawRecords: RawExportRecord[];
  normalizedRecords: NormalizedExportRecord[];
  errorMessage: string | null;
}
