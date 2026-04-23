"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EXECUTION_LS_PAGE_SIZE,
  EXECUTION_LS_VIEW,
} from "@/lib/constants/metadata";
import { useExecutionTasksListStore } from "@/lib/stores/use-execution-tasks-list-store";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { NormalizedExecutionTask } from "@/lib/types/team/execution";
import type {
  ExecutionTasksSetCol,
  ExecutionTaskSortKey,
} from "@/lib/types/team/execution-list";
import {
  buildExecutionColumnOptions,
  filterExecutionTasks,
  sortExecutionTasks,
} from "@/lib/utils/team/execution-list-filters";
import type { SortDir } from "@/lib/table-sort";
import { nextSortState } from "@/lib/table-sort";
import type { ColumnSortKind } from "@/lib/types/dataTable";

export type ExecutionView = "cards" | "table" | "kanban";

const EXECUTION_PAGE_SIZES = new Set([5, 10, 25, 50, 100, 10_000]);

function normalizeExecutionPageSize(n: number): number {
  if (!Number.isFinite(n)) return 10;
  const v = Math.floor(n);
  if (EXECUTION_PAGE_SIZES.has(v)) return v;
  if (v > 100 && v <= 10_000) return 10_000;
  return 10;
}

export function useExecutionList(tasks: NormalizedExecutionTask[]) {
  const [view, setView, viewHydrated] = usePersistentState<ExecutionView>(
    EXECUTION_LS_VIEW,
    "kanban",
  );
  const [pageSize, setPageSize, pageSizeHydrated] = usePersistentState(
    EXECUTION_LS_PAGE_SIZE,
    10,
    {
      deserialize: (raw) => normalizeExecutionPageSize(JSON.parse(raw) as number),
    },
  );
  const [page, setPage] = useState(1);

  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
    useExecutionTasksListStore();
  const setCol: ExecutionTasksSetCol = useCallback(
    (col) => (next) => setColumnFilter(col, next),
    [setColumnFilter],
  );

  const options = useMemo(() => buildExecutionColumnOptions(tasks), [tasks]);

  const filtered = useMemo(
    () => filterExecutionTasks(tasks, filters),
    [tasks, filters],
  );

  const [sort, setSort] = useState<{ key: ExecutionTaskSortKey; dir: SortDir } | null>(null);

  const onSort = useCallback((key: ExecutionTaskSortKey, kind: ColumnSortKind) => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sortedForTable = useMemo(
    () => sortExecutionTasks(filtered, sort),
    [filtered, sort],
  );

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

  const changePage = useCallback((p: number) => {
    setPage(() => Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(normalizeExecutionPageSize(size));
    setPage(1);
  }, [setPageSize]);

  const clearTableView = useCallback(() => {
    clearFilters();
    setSort(null);
    setPage(1);
  }, [clearFilters]);

  const hasActiveView = anyFilter || sort !== null;

  return {
    view,
    setView,
    viewHydrated,
    pageSizeHydrated,
    page: pageClamped,
    pageSize,
    totalPages,
    changePage,
    changePageSize,
    filters,
    setCol,
    options,
    filtered,
    sortedForTable,
    paginatedRows,
    matchedCount,
    totalCount: tasks.length,
    anyFilter,
    clearFilters,
    clearTableView,
    hasActiveView,
    sort,
    onSort,
  };
}
