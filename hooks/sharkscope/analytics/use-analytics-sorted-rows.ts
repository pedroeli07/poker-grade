"use client";

import { useMemo } from "react";
import type { AnalyticsSortState } from "@/lib/types";
import useAnalyticsColumnSort from "@/hooks/sharkscope/analytics/use-analytics-column-sort";

/**
 * Ordenação de coluna + linhas ordenadas num único hook (padrão das tabelas analytics).
 * `sortRows` deve ser uma função pura importada de `lib/utils/sharkscope-analytics-table-sort`.
 */
export function useAnalyticsSortedRows<T, K extends string>(
  filtered: T[],
  sortRows: (rows: T[], sort: AnalyticsSortState<K>) => T[]
) {
  const { sort, toggleSort } = useAnalyticsColumnSort<K>();
  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort, sortRows]);
  return { sort, toggleSort, sorted };
}
