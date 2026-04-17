import type { SharkScopeResponse } from "@/lib/types/sharkScopeTypes";

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
