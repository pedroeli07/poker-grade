"use client";

import { memo, useMemo } from "react";
import ColumnFilter from "@/components/column-filter";
import { TARGETS_CARD_FILTER_COLUMNS } from "@/lib/constants/target";
import type { ColKey, Filters, TargetsColumnOptions } from "@/lib/types/columnKeys";
const TargetsColFilters = memo(function TargetsColFilters({
  compact = false,
  options,
  filters,
  setCol,
  hidePlayerFilter = false,
}: {
  compact?: boolean;
  options: TargetsColumnOptions;
  filters: Filters;
  setCol: (col: ColKey) => (next: Set<string> | null) => void;
  hidePlayerFilter?: boolean;
}) {
  const columns = useMemo(
    () =>
      hidePlayerFilter
        ? TARGETS_CARD_FILTER_COLUMNS.filter(([, col]) => col !== "player")
        : TARGETS_CARD_FILTER_COLUMNS,
    [hidePlayerFilter]
  );

  return (
    <>
      {columns.map(([id, col, label]) => (
        <ColumnFilter
          key={id}
          columnId={id}
          label={label}
          options={options[col] || []}
          applied={filters[col]}
          onApply={setCol(col)}
          compact={compact}
        />
      ))}
    </>
  );
});

TargetsColFilters.displayName = "TargetsColFilters";

export default TargetsColFilters;
