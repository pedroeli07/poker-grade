import type { LobbyzeFilterItem } from "@/lib/types";

export type GradeRuleCardRule = {
  id: string;
  filterName: string;
  lobbyzeFilterId: number | null;
  sites: LobbyzeFilterItem[];
  buyInMin: number | null;
  buyInMax: number | null;
  speed: LobbyzeFilterItem[];
  variant: LobbyzeFilterItem[];
  tournamentType: LobbyzeFilterItem[];
  gameType: LobbyzeFilterItem[];
  playerCount: LobbyzeFilterItem[];
  weekDay: LobbyzeFilterItem[];
  prizePoolMin: number | null;
  prizePoolMax: number | null;
  minParticipants: number | null;
  fromTime: string | null;
  toTime: string | null;
  excludePattern: string | null;
  timezone: number | null;
  autoOnly: boolean;
  manualOnly: boolean;
};
