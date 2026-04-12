import type { PlayerRef, WithId } from "./primitives";

export type SharkscopeAnalyticsPeriod = "30d" | "90d";
export type SharkscopeAnalyticsTab = "site" | "ranking" | "tier" | "bounty";

type BaseStat = { roi: number | null; profit: number | null; count: number | null };

export type NetworkStat = BaseStat & {
  network: string;
  label: string;
  /** ROI ponderado por volume: Σ(ROI×Count)/Σ(Count) entre nicks da rede. */
  roiWeighted: number | null;
  /** Stake agregado (torneios Player Group); 0 se dados legados por nick. */
  stake?: number;
  itm?: number | null;
  earlyFinish?: number | null;
  lateFinish?: number | null;
};

/** Dados extra para aba Por site: breakdown por jogador (cache v2). */
export type SiteAnalyticsPayload = {
  playersWithSiteData: { id: string; name: string }[];
  byPlayerId: Record<string, NetworkStat[]>;
  hasPerPlayerBreakdown: boolean;
};

export type TierStat = BaseStat & {
  tier: "Low" | "Mid" | "High";
  players: number;
  roiWeighted: number | null;
};

export type TypeStat = BaseStat & {
  type: "Bounty" | "Vanilla" | "Satellite";
  roiWeighted: number | null;
};

export type RankingEntry = {
  player: PlayerRef;
  /** TotalROI (SharkScope) */
  roi: number;
  /** Inscrições (Entries); não usar Count de outro slice de filtro */
  entries: number | null;
  profit: number | null;
  itm: number | null;
  /** Capacidade — stat API `Ability` (UI “Capacidade”), típico 0–100 */
  ability: number | null;
  avStake: number | null;
  earlyFinish: number | null;
  lateFinish: number | null;
};

export type SharkscopeAlertRow = WithId & {
  playerId: string;
  alertType: string;
  severity: string;
  metricValue: number;
  threshold: number;
  context: unknown;
  triggeredAt: string;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  player: PlayerRef;
};

export type SharkscopeAlertFilters = {
  severity: string;
  alertType: string;
  ack: string;
};

export type ScoutingSearchStats = {
  roi: number | null;
  profit: number | null;
  count: number | null;
  abi: number | null;
  entrants: number | null;
};

export type ScoutingAnalysisRow = WithId & {
  nick: string;
  network: string;
  rawData: unknown;
  nlqAnswer: unknown;
  notes: string | null;
  createdAt: string;
  savedBy: string;
};

export type SharkScopeResponse<T = unknown> = {
  Response: {
    "@success": "true" | "false";
    "@error"?: string;
    RemainingSearches?: number;
    PlayerResponse?: T;
    [key: string]: unknown;
  };
};
