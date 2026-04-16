import {
  SCOUTING_PROFIT_CLASS_NEGATIVE,
  SCOUTING_PROFIT_CLASS_POSITIVE,
} from "@/lib/constants/sharkscope/scouting";

/**
 * Helpers internos
 */
const isPositive = (value: number) => value >= 0;

const formatCurrency = (value: number, digits = 0) =>
  `$${value.toFixed(digits)}`;

/**
 * UI helpers
 */
export const scoutingProfitClass = (profit: number): string =>
  isPositive(profit)
    ? SCOUTING_PROFIT_CLASS_POSITIVE
    : SCOUTING_PROFIT_CLASS_NEGATIVE;

export const scoutingProfitText = (profit: number): string =>
  `${isPositive(profit) ? "+" : ""}${formatCurrency(profit)}`;