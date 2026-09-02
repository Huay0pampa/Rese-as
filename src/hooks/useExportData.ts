'use client';

import { useState, useMemo } from 'react';
import {
  NormalizedExportRecord,
  ActiveFilters,
  FilterOptions,
  SummaryMetrics,
} from '@/types';
import { extractFilterOptions, filterExportRecords } from '@/lib/filters/filterEngine';
import { computeSummaryMetrics } from '@/lib/analysis/analyzer';

const INITIAL_FILTERS: ActiveFilters = {
  searchQuery: '',
  selectedExporters: [],
  selectedDestinations: [],
  selectedChannels: [],
  dateRange: { startDate: null, endDate: null },
  fobRange: { min: null, max: null },
};

export function useExportData(initialRecords: NormalizedExportRecord[] = []) {
  const [records, setRecords] = useState<NormalizedExportRecord[]>(initialRecords);
  const [filters, setFilters] = useState<ActiveFilters>(INITIAL_FILTERS);

  // Available filter dropdown options computed dynamically
  const filterOptions: FilterOptions = useMemo(() => {
    return extractFilterOptions(records);
  }, [records]);

  // Filtered dataset
  const filteredRecords: NormalizedExportRecord[] = useMemo(() => {
    return filterExportRecords(records, filters);
  }, [records, filters]);

  // Dynamic summary metrics calculated from filtered dataset
  const summaryMetrics: SummaryMetrics = useMemo(() => {
    return computeSummaryMetrics(filteredRecords);
  }, [filteredRecords]);

  const updateSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return {
    records,
    setRecords,
    filteredRecords,
    filters,
    setFilters,
    filterOptions,
    summaryMetrics,
    updateSearchQuery,
    resetFilters,
  };
}
