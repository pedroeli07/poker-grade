"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RITUALS_LIST_LS_PAGE_SIZE } from "@/lib/constants/metadata";
import { useRitualsListStore } from "@/lib/stores/use-rituals-list-store";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { RitualDTO } from "@/lib/data/team/rituals-page";
import type { RitualListSetCol, RitualListSortKey } from "@/lib/types/team/rituals-list";
import {
  buildRitualListColumnOptions,
  filterRituals,
  sortRituals,
} from "@/lib/utils/team/rituals-list-filters";
import type { SortDir } from "@/lib/table-sort";
import { nextSortState } from "@/lib/table-sort";
import type { ColumnSortKind } from "@/lib/types/dataTable";

const RITUAL_PAGE_SIZES = new Set([5, 10, 25, 50, 100, 10_000]);

function normalizeRitualPageSize(n: number): number {
  if (!Number.isFinite(n)) return 10;
  const v = Math.floor(n);
  if (RITUAL_PAGE_SIZES.has(v)) return v;
  if (v > 100 && v <= 10_000) return 10_000;
  return 10;
}

export function useRitualsListTable(rituals: RitualDTO[]) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize, pageSizeHydrated] = usePersistentState(
    RITUALS_LIST_LS_PAGE_SIZE,
    10,
    {
      deserialize: (raw) => normalizeRitualPageSize(JSON.parse(raw) as number),
    },
  );
  const [page, setPage] = useState(1);

  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } = useRitualsListStore();
  const setCol: RitualListSetCol = useCallback(
    (col) => (next) => setColumnFilter(col, next),
    [setColumnFilter],
  );

  const options = useMemo(() => buildRitualListColumnOptions(rituals), [rituals]);

  const filtered = useMemo(() => filterRituals(rituals, search, filters), [rituals, search, filters]);

  const [sort, setSort] = useState<{ key: RitualListSortKey; dir: SortDir } | null>(null);

  const onSort = useCallback((key: RitualListSortKey, kind: ColumnSortKind) => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sortedForTable = useMemo(() => sortRituals(filtered, sort), [filtered, sort]);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  const sortKey = useMemo(() => (sort ? `${sort.key}:${sort.dir}` : ""), [sort]);

  const isAll = pageSize >= 10_000;
  const matchedCount = sortedForTable.length;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(matchedCount / pageSize));
  const pageClamped = Math.max(1, Math.min(page, totalPages));

  useEffect(() => {
    // Volta à primeira página quando o critério de listagem muda.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset de paginação ao filtrar/ordenar
    setPage(1);
  }, [search, filtersKey, sortKey]);

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
      setPageSize(normalizeRitualPageSize(size));
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
    totalCount: rituals.length,
    anyFilter,
    clearFilters,
    clearTableView,
    hasActiveView,
    sort,
    onSort,
  };
}
