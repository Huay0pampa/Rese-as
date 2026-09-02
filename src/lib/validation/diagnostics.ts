import {
  NormalizedExportRecord,
  DataQualityReport,
  FieldQualityMetric,
} from '@/types';

/**
 * Computes a detailed Data Quality Diagnostic Report from a normalized export dataset.
 * Tracks dataset completeness score, valid vs invalid counts per field, and assigns a quality grade.
 */
export function computeDataQualityReport(
  records: NormalizedExportRecord[]
): DataQualityReport {
  const totalRecords = records.length;

  if (totalRecords === 0) {
    return {
      totalRecords: 0,
      validRecords: 0,
      recordsWithInvalidDate: 0,
      recordsWithInvalidNumbers: 0,
      recordsWithEmptyFields: 0,
      completenessScore: 0,
      qualityGrade: 'F',
      fieldMetrics: [],
      generatedAt: new Date().toISOString(),
    };
  }

  let validRecords = 0;
  let recordsWithInvalidDate = 0;
  let recordsWithInvalidNumbers = 0;
  let recordsWithEmptyFields = 0;

  // Field counters
  let validPartida = 0;
  let validFecha = 0;
  let validExportador = 0;
  let validQty = 0;
  let validFobTot = 0;
  let validFobUnd2 = 0;
  let validPaisDestino = 0;
  let validCanal = 0;

  records.forEach((rec) => {
    const flags = rec.qualityFlags;

    if (flags.isValidOverall) validRecords++;
    if (!flags.isDateValid) recordsWithInvalidDate++;
    if (!flags.isQtyValid || !flags.isFobTotValid) recordsWithInvalidNumbers++;
    if (flags.hasEmptyRequiredFields) recordsWithEmptyFields++;

    if (rec.descripcionPartida && rec.descripcionPartida !== '(Sin Descripción)') validPartida++;
    if (flags.isDateValid) validFecha++;
    if (rec.exportador && rec.exportador !== '(Sin Exportador)') validExportador++;
    if (flags.isQtyValid) validQty++;
    if (flags.isFobTotValid) validFobTot++;
    if (flags.isFobUnd2Valid) validFobUnd2++;
    if (rec.paisDestino && rec.paisDestino !== '(Sin Destino)') validPaisDestino++;
    if (rec.canal && rec.canal !== 'N/A') validCanal++;
  });

  const rawScore = (validRecords / totalRecords) * 100;
  const completenessScore = Math.round(rawScore * 10) / 10; // e.g. 98.4%

  let qualityGrade: DataQualityReport['qualityGrade'] = 'F';
  if (completenessScore >= 95) qualityGrade = 'A';
  else if (completenessScore >= 85) qualityGrade = 'B';
  else if (completenessScore >= 70) qualityGrade = 'C';
  else if (completenessScore >= 50) qualityGrade = 'D';

  const makeMetric = (field: string, label: string, valid: number): FieldQualityMetric => {
    const pct = totalRecords > 0 ? Math.round((valid / totalRecords) * 1000) / 10 : 0;
    return {
      field,
      label,
      total: totalRecords,
      valid,
      invalidOrEmpty: totalRecords - valid,
      percentageValid: pct,
    };
  };

  const fieldMetrics: FieldQualityMetric[] = [
    makeMetric('descripcionPartida', 'Descripción de Partida', validPartida),
    makeMetric('fecha', 'Fecha Aduanera', validFecha),
    makeMetric('exportador', 'Exportador', validExportador),
    makeMetric('qty1', 'Cantidad (Qty 1)', validQty),
    makeMetric('fobTot', 'U$ FOB Total', validFobTot),
    makeMetric('fobUnd2', 'U$ FOB Und 2', validFobUnd2),
    makeMetric('paisDestino', 'País de Destino', validPaisDestino),
    makeMetric('canal', 'Canal Aduanero', validCanal),
  ];

  return {
    totalRecords,
    validRecords,
    recordsWithInvalidDate,
    recordsWithInvalidNumbers,
    recordsWithEmptyFields,
    completenessScore,
    qualityGrade,
    fieldMetrics,
    generatedAt: new Date().toISOString(),
  };
}
