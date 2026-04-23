import type { IndicatorCatalogColKey, IndicatorCatalogSortKey } from "@/lib/types/team/indicators-catalog-list";
import type { ColumnSortKind } from "@/lib/types/dataTable";

export const INDICATOR_CATALOG_COL_LABEL: Record<IndicatorCatalogColKey, string> = {
  name: "Nome",
  resultType: "Tipo",
  definition: "Fórmula",
  dataSource: "Fonte",
  responsibleName: "DRI",
  meta: "Meta",
  frequency: "Frequência",
  autoAction: "Ação",
  glossary: "Glossário",
  link: "Link",
};

export const INDICATOR_CATALOG_TABLE_SORT_LABEL: Record<IndicatorCatalogSortKey, string> = {
  name: "Nome",
  resultType: "Tipo",
  definition: "Fórmula",
  dataSource: "Fonte",
  responsibleName: "DRI",
  targetValue: "Meta",
  frequency: "Frequência",
  autoAction: "Ação",
  glossary: "Glossário",
};

type HeadCol = {
  id: string;
  width: string;
  label: string;
  filterCol: IndicatorCatalogColKey | null;
  sortKey: IndicatorCatalogSortKey | null;
  sortKind: ColumnSortKind | null;
};

export const INDICATOR_CATALOG_TABLE_HEAD_COLUMNS: HeadCol[] = [
  {
    id: "i-name",
    width: "w-[16%] min-w-[180px]",
    label: "Nome",
    filterCol: "name",
    sortKey: "name",
    sortKind: "string",
  },
  {
    id: "i-type",
    width: "w-[9%] min-w-[96px]",
    label: "Tipo",
    filterCol: "resultType",
    sortKey: "resultType",
    sortKind: "string",
  },
  {
    id: "i-def",
    width: "w-[18%] min-w-[200px]",
    label: "Fórmula",
    filterCol: "definition",
    sortKey: "definition",
    sortKind: "string",
  },
  {
    id: "i-src",
    width: "w-[10%] min-w-[112px]",
    label: "Fonte",
    filterCol: "dataSource",
    sortKey: "dataSource",
    sortKind: "string",
  },
  {
    id: "i-dri",
    width: "w-[9%] min-w-[100px]",
    label: "DRI",
    filterCol: "responsibleName",
    sortKey: "responsibleName",
    sortKind: "string",
  },
  {
    id: "i-meta",
    width: "w-[8%] min-w-[88px]",
    label: "Meta",
    filterCol: "meta",
    sortKey: "targetValue",
    sortKind: "number",
  },
  {
    id: "i-freq",
    width: "w-[9%] min-w-[96px]",
    label: "Frequência",
    filterCol: "frequency",
    sortKey: "frequency",
    sortKind: "string",
  },
  {
    id: "i-act",
    width: "w-[11%] min-w-[120px]",
    label: "Ação",
    filterCol: "autoAction",
    sortKey: "autoAction",
    sortKind: "string",
  },
  {
    id: "i-gloss",
    width: "w-[14%] min-w-[180px]",
    label: "Glossário",
    filterCol: "glossary",
    sortKey: "glossary",
    sortKind: "string",
  },
  {
    id: "i-link",
    width: "w-[6%] min-w-[72px]",
    label: "Link",
    filterCol: "link",
    sortKey: null,
    sortKind: null,
  },
];
