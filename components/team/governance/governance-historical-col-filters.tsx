"use client";

import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import { GOVERNANCE_CARD_FILTER_COLUMNS } from "@/lib/constants/team/governance-historical-columns";
import type {
  GovernanceDecisionColumnFilters,
  GovernanceDecisionColumnOptions,
  GovernanceDecisionsSetCol,
} from "@/lib/types/team/governance-historical";

const GovernanceHistoricalColFilters = memo(function GovernanceHistoricalColFilters({
  compact,
  options,
  filters,
  setCol,
}: {
  compact?: boolean;
  options: GovernanceDecisionColumnOptions;
  filters: GovernanceDecisionColumnFilters;
  setCol: GovernanceDecisionsSetCol;
}) {
  return (
    <>
      {GOVERNANCE_CARD_FILTER_COLUMNS.map(([id, col, label]) => (
        <ColumnFilter
          key={id}
          columnId={id}
          label={label}
          options={options[col]}
          applied={filters[col]}
          onApply={setCol(col)}
          compact={compact}
        />
      ))}
    </>
  );
});

GovernanceHistoricalColFilters.displayName = "GovernanceHistoricalColFilters";

export default GovernanceHistoricalColFilters;
