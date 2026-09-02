import {
  RawExportRecord,
  NormalizedExportRecord,
  DateDetails,
  RecordQualityFlags,
} from '@/types';
import { OFFICIAL_EXCEL_HEADERS } from '../constants/schema';

const SPANISH_MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * Clean text strings by trimming surrounding whitespace and converting multiple inner spaces to a single space.
 */
export function cleanText(val: unknown): string {
  if (val === undefined || val === null) return '';
  return String(val).trim().replace(/\s+/g, ' ');
}

/**
 * Robust numeric parser supporting numbers, formatted strings ($ 1,234.56, 1.234,56, etc.)
 */
export function parseNumericDetails(val: unknown): { value: number; isValid: boolean } {
  if (val === undefined || val === null || val === '') {
    return { value: 0, isValid: false };
  }
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return { value: 0, isValid: false };
    return { value: val, isValid: true };
  }

  const str = String(val).trim();
  // Remove currency signs, letters, and clean thousand separators
  // Handles both European (1.234,56) and standard (1,234.56) formats if needed
  let cleaned = str.replace(/[^0-9.,-]+/g, '');

  if (!cleaned) return { value: 0, isValid: false };

  // If contains comma and dot, e.g. 1,234.56 -> remove comma
  if (cleaned.includes(',') && cleaned.includes('.')) {
    if (cleaned.indexOf(',') < cleaned.indexOf('.')) {
      cleaned = cleaned.replace(/,/g, '');
    } else {
      // European format 1.234,56 -> 1234.56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
  } else if (cleaned.includes(',')) {
    // Single comma: convert to dot if decimal or remove if thousand sep
    const parts = cleaned.split(',');
    if (parts[1] && parts[1].length === 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }

  const num = parseFloat(cleaned);
  if (isNaN(num) || !isFinite(num)) {
    return { value: 0, isValid: false };
  }

  return { value: num, isValid: true };
}

/**
 * Convert Excel date serial number to JavaScript Date object.
 */
function excelSerialToDate(serial: number): Date | null {
  // Excel epoch begins Jan 1 1900. Account for Excel 1 leap year bug (25569 days shift)
  if (isNaN(serial) || serial <= 0) return null;
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  const fractionalDay = serial - Math.floor(serial) + 0.0000001;
  let totalSeconds = Math.floor(86400 * fractionalDay);
  const seconds = totalSeconds % 60;
  totalSeconds = Math.floor(totalSeconds / 60);
  const minutes = totalSeconds % 60;
  const hours = Math.floor(totalSeconds / 60);

  return new Date(
    dateInfo.getUTCFullYear(),
    dateInfo.getUTCMonth(),
    dateInfo.getUTCDate(),
    hours,
    minutes,
    seconds
  );
}

/**
 * Comprehensive Date details parser. Extracts ISO date, Year, Month Number, Month Name, and Year-Month.
 */
export function parseDateDetails(val: unknown): DateDetails {
  const rawStr = val !== undefined && val !== null ? String(val).trim() : '';

  if (!val) {
    return {
      raw: rawStr,
      isoDate: null,
      year: null,
      monthNumber: null,
      monthName: null,
      yearMonth: null,
      isValid: false,
    };
  }

  let dateObj: Date | null = null;

  if (val instanceof Date && !isNaN(val.getTime())) {
    dateObj = val;
  } else if (typeof val === 'number') {
    dateObj = excelSerialToDate(val);
  } else if (typeof val === 'string') {
    const trimmed = val.trim();

    // Check numeric Excel serial string
    if (/^\d{4,6}(\.\d+)?$/.test(trimmed)) {
      const serial = parseFloat(trimmed);
      if (serial > 1000 && serial < 100000) {
        dateObj = excelSerialToDate(serial);
      }
    }

    if (!dateObj) {
      // YYYY-MM-DD
      if (/^\d{4}-\d{1,2}-\d{1,2}/.test(trimmed)) {
        const parts = trimmed.split(/[-T ]/);
        dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
      // DD/MM/YYYY or DD-MM-YYYY
      else if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(trimmed)) {
        const parts = trimmed.split(/[\/-]/);
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        dateObj = new Date(year, month - 1, day);
      } else {
        const fallback = new Date(trimmed);
        if (!isNaN(fallback.getTime())) {
          dateObj = fallback;
        }
      }
    }
  }

  if (!dateObj || isNaN(dateObj.getTime()) || dateObj.getFullYear() < 1990 || dateObj.getFullYear() > 2100) {
    return {
      raw: rawStr,
      isoDate: null,
      year: null,
      monthNumber: null,
      monthName: null,
      yearMonth: null,
      isValid: false,
    };
  }

  const year = dateObj.getFullYear();
  const monthNumber = dateObj.getMonth() + 1; // 1 - 12
  const monthName = SPANISH_MONTH_NAMES[monthNumber - 1];
  const padMonth = String(monthNumber).padStart(2, '0');
  const padDay = String(dateObj.getDate()).padStart(2, '0');
  const isoDate = `${year}-${padMonth}-${padDay}`;
  const yearMonth = `${year}-${padMonth}`;

  return {
    raw: rawStr,
    isoDate,
    year,
    monthNumber,
    monthName,
    yearMonth,
    isValid: true,
  };
}

/**
 * Case-insensitive field lookup independent of column order.
 */
function getFieldValue(record: RawExportRecord, headerName: string): unknown {
  const target = headerName.trim().toLowerCase();
  const matchKey = Object.keys(record).find((k) => k.trim().toLowerCase() === target);
  return matchKey ? record[matchKey] : undefined;
}

/**
 * Normalizes raw records into strongly-typed NormalizedExportRecord instances.
 * Computes DateDetails, parses numbers, and records Quality Flags without dropping invalid data.
 */
export function normalizeExportRecords(
  rawRecords: RawExportRecord[]
): NormalizedExportRecord[] {
  return rawRecords.map((raw, idx) => {
    const descripcionPartida = cleanText(getFieldValue(raw, 'Descripcion de la Partida Aduanera'));
    const exportador = cleanText(getFieldValue(raw, 'Exportador'));
    const paisDestino = cleanText(getFieldValue(raw, 'Pais de Destino'));
    const canal = cleanText(getFieldValue(raw, 'Canal'));

    const dateDetails = parseDateDateilsOrFallback(getFieldValue(raw, 'Fecha'));

    const qtyParsed = parseNumericDetails(getFieldValue(raw, 'Qty 1'));
    const fobTotParsed = parseNumericDetails(getFieldValue(raw, 'U$ FOB Tot'));
    const fobUnd2Parsed = parseNumericDetails(getFieldValue(raw, 'U$ FOB Und 2'));

    const warnings: string[] = [];

    if (!descripcionPartida) warnings.push('Descripción de partida aduanera vacía.');
    if (!exportador) warnings.push('Exportador vacío.');
    if (!paisDestino) warnings.push('País de destino vacío.');
    if (!dateDetails.isValid) warnings.push('Fecha inválida o no parseable.');
    if (!qtyParsed.isValid) warnings.push('Cantidad Qty 1 inválida.');
    if (!fobTotParsed.isValid) warnings.push('Monto U$ FOB Tot inválido.');

    const hasEmptyRequiredFields =
      !descripcionPartida || !exportador || !paisDestino;

    const isNumericValid = qtyParsed.isValid && fobTotParsed.isValid;
    const isTextValid = !hasEmptyRequiredFields;
    const isValidOverall = dateDetails.isValid && isNumericValid && isTextValid;

    const qualityFlags: RecordQualityFlags = {
      isDateValid: dateDetails.isValid,
      isQtyValid: qtyParsed.isValid,
      isFobTotValid: fobTotParsed.isValid,
      isFobUnd2Valid: fobUnd2Parsed.isValid,
      isTextValid,
      hasEmptyRequiredFields,
      isValidOverall,
      warnings,
    };

    // Collect extra non-official fields
    const extraFields: Record<string, unknown> = {};
    Object.keys(raw).forEach((key) => {
      const isOfficial = OFFICIAL_EXCEL_HEADERS.some(
        (h) => h.toLowerCase() === key.trim().toLowerCase()
      );
      if (!isOfficial) {
        extraFields[key.trim()] = raw[key];
      }
    });

    return {
      id: `rec-${idx + 1}-${Date.now().toString(36)}`,
      descripcionPartida: descripcionPartida || '(Sin Descripción)',
      fecha: dateDetails.isoDate || '',
      dateDetails,
      exportador: exportador || '(Sin Exportador)',
      qty1: qtyParsed.value,
      fobTot: fobTotParsed.value,
      fobUnd2: fobUnd2Parsed.value,
      paisDestino: paisDestino || '(Sin Destino)',
      canal: canal || 'N/A',
      qualityFlags,
      extraFields: Object.keys(extraFields).length > 0 ? extraFields : undefined,
    };
  });
}

function parseDateDateilsOrFallback(val: unknown): DateDetails {
  return parseDateDetails(val);
}
