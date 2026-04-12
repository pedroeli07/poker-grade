import { useState, useMemo, useCallback } from "react";
import { NumberFilterValue } from "@/lib/number-filter";
import { matchNumberFilter } from "@/lib/match-number-filter";

export function useAnalyticsFilter<T>(
  data: T[],
  filters: Record<string, Set<string> | null | undefined>,
  setColumnFilter: (col: string, next: Set<string> | null) => void,
  numFilterKeys: string[]
) {
  const [numFilters, setNumFilters] = useState<Record<string, NumberFilterValue | null>>({});

  const setCol = useCallback((col: string) => (next: Set<string> | null) => setColumnFilter(col, next), [setColumnFilter]);
  const setNumFilter = useCallback((col: string) => (v: NumberFilterValue | null) => setNumFilters((prev) => ({ ...prev, [col]: v })), []);

  const columnFilterValues = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    for (const key of Object.keys(filters)) {
      if (filters[key]) result[key] = filters[key] as Set<string>;
    }
    return result;
  }, [filters]);

  const filtered = useMemo(() => data.filter((item) => {
    for (const col of Object.keys(columnFilterValues)) {
      const val = (item as Record<string, unknown>)[col];
      if (val !== undefined && !columnFilterValues[col].has(String(val))) return false;
    }
    for (const key of numFilterKeys) {
      const f = numFilters[key];
      if (f) {
        const val = (item as Record<string, unknown>)[key] as number | null;
        if (!matchNumberFilter(val, f)) return false;
      }
    }
    return true;
  }), [data, columnFilterValues, numFilters, numFilterKeys]);

  const clearAll = useCallback(() => setNumFilters({}), []);

  return { numFilters, setNumFilter, setCol, filtered, clearAll };
}