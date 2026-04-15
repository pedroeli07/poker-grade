import type { PlayerStatus } from "@prisma/client";

/** Limiar FP 10d acima do qual o badge fica “atenção” (âmbar). */
export const PLAYERS_TABLE_FP_ATTENTION_THRESHOLD = 8;

/** Limiar FT 10d abaixo do qual o badge fica vermelho. */
export const PLAYERS_TABLE_FT_LOW_THRESHOLD = 8;

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
