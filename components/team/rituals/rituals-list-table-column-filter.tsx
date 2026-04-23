"use client";

import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import type {
  RitualListColKey,
  RitualListColumnFilters,
  RitualListColumnOptions,
  RitualListSetCol,
} from "@/lib/types/team/rituals-list";

const RitualsListTableColumnFilter = memo(function RitualsListTableColumnFilter({
  columnId,
  col,
  label,
  options,
  filters,
  setCol,
}: {
  columnId: string;
  col: RitualListColKey;
  label: string;
  options: RitualListColumnOptions;
  filters: RitualListColumnFilters;
  setCol: RitualListSetCol;
}) {
  return (
    <ColumnFilter
      columnId={columnId}
      ariaLabel={label}
      label={<FilteredColumnTitle active={filters[col] !== null}>{label}</FilteredColumnTitle>}
      options={options[col]}
      applied={filters[col]}
      onApply={setCol(col)}
      triggerClassName="text-sm font-semibold leading-tight max-w-[7.5rem] text-center"
    />
  );
});

RitualsListTableColumnFilter.displayName = "RitualsListTableColumnFilter";

export default RitualsListTableColumnFilter;
