import { EMPTY_DESC } from "@/lib/constants/sharkscope/ui";
import { STATUS_CONFIG } from "@/lib/constants/grade";
import type { GradeListRow, GradeRuleCardRule } from "@/lib/types/grade/index";
import type { LobbyzeFilterItem } from "@/lib/types/lobbyzeTypes";
import type { TargetListRow } from "@/lib/types/target/index";
import { parseJson } from "./parse-forms";
import { htmlToPlainText } from "./html-to-plain-text";

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
    buyInMin: rule.buyInMin,
    buyInMax: rule.buyInMax,
    prizePoolMin: rule.prizePoolMin,
    prizePoolMax: rule.prizePoolMax,
    minParticipants: rule.minParticipants,
    fromTime: rule.fromTime,
    toTime: rule.toTime,
    excludePattern: rule.excludePattern,
    timezone: rule.timezone,
    autoOnly: rule.autoOnly,
    manualOnly: rule.manualOnly,
    sites: parseJson<LobbyzeFilterItem>(rule.sites),
    speed: parseJson<LobbyzeFilterItem>(rule.speed),
    variant: parseJson<LobbyzeFilterItem>(rule.variant),
    tournamentType: parseJson<LobbyzeFilterItem>(rule.tournamentType),
    gameType: parseJson<LobbyzeFilterItem>(rule.gameType),
    playerCount: parseJson<LobbyzeFilterItem>(rule.playerCount),
    weekDay: parseJson<LobbyzeFilterItem>(rule.weekDay),
  };
}

export function descriptionPick(r: GradeListRow) {
  const raw = r.description?.trim() ?? "";
  const plain = raw ? htmlToPlainText(raw) : "";
  return {
    value: raw || EMPTY_DESC,
    label: plain ? (plain.length > 80 ? `${plain.slice(0, 80)}…` : plain) : "(sem descrição)",
  };
}

export const statusLabel = (s: TargetListRow["status"]) => STATUS_CONFIG[s].label;
