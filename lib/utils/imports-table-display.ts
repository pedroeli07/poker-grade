import type {
  ColumnOptions,
  ImportsColumnKey,
  ImportsFilters,
} from "@/lib/types";
import { IMPORTS_COLUMN_LABELS } from "@/lib/constants";
import type { SortDir } from "@/lib/table-sort";

function labelsFromSet(
  set: Set<string>,
  opts: { value: string; label: string }[]
): string {
  if (set.size === 0) return "(nenhum valor selecionado)";
  return [...set]
    .map((val) => opts.find((o) => o.value === val)?.label ?? val)
    .join(", ");
}

export function buildImportsFilterSummaryLines(
  filters: ImportsFilters,
  options: ColumnOptions<ImportsColumnKey>
): string[] {
  const lines: string[] = [];
  (Object.keys(IMPORTS_COLUMN_LABELS) as ImportsColumnKey[]).forEach((key) => {
    const applied = filters[key];
    if (applied !== null) {
      lines.push(`${IMPORTS_COLUMN_LABELS[key]}: ${labelsFromSet(applied, options[key] ?? [])}`);
    }
  });
  return lines;
}

export function formatImportsSortSummary(
  sort: { key: ImportsColumnKey; dir: SortDir } | null
): string | null {
  if (!sort) return null;
  const label = IMPORTS_COLUMN_LABELS[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${label} (${dirPt})`;
}
