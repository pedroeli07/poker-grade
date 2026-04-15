import {
  pillClass,
  roiClass,
  statBadgeAmber,
  statBadgeEmerald,
  statBadgeMuted,
  statBadgeRed,
} from "@/lib/constants/classes";
import {
  PLAYERS_TABLE_FP_ATTENTION_THRESHOLD,
  PLAYERS_TABLE_FT_LOW_THRESHOLD,
} from "@/lib/constants/player/players-table-ui";

export function formatPlayersTableRoiPercent(roi: number): string {
  return `${roi.toFixed(1)}%`;
}

/** Classes do badge de ROI na tabela de jogadores (mesmas faixas que o componente original). */
export function playersTableRoiBadgeClassNames(roi: number): string {
  if (roi < -40) return `${roiClass} ${statBadgeRed}`;
  if (roi < -20) return `${roiClass} ${statBadgeAmber}`;
  if (roi >= 0) return `${roiClass} ${statBadgeEmerald}`;
  return `${roiClass} ${statBadgeMuted}`;
}

export function playersTableRoiDisplayText(roi: number): string {
  const pct = formatPlayersTableRoiPercent(roi);
  if (roi >= 0) return `+${pct}`;
  return pct;
}

export function playersTableFpTenDayClassName(value: number): string {
  return `${pillClass} ${
    value > PLAYERS_TABLE_FP_ATTENTION_THRESHOLD ? statBadgeAmber : statBadgeEmerald
  }`;
}

export function playersTableFtTenDayClassName(value: number): string {
  return `${pillClass} ${
    value < PLAYERS_TABLE_FT_LOW_THRESHOLD ? statBadgeRed : statBadgeEmerald
  }`;
}

export function deletePlayerActionErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message === "FORBIDDEN") {
    return "Sem permissão para excluir este jogador.";
  }
  if (err instanceof Error && err.message === "NOT_FOUND") {
    return "Jogador não encontrado.";
  }
  return "Não foi possível excluir. Tente novamente.";
}
