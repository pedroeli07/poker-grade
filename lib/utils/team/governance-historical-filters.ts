import { DECISION_STATUS_OPTIONS, DECISION_VISIBILITY_OPTIONS } from "@/lib/constants/team/governance-mural-ui";
import { distinctOptions } from "@/lib/utils/distinct-options";
import type { GovernanceDecisionDTO } from "@/lib/data/team/governance-page";
import { GOVERNANCE_DECISION_COL_LABEL, GOVERNANCE_TABLE_SORT_LABEL } from "@/lib/constants/team/governance-historical-columns";
import type {
  GovernanceDecisionColumnFilters,
  GovernanceDecisionColumnOptions,
  GovernanceDecisionSortKey,
} from "@/lib/types/team/governance-historical";
import type { SortDir } from "@/lib/table-sort";
import { compareDate, compareString } from "@/lib/table-sort";

const NONE_AUTHOR = "__sem_autor__";

function authorLabel(d: GovernanceDecisionDTO) {
  return d.author?.displayName || d.author?.email || "—";
}

function authorIdOrNone(d: GovernanceDecisionDTO) {
  return d.author?.id ?? NONE_AUTHOR;
}

export function buildGovernanceDecisionColumnOptions(
  decisions: GovernanceDecisionDTO[],
): GovernanceDecisionColumnOptions {
  const area = distinctOptions(decisions, (d) => ({ value: d.area, label: d.area }));
  const status = DECISION_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
  const visibility = DECISION_VISIBILITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
  const author = distinctOptions(decisions, (d) => ({
    value: authorIdOrNone(d),
    label: authorLabel(d),
  }));
  const tagSet = new Set<string>();
  for (const d of decisions) {
    for (const t of d.tags) tagSet.add(t);
  }
  const tag = [...tagSet]
    .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }))
    .map((t) => ({ value: t, label: t }));
  return { area, status, visibility, author, tag };
}

export function filterGovernanceDecisions(
  decisions: GovernanceDecisionDTO[],
  search: string,
  filters: GovernanceDecisionColumnFilters,
): GovernanceDecisionDTO[] {
  const q = search.trim().toLowerCase();
  return decisions.filter((dec) => {
    if (q) {
      const blob = [
        dec.title,
        dec.summary,
        dec.impact,
        dec.tags.join(" "),
        dec.area,
        authorLabel(dec),
      ]
        .join(" ")
        .toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (filters.area && !filters.area.has(dec.area)) return false;
    if (filters.status && !filters.status.has(dec.status)) return false;
    if (filters.visibility && !filters.visibility.has(dec.visibility)) return false;
    if (filters.author) {
      const id = authorIdOrNone(dec);
      if (!filters.author.has(id)) return false;
    }
    if (filters.tag) {
      const has = dec.tags.some((t) => filters.tag!.has(t));
      if (!has) return false;
    }
    return true;
  });
}

export function sortGovernanceDecisions(
  rows: GovernanceDecisionDTO[],
  sort: { key: GovernanceDecisionSortKey; dir: SortDir } | null,
): GovernanceDecisionDTO[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "title":
        return compareString(a.title, b.title, dir);
      case "decidedAt":
        return compareDate(a.decidedAt, b.decidedAt, dir);
      case "area":
        return compareString(a.area, b.area, dir);
      case "status":
        return compareString(a.status, b.status, dir);
      case "visibility":
        return compareString(a.visibility, b.visibility, dir);
      case "authorName": {
        const la = authorLabel(a);
        const lb = authorLabel(b);
        return compareString(la, lb, dir);
      }
      default:
        return 0;
    }
  });
  return copy;
}

export function buildGovernanceFilterSummaryLines(
  options: GovernanceDecisionColumnOptions,
  applied: GovernanceDecisionColumnFilters,
): string[] {
  const lines: string[] = [];
  for (const key of Object.keys(GOVERNANCE_DECISION_COL_LABEL) as (keyof GovernanceDecisionColumnOptions)[]) {
    const set = applied[key];
    if (set === null || set.size === 0) continue;
    const opts = options[key] ?? [];
    const parts = [...set].map(
      (val) => opts.find((o) => o.value === val)?.label ?? val,
    );
    const label = GOVERNANCE_DECISION_COL_LABEL[key];
    lines.push(`${label}: ${parts.join(", ")}`);
  }
  return lines;
}

export function formatGovernanceTableSortSummary(
  sort: { key: GovernanceDecisionSortKey; dir: SortDir } | null,
): string | null {
  if (!sort) return null;
  const l = GOVERNANCE_TABLE_SORT_LABEL[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${l} (${dirPt})`;
}
