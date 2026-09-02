import {
  NormalizedExportRecord,
  ActiveFilters,
  FilterOptions,
} from '@/types';

/**
 * Extracts unique filter options (exporters, destinations, channels, FOB range, dates)
 * dynamically from the provided dataset.
 */
export function extractFilterOptions(
  records: NormalizedExportRecord[]
): FilterOptions {
  const exporters = new Set<string>();
  const destinations = new Set<string>();
  const channels = new Set<string>();
  let minFob = Infinity;
  let maxFob = -Infinity;
  let minDate: string | null = null;
  let maxDate: string | null = null;

  records.forEach((rec) => {
    if (rec.exportador) exporters.add(rec.exportador);
    if (rec.paisDestino) destinations.add(rec.paisDestino);
    if (rec.canal) channels.add(rec.canal);

    if (rec.fobTot < minFob) minFob = rec.fobTot;
    if (rec.fobTot > maxFob) maxFob = rec.fobTot;

    if (rec.fecha) {
      if (!minDate || rec.fecha < minDate) minDate = rec.fecha;
      if (!maxDate || rec.fecha > maxDate) maxDate = rec.fecha;
    }
  });

  return {
    exporters: Array.from(exporters).sort(),
    destinations: Array.from(destinations).sort(),
    channels: Array.from(channels).sort(),
    minFob: minFob === Infinity ? 0 : minFob,
    maxFob: maxFob === -Infinity ? 0 : maxFob,
    minDate,
    maxDate,
  };
}

/**
 * Filter engine shell applying multi-criteria active filters to records.
 */
export function filterExportRecords(
  records: NormalizedExportRecord[],
  filters: ActiveFilters
): NormalizedExportRecord[] {
  return records.filter((rec) => {
    // Search query match (free text across description, exporter, destination)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchDesc = rec.descripcionPartida.toLowerCase().includes(q);
      const matchExp = rec.exportador.toLowerCase().includes(q);
      const matchDest = rec.paisDestino.toLowerCase().includes(q);
      if (!matchDesc && !matchExp && !matchDest) return false;
    }

    // Exporter filter
    if (
      filters.selectedExporters.length > 0 &&
      !filters.selectedExporters.includes(rec.exportador)
    ) {
      return false;
    }

    // Destination filter
    if (
      filters.selectedDestinations.length > 0 &&
      !filters.selectedDestinations.includes(rec.paisDestino)
    ) {
      return false;
    }

    // Channel filter
    if (
      filters.selectedChannels.length > 0 &&
      !filters.selectedChannels.includes(rec.canal)
    ) {
      return false;
    }

    // FOB range filter
    if (filters.fobRange.min !== null && rec.fobTot < filters.fobRange.min) {
      return false;
    }
    if (filters.fobRange.max !== null && rec.fobTot > filters.fobRange.max) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.startDate && rec.fecha < filters.dateRange.startDate) {
      return false;
    }
    if (filters.dateRange.endDate && rec.fecha > filters.dateRange.endDate) {
      return false;
    }

    return true;
  });
}
