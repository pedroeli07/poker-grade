import type { UpdateGradeRuleInput } from "@/lib/types/grade/index";
import { sanitizeText, sanitizeOptional } from "@/lib/utils/text-sanitize";
import { toPrismaJson, toPrismaJsonOptional } from "@/lib/utils/parse-forms";
import { sanitizeLobbyzeItems } from "@/lib/constants/sanitize";
import type { LobbyzeImportRow, UnpersistedGradeRule, UpdateGradeRuleParsed } from "./prisma-rule-data.types";

export function importRuleCreateInput(r: UnpersistedGradeRule, raw: LobbyzeImportRow) {
  const lid = raw?.id;
  return {
    filterName: sanitizeText(r.filterName, 500),
    lobbyzeFilterId: typeof lid === "number" ? lid : null,
    sites: toPrismaJson(r.sites),
    buyInMin: r.buyInMin,
    buyInMax: r.buyInMax,
    speed: toPrismaJsonOptional(r.speed),
    variant: toPrismaJsonOptional(r.variant),
    tournamentType: toPrismaJsonOptional(r.tournamentType),
    prizePoolMin: r.prizePoolMin,
    prizePoolMax: r.prizePoolMax,
    minParticipants: r.minParticipants,
    excludePattern: sanitizeOptional(r.excludePattern, 2000),
    fromTime: r.fromTime,
    toTime: r.toTime,
    weekDay: toPrismaJsonOptional(r.weekDay),
  };
}

export function toUpdateRuleSchemaInput(ruleId: string, payload: UpdateGradeRuleInput) {
  return {
    ruleId,
    filterName: payload.filterName,
    sites: sanitizeLobbyzeItems(payload.sites),
    buyInMin: payload.buyInMin,
    buyInMax: payload.buyInMax,
    speed: sanitizeLobbyzeItems(payload.speed),
    tournamentType: sanitizeLobbyzeItems(payload.tournamentType),
    variant: sanitizeLobbyzeItems(payload.variant),
    gameType: sanitizeLobbyzeItems(payload.gameType),
    playerCount: sanitizeLobbyzeItems(payload.playerCount),
    weekDay: sanitizeLobbyzeItems(payload.weekDay),
    prizePoolMin: payload.prizePoolMin,
    prizePoolMax: payload.prizePoolMax,
    minParticipants: payload.minParticipants,
    fromTime: payload.fromTime,
    toTime: payload.toTime,
    excludePattern: payload.excludePattern,
    timezone: payload.timezone,
    autoOnly: payload.autoOnly,
    manualOnly: payload.manualOnly,
  };
}

export function prismaDataFromUpdateRule(p: UpdateGradeRuleParsed) {
  return {
    filterName: sanitizeText(p.filterName, 500),
    sites: toPrismaJson(p.sites),
    buyInMin: p.buyInMin,
    buyInMax: p.buyInMax,
    speed: toPrismaJsonOptional(p.speed),
    tournamentType: toPrismaJsonOptional(p.tournamentType),
    variant: toPrismaJsonOptional(p.variant),
    gameType: toPrismaJsonOptional(p.gameType),
    playerCount: toPrismaJsonOptional(p.playerCount),
    weekDay: toPrismaJsonOptional(p.weekDay),
    prizePoolMin: p.prizePoolMin,
    prizePoolMax: p.prizePoolMax,
    minParticipants: p.minParticipants,
    fromTime: p.fromTime,
    toTime: p.toTime,
    excludePattern: sanitizeOptional(p.excludePattern ?? null, 2000),
    timezone: p.timezone,
    autoOnly: p.autoOnly,
    manualOnly: p.manualOnly,
  };
}
