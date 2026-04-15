import type { ReactNode } from "react";

/** Título de coluna com destaque quando o filtro da coluna está ativo. */
export type FilteredColumnTitleProps = {
  active: boolean;
  children: ReactNode;
};

export type DataTableToolbarProps = {
  /** Texto antes dos números, ex.: "Mostrando" */
  showingLabel?: string;
  filteredCount: number;
  totalCount: number;
  /** Singular e plural da entidade, ex.: ["jogador", "jogadores"] */
  entityLabels: [string, string];
  hasActiveView: boolean;
  anyFilter: boolean;
  sortSummary: string | null;
  filterSummaryLines: string[];
  onClear: () => void;
  clearButtonLabel?: string;
  /** Título da secção de chips (ex.: "Valores filtrados") */
  filterChipsSectionTitle?: string;
};

export type DataTableShellProps = {
  hasActiveView: boolean;
  children: ReactNode;
  className?: string;
};
