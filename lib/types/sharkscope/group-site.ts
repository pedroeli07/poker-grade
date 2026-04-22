import type { NetworkAggBucket, TournamentRow } from "@/lib/types/sharkscope/completed-tournaments";
import type { SharkScopeGetFn } from "@/lib/types/sharkscope/group-sync";

/** Opções de `paginatePlayerGroupCompletedTournaments` (Player Group + `completedTournaments`). */
export type PlayerGroupCompletedTournamentsPaginateOpts = {
  groupName: string;
  filterBody: string;
  fetchFn: SharkScopeGetFn;
  signal?: AbortSignal;
  collectRows: boolean;
};

export type PlayerGroupCompletedTournamentsPaginateResult = {
  merged: Map<string, NetworkAggBucket>;
  mergedPlayer: Map<string, Map<string, NetworkAggBucket>>;
  mergedSkippedUnknown: Map<string, number>;
  pagesFetched: number;
  tournamentRowsTotal: number;
  lastPageTournamentRows: number;
  rows: TournamentRow[];
};

/** Resultado agregado após paginar 90d (antes de montar payload v3). */
export type GroupSiteFetch90dResult = {
  allRows: TournamentRow[];
  merged: Map<string, NetworkAggBucket>;
  mergedPlayer: Map<string, Map<string, NetworkAggBucket>>;
  pagesFetched: number;
  tournamentRowsTotal: number;
};
