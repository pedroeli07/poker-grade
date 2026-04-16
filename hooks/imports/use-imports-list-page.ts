"use client";

import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { distinctOptions, importRowDateLabel } from "@/lib/utils";
import { EMPTY_PLAYER, STALE_TIME } from "@/lib/constants";
import { useImportsStore } from "@/lib/stores/use-imports-store";
import { importKeys } from "@/lib/queries/import-query-keys";
import { getImportsListRowsAction } from "@/lib/queries/db/imports";
import { useInvalidate } from "@/hooks/use-invalidate";
import type { ImportListRow, ImportsColumnKey } from "@/lib/types";
import { useImportsActions } from "@/hooks/imports/use-imports-actions";

export function useImportsListPage(initialImports: ImportListRow[]) {
  const invalidate = useInvalidate("imports");
  const { data: imports = initialImports } = useQuery({
    queryKey: importKeys.list(),
    queryFn: async () => {
      const r = await getImportsListRowsAction();
      if (!r.ok) throw new Error(r.error);
      return r.rows;
    },
    initialData: initialImports,
    staleTime: STALE_TIME,
  });

  const {
    selected,
    setSelected,
    idsToDelete,
    setIdsToDelete,
    isPending,
    toggle,
    confirmDelete,
  } = useImportsActions({ invalidate });

  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
    useImportsStore();

  const options = useMemo(
    () => ({
      fileName: distinctOptions(imports, (r) => ({
        value: r.fileName,
        label: r.fileName,
      })),
      player: distinctOptions(imports, (r) => {
        const v = r.playerName ?? EMPTY_PLAYER;
        return { value: v, label: r.playerName ?? "(nÃ£o identificado)" };
      }),
      totalRows: distinctOptions(imports, (r) => ({
        value: String(r.totalRows),
        label: String(r.totalRows),
      })),
      played: distinctOptions(imports, (r) => ({
        value: String(r.matchedInGrade),
        label: String(r.matchedInGrade),
      })),
      extraPlay: distinctOptions(imports, (r) => ({
        value: String(r.outOfGrade),
        label: String(r.outOfGrade),
      })),
      didntPlay: distinctOptions(imports, (r) => ({
        value: String(r.suspect),
        label: String(r.suspect),
      })),
      date: distinctOptions(imports, (r) => {
        const label = importRowDateLabel(r);
        return { value: label, label };
      }),
    }),
    [imports]
  );

  const filtered = useMemo(
    () =>
      imports.filter((r) => {
        if (filters.fileName && !filters.fileName.has(r.fileName))
          return false;
        if (filters.player && !filters.player.has(r.playerName ?? EMPTY_PLAYER))
          return false;
        if (filters.totalRows && !filters.totalRows.has(String(r.totalRows)))
          return false;
        if (filters.played && !filters.played.has(String(r.matchedInGrade)))
          return false;
        if (filters.extraPlay && !filters.extraPlay.has(String(r.outOfGrade)))
          return false;
        if (filters.didntPlay && !filters.didntPlay.has(String(r.suspect)))
          return false;
        if (filters.date && !filters.date.has(importRowDateLabel(r)))
          return false;
        return true;
      }),
    [imports, filters]
  );

  const allSelected =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  const setCol = useCallback(
    (col: ImportsColumnKey) => (next: Set<string> | null) =>
      setColumnFilter(col, next),
    [setColumnFilter]
  );

  return {
    imports,
    filtered,
    options,
    filters,
    anyFilter,
    clearFilters,
    setCol,
    allSelected,
    selected,
    setSelected,
    idsToDelete,
    setIdsToDelete,
    isPending,
    toggle,
    confirmDelete,
  };
}
