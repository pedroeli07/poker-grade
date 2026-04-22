import type { Prisma } from "@prisma/client";
import type { SharkScopeSyncMode } from "@/lib/types/sharkScopeTypes";
import type { SharkScopeGetFn } from "@/lib/types/sharkscope/group-sync";

/** Tipos usados só em `run-daily-sync` (alertas relativos ao time). */
export type GroupTenDMetric = {
  groupName: string;
  memberIds: string[];
  roi: number | null;
  fp: number | null;
  ft: number | null;
};

/** Atualiza `remainingSearches` a partir da resposta SharkScope. */
export type TrackRemainingSearches = (raw: unknown) => void;

export type NickSiteStatisticsSyncOptions = {
  syncMode: SharkScopeSyncMode;
  onlyPlayerGroup: string | undefined;
  nickSyncPlayerIds: string[] | null;
  signal: AbortSignal | undefined;
  countedSharkScopeGet: SharkScopeGetFn;
  trackRemaining: TrackRemainingSearches;
  forceRefresh: boolean;
};

/** Jogador ativo com `playerGroup` (select usado no daily-sync). */
export type DailySyncPlayerRow = {
  id: string;
  name: string;
  playerGroup: string | null;
};

/** Estado partilhado pelo loop de grupos em `runDailySyncSharkScope`. */
export type DailySyncGroupLoopContext = {
  syncMode: SharkScopeSyncMode;
  need10: boolean;
  need3090: boolean;
  needCT: boolean;
  forceRefresh: boolean;
  signal: AbortSignal | undefined;
  countedSharkScopeGet: SharkScopeGetFn;
  trackRemaining: TrackRemainingSearches;
  playerNameById: Map<string, string>;
  allAlertsThisRun: Prisma.AlertLogCreateManyInput[];
};