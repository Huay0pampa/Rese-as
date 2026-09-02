'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  NormalizedExportRecord,
  ActiveFilters,
  FilterOptions,
  SummaryMetrics,
  ActiveFilterBadge,
} from '@/types';
import {
  extractFilterOptions,
  filterExportRecords,
  getActiveFilterBadges,
  INITIAL_ACTIVE_FILTERS,
} from '@/lib/filters/filterEngine';
import { computeSummaryMetrics } from '@/lib/analysis/analyzer';

export function useExportData(initialRecords: NormalizedExportRecord[] = []) {
  const [records, setRecords] = useState<NormalizedExportRecord[]>(initialRecords);
  const [filters, setFilters] = useState<ActiveFilters>(INITIAL_ACTIVE_FILTERS);

  // Available filter options computed dynamically from dataset
  const filterOptions: FilterOptions = useMemo(() => {
    return extractFilterOptions(records);
  }, [records]);

  // Filtered dataset
  const filteredRecords: NormalizedExportRecord[] = useMemo(() => {
    return filterExportRecords(records, filters);
  }, [records, filters]);

  // Active filter badges
  const activeBadges: ActiveFilterBadge[] = useMemo(() => {
    return getActiveFilterBadges(filters);
  }, [filters]);

  // Dynamic summary metrics calculated from filtered dataset
  const summaryMetrics: SummaryMetrics = useMemo(() => {
    return computeSummaryMetrics(filteredRecords);
  }, [filteredRecords]);

  const updateSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_ACTIVE_FILTERS);
  }, []);

  const removeFilterBadge = useCallback((badge: ActiveFilterBadge) => {
    setFilters((prev) => {
      switch (badge.category) {
        case 'search':
          return { ...prev, searchQuery: '' };
        case 'year':
          return {
            ...prev,
            selectedYears: prev.selectedYears.filter((y) => y !== badge.value),
          };
        case 'exporter':
          return {
            ...prev,
            selectedExporters: prev.selectedExporters.filter((e) => e !== badge.value),
          };
        case 'destination':
          return {
            ...prev,
            selectedDestinations: prev.selectedDestinations.filter((d) => d !== badge.value),
          };
        case 'heading':
          return {
            ...prev,
            selectedCustomsHeadings: prev.selectedCustomsHeadings.filter((h) => h !== badge.value),
          };
        case 'channel':
          return {
            ...prev,
            selectedChannels: prev.selectedChannels.filter((c) => c !== badge.value),
          };
        case 'dateRange':
          return { ...prev, dateRange: { startDate: null, endDate: null } };
        default:
          return prev;
      }
    });
  }, []);

  return {
    records,
    setRecords,
    filteredRecords,
    filters,
    setFilters,
    filterOptions,
    activeBadges,
    summaryMetrics,
    updateSearchQuery,
    resetFilters,
    removeFilterBadge,
  };
}
