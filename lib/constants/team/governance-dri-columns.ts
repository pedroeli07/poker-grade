import type { GovernanceDriColKey, GovernanceDriSortKey } from "@/lib/types/team/governance-dri-matrix";
import type { ColumnSortKind } from "@/lib/types/dataTable";

export const GOVERNANCE_DRI_COL_LABEL: Record<GovernanceDriColKey, string> = {
  area: "Área",
  responsible: "Responsável (DRI)",
  rules: "Regras de escalação",
};

export const GOVERNANCE_DRI_TABLE_SORT_LABEL: Record<GovernanceDriSortKey, string> = {
  area: "Área",
  responsible: "Responsável (DRI)",
  rules: "Regras de escalação",
};

type HeadCol = {
  id: string;
  width: string;
  label: string;
  filterCol: GovernanceDriColKey | null;
  sortKey: GovernanceDriSortKey | null;
  sortKind: ColumnSortKind | null;
  headCellClassName?: string;
};

export const GOVERNANCE_DRI_TABLE_HEAD_COLUMNS: HeadCol[] = [
  {
    id: "dri-area",
    width: "w-[18%] min-w-[120px]",
    label: "Área",
    filterCol: "area",
    sortKey: "area",
    sortKind: "string",
  },
  {
    id: "dri-resp",
    width: "w-[24%] min-w-[200px]",
    label: "Responsável (DRI)",
    filterCol: "responsible",
    sortKey: "responsible",
    sortKind: "string",
  },
  {
    id: "dri-rules",
    width: "min-w-0 w-auto",
    label: "Regras de escalação",
    filterCol: "rules",
    sortKey: "rules",
    sortKind: "string",
  },
  {
    id: "dri-actions",
    width: "w-[120px]",
    label: "",
    filterCol: null,
    sortKey: null,
    sortKind: null,
    headCellClassName: "text-right",
  },
];
