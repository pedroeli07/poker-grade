"use client";

import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import { TARGETS_CARD_FILTER_COLUMNS } from "@/lib/constants/target";
import type { ColKey, Filters, TargetsColumnOptions } from "@/lib/types";

const TargetsColFilters = memo(function TargetsColFilters({
  compact = false,
  options,
  filters,
  setCol,
}: {
  compact?: boolean;
  options: TargetsColumnOptions;
  filters: Filters;
  setCol: (col: ColKey) => (next: Set<string> | null) => void;
}) {
  return (
    <>
      {TARGETS_CARD_FILTER_COLUMNS.map(([id, col, label]) => (
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
