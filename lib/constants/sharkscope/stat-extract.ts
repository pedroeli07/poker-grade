import type { ScoutingSearchStats } from "@/lib/types";

/**
 * Caminhos JSON onde procurar nós `Statistics` / `Statistic` (ordem de prioridade).
 * PlayerGroup (Summary / Statistics) e jogador normal.
 */
export const SHARKSCOPE_STAT_CONTAINER_PATHS = [
  ["Response", "PlayerResponse", "PlayerView", "PlayerGroup", "Statistics"],
  ["Response", "PlayerResponse", "PlayerView", "Statistics"],
  ["Response", "PlayerResponse", "PlayerResults", "PlayerResult", "Statistics"],
  ["Response", "PlayerResponse", "PlayerResults", "PlayerResult", "Player", "Statistics"],
  ["Response", "PlayerResponse", "PlayerResults", "PlayerResult", "Statistic"],
  ["PlayerResponse", "PlayerResults", "PlayerResult", "Statistics"],
  ["PlayerResponse", "PlayerResults", "PlayerResult", "Player", "Statistics"],
  ["Statistics"],
  ["PlayerResults", "PlayerResult", "Statistics"],
] as const;

/** Mapeamento nome API SharkScope → chave em `ScoutingSearchStats`. */
export const SHARKSCOPE_SCOUTING_STAT_EXTRACTS = [
  ["roi", "AvROI"],
  ["profit", "TotalProfit"],
  ["count", "Count"],
  ["abi", "AvStake"],
  ["entrants", "AvEntrants"],
] as const satisfies readonly (readonly [keyof ScoutingSearchStats, string])[];

export const SHARKSCOPE_EMPTY_SCOUTING_STATS: ScoutingSearchStats = {
  roi: null,
  profit: null,
  count: null,
  abi: null,
  entrants: null,
};

/**
 * Aliases extra por id de stat normalizado (minúsculas, sem espaços).
 * O `want` base já é incluído em runtime; aqui só entram sinónimos adicionais.
 */
export const SHARKSCOPE_STAT_ID_EXTRA_ALIASES: Readonly<Record<string, readonly string[]>> = {
  earlyfinish: ["finshesearly"],
  latefinish: ["finsheslate"],
  totalprofit: ["profit", "netprofit"],
  avstake: ["stake", "averagestake"],
  ability: ["avability"],
  avability: ["ability"],
};
