import type { ReactNode } from "react";
import type { SortDir } from "@/lib/table-sort";

export type FilteredColumnTitleProps = { active: boolean; children: ReactNode };
export type DataTableToolbarProps = {
  showingLabel?: string;
  filteredCount: number;
  totalCount: number;
  entityLabels: [string, string];
  hasActiveView: boolean;
  anyFilter: boolean;
  sortSummary: string | null;
  filterSummaryLines: string[];
  onClear: () => void;
  clearButtonLabel?: string;
  filterChipsSectionTitle?: string;
};
export type DataTableShellProps = { hasActiveView: boolean; children: ReactNode; className?: string };

export type ColumnSortKind = "number" | "string" | "date";
export type ColumnSortState<K extends string> = { key: K; dir: SortDir } | null;
export type ColumnSortToggle<K extends string> = (key: K, kind: ColumnSortKind) => void;
export type ColumnSortButtonProps<K extends string> = {
  columnKey: K;
  sort: ColumnSortState<K>;
  toggleSort: ColumnSortToggle<K>;
  kind: ColumnSortKind;
  label: string;
};
