import * as XLSX from 'xlsx';
import { RawExportRecord, FileMetadata } from '@/types';
import { OFFICIAL_EXCEL_HEADERS } from '../constants/schema';

/**
 * Parsing result interface
 */
export interface ExcelParseResult {
  records: RawExportRecord[];
  metadata: FileMetadata;
}

/**
 * Parse an Excel (.xlsx, .xls) or CSV file buffer into raw record objects using SheetJS (XLSX).
 * Completely data-driven: row count is dynamic and determined at runtime.
 * Identifies sheet name, total columns detected, and preserves additional non-official columns.
 */
export async function parseExcelFile(file: File): Promise<ExcelParseResult> {
  let workbook: XLSX.WorkBook;

  try {
    const arrayBuffer = await file.arrayBuffer();
    workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(`El archivo '${file.name}' no es un documento Excel o CSV válido o está dañado. (${message})`);
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('El archivo Excel no contiene ninguna hoja de trabajo activa.');
  }

  const worksheet = workbook.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json<RawExportRecord>(worksheet, {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd',
  });

  if (records.length === 0) {
    throw new Error(`La hoja '${sheetName}' del archivo Excel no contiene ningún registro de datos.`);
  }

  // Extract all unique detected column header names from the first record
  const sampleRow = records[0] || {};
  const detectedHeaders = Object.keys(sampleRow).map((h) => h.trim());
  const detectedColumnsCount = detectedHeaders.length;

  // Identify additional non-official columns
  const additionalColumns = detectedHeaders.filter((header) => {
    return !OFFICIAL_EXCEL_HEADERS.some(
      (official) => official.toLowerCase() === header.toLowerCase()
    );
  });

  const ext = file.name.split('.').pop()?.toLowerCase();
  let fileType: FileMetadata['fileType'] = 'unknown';
  if (ext === 'xlsx') fileType = 'xlsx';
  else if (ext === 'xls') fileType = 'xls';
  else if (ext === 'csv') fileType = 'csv';

  const metadata: FileMetadata = {
    fileName: file.name,
    fileSize: file.size,
    fileType,
    sheetName,
    detectedColumnsCount,
    additionalColumns,
    totalRows: records.length,
    validRows: 0,
    invalidRows: 0,
    uploadedAt: new Date().toISOString(),
  };

  return { records, metadata };
}
