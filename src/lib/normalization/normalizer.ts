import { RawExportRecord, NormalizedExportRecord } from '@/types';
import { OFFICIAL_EXCEL_HEADERS } from '../constants/schema';

/**
 * Helper to parse numbers safely from string or number inputs.
 */
function parseNumericValue(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]+/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Helper to parse dates into ISO standard string YYYY-MM-DD.
 */
function parseDateValue(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split('T')[0];
  }
  const dateStr = String(val).trim();
  const dateObj = new Date(dateStr);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toISOString().split('T')[0];
  }
  return dateStr;
}

/**
 * Helper to find field value matching key case-insensitively, independent of column position.
 */
function getFieldValue(record: RawExportRecord, headerName: string): unknown {
  const target = headerName.trim().toLowerCase();
  const matchKey = Object.keys(record).find((k) => k.trim().toLowerCase() === target);
  return matchKey ? record[matchKey] : undefined;
}

/**
 * Normalizes raw records into strongly-typed NormalizedExportRecord instances.
 * Preserves additional columns in extraFields for future use.
 */
export function normalizeExportRecords(
  rawRecords: RawExportRecord[]
): NormalizedExportRecord[] {
  return rawRecords.map((raw, idx) => {
    const descripcionPartida = String(
      getFieldValue(raw, 'Descripcion de la Partida Aduanera') || ''
    ).trim();

    const fecha = parseDateValue(getFieldValue(raw, 'Fecha'));
    const exportador = String(getFieldValue(raw, 'Exportador') || '').trim();
    const qty1 = parseNumericValue(getFieldValue(raw, 'Qty 1'));
    const fobTot = parseNumericValue(getFieldValue(raw, 'U$ FOB Tot'));
    const fobUnd2 = parseNumericValue(getFieldValue(raw, 'U$ FOB Und 2'));
    const paisDestino = String(getFieldValue(raw, 'Pais de Destino') || '').trim();
    const canal = String(getFieldValue(raw, 'Canal') || '').trim();

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
      descripcionPartida,
      fecha,
      exportador,
      qty1,
      fobTot,
      fobUnd2,
      paisDestino,
      canal,
      extraFields: Object.keys(extraFields).length > 0 ? extraFields : undefined,
    };
  });
}
