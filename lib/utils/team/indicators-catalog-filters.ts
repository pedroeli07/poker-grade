import { distinctOptions } from "@/lib/utils/distinct-options";
import type { TeamIndicatorDTO } from "@/lib/data/team/indicators-page";
import {
  formatIndicatorMeta,
  indicatorFrequencyLabel,
  INDICATOR_RESULT_TYPE_LABEL,
  INDICATOR_RESULT_OUTCOME,
  INDICATOR_RESULT_PROCESS,
} from "@/lib/constants/team/indicators-catalog-ui";
import {
  INDICATOR_CATALOG_COL_LABEL,
  INDICATOR_CATALOG_TABLE_SORT_LABEL,
} from "@/lib/constants/team/indicators-catalog-columns";
import type {
  IndicatorCatalogColumnFilters,
  IndicatorCatalogColumnOptions,
  IndicatorCatalogSortKey,
} from "@/lib/types/team/indicators-catalog-list";
import type { SortDir } from "@/lib/table-sort";
import { compareNumber, compareString } from "@/lib/table-sort";

const EMPTY_RESPONSIBLE = "__empty__";
const EMPTY_GLOSSARY = "__empty__";
const LINK_NONE = "__none__";
const LINK_HAS = "__has__";

function metaFilterValue(row: TeamIndicatorDTO) {
  return formatIndicatorMeta(row.targetValue, row.unit);
}

function responsibleFilterValue(row: TeamIndicatorDTO) {
  return row.responsibleName?.trim() ? row.responsibleName.trim() : EMPTY_RESPONSIBLE;
}

function glossaryFilterValue(row: TeamIndicatorDTO) {
  return row.glossary?.trim() ? row.glossary.trim() : EMPTY_GLOSSARY;
}

function linkFilterValue(row: TeamIndicatorDTO) {
  return row.sourceUrl?.trim() ? LINK_HAS : LINK_NONE;
}

export function buildIndicatorCatalogColumnOptions(
  rows: TeamIndicatorDTO[],
): IndicatorCatalogColumnOptions {
  const name = distinctOptions(rows, (r) => ({ value: r.name, label: r.name }));
  const resultType = [
    { value: INDICATOR_RESULT_PROCESS, label: INDICATOR_RESULT_TYPE_LABEL[INDICATOR_RESULT_PROCESS] },
    { value: INDICATOR_RESULT_OUTCOME, label: INDICATOR_RESULT_TYPE_LABEL[INDICATOR_RESULT_OUTCOME] },
  ];
  const definition = distinctOptions(rows, (r) => ({
    value: r.definition || "—",
    label: r.definition || "—",
  }));
  const dataSource = distinctOptions(rows, (r) => ({ value: r.dataSource, label: r.dataSource }));
  const responsibleOpts = distinctOptions(rows, (r) => {
    const v = responsibleFilterValue(r);
    const label = v === EMPTY_RESPONSIBLE ? "—" : v;
    return { value: v, label };
  });
  const meta = distinctOptions(rows, (r) => ({ value: metaFilterValue(r), label: metaFilterValue(r) }));
  const freqMap = new Map<string, string>();
  for (const r of rows) {
    if (!freqMap.has(r.frequency)) freqMap.set(r.frequency, indicatorFrequencyLabel(r.frequency));
  }
  const frequency = [...freqMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }))
    .map(([value, label]) => ({ value, label }));
  const autoAction = distinctOptions(rows, (r) => ({ value: r.autoAction, label: r.autoAction }));
  const glossaryOpts = distinctOptions(rows, (r) => {
    const v = glossaryFilterValue(r);
    const label = v === EMPTY_GLOSSARY ? "—" : v;
    return { value: v, label };
  });
  const link = [
    { value: LINK_NONE, label: "Sem link" },
    { value: LINK_HAS, label: "Com link" },
  ];
  return {
    name,
    resultType,
    definition,
    dataSource,
    responsibleName: responsibleOpts,
    meta,
    frequency,
    autoAction,
    glossary: glossaryOpts,
    link,
  };
}

export function filterIndicatorCatalogRows(
  rows: TeamIndicatorDTO[],
  search: string,
  filters: IndicatorCatalogColumnFilters,
): TeamIndicatorDTO[] {
  const q = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (q) {
      const blob = [
        row.name,
        row.definition,
        row.dataSource,
        row.responsibleName ?? "",
        row.glossary ?? "",
        row.autoAction,
        metaFilterValue(row),
        indicatorFrequencyLabel(row.frequency),
        INDICATOR_RESULT_TYPE_LABEL[row.resultType] ?? row.resultType,
      ]
        .join(" ")
        .toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (filters.name && !filters.name.has(row.name)) return false;
    if (filters.resultType && !filters.resultType.has(row.resultType)) return false;
    if (filters.definition) {
      const dv = row.definition || "—";
      if (!filters.definition.has(dv)) return false;
    }
    if (filters.dataSource && !filters.dataSource.has(row.dataSource)) return false;
    if (filters.responsibleName && !filters.responsibleName.has(responsibleFilterValue(row))) {
      return false;
    }
    if (filters.meta && !filters.meta.has(metaFilterValue(row))) return false;
    if (filters.frequency && !filters.frequency.has(row.frequency)) return false;
    if (filters.autoAction && !filters.autoAction.has(row.autoAction)) return false;
    if (filters.glossary && !filters.glossary.has(glossaryFilterValue(row))) return false;
    if (filters.link && !filters.link.has(linkFilterValue(row))) return false;
    return true;
  });
}

export function sortIndicatorCatalogRows(
  rows: TeamIndicatorDTO[],
  sort: { key: IndicatorCatalogSortKey; dir: SortDir } | null,
): TeamIndicatorDTO[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "name":
        return compareString(a.name, b.name, dir);
      case "resultType":
        return compareString(a.resultType, b.resultType, dir);
      case "definition":
        return compareString(a.definition ?? "", b.definition ?? "", dir);
      case "dataSource":
        return compareString(a.dataSource, b.dataSource, dir);
      case "responsibleName":
        return compareString(a.responsibleName ?? "", b.responsibleName ?? "", dir);
      case "targetValue":
        return compareNumber(a.targetValue, b.targetValue, dir);
      case "frequency":
        return compareString(a.frequency, b.frequency, dir);
      case "autoAction":
        return compareString(a.autoAction, b.autoAction, dir);
      case "glossary":
        return compareString(a.glossary ?? "", b.glossary ?? "", dir);
      default:
        return 0;
    }
  });
  return copy;
}

export function buildIndicatorCatalogFilterSummaryLines(
  options: IndicatorCatalogColumnOptions,
  applied: IndicatorCatalogColumnFilters,
): string[] {
  const lines: string[] = [];
  for (const key of Object.keys(INDICATOR_CATALOG_COL_LABEL) as (keyof IndicatorCatalogColumnOptions)[]) {
    const set = applied[key];
    if (set === null || set.size === 0) continue;
    const opts = options[key] ?? [];
    const parts = [...set].map((val) => opts.find((o) => o.value === val)?.label ?? val);
    const label = INDICATOR_CATALOG_COL_LABEL[key];
    lines.push(`${label}: ${parts.join(", ")}`);
  }
  return lines;
}

export function formatIndicatorCatalogSortSummary(
  sort: { key: IndicatorCatalogSortKey; dir: SortDir } | null,
): string | null {
  if (!sort) return null;
  const l = INDICATOR_CATALOG_TABLE_SORT_LABEL[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${l} (${dirPt})`;
}
