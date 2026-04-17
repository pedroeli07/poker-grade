"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  SHARKSCOPE_ALERTS_ALLOWED_PAGE_SIZE,
  SHARKSCOPE_ALERTS_LS_PAGE,
  SHARKSCOPE_ALERTS_LS_PAGE_SIZE,
  SHARKSCOPE_ALERTS_LS_SELECTED,
} from "@/lib/constants/sharkscope/alerts";
import type { SharkscopeAlertRow } from "@/lib/types";
import { useAlertsDashboard } from "@/hooks/sharkscope/alerts/use-alerts-dashboard";
import { nextSortState, compareString, compareDate } from "@/lib/table-sort";
import type { ColumnSortState } from "@/lib/types/dataTable";
import type { NumberFilterValue } from "@/lib/number-filter";

export type AlertSortKey = "severity" | "player" | "alertType" | "triggeredAt";

const SEVERITY_ORDER: Record<string, number> = { red: 0, yellow: 1, green: 2 };

export function useAlertsPageClient(initialAlerts: SharkscopeAlertRow[]) {
  const {
    alerts,
    filterSeverity,
    setFilterSeverity: setFilterSeverityInner,
    filterType,
    setFilterType: setFilterTypeInner,
    filterAck,
    setFilterAck: setFilterAckInner,
    filterPlayer,
    setFilterPlayer: setFilterPlayerInner,
    filterData,
    setFilterData: setFilterDataInner,
    filterValor,
    setFilterValor: setFilterValorInner,
    filterLimite,
    setFilterLimite: setFilterLimiteInner,
    filtered,
    unackedCount,
    isPending,
    acknowledge,
    acknowledgeAll,
    deleteAlerts,
  } = useAlertsDashboard(initialAlerts);

  const [sort, setSort] = useState<ColumnSortState<AlertSortKey>>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [storageHydrated, setStorageHydrated] = useState(false);

  useLayoutEffect(() => {
    const validIds = new Set(initialAlerts.map((a) => a.id));
    try {
      const ps = localStorage.getItem(SHARKSCOPE_ALERTS_LS_PAGE_SIZE);
      if (ps) {
        const n = Number(ps);
        if (SHARKSCOPE_ALERTS_ALLOWED_PAGE_SIZE.has(n)) {
          setPageSize(n);
        }
      }
      const pg = localStorage.getItem(SHARKSCOPE_ALERTS_LS_PAGE);
      if (pg) {
        const p = parseInt(pg, 10);
        if (!Number.isNaN(p) && p >= 1) setPage(p);
      }
      const rawSel = localStorage.getItem(SHARKSCOPE_ALERTS_LS_SELECTED);
      if (rawSel) {
        const parsed: unknown = JSON.parse(rawSel);
        if (Array.isArray(parsed) && parsed.every((x): x is string => typeof x === "string")) {
          setSelectedIds(new Set(parsed.filter((id) => validIds.has(id))));
        }
      }
    } catch {
      /* ignore corrupt LS */
    } finally {
      setStorageHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once from LS; validIds from first server payload
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    const valid = new Set(alerts.map((a) => a.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)));
      if (next.size === prev.size && [...next].every((id) => prev.has(id))) return prev;
      return next;
    });
  }, [alerts, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(SHARKSCOPE_ALERTS_LS_PAGE_SIZE, String(pageSize));
    } catch {
      /* ignore */
    }
  }, [pageSize, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(SHARKSCOPE_ALERTS_LS_PAGE, String(page));
    } catch {
      /* ignore */
    }
  }, [page, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(SHARKSCOPE_ALERTS_LS_SELECTED, JSON.stringify([...selectedIds]));
    } catch {
      /* ignore */
    }
  }, [selectedIds, storageHydrated]);

  const toggleSort = useCallback((key: AlertSortKey, kind: "string" | "date" | "number") => {
    setPage(1);
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sortedFiltered = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "severity": {
          const diff = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
          return sort.dir === "asc" ? diff : -diff;
        }
        case "player":
          return compareString(a.player.name, b.player.name, sort.dir);
        case "alertType":
          return compareString(a.alertType, b.alertType, sort.dir);
        case "triggeredAt":
          return compareDate(a.triggeredAt, b.triggeredAt, sort.dir);
        default:
          return 0;
      }
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedFiltered.slice(start, start + pageSize);
  }, [sortedFiltered, safePage, pageSize]);

  const setFilterSeverity = useCallback(
    (v: Set<string> | null) => {
      setPage(1);
      setFilterSeverityInner(v);
    },
    [setFilterSeverityInner]
  );
  const setFilterType = useCallback(
    (v: Set<string> | null) => {
      setPage(1);
      setFilterTypeInner(v);
    },
    [setFilterTypeInner]
  );
  const setFilterAck = useCallback(
    (v: Set<string> | null) => {
      setPage(1);
      setFilterAckInner(v);
    },
    [setFilterAckInner]
  );
  const setFilterPlayer = useCallback(
    (v: Set<string> | null) => {
      setPage(1);
      setFilterPlayerInner(v);
    },
    [setFilterPlayerInner]
  );
  const setFilterData = useCallback(
    (v: Set<string> | null) => {
      setPage(1);
      setFilterDataInner(v);
    },
    [setFilterDataInner]
  );
  const setFilterValor = useCallback(
    (v: NumberFilterValue | null) => {
      setPage(1);
      setFilterValorInner(v);
    },
    [setFilterValorInner]
  );
  const setFilterLimite = useCallback(
    (v: NumberFilterValue | null) => {
      setPage(1);
      setFilterLimiteInner(v);
    },
    [setFilterLimiteInner]
  );

  const filteredIdSet = useMemo(() => new Set(filtered.map((a) => a.id)), [filtered]);
  const visibleSelectedIds = useMemo(
    () => new Set([...selectedIds].filter((id) => filteredIdSet.has(id))),
    [selectedIds, filteredIdSet]
  );

  const allCurrentPageSelected =
    paginatedRows.length > 0 && paginatedRows.every((a) => selectedIds.has(a.id));
  const someCurrentPageSelected = paginatedRows.some((a) => selectedIds.has(a.id));
  const headerChecked = allCurrentPageSelected
    ? true
    : someCurrentPageSelected
      ? ("indeterminate" as const)
      : false;

  const toggleSelectCurrentPage = useCallback(
    (checked: boolean) => {
      const pageIds = paginatedRows.map((a) => a.id);
      if (checked) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          pageIds.forEach((id) => next.add(id));
          return next;
        });
      } else {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          pageIds.forEach((id) => next.delete(id));
          return next;
        });
      }
    },
    [paginatedRows]
  );

  const resetAlertFilters = useCallback(() => {
    setPage(1);
    setSort(null);
    setFilterSeverityInner(null);
    setFilterTypeInner(null);
    setFilterPlayerInner(null);
    setFilterDataInner(null);
    setFilterValorInner(null);
    setFilterLimiteInner(null);
    setFilterAckInner(new Set(["unacknowledged"]));
  }, [
    setFilterSeverityInner,
    setFilterTypeInner,
    setFilterPlayerInner,
    setFilterDataInner,
    setFilterValorInner,
    setFilterLimiteInner,
    setFilterAckInner,
  ]);

  const confirmBulkDelete = useCallback(() => {
    const ids = [...visibleSelectedIds];
    deleteAlerts(ids, {
      onSuccess: () => {
        setBulkDeleteOpen(false);
        setSelectedIds(new Set());
      },
    });
  }, [deleteAlerts, visibleSelectedIds]);

  return {
    alerts,
    filterSeverity,
    setFilterSeverity,
    filterType,
    setFilterType,
    filterAck,
    setFilterAck,
    filterPlayer,
    setFilterPlayer,
    filterData,
    setFilterData,
    filterValor,
    setFilterValor,
    filterLimite,
    setFilterLimite,
    resetAlertFilters,
    sort,
    toggleSort,
    filtered,
    unackedCount,
    isPending,
    acknowledge,
    acknowledgeAll,
    selectedIds,
    setSelectedIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    safePage,
    paginatedRows,
    visibleSelectedIds,
    headerChecked,
    toggleSelectCurrentPage,
    confirmBulkDelete,
  };
}
