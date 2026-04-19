import {
    IMPORT_DETAIL_TAB_DEFS,
  IMPORTS_COLUMN_LABELS,
  IMPORTS_FILTER_SUMMARY_EMPTY_SELECTION,
} from "@/lib/constants";
import type {
  ColumnOptions,
  ImportDetailTabWithCount,
  ImportsColumnKey,
  ImportsFilters,
  Tab,
} from "@/lib/types";
import type { SortDir } from "@/lib/table-sort";




const createLabelMap = (opts: { value: string; label: string }[]) =>
  new Map(opts.map((o) => [o.value, o.label]));

const labelsFromSet = (set: Set<string>, map: Map<string, string>): string =>
  !set.size
    ? IMPORTS_FILTER_SUMMARY_EMPTY_SELECTION
    : [...set].map((v) => map.get(v) ?? v).join(", ");

function buildImportsFilterSummaryLines(
  filters: ImportsFilters,
  options: ColumnOptions<ImportsColumnKey>
): string[] {
  const lines: string[] = [];

  for (const key of Object.keys(IMPORTS_COLUMN_LABELS) as ImportsColumnKey[]) {
    const applied = filters[key];

    if (applied !== null) {
      const map = createLabelMap(options[key] ?? []);
      lines.push(`${IMPORTS_COLUMN_LABELS[key]}: ${labelsFromSet(applied, map)}`);
    }
  }

  return lines;
}

function formatImportsSortSummary(
  sort: { key: ImportsColumnKey; dir: SortDir } | null
): string | null {
  if (!sort) return null;

  const label = IMPORTS_COLUMN_LABELS[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";

  return `${label} (${dirPt})`;
}

function buildImportDetailTabs(
    counts: Record<Tab, number>
  ): ImportDetailTabWithCount[] {
    return IMPORT_DETAIL_TAB_DEFS.map((def) => ({
      ...def,
      count: counts[def.id as Tab],
    }));
  }
  
export {
  importsListColumnSortKind,
  sortImportListRows,
} from "./imports-list-table";

export {
  buildImportsFilterSummaryLines,
  formatImportsSortSummary,
  buildImportDetailTabs,
};