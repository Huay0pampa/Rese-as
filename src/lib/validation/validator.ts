import { OFFICIAL_EXCEL_HEADERS, COLUMN_DEFINITIONS } from '../constants/schema';
import { RawExportRecord, ValidationResult, ValidationErrorDetail } from '@/types';

/**
 * Validate incoming raw records against the official 8-column schema.
 * Checks for missing required columns and valid field types.
 */
export function validateExportRecords(records: RawExportRecord[]): ValidationResult {
  const missingColumns: string[] = [];
  const errors: ValidationErrorDetail[] = [];
  const warnings: ValidationErrorDetail[] = [];
  const validRawRecords: RawExportRecord[] = [];
  const invalidRawRecords: RawExportRecord[] = [];

  if (records.length === 0) {
    return {
      isValid: false,
      missingColumns: [...OFFICIAL_EXCEL_HEADERS],
      totalRowsProcessed: 0,
      validRowsCount: 0,
      invalidRowsCount: 0,
      errors: [
        {
          rowIndex: 0,
          column: 'General',
          value: null,
          message: 'El archivo está vacío o no contiene filas de datos.',
          severity: 'error',
        },
      ],
      warnings: [],
      validRawRecords: [],
      invalidRawRecords: [],
    };
  }

  // Check header existence from first row keys
  const sampleRow = records[0];
  const presentHeaders = Object.keys(sampleRow).map((k) => k.trim());

  for (const officialHeader of OFFICIAL_EXCEL_HEADERS) {
    const isPresent = presentHeaders.some(
      (h) => h.toLowerCase() === officialHeader.toLowerCase()
    );
    if (!isPresent) {
      missingColumns.push(officialHeader);
    }
  }

  if (missingColumns.length > 0) {
    return {
      isValid: false,
      missingColumns,
      totalRowsProcessed: records.length,
      validRowsCount: 0,
      invalidRowsCount: records.length,
      errors: missingColumns.map((col) => ({
        rowIndex: 0,
        column: col,
        value: null,
        message: `Falta la columna obligatoria '${col}' en el esquema del archivo.`,
        severity: 'error',
      })),
      warnings: [],
      validRawRecords: [],
      invalidRawRecords: records,
    };
  }

  // Row-level validation
  records.forEach((row, index) => {
    let rowHasError = false;

    COLUMN_DEFINITIONS.forEach((colDef) => {
      // Find key matching official header case-insensitively
      const actualKey = Object.keys(row).find(
        (k) => k.trim().toLowerCase() === colDef.excelHeader.toLowerCase()
      );
      const rawValue = actualKey ? row[actualKey] : undefined;

      if (colDef.required && (rawValue === undefined || rawValue === null || rawValue === '')) {
        rowHasError = true;
        errors.push({
          rowIndex: index + 1,
          column: colDef.excelHeader,
          value: rawValue,
          message: `Fila ${index + 1}: El campo '${colDef.label}' es obligatorio.`,
          severity: 'error',
        });
      }
    });

    if (rowHasError) {
      invalidRawRecords.push(row);
    } else {
      validRawRecords.push(row);
    }
  });

  return {
    isValid: errors.length === 0,
    missingColumns,
    totalRowsProcessed: records.length,
    validRowsCount: validRawRecords.length,
    invalidRowsCount: invalidRawRecords.length,
    errors,
    warnings,
    validRawRecords,
    invalidRawRecords,
  };
}
