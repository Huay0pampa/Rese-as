import * as XLSX from 'xlsx';
import { NormalizedExportRecord, AnalysisQueryResult, SummaryMetrics, ActiveFilterBadge } from '@/types';
import { OFFICIAL_EXCEL_HEADERS } from '../constants/schema';
import { generateDescriptiveFilename, FilenameOptions } from './filename-generator';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';

export type ExportFormat = 'xlsx' | 'csv' | 'json' | 'pdf';

/**
 * Helper function to trigger browser download of a blob
 */
function downloadBlob(content: BlobPart, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Map NormalizedExportRecord to object with official excel header keys
 */
function mapRecordToExportRow(record: NormalizedExportRecord): Record<string, unknown> {
  return {
    [OFFICIAL_EXCEL_HEADERS[0]]: record.descripcionPartida,
    [OFFICIAL_EXCEL_HEADERS[1]]: record.fecha || record.dateDetails.raw,
    [OFFICIAL_EXCEL_HEADERS[2]]: record.exportador,
    [OFFICIAL_EXCEL_HEADERS[3]]: record.qty1,
    [OFFICIAL_EXCEL_HEADERS[4]]: record.fobTot,
    [OFFICIAL_EXCEL_HEADERS[5]]: record.fobUnd2,
    [OFFICIAL_EXCEL_HEADERS[6]]: record.paisDestino,
    [OFFICIAL_EXCEL_HEADERS[7]]: record.canal,
    ...record.extraFields,
  };
}

/**
 * Export processed export dataset to XLSX, CSV, or JSON format.
 */
export async function exportDataset(
  records: NormalizedExportRecord[],
  format: 'xlsx' | 'csv' | 'json',
  filenameOptions?: FilenameOptions | string
): Promise<void> {
  if (!records || records.length === 0) {
    throw new Error('No hay registros para exportar.');
  }

  const filename =
    typeof filenameOptions === 'string'
      ? filenameOptions
      : generateDescriptiveFilename({
          prefix: 'datos_exportaciones_filtrados',
          ...filenameOptions,
        });

  const exportRows = records.map(mapRecordToExportRow);

  if (format === 'json') {
    const jsonStr = JSON.stringify(exportRows, null, 2);
    downloadBlob(jsonStr, 'application/json;charset=utf-8;', `${filename}.json`);
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Filtrados');

  if (format === 'csv') {
    const csvStr = XLSX.utils.sheet_to_csv(worksheet);
    downloadBlob(csvStr, 'text/csv;charset=utf-8;', `${filename}.csv`);
    return;
  }

  if (format === 'xlsx') {
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
}

/**
 * Export calculated analytics query result to XLSX, CSV, or JSON format.
 */
export async function exportAnalyticsResult(
  queryResult: AnalysisQueryResult,
  format: 'xlsx' | 'csv' | 'json',
  filenameOptions?: FilenameOptions | string
): Promise<void> {
  if (!queryResult || queryResult.data.length === 0) {
    throw new Error('No hay resultados analíticos para exportar.');
  }

  const filename =
    typeof filenameOptions === 'string'
      ? filenameOptions
      : generateDescriptiveFilename({
          prefix: 'analisis_exportaciones',
          dimension: queryResult.dimension,
          metric: queryResult.metric,
          operation: queryResult.operation,
          ...filenameOptions,
        });

  const exportRows = queryResult.data.map((dp, idx) => ({
    '#': idx + 1,
    [queryResult.dimensionLabel]: dp.category,
    [`${queryResult.operationLabel} · ${queryResult.metricLabel}`]: dp.value,
    'Registros Procesados': dp.recordCount,
    '% del Total': `${dp.percentageOfTotal.toFixed(2)}%`,
  }));

  if (format === 'json') {
    const jsonStr = JSON.stringify(
      {
        dimension: queryResult.dimensionLabel,
        metric: queryResult.metricLabel,
        operation: queryResult.operationLabel,
        totalGroups: queryResult.totalGroups,
        totalRecordsProcessed: queryResult.totalRecordsProcessed,
        data: exportRows,
      },
      null,
      2
    );
    downloadBlob(jsonStr, 'application/json;charset=utf-8;', `${filename}.json`);
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen Analítico');

  if (format === 'csv') {
    const csvStr = XLSX.utils.sheet_to_csv(worksheet);
    downloadBlob(csvStr, 'text/csv;charset=utf-8;', `${filename}.csv`);
    return;
  }

  if (format === 'xlsx') {
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
}

/**
 * Escapes HTML characters to prevent XSS.
 */
function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return String(unsafe);
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Export analytics result as a executive printable PDF report.
 */
export function exportAnalyticsResultToPDF(
  queryResult: AnalysisQueryResult,
  summaryMetrics?: SummaryMetrics,
  activeBadges: ActiveFilterBadge[] = [],
  filenameOptions?: FilenameOptions | string
): void {
  if (!queryResult || queryResult.data.length === 0) {
    throw new Error('No hay resultados para generar la vista PDF.');
  }

  const filename =
    typeof filenameOptions === 'string'
      ? filenameOptions
      : generateDescriptiveFilename({
          prefix: 'reporte_exportaciones',
          dimension: queryResult.dimension,
          metric: queryResult.metric,
          operation: queryResult.operation,
          ...filenameOptions,
        });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor permite ventanas emergentes (popups) para imprimir o descargar el PDF.');
    return;
  }

  const filterChipsHtml =
    activeBadges.length > 0
      ? activeBadges
          .map((b) => `<span style="background:#e0e7ff; color:#3730a3; padding:3px 8px; border-radius:12px; font-size:11px; margin-right:4px;">${escapeHtml(b.label)}: ${escapeHtml(String(b.value))}</span>`)
          .join('')
      : '<span style="color:#64748b; font-size:11px;">Ninguno (Dataset completo)</span>';

  const rowsHtml = queryResult.data
    .map(
      (dp, i) => `
    <tr>
      <td style="padding:8px; border-bottom:1px solid #e2e8f0; font-size:11px; text-align:center;">${i + 1}</td>
      <td style="padding:8px; border-bottom:1px solid #e2e8f0; font-size:11px; font-weight:600; color:#1e293b;">${escapeHtml(dp.category)}</td>
      <td style="padding:8px; border-bottom:1px solid #e2e8f0; font-size:11px; text-align:right; font-family:monospace; font-weight:bold; color:#0f766e;">
        ${queryResult.metric === 'fobTot' || queryResult.metric === 'fobUnd2' ? escapeHtml(formatCurrency(dp.value)) : escapeHtml(formatNumber(dp.value))}
      </td>
      <td style="padding:8px; border-bottom:1px solid #e2e8f0; font-size:11px; text-align:right; font-family:monospace;">${escapeHtml(formatNumber(dp.recordCount))}</td>
      <td style="padding:8px; border-bottom:1px solid #e2e8f0; font-size:11px; text-align:right; font-family:monospace;">${escapeHtml(dp.percentageOfTotal.toFixed(1))}%</td>
    </tr>`
    )
    .join('');

  const todayStr = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>${filename}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 30px; color: #0f172a; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 20px; font-weight: bold; color: #1e3a8a; margin: 0; }
        .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
        .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .kpi-card { background: #f1f5f9; border-radius: 6px; padding: 10px; text-align: center; }
        .kpi-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
        .kpi-value { font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #0f172a; color: #ffffff; font-size: 11px; padding: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
        @media print {
          body { margin: 10px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">Analizador de Exportaciones</h1>
          <p class="subtitle">Reporte Ejecutivo de Inteligencia Comercial & Logística</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size:11px; font-weight:bold; color:#2563eb; margin:0;">REPORTE DE RESULTADOS</p>
          <p style="font-size:10px; color:#64748b; margin-top:2px;">Generado: ${todayStr}</p>
        </div>
      </div>

      <div class="meta-box">
        <strong>Configuración del Análisis:</strong> Agrupar por <em>${queryResult.dimensionLabel}</em> | Métrica: <em>${queryResult.metricLabel}</em> | Operación: <em>${queryResult.operationLabel}</em><br/>
        <div style="margin-top: 6px;"><strong>Filtros Aplicados:</strong> ${filterChipsHtml}</div>
      </div>

      ${
        summaryMetrics
          ? `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-title">Registros Procesados</div>
          <div class="kpi-value">${formatNumber(summaryMetrics.totalRecords)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Exportadores Únicos</div>
          <div class="kpi-value">${formatNumber(summaryMetrics.uniqueExportersCount)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Países de Destino</div>
          <div class="kpi-value">${formatNumber(summaryMetrics.uniqueDestinationsCount)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">FOB Total USD</div>
          <div class="kpi-value" style="color:#059669;">${formatCurrency(summaryMetrics.totalFobUSD)}</div>
        </div>
      </div>`
          : ''
      }

      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th style="text-align: left;">${queryResult.dimensionLabel}</th>
            <th style="text-align: right;">${queryResult.operationLabel} · ${queryResult.metricLabel}</th>
            <th style="text-align: right; width: 100px;">Registros</th>
            <th style="text-align: right; width: 80px;">% Total</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        Documento generado automáticamente por el Analizador de Exportaciones · ${queryResult.totalGroups} grupos agrupados · ${formatNumber(queryResult.totalRecordsProcessed)} operaciones evaluadas
      </div>

      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Capture a rendered Recharts SVG element inside a container and download it as PNG or SVG image.
 */
export async function exportChartToImage(
  containerRef: HTMLElement | null,
  filenameOptions?: FilenameOptions | string,
  imageFormat: 'png' | 'svg' = 'png'
): Promise<void> {
  if (!containerRef) {
    throw new Error('Contenedor del gráfico no encontrado.');
  }

  const svgElement = containerRef.querySelector('svg');
  if (!svgElement) {
    throw new Error('No se encontró el elemento SVG del gráfico.');
  }

  const filename =
    typeof filenameOptions === 'string'
      ? filenameOptions
      : generateDescriptiveFilename({
          prefix: 'grafico_exportaciones',
          ...filenameOptions,
        });

  const svgData = new XMLSerializer().serializeToString(svgElement);

  if (imageFormat === 'svg') {
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(svgBlob, 'image/svg+xml;charset=utf-8;', `${filename}.svg`);
    return;
  }

  // Convert SVG to Canvas for PNG download
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener el contexto 2D del canvas.');

  const bbox = svgElement.getBoundingClientRect();
  const width = bbox.width || 800;
  const height = bbox.height || 400;

  // Scale up for high DPI sharpness
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Dark theme background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  const img = new Image();
  const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, 'image/png', `${filename}.png`);
          resolve();
        } else {
          reject(new Error('Fallo al generar imagen PNG.'));
        }
      }, 'image/png');
    };
    img.onerror = (err) => reject(err);
    img.src = svgUrl;
  });
}
