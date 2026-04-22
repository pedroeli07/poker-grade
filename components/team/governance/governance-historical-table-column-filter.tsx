"use client";

import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import type {
  GovernanceDecisionColKey,
  GovernanceDecisionColumnFilters,
  GovernanceDecisionColumnOptions,
  GovernanceDecisionsSetCol,
} from "@/lib/types/team/governance-historical";

const GovernanceHistoricalTableColumnFilter = memo(function GovernanceHistoricalTableColumnFilter({
  columnId,
  col,
  label,
  options,
  filters,
  setCol,
}: {
  columnId: string;
  col: GovernanceDecisionColKey;
  label: string;
  options: GovernanceDecisionColumnOptions;
  filters: GovernanceDecisionColumnFilters;
  setCol: GovernanceDecisionsSetCol;
}) {
  return (
    <ColumnFilter
      columnId={columnId}
      ariaLabel={label}
      label={
        <FilteredColumnTitle active={filters[col] !== null}>{label}</FilteredColumnTitle>
      }
      options={options[col]}
      applied={filters[col]}
      onApply={setCol(col)}
      triggerClassName="text-sm font-semibold leading-tight max-w-[7.5rem] text-center"
    />
  );
});

GovernanceHistoricalTableColumnFilter.displayName = "GovernanceHistoricalTableColumnFilter";

export default GovernanceHistoricalTableColumnFilter;
