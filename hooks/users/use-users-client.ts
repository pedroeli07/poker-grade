"use client";

import { useCallback, useMemo, useState } from "react";
import { distinctOptions } from "@/lib/utils/distinct-options";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useUsersStore } from "@/lib/stores/use-users-store";
import { useUserActions } from "@/hooks/user/use-user-actions";
import { ROLE_VISUAL } from "@/components/user/user-badges";
import { useUserPermissions } from "@/hooks/user/use-user-permissions";
import type { UserDirectoryRow, UserColumnKey } from "@/lib/types/user/index";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import { nextSortState, type SortDir } from "@/lib/table-sort";
import {
  buildUsersFilterSummaryLines,
  computeUsersDirectoryStats,
  filterUsersDirectoryRows,
  formatUsersSortSummary,
  sortUsersDirectoryRows,
} from "@/lib/utils/user";
import { USERS_TABLE_ENTITY_LABELS } from "@/lib/constants/users";

export function useUserClient(initialRows: UserDirectoryRow[]) {
  const { canManage } = useUserPermissions();
  const [inviteOpen, setInviteOpen] = useState(false);
  const canManageUsers = canManage ?? false;
  const [searchQuery, setSearchQuery, searchHydrated] = usePersistentState<string>(
    "gestao-grades:users:search",
    ""
  );
  const {
    filters,
    setColumnFilter,
    clearFilters,
    hasAnyFilter: anyFilter,
  } = useUsersStore();
  const [viewMode, setViewMode, viewHydrated] = usePersistentState<"grid" | "table">(
    "gestao-grades:users:view",
    "table"
  );
  const [tableSort, setTableSort, sortHydrated] = usePersistentState<{
    key: UserColumnKey;
    dir: SortDir;
  } | null>("gestao-grades:users:sort", null);
  const hydrated = searchHydrated && viewHydrated && sortHydrated;
  const { runAction, pending } = useUserActions();

  const options = useMemo(
    () => ({
      email: distinctOptions(initialRows, (r) => ({
        value: r.email,
        label: r.email,
      })),
      role: distinctOptions(initialRows, (r) => ({
        value: r.role,
        label: ROLE_VISUAL[r.role].label,
      })),
      status: distinctOptions(initialRows, (r) => ({
        value: r.isRegistered ? "REGISTERED" : "PENDING",
        label: r.isRegistered ? "Ativo" : "Pendente",
      })),
    }),
    [initialRows]
  );

  const filtered = useMemo(
    () => filterUsersDirectoryRows(initialRows, searchQuery, filters),
    [initialRows, searchQuery, filters]
  );

  const sortedTableRows = useMemo(
    () => sortUsersDirectoryRows(filtered, tableSort),
    [filtered, tableSort]
  );

  const toggleUserSort = useCallback(
    (key: UserColumnKey, kind: ColumnSortKind) => {
      setTableSort((prev) =>
        nextSortState(prev, key, kind === "date" ? "date" : kind)
      );
    },
    [setTableSort]
  );

  const stats = useMemo(
    () => computeUsersDirectoryStats(initialRows),
    [initialRows]
  );

  const setCol = useCallback(
    (col: UserColumnKey) => (next: Set<string> | null) =>
      setColumnFilter(col, next),
    [setColumnFilter]
  );

  const searchActive = Boolean(searchQuery.trim());
  const anyFilterOrSearch = anyFilter || searchActive;
  const hasTableActiveView = anyFilterOrSearch || tableSort !== null;
  const filterSummaryLines = useMemo(
    () => buildUsersFilterSummaryLines(searchQuery, filters, options),
    [searchQuery, filters, options]
  );
  const sortSummary = useMemo(
    () => formatUsersSortSummary(tableSort),
    [tableSort]
  );
  const clearTableView = useCallback(() => {
    setSearchQuery("");
    clearFilters();
    setTableSort(null);
  }, [clearFilters, setSearchQuery, setTableSort]);

  return {
    canManageUsers,
    inviteOpen,
    setInviteOpen,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    hydrated,
    tableSort,
    filters,
    options,
    anyFilter,
    filtered,
    sortedTableRows,
    toggleUserSort,
    stats,
    setCol,
    anyFilterOrSearch,
    hasTableActiveView,
    filterSummaryLines,
    sortSummary,
    clearTableView,
    clearFilters,
    runAction,
    pending,
    entityLabels: USERS_TABLE_ENTITY_LABELS,
  };
}
