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

export type ScoutingSearchStats = {
  roi: number | null;
  profit: number | null;
  count: number | null;
  abi: number | null;
  entrants: number | null;
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

export type DailySyncSharkScopeResult = {
  processed: number;
  errors: number;
  sharkHttpCalls: number;
  remainingSearches: number | null;
  ts: string;
  cancelled?: boolean;
  syncMode?: SharkScopeSyncMode;
};

export type RunDailySyncOptions = {
  signal?: AbortSignal;
  /**
   * Sincroniza só este `playerGroup`. Com `syncMode: "analytics"`, pula stats por nick×rede.
   * Com `analytics_nick`, mantém statistics do grupo + nick×rede **só** para jogadores deste grupo.
   */
  onlyPlayerGroup?: string;
  /**
   * `players` — só `Date:10D` (o que a tabela de jogadores lê); sem 30d/90d ou CT.
   * `analytics` — 30d/90d + CT + breakdown; **não** refaz `Date:10D` (evita duplicar o botão de jogadores). Não pede `statistics` lifetime (poupa buscas).
   * `analytics_nick` — 30d/90d por Player Group + `statistics` por nick×rede; **sem** `completedTournaments` (poupa buscas vs `analytics`).
   * `light` — 10d/30d/90d, sem CT. Não pede lifetime.
   * `full` — 10d/30d/90d + CT + breakdown por tipo. Não pede lifetime.
   */
  syncMode?: SharkScopeSyncMode;
};

/** Agregação por rede (time ou jogador): lucro, investimento total (buy-in+rake), volume e contadores ITM/FP/FT. */
export type NetworkAggBucket = {
  profit: number;
  /** Soma de buy-in por linha (incl. rake); denominador do ROI. */
  stake: number;
  entries: number;
  itmHits: number;
  earlyHits: number;
  lateHits: number;
};

/** Torneio individual extraído de completedTournaments — suficiente para agregar qualquer janela localmente. */
export type TournamentRow = {
  /** Unix timestamp em segundos (vem de `@date`). */
  date: number;
  network: string;
  /** Chave normalizada do app (gg, pokerstars, …) — null se rede desconhecida. */
  networkKey: string | null;
  stake: number;
  rake: number;
  /** Buy-in total por linha (stake+rake ou nível entrada); usado no denominador do ROI. */
  investment: number;
  /** Lucro líquido da linha (preferir `@profit` na API quando existir). */
  prize: number;
  position: number;
  entrants: number;
  playerName: string;
  /** Flags brutas: "B,SAT,ME" etc. */
  flags: string;
  /** Classificação derivada de `@flags`: bounty | satellite | vanilla. */
  tournamentType: "bounty" | "satellite" | "vanilla";
  gameClass: string;
  tournamentId: string;
};

/** Payload v3 inclui `tournaments` (array de `TournamentRow`) para filtragem local. */
export type GroupSiteBreakdownPayloadV3 = {
  v: 3;
  groupName: string;
  filterBody: string;
  pagesFetched: number;
  tournamentRows: number;
  byNetwork: Record<string, NetworkAggBucket>;
  byPlayerNick?: Record<string, Record<string, NetworkAggBucket>>;
  tournaments: TournamentRow[];
};

/** Payload gravado em `SharkScopeCache.rawData` para `group_site_breakdown_*`. */
export type GroupSiteBreakdownPayload =
  | {
      v: 1 | 2;
      groupName: string;
      filterBody: string;
      pagesFetched: number;
      tournamentRows: number;
      byNetwork: Record<string, NetworkAggBucket>;
      byPlayerNick?: Record<string, Record<string, NetworkAggBucket>>;
    }
  | GroupSiteBreakdownPayloadV3;


/** Assinatura de `sharkScopeGet` — injetável em sync (contagem de calls / tests). */
export type SharkScopeGetFn = <T = unknown>(
  path: string,
  init?: { signal?: AbortSignal }
) => Promise<SharkScopeResponse<T>>;

export type PlayerLite = { id: string; name: string; nickname: string | null };

export type NickUpsertPlan = {
  playerId: string;
  playerName: string;
  sharkKey: string;
  network: string;
  nick: string;
};
