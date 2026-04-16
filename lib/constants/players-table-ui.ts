import type { PlayerStatus } from "@prisma/client";
import type { PlayersTableSortKey } from "@/lib/types/player";

/** Labels da ordenação (resumo no topo da tabela). */
export const PLAYERS_TABLE_SORT_LABELS: Record<PlayersTableSortKey, string> = {
  name: "Nome",
  email: "E-mail",
  nicks: "Nicks",
  playerGroup: "Grupo Shark",
  coachLabel: "Coach",
  gradeLabel: "Grade",
  abiNumericValue: "ABI",
  roiTenDay: "ROI (10d)",
  fpTenDay: "FP (10d)",
  ftTenDay: "FT (10d)",
  status: "Status",
};

/** Limiar FP 10d acima do qual o badge fica “atenção” (âmbar). */
export const PLAYERS_TABLE_FP_ATTENTION_THRESHOLD = 8;

/** Limiar FT 10d abaixo do qual o badge fica vermelho. */
export const PLAYERS_TABLE_FT_LOW_THRESHOLD = 8;

/** Faixas de ROI (%) para cor do badge na tabela (abaixo de `softNegative` e ≥0: cores distintas). */
export const PLAYERS_TABLE_ROI_BADGE_THRESHOLDS = {
  strongNegative: -40,
  softNegative: -20,
} as const;

export const PLAYER_TABLE_STATUS_LABEL: Record<PlayerStatus, string> = {
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  INACTIVE: "Inativo",
};

export const PLAYER_TABLE_STATUS_ACTIVE_BADGE_CLASS =
  "shadow-lg shadow-emerald-500 glow-success h-8 shrink-0 border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0 text-[13px] leading-none text-emerald-500 hover:bg-emerald-500/20";

export const PLAYER_TABLE_STATUS_SUSPENDED_BADGE_CLASS =
  "h-8 shrink-0 border-amber-500/25 bg-amber-500/10 px-1.5 py-0 text-[13px] leading-none text-amber-700";

export const PLAYER_TABLE_STATUS_INACTIVE_BADGE_CLASS =
  "h-6 shrink-0 px-1.5 py-0 text-[13px] leading-none";
