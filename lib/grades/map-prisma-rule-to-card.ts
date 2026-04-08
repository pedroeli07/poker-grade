import type { GradeRuleCardRule, LobbyzeFilterItem } from "@/lib/types";

function parseJson<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapPrismaRuleToCard(rule: {
  id: string;
  filterName: string;
  lobbyzeFilterId: number | null;
  sites: unknown;
  buyInMin: number | null;
  buyInMax: number | null;
  speed: unknown;
  variant: unknown;
  tournamentType: unknown;
  gameType: unknown;
  playerCount: unknown;
  weekDay: unknown;
  prizePoolMin: number | null;
  prizePoolMax: number | null;
  minParticipants: number | null;
  fromTime: string | null;
  toTime: string | null;
  excludePattern: string | null;
  timezone: number | null;
  autoOnly: boolean;
  manualOnly: boolean;
}): GradeRuleCardRule {
  return {
    id: rule.id,
    filterName: rule.filterName,
    lobbyzeFilterId: rule.lobbyzeFilterId,
    sites: parseJson<LobbyzeFilterItem>(rule.sites),
    buyInMin: rule.buyInMin,
    buyInMax: rule.buyInMax,
    speed: parseJson<LobbyzeFilterItem>(rule.speed),
    variant: parseJson<LobbyzeFilterItem>(rule.variant),
    tournamentType: parseJson<LobbyzeFilterItem>(rule.tournamentType),
    gameType: parseJson<LobbyzeFilterItem>(rule.gameType),
    playerCount: parseJson<LobbyzeFilterItem>(rule.playerCount),
    weekDay: parseJson<LobbyzeFilterItem>(rule.weekDay),
    prizePoolMin: rule.prizePoolMin,
    prizePoolMax: rule.prizePoolMax,
    minParticipants: rule.minParticipants,
    fromTime: rule.fromTime,
    toTime: rule.toTime,
    excludePattern: rule.excludePattern,
    timezone: rule.timezone,
    autoOnly: rule.autoOnly,
    manualOnly: rule.manualOnly,
  };
}
