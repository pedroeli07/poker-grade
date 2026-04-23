"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { INDICATORS_CATALOG_LS_PAGE_SIZE } from "@/lib/constants/metadata";
import { useIndicatorsCatalogListStore } from "@/lib/stores/use-indicators-catalog-list-store";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { TeamIndicatorDTO } from "@/lib/data/team/indicators-page";
import type { IndicatorsCatalogSetCol } from "@/lib/types/team/indicators-catalog-list";
import {
  buildIndicatorCatalogColumnOptions,
  filterIndicatorCatalogRows,
  sortIndicatorCatalogRows,
} from "@/lib/utils/team/indicators-catalog-filters";
import type { IndicatorCatalogSortKey } from "@/lib/types/team/indicators-catalog-list";
import type { SortDir } from "@/lib/table-sort";
import { nextSortState } from "@/lib/table-sort";
import type { ColumnSortKind } from "@/lib/types/dataTable";

const PAGE_SIZES = new Set([5, 10, 25, 50, 100, 10_000]);

function normalizePageSize(n: number): number {
  if (!Number.isFinite(n)) return 10;
  const v = Math.floor(n);
  if (PAGE_SIZES.has(v)) return v;
  if (v > 100 && v <= 10_000) return 10_000;
  return 10;
}

export function useIndicatorsCatalogList(indicators: TeamIndicatorDTO[]) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize, pageSizeHydrated] = usePersistentState(
    INDICATORS_CATALOG_LS_PAGE_SIZE,
    10,
    {
      deserialize: (raw) => normalizePageSize(JSON.parse(raw) as number),
    },
  );
  const [page, setPage] = useState(1);

  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
    useIndicatorsCatalogListStore();
  const setCol: IndicatorsCatalogSetCol = useCallback(
    (col) => (next) => setColumnFilter(col, next),
    [setColumnFilter],
  );

  const options = useMemo(() => buildIndicatorCatalogColumnOptions(indicators), [indicators]);

  const filtered = useMemo(
    () => filterIndicatorCatalogRows(indicators, search, filters),
    [indicators, search, filters],
  );

  const [sort, setSort] = useState<{ key: IndicatorCatalogSortKey; dir: SortDir } | null>(null);

  const onSort = useCallback((key: IndicatorCatalogSortKey, kind: ColumnSortKind) => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sortedForTable = useMemo(
    () => sortIndicatorCatalogRows(filtered, sort),
    [filtered, sort],
  );

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  const sortKeyStr = useMemo(() => (sort ? `${sort.key}:${sort.dir}` : ""), [sort]);

  const isAll = pageSize >= 10_000;
  const matchedCount = sortedForTable.length;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(matchedCount / pageSize));
  const pageClamped = Math.max(1, Math.min(page, totalPages));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset de paginação ao filtrar/ordenar
    setPage(1);
  }, [search, filtersKey, sortKeyStr]);

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
      setPageSize(normalizePageSize(size));
      setPage(1);
    },
    [setPageSize],
  );

  const clearTableView = useCallback(() => {
    clearFilters();
    setSort(null);
    setSearch("");
    setPage(1);
  }, [clearFilters]);

  const hasActiveView = anyFilter || sort !== null || search.trim().length > 0;

  return {
    search,
    setSearch,
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
    totalCount: indicators.length,
    anyFilter,
    clearFilters,
    clearTableView,
    hasActiveView,
    sort,
    onSort,
  };
}
