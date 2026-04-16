"use client";

import { useMemo, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { descriptionPick, distinctOptions } from "@/lib/utils";
import { EMPTY_DESC, STALE_TIME } from "@/lib/constants";
import { GRADES_LS_VIEW } from "@/lib/constants/metadata";
import type { GradeListRow, ColumnKey } from "@/lib/types";
import { getGradesListRowsAction } from "@/lib/queries/db/grade";
import { gradeKeys } from "@/lib/queries/grade-query-keys";
import { useGradesListStore } from "@/lib/stores/use-grades-list-store";

export function useGradesListPage(initialRows: GradeListRow[]) {
  const { data: rows = initialRows } = useQuery({
    queryKey: gradeKeys.list(),
    queryFn: async () => {
      const r = await getGradesListRowsAction();
      if (!r.ok) throw new Error(r.error);
      return r.rows;
    },
    initialData: initialRows,
    staleTime: STALE_TIME,
  });

  const [view, setView] = useState<"cards" | "table">("cards");
  const [storageHydrated, setStorageHydrated] = useState(false);

  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(GRADES_LS_VIEW);
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
      localStorage.setItem(GRADES_LS_VIEW, view);
    } catch {
      /* ignore */
    }
  }, [view, storageHydrated]);
  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
    useGradesListStore();
  const setCol = useCallback(
    (col: ColumnKey) => (next: Set<string> | null) =>
      setColumnFilter(col, next),
    [setColumnFilter]
  );

  const options = useMemo(
    () => ({
      name: distinctOptions(rows, (r) => ({ value: r.name, label: r.name })),
      description: distinctOptions(rows, (r) => descriptionPick(r)),
      rules: distinctOptions(rows, (r) => ({
        value: String(r.rulesCount),
        label: `${r.rulesCount} regra${r.rulesCount !== 1 ? "s" : ""}`,
      })),
      players: distinctOptions(rows, (r) => ({
        value: String(r.assignmentsCount),
        label: `${r.assignmentsCount} jogador${r.assignmentsCount !== 1 ? "es" : ""}`,
      })),
    }),
    [rows]
  );

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filters.name && !filters.name.has(r.name)) return false;
        const descVal = r.description?.trim() || EMPTY_DESC;
        if (filters.description && !filters.description.has(descVal))
          return false;
        if (filters.rules && !filters.rules.has(String(r.rulesCount)))
          return false;
        if (
          filters.players &&
          !filters.players.has(String(r.assignmentsCount))
        )
          return false;
        return true;
      }),
    [rows, filters]
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
