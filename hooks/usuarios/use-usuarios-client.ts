"use client";

import { useCallback, useMemo, useState } from "react";
import { distinctOptions } from "@/lib/utils";
import { useUsuariosStore } from "@/lib/stores/use-usuarios-store";
import { useUserActions } from "@/hooks/user/use-user-actions";
import { ROLE_VISUAL } from "@/components/user/user-badges";
import { useUserPermissions } from "@/hooks/user/use-user-permissions";
import type { UsuarioDirectoryRow, UsuariosColumnKey } from "@/lib/types";
import type { ColumnSortKind } from "@/lib/types/sortButton";
import { buildUsuariosFilterSummaryLines, formatUsuariosSortSummary } from "@/lib/utils/usuarios-table-display";
import { nextSortState, type SortDir } from "@/lib/table-sort";
import { computeUsuariosDirectoryStats, filterUsuariosDirectoryRows, sortUsuariosDirectoryRows } from "@/lib/utils/usuarios-directory-table";
import { USUARIOS_TABLE_ENTITY_LABELS } from "@/lib/constants/usuarios/usuarios-page";

export function useUsuariosClient(initialRows: UsuarioDirectoryRow[]) {
  const { canManage } = useUserPermissions();
  const [inviteOpen, setInviteOpen] = useState(false);
  const canManageUsers = canManage ?? false;
  const [searchQuery, setSearchQuery] = useState("");
  const {
    filters,
    setColumnFilter,
    clearFilters,
    hasAnyFilter: anyFilter,
  } = useUsuariosStore();
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [tableSort, setTableSort] = useState<{
    key: UsuariosColumnKey;
    dir: SortDir;
  } | null>(null);
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
    () => filterUsuariosDirectoryRows(initialRows, searchQuery, filters),
    [initialRows, searchQuery, filters]
  );

  const sortedTableRows = useMemo(
    () => sortUsuariosDirectoryRows(filtered, tableSort),
    [filtered, tableSort]
  );

  const toggleUsuarioSort = useCallback(
    (key: UsuariosColumnKey, kind: ColumnSortKind) => {
      setTableSort((prev) =>
        nextSortState(prev, key, kind === "date" ? "date" : kind)
      );
    },
    []
  );

  const stats = useMemo(
    () => computeUsuariosDirectoryStats(initialRows),
    [initialRows]
  );

  const setCol = useCallback(
    (col: UsuariosColumnKey) => (next: Set<string> | null) =>
      setColumnFilter(col, next),
    [setColumnFilter]
  );

  const searchActive = Boolean(searchQuery.trim());
  const anyFilterOrSearch = anyFilter || searchActive;
  const hasTableActiveView = anyFilterOrSearch || tableSort !== null;
  const filterSummaryLines = useMemo(
    () => buildUsuariosFilterSummaryLines(searchQuery, filters, options),
    [searchQuery, filters, options]
  );
  const sortSummary = useMemo(
    () => formatUsuariosSortSummary(tableSort),
    [tableSort]
  );
  const clearTableView = useCallback(() => {
    setSearchQuery("");
    clearFilters();
    setTableSort(null);
  }, [clearFilters]);

  return {
    canManageUsers,
    inviteOpen,
    setInviteOpen,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    tableSort,
    filters,
    options,
    anyFilter,
    filtered,
    sortedTableRows,
    toggleUsuarioSort,
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
    entityLabels: USUARIOS_TABLE_ENTITY_LABELS,
  };
}
