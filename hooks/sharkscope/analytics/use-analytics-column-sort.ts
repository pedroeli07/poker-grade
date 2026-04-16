"use client";

import { useCallback, useMemo, useState } from "react";
import { nextSortState } from "@/lib/table-sort";
import type { ColumnSortKind, AnalyticsSortState } from "@/lib/types";

const useAnalyticsColumnSort = <K extends string>() => {
  const [sort, setSort] = useState<AnalyticsSortState<K>>(null);

  const toggleSort = useCallback((key: K, kind: ColumnSortKind) => {
    setSort((prev: AnalyticsSortState<K> | null) => nextSortState(prev, key, kind));
  }, []);

  return useMemo(() => ({ sort, toggleSort }), [sort, toggleSort]);
};

export default useAnalyticsColumnSort;
