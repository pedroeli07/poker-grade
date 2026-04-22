import type { GovernanceDecisionColKey, GovernanceDecisionSortKey } from "@/lib/types/team/governance-historical";
import type { ColumnSortKind } from "@/lib/types/dataTable";

export const GOVERNANCE_DECISION_COL_LABEL: Record<GovernanceDecisionColKey, string> = {
  area: "Área",
  status: "Status",
  visibility: "Visibilidade",
  author: "Autor",
  tag: "Tag",
};

/** Popovers de filtro no modo cards (id, chave, rótulo no botão). */
export const GOVERNANCE_CARD_FILTER_COLUMNS: [string, GovernanceDecisionColKey, string][] = [
  ["governance-hist-f-area", "area", "Área"],
  ["governance-hist-f-status", "status", "Status"],
  ["governance-hist-f-vis", "visibility", "Visibilidade"],
  ["governance-hist-f-auth", "author", "Autor"],
  ["governance-hist-f-tag", "tag", "Tag"],
];

export const GOVERNANCE_TABLE_SORT_LABEL: Record<GovernanceDecisionSortKey, string> = {
  title: "Decisão",
  decidedAt: "Data",
  area: "Área",
  status: "Status",
  visibility: "Visibilidade",
  authorName: "Autor",
};

type HeadCol = {
  id: string;
  width: string;
  label: string;
  filterCol: GovernanceDecisionColKey | null;
  sortKey: GovernanceDecisionSortKey | null;
  sortKind: ColumnSortKind | null;
};

/** Cabeçalho da tabela: colunas, filtros e ordenação. */
export const GOVERNANCE_TABLE_HEAD_COLUMNS: HeadCol[] = [
  {
    id: "d-title",
    width: "w-[34%] min-w-[260px]",
    label: "Decisão",
    filterCol: null,
    sortKey: "title",
    sortKind: "string",
  },
  {
    id: "d-area",
    width: "w-[10%]",
    label: "Área",
    filterCol: "area",
    sortKey: "area",
    sortKind: "string",
  },
  {
    id: "d-when",
    width: "w-[9%] whitespace-nowrap",
    label: "Data",
    filterCol: null,
    sortKey: "decidedAt",
    sortKind: "date",
  },
  {
    id: "d-st",
    width: "w-[10%]",
    label: "Status",
    filterCol: "status",
    sortKey: "status",
    sortKind: "string",
  },
  {
    id: "d-vis",
    width: "w-[10%]",
    label: "Vis.",
    filterCol: "visibility",
    sortKey: "visibility",
    sortKind: "string",
  },
  {
    id: "d-auth",
    width: "w-[12%]",
    label: "Autor",
    filterCol: "author",
    sortKey: "authorName",
    sortKind: "string",
  },
  {
    id: "d-tags",
    width: "w-[9%]",
    label: "Tags",
    filterCol: "tag",
    sortKey: null,
    sortKind: null,
  },
];
