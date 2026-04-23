"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GOVERNANCE_DRI_LS_PAGE_SIZE } from "@/lib/constants/metadata";
import { useGovernanceDriListStore } from "@/lib/stores/use-governance-dri-list-store";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { GovernanceDriDTO } from "@/lib/data/team/governance-page";
import type { GovernanceDriSetCol } from "@/lib/types/team/governance-dri-matrix";
import {
  buildDriColumnOptions,
  filterDriMatrix,
  sortDriMatrix,
} from "@/lib/utils/team/governance-dri-filters";
import type { GovernanceDriSortKey } from "@/lib/types/team/governance-dri-matrix";
import type { SortDir } from "@/lib/table-sort";
import { nextSortState } from "@/lib/table-sort";
import type { ColumnSortKind } from "@/lib/types/dataTable";

const GOVERNANCE_PAGE_SIZES = new Set([5, 10, 25, 50, 100, 10_000]);

function normalizeDriPageSize(n: number): number {
  if (!Number.isFinite(n)) return 10;
  const v = Math.floor(n);
  if (GOVERNANCE_PAGE_SIZES.has(v)) return v;
  if (v > 100 && v <= 10_000) return 10_000;
  return 10;
}

export function useGovernanceDriMatrixList(dris: GovernanceDriDTO[]) {
  const [pageSize, setPageSize, pageSizeHydrated] = usePersistentState(
    GOVERNANCE_DRI_LS_PAGE_SIZE,
    10,
    {
      deserialize: (raw) => normalizeDriPageSize(JSON.parse(raw) as number),
    },
  );
  const [page, setPage] = useState(1);

  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } = useGovernanceDriListStore();
  const setCol: GovernanceDriSetCol = useCallback(
    (col) => (next) => setColumnFilter(col, next),
    [setColumnFilter],
  );

  const options = useMemo(() => buildDriColumnOptions(dris), [dris]);

  const filtered = useMemo(() => filterDriMatrix(dris, filters), [dris, filters]);

  const [sort, setSort] = useState<{ key: GovernanceDriSortKey; dir: SortDir } | null>(null);

  const onSort = useCallback((key: GovernanceDriSortKey, kind: ColumnSortKind) => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sortedForTable = useMemo(() => sortDriMatrix(filtered, sort), [filtered, sort]);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  const sortKey = useMemo(() => (sort ? `${sort.key}:${sort.dir}` : ""), [sort]);

  const isAll = pageSize >= 10_000;
  const matchedCount = sortedForTable.length;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(matchedCount / pageSize));
  const pageClamped = Math.max(1, Math.min(page, totalPages));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset de paginação ao filtrar/ordenar
    setPage(1);
  }, [filtersKey, sortKey]);

  const paginatedRows = useMemo(() => {
    if (isAll) return sortedForTable;
    const start = (pageClamped - 1) * pageSize;
    return sortedForTable.slice(start, start + pageSize);
  }, [sortedForTable, pageClamped, pageSize, isAll]);

  const changePage = useCallback(
    (p: number) => {
      setPage(() => Math.max(1, Math.min(p, totalPages)));
    },
    [totalPages],
  );

  const changePageSize = useCallback(
    (size: number) => {
      setPageSize(normalizeDriPageSize(size));
      setPage(1);
    },
    [setPageSize],
  );

  const clearTableView = useCallback(() => {
    clearFilters();
    setSort(null);
    setPage(1);
  }, [clearFilters]);

  const hasActiveView = anyFilter || sort !== null;

  return {
    pageSizeHydrated,
    page: pageClamped,
    pageSize,
    totalPages,
    changePage,
    changePageSize,
    filters,
    setCol,
    options,
    paginatedRows,
    matchedCount,
    totalCount: dris.length,
    anyFilter,
    clearFilters,
    clearTableView,
    hasActiveView,
    sort,
    onSort,
  };
}
