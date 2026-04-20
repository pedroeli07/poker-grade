"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnSortKind } from "@/lib/types/dataTable";
import type { ColKey, TargetListRow, TargetsTableSortState } from "@/lib/types";
import { nextSortState } from "@/lib/table-sort";
import { sortTargetsTableRows } from "@/lib/utils/target";
import { useTargetListViewModels } from "@/hooks/targets/use-target-list-view-models";

export function useTargetsTableSection(filtered: TargetListRow[]) {
  const [sort, setSort] = useState<TargetsTableSortState>(null);

  const toggleSort = useCallback((key: ColKey, kind: ColumnSortKind) => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const resetSort = useCallback(() => {
    setSort(null);
  }, []);

  const sorted = useMemo(() => sortTargetsTableRows(filtered, sort), [filtered, sort]);
  const viewModels = useTargetListViewModels(sorted);
  const rows = useMemo(
    () => sorted.map((row, i) => ({ row, vm: viewModels[i]! })),
    [sorted, viewModels],
  );

  return { sort, toggleSort, resetSort, viewModels, rows };
}
