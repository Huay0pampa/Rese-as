import {
  NormalizedExportRecord,
  ActiveFilters,
  FilterOptions,
  ActiveFilterBadge,
} from '@/types';

export const INITIAL_ACTIVE_FILTERS: ActiveFilters = {
  searchQuery: '',
  selectedYears: [],
  selectedExporters: [],
  selectedDestinations: [],
  selectedCustomsHeadings: [],
  selectedChannels: [],
  dateRange: { startDate: null, endDate: null },
  fobRange: { min: null, max: null },
};

/**
 * Dynamically extracts all unique filter options (years, exporters, destinations, headings, channels, dates, FOB range)
 * directly from the provided dataset. Zero hardcoding!
 */
export function extractFilterOptions(
  records: NormalizedExportRecord[]
): FilterOptions {
  const yearsSet = new Set<number>();
  const exportersSet = new Set<string>();
  const destinationsSet = new Set<string>();
  const headingsSet = new Set<string>();
  const channelsSet = new Set<string>();

  let minFob = Infinity;
  let maxFob = -Infinity;
  let minDate: string | null = null;
  let maxDate: string | null = null;

  records.forEach((rec) => {
    if (rec.dateDetails.year) yearsSet.add(rec.dateDetails.year);
    if (rec.exportador && rec.exportador !== '(Sin Exportador)') exportersSet.add(rec.exportador);
    if (rec.paisDestino && rec.paisDestino !== '(Sin Destino)') destinationsSet.add(rec.paisDestino);
    if (rec.descripcionPartida && rec.descripcionPartida !== '(Sin Descripción)') headingsSet.add(rec.descripcionPartida);
    if (rec.canal && rec.canal !== 'N/A') channelsSet.add(rec.canal);

    if (typeof rec.fobTot === 'number' && !isNaN(rec.fobTot)) {
      if (rec.fobTot < minFob) minFob = rec.fobTot;
      if (rec.fobTot > maxFob) maxFob = rec.fobTot;
    }

    if (rec.fecha) {
      if (!minDate || rec.fecha < minDate) minDate = rec.fecha;
      if (!maxDate || rec.fecha > maxDate) maxDate = rec.fecha;
    }
  });

  return {
    years: Array.from(yearsSet).sort((a, b) => a - b),
    exporters: Array.from(exportersSet).sort((a, b) => a.localeCompare(b)),
    destinations: Array.from(destinationsSet).sort((a, b) => a.localeCompare(b)),
    customsHeadings: Array.from(headingsSet).sort((a, b) => a.localeCompare(b)),
    channels: Array.from(channelsSet).sort((a, b) => a.localeCompare(b)),
    minFob: minFob === Infinity ? 0 : minFob,
    maxFob: maxFob === -Infinity ? 0 : maxFob,
    minDate,
    maxDate,
  };
}

/**
 * Filter engine applying multi-criteria active filters to records with AND logic across criteria and OR logic within multi-select items.
 */
export function filterExportRecords(
  records: NormalizedExportRecord[],
  filters: ActiveFilters
): NormalizedExportRecord[] {
  // Convert arrays to Sets for O(1) lookups
  const yearsSet = new Set(filters.selectedYears);
  const exportersSet = new Set(filters.selectedExporters);
  const destinationsSet = new Set(filters.selectedDestinations);
  const headingsSet = new Set(filters.selectedCustomsHeadings);
  const channelsSet = new Set(filters.selectedChannels);

  return records.filter((rec) => {
    // 1. Search Query Match (Free text search across description, exporter, destination, channel)
    if (filters.searchQuery) {
      const q = filters.searchQuery.trim().toLowerCase();
      const matchDesc = rec.descripcionPartida.toLowerCase().includes(q);
      const matchExp = rec.exportador.toLowerCase().includes(q);
      const matchDest = rec.paisDestino.toLowerCase().includes(q);
      const matchChan = rec.canal.toLowerCase().includes(q);
      if (!matchDesc && !matchExp && !matchDest && !matchChan) return false;
    }

    // 2. Year Filter
    if (yearsSet.size > 0) {
      if (!rec.dateDetails.year || !yearsSet.has(rec.dateDetails.year)) {
        return false;
      }
    }

    // 3. Exporter Filter
    if (exportersSet.size > 0) {
      if (!exportersSet.has(rec.exportador)) {
        return false;
      }
    }

    // 4. Destination Country Filter
    if (destinationsSet.size > 0) {
      if (!destinationsSet.has(rec.paisDestino)) {
        return false;
      }
    }

    // 5. Customs Heading Filter
    if (headingsSet.size > 0) {
      if (!headingsSet.has(rec.descripcionPartida)) {
        return false;
      }
    }

    // 6. Channel Filter
    if (channelsSet.size > 0) {
      if (!channelsSet.has(rec.canal)) {
        return false;
      }
    }

    // 7. FOB Range Filter
    if (filters.fobRange.min !== null && rec.fobTot < filters.fobRange.min) {
      return false;
    }
    if (filters.fobRange.max !== null && rec.fobTot > filters.fobRange.max) {
      return false;
    }

    // 8. Date Range Filter
    if (filters.dateRange.startDate && rec.fecha && rec.fecha < filters.dateRange.startDate) {
      return false;
    }
    if (filters.dateRange.endDate && rec.fecha && rec.fecha > filters.dateRange.endDate) {
      return false;
    }

    return true;
  });
}

/**
 * Extracts list of active filter badges for UI rendering and single-click removal.
 */
export function getActiveFilterBadges(filters: ActiveFilters): ActiveFilterBadge[] {
  const badges: ActiveFilterBadge[] = [];

  if (filters.searchQuery) {
    badges.push({
      id: `search-${filters.searchQuery}`,
      category: 'search',
      label: `Búsqueda: "${filters.searchQuery}"`,
      value: filters.searchQuery,
    });
  }

  filters.selectedYears.forEach((year) => {
    badges.push({
      id: `year-${year}`,
      category: 'year',
      label: `Año: ${year}`,
      value: year,
    });
  });

  filters.selectedExporters.forEach((exp) => {
    badges.push({
      id: `exp-${exp}`,
      category: 'exporter',
      label: `Exportador: ${exp}`,
      value: exp,
    });
  });

  filters.selectedDestinations.forEach((dest) => {
    badges.push({
      id: `dest-${dest}`,
      category: 'destination',
      label: `País: ${dest}`,
      value: dest,
    });
  });

  filters.selectedCustomsHeadings.forEach((heading) => {
    const truncated = heading.length > 30 ? heading.substring(0, 30) + '...' : heading;
    badges.push({
      id: `heading-${heading}`,
      category: 'heading',
      label: `Partida: ${truncated}`,
      value: heading,
    });
  });

  filters.selectedChannels.forEach((chan) => {
    badges.push({
      id: `chan-${chan}`,
      category: 'channel',
      label: `Canal: ${chan}`,
      value: chan,
    });
  });

  if (filters.dateRange.startDate || filters.dateRange.endDate) {
    const start = filters.dateRange.startDate || 'Inicio';
    const end = filters.dateRange.endDate || 'Fin';
    badges.push({
      id: `date-${start}-${end}`,
      category: 'dateRange',
      label: `Fecha: ${start} a ${end}`,
      value: filters.dateRange,
    });
  }

  return badges;
}
