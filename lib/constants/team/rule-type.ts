/** Stored in `team_operational_rules.tipo` — use English for maintainability. */
export const RULE_TYPE_MANDATORY = "MANDATORY" as const;
export const RULE_TYPE_RECOMMENDATION = "RECOMMENDATION" as const;

export type RuleType = typeof RULE_TYPE_MANDATORY | typeof RULE_TYPE_RECOMMENDATION;

const LEGACY_RULE_TYPE: Record<string, RuleType> = {
  OBRIGATORIA: RULE_TYPE_MANDATORY,
  RECOMENDACAO: RULE_TYPE_RECOMMENDATION,
};

/** Normalizes DB values (legacy PT codes or English) for lookups and forms. */
export function coerceRuleType(raw: string | null | undefined): RuleType {
  if (raw == null || raw === "") return RULE_TYPE_MANDATORY;
  if (raw === RULE_TYPE_MANDATORY || raw === RULE_TYPE_RECOMMENDATION) return raw;
  return LEGACY_RULE_TYPE[raw] ?? RULE_TYPE_MANDATORY;
}
