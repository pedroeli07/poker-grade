import type { GovernanceAlertRuleColumnFilters } from "@/lib/types/team/governance-alert-rules-list";
import { createFilterStore } from "@/lib/stores/create-filter-store";

const defaultFilters: GovernanceAlertRuleColumnFilters = {
  area: null,
  metric: null,
  severity: null,
  responsible: null,
};

export const useGovernanceAlertRulesListStore = createFilterStore<GovernanceAlertRuleColumnFilters>(
  defaultFilters,
  "gestao-grades:governance:alertRules:filters",
);
