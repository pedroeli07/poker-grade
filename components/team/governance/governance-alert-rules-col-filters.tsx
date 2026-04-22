"use client";

import { memo } from "react";
import ColumnFilter from "@/components/column-filter";
import { GOVERNANCE_ALERT_RULE_CARD_FILTER_COLUMNS } from "@/lib/constants/team/governance-alert-rules-columns";
import type {
  GovernanceAlertRuleColumnFilters,
  GovernanceAlertRuleColumnOptions,
  GovernanceAlertRulesSetCol,
} from "@/lib/types/team/governance-alert-rules-list";

const GovernanceAlertRulesColFilters = memo(function GovernanceAlertRulesColFilters({
  compact,
  options,
  filters,
  setCol,
}: {
  compact?: boolean;
  options: GovernanceAlertRuleColumnOptions;
  filters: GovernanceAlertRuleColumnFilters;
  setCol: GovernanceAlertRulesSetCol;
}) {
  return (
    <>
      {GOVERNANCE_ALERT_RULE_CARD_FILTER_COLUMNS.map(([id, col, label]) => (
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

GovernanceAlertRulesColFilters.displayName = "GovernanceAlertRulesColFilters";

export default GovernanceAlertRulesColFilters;
