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
