import {
  GRADES_FILTER_SUMMARY_EMPTY_SELECTION,
  GRADES_TABLE_COLUMN_LABELS,
} from "@/lib/constants/grade";
import type { GradesColumnFilters, GradesColumnKey, GradesColumnOptions } from "@/lib/types";
import type { SortDir } from "@/lib/table-sort";

function labelsFromSet(
  set: Set<string>,
  opts: { value: string; label: string }[]
): string {
  if (set.size === 0) return GRADES_FILTER_SUMMARY_EMPTY_SELECTION;
  return [...set]
    .map((val) => opts.find((o) => o.value === val)?.label ?? val)
    .join(", ");
}

function buildGradesFilterSummaryLines(
  filters: GradesColumnFilters,
  options: GradesColumnOptions
): string[] {
  const lines: string[] = [];
  const labels = GRADES_TABLE_COLUMN_LABELS;
  for (const key of Object.keys(labels) as GradesColumnKey[]) {
    const applied = filters[key];
    if (applied !== null) {
      lines.push(`${labels[key]}: ${labelsFromSet(applied, options[key] ?? [])}`);
    }
  }
  return lines;
}

function formatGradesTableSortSummary(
  sort: { key: GradesColumnKey; dir: SortDir } | null
): string | null {
  if (!sort) return null;
  const label = GRADES_TABLE_COLUMN_LABELS[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${label} (${dirPt})`;
}

export { labelsFromSet, buildGradesFilterSummaryLines, formatGradesTableSortSummary };