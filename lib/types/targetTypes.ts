import type { TargetStatus, TargetType } from "@prisma/client";
import type { SortDir } from "@/lib/table-sort";
import type { ColKey } from "./columnKeys";
import type { PlayerRef, WithIdAndStatus } from "./primitives";

/** Ordenação da tabela de targets (UI). */
export type TargetsTableSortState = { key: ColKey; dir: SortDir } | null;

/** Contagens por estado para cards de resumo na página de targets. */
export type TargetsSummaryInput = {
  onTrack: number;
  attention: number;
  offTrack: number;
};

export type TargetLimitAction = "UPGRADE" | "MAINTAIN" | "DOWNGRADE" | null;

export type TargetListRow = WithIdAndStatus<TargetStatus> & {
  name: string;
  category: string;
  playerId: string;
  playerName: string;
  targetType: TargetType;
  limitAction: TargetLimitAction;
  numericValue: number | null;
  numericCurrent: number | null;
  textValue: string | null;
  textCurrent: string | null;
  unit: string | null;
  coachNotes: string | null;
};

export type TargetsPagePlayerOption = PlayerRef;
