import * as XLSX from 'xlsx';
import { RawExportRecord, FileMetadata } from '@/types';

/**
 * Parsing result interface
 */
export interface ExcelParseResult {
  records: RawExportRecord[];
  metadata: FileMetadata;
}

/**
 * Parse an Excel or CSV file buffer into raw record objects using SheetJS (XLSX).
 * Completely data-driven: row count is dynamic and determined at runtime.
 */
export async function parseExcelFile(file: File): Promise<ExcelParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('El archivo Excel no contiene ninguna hoja de trabajo.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const records = XLSX.utils.sheet_to_json<RawExportRecord>(worksheet, {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd',
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
    totalRows: records.length,
    validRows: 0,
    invalidRows: 0,
    uploadedAt: new Date().toISOString(),
  };

  return { records, metadata };
}
