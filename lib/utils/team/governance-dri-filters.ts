import { distinctOptions } from "@/lib/utils/distinct-options";
import type { GovernanceDriDTO } from "@/lib/data/team/governance-page";
import { GOVERNANCE_DRI_COL_LABEL, GOVERNANCE_DRI_TABLE_SORT_LABEL } from "@/lib/constants/team/governance-dri-columns";
import type {
  GovernanceDriColKey,
  GovernanceDriColumnFilters,
  GovernanceDriColumnOptions,
  GovernanceDriSortKey,
} from "@/lib/types/team/governance-dri-matrix";
import type { SortDir } from "@/lib/table-sort";
import { compareString } from "@/lib/table-sort";

export function driResponsibleValue(d: GovernanceDriDTO): string {
  if (d.authUserId) return `u:${d.authUserId}`;
  return `n:${(d.responsibleName ?? "").trim()}`;
}

export function driResponsibleLabel(d: GovernanceDriDTO): string {
  return d.user?.displayName || d.responsibleName || "Responsável não definido";
}

function rulesFilterValue(d: GovernanceDriDTO): string {
  return d.rules.trim() || "__empty__";
}

export function buildDriColumnOptions(dris: GovernanceDriDTO[]): GovernanceDriColumnOptions {
  const area = distinctOptions(dris, (d) => ({ value: d.area, label: d.area }));
  const responsible = distinctOptions(dris, (d) => ({
    value: driResponsibleValue(d),
    label: driResponsibleLabel(d),
  }));
  const rules = distinctOptions(dris, (d) => {
    const v = rulesFilterValue(d);
    const label = d.rules.trim() || "—";
    return { value: v, label };
  });
  return { area, responsible, rules };
}

export function filterDriMatrix(
  dris: GovernanceDriDTO[],
  filters: GovernanceDriColumnFilters,
): GovernanceDriDTO[] {
  return dris.filter((d) => {
    if (filters.area && !filters.area.has(d.area)) return false;
    if (filters.responsible && !filters.responsible.has(driResponsibleValue(d))) return false;
    if (filters.rules && !filters.rules.has(rulesFilterValue(d))) return false;
    return true;
  });
}

export function sortDriMatrix(
  rows: GovernanceDriDTO[],
  sort: { key: GovernanceDriSortKey; dir: SortDir } | null,
): GovernanceDriDTO[] {
  if (!sort) return rows;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (sort.key) {
      case "area":
        return compareString(a.area, b.area, sort.dir);
      case "responsible":
        return compareString(driResponsibleLabel(a), driResponsibleLabel(b), sort.dir);
      case "rules":
        return compareString(a.rules, b.rules, sort.dir);
      default:
        return 0;
    }
  });
  return copy;
}

export function buildDriFilterSummaryLines(
  options: GovernanceDriColumnOptions,
  applied: GovernanceDriColumnFilters,
): string[] {
  const lines: string[] = [];
  for (const key of Object.keys(GOVERNANCE_DRI_COL_LABEL) as GovernanceDriColKey[]) {
    const set = applied[key];
    if (set === null || set.size === 0) continue;
    const opts = options[key] ?? [];
    const parts = [...set].map(
      (val) => opts.find((o) => o.value === val)?.label ?? val,
    );
    const label = GOVERNANCE_DRI_COL_LABEL[key];
    lines.push(`${label}: ${parts.join(", ")}`);
  }
  return lines;
}

export function formatDriTableSortSummary(
  sort: { key: GovernanceDriSortKey; dir: SortDir } | null,
): string | null {
  if (!sort) return null;
  const l = GOVERNANCE_DRI_TABLE_SORT_LABEL[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${l} (${dirPt})`;
}
