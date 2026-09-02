/**
 * Interfaces for dynamic multi-criteria filtering of export records.
 */

export interface DateRangeFilter {
  startDate: string | null;
  endDate: string | null;
}

export interface RangeFilter {
  min: number | null;
  max: number | null;
}

/**
 * Dynamic filter options extracted directly from the active dataset
 */
export interface FilterOptions {
  years: number[];
  exporters: string[];
  destinations: string[];
  customsHeadings: string[];
  channels: string[];
  minFob: number;
  maxFob: number;
  minDate: string | null;
  maxDate: string | null;
}

/**
 * Active search and filter criteria applied by the user
 */
export interface ActiveFilters {
  searchQuery: string;
  selectedYears: number[];
  selectedExporters: string[];
  selectedDestinations: string[];
  selectedCustomsHeadings: string[];
  selectedChannels: string[];
  dateRange: DateRangeFilter;
  fobRange: RangeFilter;
}

/**
 * Single active filter badge item for UI state display and removal
 */
export interface ActiveFilterBadge {
  id: string;
  category: 'search' | 'year' | 'exporter' | 'destination' | 'heading' | 'channel' | 'dateRange' | 'fobRange';
  label: string;
  value: unknown;
}
