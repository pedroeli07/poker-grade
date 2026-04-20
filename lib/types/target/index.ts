import type { TargetStatus, TargetType } from "@prisma/client";
import type {
  TargetStatusConfig,
  TargetStatusKey,
} from "@/lib/constants/target";
import type { SortDir } from "@/lib/table-sort";
import type { PlayerRef, WithIdAndStatus } from "../primitives";
import type { TargetsColKey } from "../columnKeys";

/* =========================================================
 * 📦 DOMAIN TYPES (core do negócio)
 * ========================================================= */

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

  greenThreshold: number | null;
  yellowThreshold: number | null;

  createdAt: Date;
  updatedAt: Date;
};

export type TargetsPagePlayerOption = PlayerRef;

/* =========================================================
 * 🧠 UI / VIEW MODEL
 * ========================================================= */

export type TargetListViewModel = {
  id: string;
  name: string;
  category: string;
  playerId: string;
  playerName: string;

  textCurrent: string | null;
  textValue: string | null;

  statusConfig: TargetStatusConfig;

  hasLimitAction: boolean;
  limitActionLabel: string;
  limitActionColor: string;

  isNumeric: boolean;
  progressPercent: number;
  progressColor: string;

  progressCurrent: string | number;
  progressTotal: string | number;
  progressUnit: string | null;

  /** Barra no layout card */
  showCardProgressBar: boolean;

  /** Barra no layout tabela */
  showTableProgressBar: boolean;

  categoryLabel: string;
  coachNotes: string | null;
  coachNotesPreview: string;
  updatedAtLabel: string;
  updatedAtIso: string;
};

export type TargetSummaryCardData = {
  statusKey: TargetStatusKey;
  config: TargetStatusConfig;
  count: number;
  cardSurfaceClass: string;
};

/* =========================================================
 * 📊 STATE / UI CONTROL
 * ========================================================= */

export type TargetsTableSortState = {
  key: TargetsColKey;
  dir: SortDir;
} | null;

export type TargetsSummaryInput = {
  onTrack: number;
  attention: number;
  offTrack: number;
};


export type TargetsPageProps = {
  rows: TargetListRow[];
  players: TargetsPagePlayerOption[];
  canCreate: boolean;
  summary: { onTrack: number; attention: number; offTrack: number };
  /** Jogador só vê os próprios targets — sem filtro por jogador. */
  isPlayer: boolean;
};

export interface NewTargetModalProps {
  players: PlayerRef[];
}

export interface EditTargetModalProps {
  target: TargetListRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type { TargetsColKey, TargetsFilters, TargetsColumnOptions } from "../columnKeys";
