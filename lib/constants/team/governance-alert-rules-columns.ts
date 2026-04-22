import type { GovernanceAlertRuleColKey, GovernanceAlertRuleSortKey } from "@/lib/types/team/governance-alert-rules-list";
import type { ColumnSortKind } from "@/lib/types/dataTable";

export const GOVERNANCE_ALERT_RULE_COL_LABEL: Record<GovernanceAlertRuleColKey, string> = {
  area: "Área",
  metric: "Métrica",
  severity: "Severidade",
  responsible: "Responsável",
};

export const GOVERNANCE_ALERT_RULE_CARD_FILTER_COLUMNS: [string, GovernanceAlertRuleColKey, string][] = [
  ["governance-ar-f-area", "area", "Área"],
  ["governance-ar-f-metric", "metric", "Métrica"],
  ["governance-ar-f-sev", "severity", "Severidade"],
  ["governance-ar-f-resp", "responsible", "Responsável"],
];

export const GOVERNANCE_ALERT_RULE_TABLE_SORT_LABEL: Record<GovernanceAlertRuleSortKey, string> = {
  name: "Regra",
  area: "Área",
  metric: "Métrica",
  threshold: "Condição",
  severity: "Severidade",
  responsible: "Responsável",
};

type HeadCol = {
  id: string;
  width: string;
  label: string;
  filterCol: GovernanceAlertRuleColKey | null;
  sortKey: GovernanceAlertRuleSortKey | null;
  sortKind: ColumnSortKind | null;
};

export const GOVERNANCE_ALERT_RULE_TABLE_HEAD_COLUMNS: HeadCol[] = [
  {
    id: "ar-name",
    width: "w-[22%] min-w-[200px]",
    label: "Regra",
    filterCol: null,
    sortKey: "name",
    sortKind: "string",
  },
  {
    id: "ar-area",
    width: "w-[11%]",
    label: "Área",
    filterCol: "area",
    sortKey: "area",
    sortKind: "string",
  },
  {
    id: "ar-metric",
    width: "w-[12%]",
    label: "Métrica",
    filterCol: "metric",
    sortKey: "metric",
    sortKind: "string",
  },
  {
    id: "ar-cond",
    width: "w-[14%] min-w-[120px]",
    label: "Condição",
    filterCol: null,
    sortKey: "threshold",
    sortKind: "number",
  },
  {
    id: "ar-sev",
    width: "w-[10%]",
    label: "Severidade",
    filterCol: "severity",
    sortKey: "severity",
    sortKind: "string",
  },
  {
    id: "ar-resp",
    width: "w-[16%]",
    label: "Responsável",
    filterCol: "responsible",
    sortKey: "responsible",
    sortKind: "string",
  },
];
