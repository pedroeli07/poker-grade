import type { StakeTierKey } from "@/lib/types";

/** Ordem fixa na UI (micro → high). */
export const STAKE_TIER_ORDER: readonly StakeTierKey[] = [
  "micro",
  "low",
  "lowMid",
  "mid",
  "high",
] as const;

/** Rótulos curtos para tabela / filtro. */
export const STAKE_TIER_LABEL_PT: Record<StakeTierKey, string> = {
  micro: "Micro Stakes (até $10)",
  low: "Low Stakes ($10–$25)",
  lowMid: "Low-Mid ($25–$50)",
  mid: "Mid Stakes ($50–$150)",
  high: "High Stakes ($150+)",
};

/**
 * Classifica ABI médio (AvStake) no tier de stake.
 * Limites: <10 | [10,25) | [25,50) | [50,150) | ≥150 (USD).
 */
export function classifyStakeTier(stake: number | null): StakeTierKey | null {
  if (stake === null || !Number.isFinite(stake)) return null;
  if (stake < 10) return "micro";
  if (stake < 25) return "low";
  if (stake < 50) return "lowMid";
  if (stake < 150) return "mid";
  return "high";
}
