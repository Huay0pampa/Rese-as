/**
 * Interfaces for filtering export records.
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
 * Filter options available dynamically from the current dataset
 */
export interface FilterOptions {
  exporters: string[];
  destinations: string[];
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
  selectedExporters: string[];
  selectedDestinations: string[];
  selectedChannels: string[];
  dateRange: DateRangeFilter;
  fobRange: RangeFilter;
}
