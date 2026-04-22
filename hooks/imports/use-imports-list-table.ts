"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnOptions } from "@/lib/types/primitives";
import type { ImportListRow } from "@/lib/types/imports/index";
import type { ImportsColumnKey, ImportsFilters } from "@/lib/types/columnKeys";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import {
  buildImportsFilterSummaryLines,
  formatImportsSortSummary,
  sortImportListRows,
} from "@/lib/utils/imports";
import { nextSortState, type SortDir } from "@/lib/table-sort";

export function useImportsListTable(
  filtered: ImportListRow[],
  filters: ImportsFilters,
  options: ColumnOptions<ImportsColumnKey>,
  anyFilter: boolean,
  clearFilters: () => void
) {
  const [sort, setSort] = useState<{
    key: ImportsColumnKey;
    dir: SortDir;
  } | null>(null);

  const toggleSort = useCallback((key: ImportsColumnKey, kind: ColumnSortKind) => {
    setSort((prev) => nextSortState(prev, key, kind === "date" ? "date" : kind));
  }, []);

  const clearTableView = useCallback(() => {
    clearFilters();
    setSort(null);
  }, [clearFilters]);

  const hasActiveView = anyFilter || sort !== null;

  const filterSummaryLines = useMemo(
    () => buildImportsFilterSummaryLines(filters, options),
    [filters, options]
  );

  const sortSummary = useMemo(() => formatImportsSortSummary(sort), [sort]);

  const sortedFiltered = useMemo(
    () => sortImportListRows(filtered, sort),
    [filtered, sort]
  );

  return {
    sort,
    toggleSort,
    clearTableView,
    hasActiveView,
    filterSummaryLines,
    sortSummary,
    sortedFiltered,
  };
}
