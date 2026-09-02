import { extractFilterOptions, filterExportRecords } from '../src/lib/filters/filterEngine.ts';

// Mock sample dataset with 3 different exporters and 3 different countries
const mockRecords = [
  {
    id: '1',
    descripcionPartida: '0804400000 - AGUACATES (PALTAS)',
    fecha: '2025-01-15',
    dateDetails: { year: 2025, monthNumber: 1, monthName: 'Enero', yearMonth: '2025-01', isValid: true },
    exportador: 'EXANDAL S.A.C.',
    qty1: 5000,
    fobTot: 150000,
    fobUnd2: 30,
    paisDestino: 'CHINA',
    canal: 'VERDE',
  },
  {
    id: '2',
    descripcionPartida: '0804400000 - AGUACATES (PALTAS)',
    fecha: '2025-02-10',
    dateDetails: { year: 2025, monthNumber: 2, monthName: 'Febrero', yearMonth: '2025-02', isValid: true },
    exportador: 'CAMPOSOL S.A.',
    qty1: 3000,
    fobTot: 90000,
    fobUnd2: 30,
    paisDestino: 'CHINA',
    canal: 'VERDE',
  },
  {
    id: '3',
    descripcionPartida: '0806100000 - UVAS FRESCA',
    fecha: '2024-05-20',
    dateDetails: { year: 2024, monthNumber: 5, monthName: 'Mayo', yearMonth: '2024-05', isValid: true },
    exportador: 'EXANDAL S.A.C.',
    qty1: 8000,
    fobTot: 240000,
    fobUnd2: 30,
    paisDestino: 'ESTADOS UNIDOS',
    canal: 'ROJO',
  },
  {
    id: '4',
    descripcionPartida: '0806100000 - UVAS FRESCA',
    fecha: '2025-03-12',
    dateDetails: { year: 2025, monthNumber: 3, monthName: 'Marzo', yearMonth: '2025-03', isValid: true },
    exportador: 'DANPER TRUJILLO SAC',
    qty1: 10000,
    fobTot: 300000,
    fobUnd2: 30,
    paisDestino: 'ESPAÑA',
    canal: 'NARANJA',
  },
];

console.log('--- TEST 1: Extract Filter Options Dynamically ---');
const options = extractFilterOptions(mockRecords);
console.log('Extracted Years:', options.years);
console.log('Extracted Exporters:', options.exporters);
console.log('Extracted Destinations:', options.destinations);

console.log('\n--- TEST 2: Multi-Criteria Filter (Año = 2025 AND País = CHINA AND Exportador = EXANDAL S.A.C.) ---');
const filtered1 = filterExportRecords(mockRecords, {
  searchQuery: '',
  selectedYears: [2025],
  selectedExporters: ['EXANDAL S.A.C.'],
  selectedDestinations: ['CHINA'],
  selectedCustomsHeadings: [],
  selectedChannels: [],
  dateRange: { startDate: null, endDate: null },
  fobRange: { min: null, max: null },
});
console.log(`Filtered Count: ${filtered1.length} record(s)`);
console.log('Filtered record ID:', filtered1[0]?.id, '| Exporter:', filtered1[0]?.exportador, '| Year:', filtered1[0]?.dateDetails?.year, '| Destination:', filtered1[0]?.paisDestino);

console.log('\n--- TEST 3: Free Text Search ("UVAS") ---');
const filtered2 = filterExportRecords(mockRecords, {
  searchQuery: 'UVAS',
  selectedYears: [],
  selectedExporters: [],
  selectedDestinations: [],
  selectedCustomsHeadings: [],
  selectedChannels: [],
  dateRange: { startDate: null, endDate: null },
  fobRange: { min: null, max: null },
});
console.log(`Filtered Count for "UVAS": ${filtered2.length} record(s)`);

console.log('\nAll filter engine tests executed successfully!');
