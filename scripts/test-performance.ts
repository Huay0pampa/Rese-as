import { performance } from 'perf_hooks';
import { normalizeExportRecords } from '../src/lib/normalization/normalizer';
import { executeAnalyticsQuery } from '../src/lib/analysis/analyticsEngine';
import { filterExportRecords } from '../src/lib/filters/filterEngine';

console.log('--- RENDIMIENTO DEL MOTOR DE ANÁLISIS ---');
console.log('Ejecutando pruebas de carga simuladas...\n');

// 1. Generar datos ficticios
const NUM_RECORDS = 50_000;
const startGen = performance.now();
const rawRecords = [];

for (let i = 0; i < NUM_RECORDS; i++) {
  rawRecords.push({
    'DESCRIPCION COMERCIAL': `Producto Genérico ${i % 100}`,
    'FECHA': `2023-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    'EXPORTADOR': `Empresa ${i % 50} S.A.`,
    'CANTIDAD': (Math.random() * 1000).toFixed(2),
    'FOB TOTAL': (Math.random() * 50000).toFixed(2),
    'FOB UNITARIO': (Math.random() * 100).toFixed(2),
    'PAIS DE DESTINO': `País ${i % 20}`,
    'CANAL': i % 2 === 0 ? 'ROJO' : 'VERDE',
  });
}
const endGen = performance.now();
console.log(`✅ Generación de ${NUM_RECORDS} registros: ${(endGen - startGen).toFixed(2)} ms`);

// 2. Normalización
const startNorm = performance.now();
const normalizedRecords = normalizeExportRecords(rawRecords as any);
const endNorm = performance.now();
console.log(`✅ Normalización (pre-calculando fechas y números): ${(endNorm - startNorm).toFixed(2)} ms`);

// 3. Filtrado (Simulación de filtros vacíos)
const startFilter = performance.now();
const filteredRecords = filterExportRecords(normalizedRecords, {
  searchQuery: '',
  selectedYears: [],
  selectedExporters: [],
  selectedDestinations: [],
  selectedCustomsHeadings: [],
  selectedChannels: [],
  dateRange: { startDate: null, endDate: null },
  fobRange: { min: null, max: null }
});
const endFilter = performance.now();
console.log(`✅ Filtrado inicial (0 filtros): ${(endFilter - startFilter).toFixed(2)} ms`);

// 4. Agrupación y Analítica
const startQuery = performance.now();
const queryResult = executeAnalyticsQuery(filteredRecords, {
  dimension: 'exportador',
  metric: 'fobTot',
  operation: 'sum',
});
const endQuery = performance.now();
console.log(`✅ Ejecución de Consulta Analítica (Suma de FOB por Exportador): ${(endQuery - startQuery).toFixed(2)} ms`);
console.log(`   -> Grupos resultantes: ${queryResult.totalGroups}`);
console.log('\n¡Prueba de rendimiento completada!');
