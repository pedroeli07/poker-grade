import type { ColumnOptions, FilterMap } from "@/lib/types/primitives";

export const GOVERNANCE_ALERT_RULE_FILTER_COLS = ["area", "metric", "severity", "responsible"] as const;

export type GovernanceAlertRuleColKey = (typeof GOVERNANCE_ALERT_RULE_FILTER_COLS)[number];
export type GovernanceAlertRuleColumnFilters = FilterMap<GovernanceAlertRuleColKey>;
export type GovernanceAlertRuleColumnOptions = ColumnOptions<GovernanceAlertRuleColKey>;

export type GovernanceAlertRulesSetCol = (col: GovernanceAlertRuleColKey) => (next: Set<string> | null) => void;

export type GovernanceAlertRuleSortKey =
  | "name"
  | "area"
  | "metric"
  | "threshold"
  | "severity"
  | "responsible";
