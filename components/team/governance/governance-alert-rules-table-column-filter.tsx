"use client";

import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import type {
  GovernanceAlertRuleColKey,
  GovernanceAlertRuleColumnFilters,
  GovernanceAlertRuleColumnOptions,
  GovernanceAlertRulesSetCol,
} from "@/lib/types/team/governance-alert-rules-list";

const GovernanceAlertRulesTableColumnFilter = memo(function GovernanceAlertRulesTableColumnFilter({
  columnId,
  col,
  label,
  options,
  filters,
  setCol,
}: {
  columnId: string;
  col: GovernanceAlertRuleColKey;
  label: string;
  options: GovernanceAlertRuleColumnOptions;
  filters: GovernanceAlertRuleColumnFilters;
  setCol: GovernanceAlertRulesSetCol;
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

GovernanceAlertRulesTableColumnFilter.displayName = "GovernanceAlertRulesTableColumnFilter";

export default GovernanceAlertRulesTableColumnFilter;
