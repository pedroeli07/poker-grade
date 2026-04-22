"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GOVERNANCE_HISTORICAL_LS_PAGE_SIZE, GOVERNANCE_HISTORICAL_LS_VIEW } from "@/lib/constants/metadata";
import { useGovernanceDecisionsListStore } from "@/lib/stores/use-governance-decisions-list-store";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { GovernanceDecisionDTO } from "@/lib/data/team/governance-page";
import type { GovernanceDecisionsSetCol } from "@/lib/types/team/governance-historical";
import {
  buildGovernanceDecisionColumnOptions,
  filterGovernanceDecisions,
  sortGovernanceDecisions,
} from "@/lib/utils/team/governance-historical-filters";
import type { GovernanceDecisionSortKey } from "@/lib/types/team/governance-historical";
import type { SortDir } from "@/lib/table-sort";
import { nextSortState } from "@/lib/table-sort";
import type { ColumnSortKind } from "@/lib/types/dataTable";

const GOVERNANCE_PAGE_SIZES = new Set([5, 10, 25, 50, 100, 10_000]);

function normalizeGovernancePageSize(n: number): number {
  if (!Number.isFinite(n)) return 10;
  const v = Math.floor(n);
  if (GOVERNANCE_PAGE_SIZES.has(v)) return v;
  if (v > 100 && v <= 10_000) return 10_000;
  return 10;
}

export function useGovernanceHistoricalList(decisions: GovernanceDecisionDTO[]) {
  const [search, setSearch] = useState("");
  const [view, setView, viewHydrated] = usePersistentState<"cards" | "table">(
    GOVERNANCE_HISTORICAL_LS_VIEW,
    "cards",
  );
  const [pageSize, setPageSize, pageSizeHydrated] = usePersistentState(
    GOVERNANCE_HISTORICAL_LS_PAGE_SIZE,
    10,
    {
      deserialize: (raw) => normalizeGovernancePageSize(JSON.parse(raw) as number),
    },
  );
  const [page, setPage] = useState(1);

  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
    useGovernanceDecisionsListStore();
  const setCol: GovernanceDecisionsSetCol = useCallback(
    (col) => (next) => setColumnFilter(col, next),
    [setColumnFilter],
  );

  const options = useMemo(
    () => buildGovernanceDecisionColumnOptions(decisions),
    [decisions],
  );

  const filtered = useMemo(
    () => filterGovernanceDecisions(decisions, search, filters),
    [decisions, search, filters],
  );

  const [sort, setSort] = useState<{ key: GovernanceDecisionSortKey; dir: SortDir } | null>(null);

  const onSort = useCallback((key: GovernanceDecisionSortKey, kind: ColumnSortKind) => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sortedForTable = useMemo(
    () => sortGovernanceDecisions(filtered, sort),
    [filtered, sort],
  );

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

  const changePage = useCallback((p: number) => {
    setPage(() => Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(normalizeGovernancePageSize(size));
    setPage(1);
  }, [setPageSize]);

  const clearTableView = useCallback(() => {
    clearFilters();
    setSort(null);
    setSearch("");
    setPage(1);
  }, [clearFilters]);

  const hasActiveView =
    anyFilter || sort !== null || search.trim().length > 0;

  return {
    search,
    setSearch,
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
    totalCount: decisions.length,
    anyFilter,
    clearFilters,
    clearTableView,
    hasActiveView,
    sort,
    onSort,
  };
}
