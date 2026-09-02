import { NormalizedExportRecord, RawExportRecord } from './export-data';

/**
 * Official Excel Header Key representation
 */
export type OfficialExcelHeader =
  | 'Descripcion de la Partida Aduanera'
  | 'Fecha'
  | 'Exportador'
  | 'Qty 1'
  | 'U$ FOB Tot'
  | 'U$ FOB Und 2'
  | 'Pais de Destino'
  | 'Canal';

/**
 * Column definition structure
 */
export interface ColumnDefinition {
  excelHeader: OfficialExcelHeader;
  normalizedKey: keyof NormalizedExportRecord;
  label: string;
  dataType: 'string' | 'number' | 'date';
  required: boolean;
  description: string;
}

/**
 * Single field validation error detail
 */
export interface ValidationErrorDetail {
  rowIndex: number;
  column: OfficialExcelHeader | string;
  value: unknown;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Result of schema validation on uploaded dataset
 */
export interface ValidationResult {
  isValid: boolean;
  missingColumns: string[];
  totalRowsProcessed: number;
  validRowsCount: number;
  invalidRowsCount: number;
  errors: ValidationErrorDetail[];
  warnings: ValidationErrorDetail[];
  validRawRecords: RawExportRecord[];
  invalidRawRecords: RawExportRecord[];
}
