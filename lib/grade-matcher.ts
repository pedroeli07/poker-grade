/**
 * Grade Matcher Engine
 *
 * Compares a played tournament against grade rules to determine:
 * - IN_GRADE: tournament matches at least one rule
 * - SUSPECT: tournament partially matches (e.g., buy-in in range but wrong site)
 * - OUT_OF_GRADE: tournament doesn't match any rule
 */

import type { LobbyzeFilterItem, TournamentData, GradeRuleData, MatchDetail } from "@/lib/types";
import { createLogger } from "./logger";
import { normalizeSiteName, matchesExcludePattern, matchesSpeed } from "@/lib/utils";

const log = createLogger("grade-matcher");

/**
 * Main matching function: checks a tournament against a single rule
 */
function matchTournamentToRule(
  tournament: TournamentData,
  rule: GradeRuleData
): { matches: boolean; partial: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let criticalMiss = false;
  let partialMatch = false;

  // 1. Check site match
  const normalizedTournamentSite = normalizeSiteName(tournament.site);
  const siteMatch = rule.sites.some(
    (s) => normalizeSiteName(s.item_text) === normalizedTournamentSite
  );
  if (!siteMatch) {
    reasons.push(`Site "${tournament.site}" não está na grade`);
    criticalMiss = true;
  }

  // 2. Check buy-in range
  if (rule.buyInMin !== null && tournament.buyInValue < rule.buyInMin) {
    reasons.push(
      `Buy-in $${tournament.buyInValue} abaixo do mínimo $${rule.buyInMin}`
    );
    criticalMiss = true;
  }
  if (rule.buyInMax !== null && tournament.buyInValue > rule.buyInMax) {
    reasons.push(
      `Buy-in $${tournament.buyInValue} acima do máximo $${rule.buyInMax}`
    );
    criticalMiss = true;
  }

  // 3. Check speed
  if (!matchesSpeed(tournament.speed, rule.speed)) {
    reasons.push(`Speed "${tournament.speed}" não permitida na regra`);
    partialMatch = true;
  }

  // 4. Check exclude pattern
  if (
    rule.excludePattern &&
    matchesExcludePattern(tournament.tournamentName, rule.excludePattern)
  ) {
    reasons.push(`Torneio excluído pelo padrão "${rule.excludePattern}"`);
    criticalMiss = true;
  }

  // Buy-in is in range but other things don't match = partial
  if (
    !criticalMiss &&
    rule.buyInMin !== null &&
    rule.buyInMax !== null &&
    tournament.buyInValue >= rule.buyInMin &&
    tournament.buyInValue <= rule.buyInMax
  ) {
    if (reasons.length > 0) {
      partialMatch = true;
    }
  }

  return {
    matches: reasons.length === 0,
    partial: partialMatch && !criticalMiss,
    reasons,
  };
}

/**
 * Match a tournament against ALL rules of a grade.
 * Returns IN_GRADE if any rule fully matches,
 * SUSPECT if any rule partially matches,
 * OUT_OF_GRADE if nothing matches.
 */
export function matchTournamentToGrade(
  tournament: TournamentData,
  rules: GradeRuleData[]
): MatchDetail {
  let bestPartialMatch: { ruleId: string; ruleName: string; reasons: string[] } | null = null;

  for (const rule of rules) {
    const result = matchTournamentToRule(tournament, rule);

    if (result.matches) {
      return {
        result: "IN_GRADE",
        matchedRuleId: rule.id,
        matchedRuleName: rule.filterName,
        reasons: [],
      };
    }

    if (result.partial && !bestPartialMatch) {
      bestPartialMatch = {
        ruleId: rule.id,
        ruleName: rule.filterName,
        reasons: result.reasons,
      };
    }
  }

  if (bestPartialMatch) {
    return {
      result: "SUSPECT",
      matchedRuleId: bestPartialMatch.ruleId,
      matchedRuleName: bestPartialMatch.ruleName,
      reasons: bestPartialMatch.reasons,
    };
  }

  return {
    result: "OUT_OF_GRADE",
    matchedRuleId: null,
    matchedRuleName: null,
    reasons: ["Torneio não correspondeu a nenhuma regra da grade"],
  };
}

/**
 * Parse Lobbyze JSON filters into GradeRuleData format
 */
export function parseLobbyzeFilters(
  filters: Record<string, unknown>[]
): Omit<GradeRuleData, "id">[] {
  log.info("Convertendo filtros Lobbyze em regras", { count: filters.length });
  return filters.map((f) => ({
    filterName: (f.name as string) || "Unnamed Filter",
    sites: (f.site as LobbyzeFilterItem[]) || [],
    buyInMin: (f.buy_in_min as number) ?? null,
    buyInMax: (f.buy_in_max as number) ?? null,
    speed: (f.speed as LobbyzeFilterItem[]) ?? null,
    variant: (f.variant as LobbyzeFilterItem[]) ?? null,
    tournamentType: (f.type as LobbyzeFilterItem[]) ?? null,
    prizePoolMin: (f.prize_pool_min as number) ?? null,
    prizePoolMax: (f.prize_pool_max as number) ?? null,
    minParticipants: (f.min_participants as number) ?? null,
    excludePattern: (f.exclude as string) || null,
    fromTime: (f.from_time as string) ?? null,
    toTime: (f.to_time as string) ?? null,
    weekDay: (f.week_day as LobbyzeFilterItem[]) ?? null,
  }));
}
