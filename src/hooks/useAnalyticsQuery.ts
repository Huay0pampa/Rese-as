'use client';

import { useState, useMemo } from 'react';
import {
  NormalizedExportRecord,
  AnalyticsQueryOptions,
  AnalysisQueryResult,
} from '@/types';
import { executeAnalyticsQuery } from '@/lib/analysis/analyticsEngine';

const DEFAULT_OPTIONS: AnalyticsQueryOptions = {
  dimension: 'exportador',
  metric: 'fobTot',
  operation: 'sum',
  sortField: 'value',
  sortOrder: 'desc',
};

export function useAnalyticsQuery(
  records: NormalizedExportRecord[],
  initialOptions: Partial<AnalyticsQueryOptions> = {}
) {
  const [options, setOptions] = useState<AnalyticsQueryOptions>({
    ...DEFAULT_OPTIONS,
    ...initialOptions,
  });

  const result: AnalysisQueryResult = useMemo(() => {
    return executeAnalyticsQuery(records, options);
  }, [records, options]);

  const updateOptions = (newOptions: Partial<AnalyticsQueryOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }));
  };

  return {
    options,
    result,
    updateOptions,
  };
}
