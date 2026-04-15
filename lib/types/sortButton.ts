import type { SortDir } from "@/lib/table-sort";

/** Tipo de coluna para `nextSortState` (direção inicial ao primeiro clique). */
export type ColumnSortKind = "number" | "string" | "date";

export type ColumnSortState<K extends string> = { key: K; dir: SortDir } | null;

export type ColumnSortToggle<K extends string> = (key: K, kind: ColumnSortKind) => void;

export type ColumnSortButtonProps<K extends string> = {
  columnKey: K;
  sort: ColumnSortState<K>;
  toggleSort: ColumnSortToggle<K>;
  kind: ColumnSortKind;
  /** Texto para `aria-label` (ex.: "nome", "ROI 10d"). */
  label: string;
};
