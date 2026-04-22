/** Códigos SharkScope `Type` / PrizeStructure para “família bounty” (alinhado ao site: B + MB + Jackpot/Progressive, etc.). */
export const SHARKSCOPE_BOUNTY_TYPE_CODES = [
  "B",
  "MB",
  "PB",
  "JB",
  "PSB",
  "YBB",
] as const;

/** Lookup O(1) para classificação de bounty em `classify-tournament-type`. */
export const SHARKSCOPE_BOUNTY_TYPE_CODES_SET = new Set<string>(SHARKSCOPE_BOUNTY_TYPE_CODES);
