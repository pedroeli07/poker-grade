import { SEVERITY_LABELS_PT } from "@/lib/constants/team/severity";
import { distinctOptions } from "@/lib/utils/distinct-options";
import type { GovernanceAlertRuleDTO } from "@/lib/data/team/governance-page";
import {
  GOVERNANCE_ALERT_RULE_COL_LABEL,
  GOVERNANCE_ALERT_RULE_TABLE_SORT_LABEL,
} from "@/lib/constants/team/governance-alert-rules-columns";
import type {
  GovernanceAlertRuleColKey,
  GovernanceAlertRuleColumnFilters,
  GovernanceAlertRuleColumnOptions,
  GovernanceAlertRuleSortKey,
} from "@/lib/types/team/governance-alert-rules-list";
import type { SortDir } from "@/lib/table-sort";
import { compareNumber, compareString } from "@/lib/table-sort";

export function responsibleKey(r: GovernanceAlertRuleDTO): string {
  if (r.assignee?.id) return `u:${r.assignee.id}`;
  const n = r.responsibleName?.trim();
  if (n) return `n:${n}`;
  return "geral";
}

export function responsibleLabel(r: GovernanceAlertRuleDTO): string {
  return r.assignee?.displayName || r.assignee?.email || r.responsibleName?.trim() || "Geral";
}

function severityLabel(raw: string): string {
  return SEVERITY_LABELS_PT[raw] ?? raw;
}

export function buildGovernanceAlertRuleColumnOptions(
  rules: GovernanceAlertRuleDTO[],
): GovernanceAlertRuleColumnOptions {
  const area = distinctOptions(rules, (r) => ({ value: r.area, label: r.area }));
  const metric = distinctOptions(rules, (r) => ({ value: r.metric, label: r.metric }));
  const severity = distinctOptions(rules, (r) => ({
    value: r.severity,
    label: severityLabel(r.severity),
  }));
  const responsible = distinctOptions(rules, (r) => ({
    value: responsibleKey(r),
    label: responsibleLabel(r),
  }));
  return { area, metric, severity, responsible };
}

export function filterGovernanceAlertRules(
  rules: GovernanceAlertRuleDTO[],
  search: string,
  filters: GovernanceAlertRuleColumnFilters,
): GovernanceAlertRuleDTO[] {
  const q = search.trim().toLowerCase();
  return rules.filter((r) => {
    if (q) {
      const blob = [
        r.name,
        r.area,
        r.metric,
        r.operator,
        String(r.threshold),
        r.severity,
        severityLabel(r.severity),
        responsibleLabel(r),
      ]
        .join(" ")
        .toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (filters.area && !filters.area.has(r.area)) return false;
    if (filters.metric && !filters.metric.has(r.metric)) return false;
    if (filters.severity && !filters.severity.has(r.severity)) return false;
    if (filters.responsible && !filters.responsible.has(responsibleKey(r))) return false;
    return true;
  });
}

export function sortGovernanceAlertRules(
  rows: GovernanceAlertRuleDTO[],
  sort: { key: GovernanceAlertRuleSortKey; dir: SortDir } | null,
): GovernanceAlertRuleDTO[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "name":
        return compareString(a.name, b.name, dir);
      case "area":
        return compareString(a.area, b.area, dir);
      case "metric":
        return compareString(a.metric, b.metric, dir);
      case "threshold":
        return compareNumber(a.threshold, b.threshold, dir);
      case "severity":
        return compareString(a.severity, b.severity, dir);
      case "responsible":
        return compareString(responsibleLabel(a), responsibleLabel(b), dir);
      default:
        return 0;
    }
  });
  return copy;
}

export function buildGovernanceAlertRuleFilterSummaryLines(
  options: GovernanceAlertRuleColumnOptions,
  applied: GovernanceAlertRuleColumnFilters,
): string[] {
  const lines: string[] = [];
  for (const key of Object.keys(GOVERNANCE_ALERT_RULE_COL_LABEL) as (keyof GovernanceAlertRuleColumnOptions)[]) {
    const set = applied[key];
    if (set === null || set.size === 0) continue;
    const opts = options[key] ?? [];
    const parts = [...set].map(
      (val) => opts.find((o) => o.value === val)?.label ?? val,
    );
    const label = GOVERNANCE_ALERT_RULE_COL_LABEL[key];
    lines.push(`${label}: ${parts.join(", ")}`);
  }
  return lines;
}

export function formatAlertRulesTableSortSummary(
  sort: { key: GovernanceAlertRuleSortKey; dir: SortDir } | null,
): string | null {
  if (!sort) return null;
  const l = GOVERNANCE_ALERT_RULE_TABLE_SORT_LABEL[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${l} (${dirPt})`;
}
