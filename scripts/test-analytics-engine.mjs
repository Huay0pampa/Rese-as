import { executeAnalyticsQuery } from '../src/lib/analysis/analyticsEngine.ts';

// Mock sample normalized export records
const mockRecords = [
  {
    id: '1',
    descripcionPartida: '0804400000 - AGUACATES (PALTAS), FRESCOS O SECOS',
    fecha: '2024-01-15',
    dateDetails: {
      raw: '2024-01-15',
      isoDate: '2024-01-15',
      year: 2024,
      monthNumber: 1,
      monthName: 'Enero',
      yearMonth: '2024-01',
      isValid: true,
    },
    exportador: 'CAMPOSOL S.A.',
    qty1: 5000,
    fobTot: 125000,
    fobUnd2: 25,
    paisDestino: 'ESTADOS UNIDOS',
    canal: 'VERDE',
    qualityFlags: { isValidOverall: true },
  },
  {
    id: '2',
    descripcionPartida: '0804400000 - AGUACATES (PALTAS), FRESCOS O SECOS',
    fecha: '2024-03-20',
    dateDetails: {
      raw: '2024-03-20',
      isoDate: '2024-03-20',
      year: 2024,
      monthNumber: 3,
      monthName: 'Marzo',
      yearMonth: '2024-03',
      isValid: true,
    },
    exportador: 'DANPER TRUJILLO SAC',
    qty1: 3000,
    fobTot: 90000,
    fobUnd2: 30,
    paisDestino: 'ESPAÑA',
    canal: 'VERDE',
    qualityFlags: { isValidOverall: true },
  },
  {
    id: '3',
    descripcionPartida: '0806100000 - UVAS FRESCA',
    fecha: '2024-02-10',
    dateDetails: {
      raw: '2024-02-10',
      isoDate: '2024-02-10',
      year: 2024,
      monthNumber: 2,
      monthName: 'Febrero',
      yearMonth: '2024-02',
      isValid: true,
    },
    exportador: 'CAMPOSOL S.A.',
    qty1: 8000,
    fobTot: 240000,
    fobUnd2: 30,
    paisDestino: 'ESTADOS UNIDOS',
    canal: 'ROJO',
    qualityFlags: { isValidOverall: true },
  },
  {
    id: '4',
    descripcionPartida: '0806100000 - UVAS FRESCA',
    fecha: '2025-01-05',
    dateDetails: {
      raw: '2025-01-05',
      isoDate: '2025-01-05',
      year: 2025,
      monthNumber: 1,
      monthName: 'Enero',
      yearMonth: '2025-01',
      isValid: true,
    },
    exportador: 'NUEVO EXPORTADOR 2025 S.A.C.',
    qty1: 10000,
    fobTot: 350000,
    fobUnd2: 35,
    paisDestino: 'CHINA',
    canal: 'NARANJA',
    qualityFlags: { isValidOverall: true },
  },
];

console.log('--- TEST 1: Group by Year | FOB Tot | Sum ---');
const r1 = executeAnalyticsQuery(mockRecords, {
  dimension: 'year',
  metric: 'fobTot',
  operation: 'sum',
  sortField: 'category',
  sortOrder: 'asc',
});
console.log(JSON.stringify(r1.data, null, 2));

console.log('\n--- TEST 2: Group by Month | Qty 1 | Sum (Chronological Month Order) ---');
const r2 = executeAnalyticsQuery(mockRecords, {
  dimension: 'month',
  metric: 'qty1',
  operation: 'sum',
  sortField: 'category',
  sortOrder: 'asc',
});
console.log(JSON.stringify(r2.data, null, 2));

console.log('\n--- TEST 3: Group by Exportador | FOB Tot | Average ---');
const r3 = executeAnalyticsQuery(mockRecords, {
  dimension: 'exportador',
  metric: 'fobTot',
  operation: 'avg',
  sortField: 'value',
  sortOrder: 'desc',
});
console.log(JSON.stringify(r3.data, null, 2));

console.log('\n--- TEST 4: Group by Pais de Destino | Qty 1 | Count ---');
const r4 = executeAnalyticsQuery(mockRecords, {
  dimension: 'paisDestino',
  metric: 'qty1',
  operation: 'count',
  sortField: 'value',
  sortOrder: 'desc',
});
console.log(JSON.stringify(r4.data, null, 2));

console.log('\nAll analytics engine tests executed successfully!');
