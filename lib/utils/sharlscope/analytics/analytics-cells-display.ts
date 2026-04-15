import {
  statBadgeAmber,
  statBadgeEmerald,
  statBadgeMuted,
  statBadgeRed,
} from "@/lib/constants/classes";

/** Mapeia severidade FP/FT (alertas) para classe de badge já usada em analytics. */
export function analyticsFinishSeverityBadgeClass(sev: "red" | "yellow" | "green"): string {
  if (sev === "red") return statBadgeRed;
  if (sev === "yellow") return statBadgeAmber;
  return statBadgeMuted;
}

/** Capacidade 0–100: maior é melhor. */
export function analyticsAbilityBadgeClass(rounded: number): string {
  if (rounded < 40) return statBadgeRed;
  if (rounded < 60) return statBadgeAmber;
  return statBadgeEmerald;
}
