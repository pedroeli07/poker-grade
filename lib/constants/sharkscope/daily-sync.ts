import type { SharkScopeSyncMode } from "@/lib/types/sharkScopeTypes";

/** Tolerância ao comparar métricas de grupo vs média do time (alertas relativos). */
export const SHARKSCOPE_TEAM_METRIC_EPS = 0.05;

/** Flags derivadas do syncMode em `runDailySyncSharkScope`. */
export const DAILY_SYNC_MODE_FLAGS: Record<
  SharkScopeSyncMode,
  { stats10: boolean; stats3090: boolean; ct: boolean }
> = {
  players: { stats10: true, stats3090: false, ct: false },
  light: { stats10: true, stats3090: true, ct: false },
  analytics: { stats10: false, stats3090: true, ct: true },
  analytics_nick: { stats10: false, stats3090: true, ct: false },
  full: { stats10: true, stats3090: true, ct: true },
};

/** Tipos de torneio e filtros 30d/90d para o breakdown por CT. */
export const SHARKSCOPE_CT_TYPE_BREAKDOWN = [
  { type: "bounty" as const, f30: "Date:30D;Type:B", f90: "Date:90D;Type:B" },
  { type: "satellite" as const, f30: "Date:30D;Type:SAT", f90: "Date:90D;Type:SAT" },
  {
    type: "vanilla" as const,
    f30: "Date:30D;Type!:B;Type!:SAT",
    f90: "Date:90D;Type!:B;Type!:SAT",
  },
] as const;

export function dailySyncModeLogMessage(
  mode: SharkScopeSyncMode,
  groupName: string
): string | undefined {
  switch (mode) {
    case "analytics":
      return `[${groupName}] modo analytics: CT + stats 30d/90d; 10d não atualizado neste run.`;
    case "light":
      return `[${groupName}] sync leve: statistics 10d/30d/90d sem completedTournaments.`;
    case "players":
      return `[${groupName}] modo players: só Date:10D; sem lifetime/30d/90d/CT.`;
    case "analytics_nick":
      return `[${groupName}] modo analytics_nick: statistics 30d/90d; sem CT.`;
    default:
      return undefined;
  }
}
