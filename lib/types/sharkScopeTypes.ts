import type { PlayerRef, WithId } from "./primitives";

export type SharkscopeAnalyticsPeriod = "30d" | "90d";
export type SharkscopeAnalyticsTab = "site" | "ranking" | "tier" | "bounty";

/** `entries` = inscrições SharkScope (Entries), soma de entradas incl. rebuys; fallback Count no ingest se Entries não vier. */
type BaseStat = { roi: number | null; profit: number | null; entries: number | null };

export type NetworkStat = BaseStat & {
  network: string;
  label: string;
  /** ROI ponderado por volume: Σ(ROI×Entries)/Σ(Entries) entre nicks da rede. */
  roiWeighted: number | null;
  /** Stake agregado (torneios Player Group); 0 se dados legados por nick. */
  stake?: number;
  itm?: number | null;
  /** Stat API `Ability` (cache statistics); null no breakdown só por torneios. */
  ability?: number | null;
  /** ABI médio: API `AvStake` ponderado ou stake/inscrições no agregado por torneio. */
  avStake?: number | null;
  earlyFinish?: number | null;
  lateFinish?: number | null;
};

/** Dados extra para aba Por site: breakdown por jogador (cache v2). */
export type SiteAnalyticsPayload = {
  playersWithSiteData: { id: string; name: string }[];
  byPlayerId: Record<string, NetworkStat[]>;
  hasPerPlayerBreakdown: boolean;
};

export type StakeTierKey = "micro" | "low" | "lowMid" | "mid" | "high";

export type TierStat = BaseStat & {
  tier: StakeTierKey;
  /** Rótulo do tier (ex.: Micro Stakes (até $10)). */
  label: string;
  /** N.º de grupos SharkScope únicos neste bucket (métrica interna; não coluna da tabela Por tier). */
  players: number;
  roiWeighted: number | null;
  itm: number | null;
  ability: number | null;
  avStake: number | null;
  earlyFinish: number | null;
  lateFinish: number | null;
};

export type TypeStat = BaseStat & {
  type: "Bounty" | "Vanilla" | "Satellite";
  /** Igual a `roi`; reservado para compat (gráfico / ordenações antigas). */
  roiWeighted: number | null;
  itm: number | null;
  /** Da API quando existir; agregados sintéticos por torneio costumam não ter Ability. */
  ability: number | null;
  avStake: number | null;
  earlyFinish: number | null;
  lateFinish: number | null;
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

/** Modos de `runDailySyncSharkScope` — ver JSDoc em `lib/sharkscope/run-daily-sync.ts`. */
export type SharkScopeSyncMode = "full" | "light" | "players" | "analytics" | "analytics_nick";

export type SharkscopeSyncJson = {
  ok?: boolean;
  processed?: number;
  errors?: number;
  sharkHttpCalls?: number;
  remainingSearches?: number | null;
  cancelled?: boolean;
  error?: string;
};