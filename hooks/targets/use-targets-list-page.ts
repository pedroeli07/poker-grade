"use client";

import { useMemo, useCallback, useEffect } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useQuery } from "@tanstack/react-query";
import type { TargetListRow } from "@/lib/types";
import { getTargetsListDataAction } from "@/lib/queries/db/target";
import { targetKeys } from "@/lib/queries/target-query-keys";
import { LIMIT_ACTION_LABEL, NONE_LIMIT } from "@/lib/constants/grade";
import { CATEGORIES, TARGETS_LS_VIEW } from "@/lib/constants/target";
import { distinctOptions } from "@/lib/utils";
import { getTargetStatusLabel } from "@/lib/utils/target";
import type { ColKey } from "@/lib/types";
import { useTargetsListStore } from "@/lib/stores/use-targets-list-store";
import { useTargetsBulkActions } from "@/hooks/targets/use-targets-bulk-actions";

export function useTargetsListPage(
  initialRows: TargetListRow[],
  opts?: { isPlayer?: boolean }
) {
  const isPlayer = opts?.isPlayer ?? false;
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

  const [view, setView, viewHydrated] = usePersistentState<"cards" | "table">(
    TARGETS_LS_VIEW,
    "cards"
  );
  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
    useTargetsListStore();

  useEffect(() => {
    if (!isPlayer) return;
    if (filters.player !== null) setColumnFilter("player", null);
  }, [isPlayer, filters.player, setColumnFilter]);

  const options = useMemo(
    () => ({
      name: distinctOptions(rows, (r) => ({ value: r.name, label: r.name })),
      category: distinctOptions(rows, (r) => ({
        value: r.category,
        label:
          CATEGORIES.find((c) => c.value === r.category)?.label ?? r.category,
      })),
      player: distinctOptions(rows, (r) => ({
        value: r.playerId,
        label: r.playerName,
      })),
      status: distinctOptions(rows, (r) => ({
        value: r.status,
        label: getTargetStatusLabel(r.status),
      })),
      targetType: distinctOptions(rows, (r) => ({
        value: r.targetType,
        label: r.targetType === "NUMERIC" ? "NumÃ©rico" : "Texto",
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
        if (
          !isPlayer &&
          filters.player &&
          !filters.player.has(r.playerId)
        )
          return false;
        if (filters.status && !filters.status.has(r.status)) return false;
        if (filters.targetType && !filters.targetType.has(r.targetType))
          return false;
        const lim = r.limitAction ?? NONE_LIMIT;
        if (filters.limitAction && !filters.limitAction.has(lim))
          return false;
        return true;
      }),
    [rows, filters, isPlayer]
  );

  const setCol = useCallback(
    (col: ColKey) => (next: Set<string> | null) => {
      setColumnFilter(col, next);
    },
    [setColumnFilter]
  );

  const bulk = useTargetsBulkActions();

  return {
    rows,
    view,
    setView,
    viewHydrated,
    filters,
    options,
    filtered,
    anyFilter,
    clearFilters,
    setCol,
    ...bulk,
  };
}
