"use client";

import { useMemo, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TargetListRow } from "@/lib/types";
import { getTargetsListDataAction } from "@/lib/queries/db/target-queries";
import { targetKeys } from "@/lib/queries/target-query-keys";
import { LIMIT_ACTION_LABEL, NONE_LIMIT } from "@/lib/constants";
import { TARGETS_LS_VIEW } from "@/lib/constants/targets-page";
import { distinctOptions, statusLabel } from "@/lib/utils";
import type { ColKey } from "@/lib/types";
import { useTargetsListStore } from "@/lib/stores/use-targets-list-store";

export function useTargetsListPage(initialRows: TargetListRow[]) {
  const { data: rows = initialRows } = useQuery({
    queryKey: targetKeys.list(),
    queryFn: async () => {
      const r = await getTargetsListDataAction();
      if (!r.ok) throw new Error(r.error);
      return r.rows;
    },
    initialData: initialRows,
    staleTime: 30_000,
  });

  const [view, setView] = useState<"cards" | "table">("cards");
  const [storageHydrated, setStorageHydrated] = useState(false);

  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(TARGETS_LS_VIEW);
      if (raw === "cards" || raw === "table") setView(raw);
    } catch {
      /* ignore */
    } finally {
      setStorageHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(TARGETS_LS_VIEW, view);
    } catch {
      /* ignore */
    }
  }, [view, storageHydrated]);
  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
    useTargetsListStore();

  const options = useMemo(
    () => ({
      name: distinctOptions(rows, (r) => ({ value: r.name, label: r.name })),
      category: distinctOptions(rows, (r) => ({
        value: r.category,
        label: r.category,
      })),
      player: distinctOptions(rows, (r) => ({
        value: r.playerId,
        label: r.playerName,
      })),
      status: distinctOptions(rows, (r) => ({
        value: r.status,
        label: statusLabel(r.status),
      })),
      targetType: distinctOptions(rows, (r) => ({
        value: r.targetType,
        label: r.targetType === "NUMERIC" ? "Numérico" : "Texto",
      })),
      limitAction: distinctOptions(rows, (r) => {
        const v = r.limitAction ?? NONE_LIMIT;
        const label = r.limitAction
          ? `Gatilho: ${LIMIT_ACTION_LABEL[r.limitAction as keyof typeof LIMIT_ACTION_LABEL].label}`
          : "Sem gatilho";
        return { value: v, label };
      }),
    }),
    [rows]
  );

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filters.name && !filters.name.has(r.name)) return false;
        if (filters.category && !filters.category.has(r.category))
          return false;
        if (filters.player && !filters.player.has(r.playerId)) return false;
        if (filters.status && !filters.status.has(r.status)) return false;
        if (filters.targetType && !filters.targetType.has(r.targetType))
          return false;
        const lim = r.limitAction ?? NONE_LIMIT;
        if (filters.limitAction && !filters.limitAction.has(lim))
          return false;
        return true;
      }),
    [rows, filters]
  );

  const setCol = useCallback(
    (col: ColKey) => (next: Set<string> | null) => {
      setColumnFilter(col, next);
    },
    [setColumnFilter]
  );

  return {
    rows,
    view,
    setView,
    filters,
    options,
    filtered,
    anyFilter,
    clearFilters,
    setCol,
  };
}
