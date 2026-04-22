import {
  GRADE_RULE_DISPLAY_FIELD_ROWS,
  type GradeRuleDisplayFieldKey,
} from "@/lib/constants/grade-rule-display";
import type { GradeRuleCardRule } from "@/lib/types/grade/index";
import type { LobbyzeFilterItem } from "@/lib/types/lobbyzeTypes";
export function formatGradeRuleUsdInt(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

export function getRuleDisplayMeta(rule: GradeRuleCardRule) {
  const hasBuyIn = rule.buyInMin != null || rule.buyInMax != null;
  const hasPrize = rule.prizePoolMin != null || rule.prizePoolMax != null;
  const hasTime = rule.fromTime != null || rule.toTime != null;
  const hasMinP = rule.minParticipants != null;
  const hasExclude = !!rule.excludePattern;
  const hasBadges = rule.autoOnly || rule.manualOnly;
  const hasMeta = hasPrize || hasTime || hasMinP || hasExclude || hasBadges;

  return {
    hasBuyIn,
    hasPrize,
    hasTime,
    hasMinP,
    hasExclude,
    hasBadges,
    hasMeta,
  };
}

export type RuleDisplayFieldRow = {
  key: GradeRuleDisplayFieldKey;
  label: string;
  items: LobbyzeFilterItem[];
};

export function getVisibleRuleFieldRows(rule: GradeRuleCardRule): RuleDisplayFieldRow[] {
  return GRADE_RULE_DISPLAY_FIELD_ROWS.map(({ key, label }) => ({
    key,
    label,
    items: rule[key],
  })).filter((row) => row.items.length > 0);
}

/** Sufixo ` UTC+3` / ` UTC-3` para o badge de horário. */
export function formatRuleTimezoneUtcSuffix(timezone: number | null): string {
  if (timezone == null) return "";
  return ` UTC${timezone >= 0 ? "+" : ""}${timezone}`;
}
