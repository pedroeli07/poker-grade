import type { NetworkAggBucket, TournamentRow } from "@/lib/types/sharkscope/completed-tournaments";

export type AggregateCompletedTournamentsFullResult = {
  byNetwork: Map<string, NetworkAggBucket>;
  byPlayer: Map<string, Map<string, NetworkAggBucket>>;
  tournamentRows: number;
  rows: TournamentRow[];
  skippedUnknownNetworks: Map<string, number>;
};

export type AggregateRowsResult = {
  byNetwork: Map<string, NetworkAggBucket>;
  byPlayer: Map<string, Map<string, NetworkAggBucket>>;
  totals: NetworkAggBucket;
};

export type ComputeStatsFromRowsResult = {
  count: number;
  entries: number;
  totalProfit: number;
  totalStake: number;
  totalRoi: number | null;
  itm: number | null;
  earlyFinish: number | null;
  lateFinish: number | null;
  avStake: number | null;
};

export type FilterTournamentRowsOpts = {
  afterTimestamp?: number;
  beforeTimestamp?: number;
  tournamentType?: TournamentRow["tournamentType"];
};
