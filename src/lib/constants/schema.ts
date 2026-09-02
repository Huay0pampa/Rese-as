import { ColumnDefinition, OfficialExcelHeader } from '@/types';

/**
 * Official Excel Header Names strictly expected by the application.
 */
export const OFFICIAL_EXCEL_HEADERS: readonly OfficialExcelHeader[] = [
  'Descripcion de la Partida Aduanera',
  'Fecha',
  'Exportador',
  'Qty 1',
  'U$ FOB Tot',
  'U$ FOB Und 2',
  'Pais de Destino',
  'Canal',
] as const;

/**
 * Metadata configuration for each official column.
 */
export const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  {
    excelHeader: 'Descripcion de la Partida Aduanera',
    normalizedKey: 'descripcionPartida',
    label: 'Descripción de Partida Aduanera',
    dataType: 'string',
    required: true,
    description: 'Descripción del producto o mercancía exportada.',
  },
  {
    excelHeader: 'Fecha',
    normalizedKey: 'fecha',
    label: 'Fecha de Exportación',
    dataType: 'date',
    required: true,
    description: 'Fecha oficial del registro aduanero.',
  },
  {
    excelHeader: 'Exportador',
    normalizedKey: 'exportador',
    label: 'Empresa Exportadora',
    dataType: 'string',
    required: true,
    description: 'Razón social o nombre de la empresa exportadora.',
  },
  {
    excelHeader: 'Qty 1',
    normalizedKey: 'qty1',
    label: 'Cantidad 1',
    dataType: 'number',
    required: true,
    description: 'Cantidad física declarada en la partida.',
  },
  {
    excelHeader: 'U$ FOB Tot',
    normalizedKey: 'fobTot',
    label: 'Monto FOB Total (USD)',
    dataType: 'number',
    required: true,
    description: 'Valor total Free on Board en dólares americanos.',
  },
  {
    excelHeader: 'U$ FOB Und 2',
    normalizedKey: 'fobUnd2',
    label: 'Monto FOB Unitario 2 (USD)',
    dataType: 'number',
    required: false,
    description: 'Valor FOB unitario por segunda unidad de medida.',
  },
  {
    excelHeader: 'Pais de Destino',
    normalizedKey: 'paisDestino',
    label: 'País de Destino',
    dataType: 'string',
    required: true,
    description: 'País de destino final de las mercancías.',
  },
  {
    excelHeader: 'Canal',
    normalizedKey: 'canal',
    label: 'Canal de Control',
    dataType: 'string',
    required: false,
    description: 'Canal de control aduanero asignado (ej: Verde, Naranja, Rojo).',
  },
];

/**
 * Accepted file extensions
 */
export const ACCEPTED_FILE_EXTENSIONS = ['.xlsx', '.xls', '.csv'] as const;
export const ACCEPTED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
] as const;
