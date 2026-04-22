import { SHARKSCOPE_BOUNTY_TYPE_CODES_SET } from "@/lib/constants/sharkscope/tournament-classify";
import type { TournamentRow } from "@/lib/types/sharkscope/completed-tournaments";

export function normalizeFlagTokens(flags: string): string[] {
  return flags
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.toUpperCase());
}

export function isBountyStructure(flags: string): boolean {
  const raw = flags.trim();
  if (!raw) return false;

  if (/\bBOUNTY\b/i.test(raw)) return true;
  if (/MYSTERY-BOUNTY|PROGRESSIVE-BOUNTY|PROGRESSIVE KO|\bPKO\b/i.test(raw)) return true;

  for (const t of normalizeFlagTokens(flags)) {
    if (SHARKSCOPE_BOUNTY_TYPE_CODES_SET.has(t)) return true;
  }
  return false;
}

export function isSatelliteFormat(flags: string): boolean {
  const raw = flags.trim();
  if (!raw) return false;

  for (const t of normalizeFlagTokens(flags)) {
    if (t === "SAT") return true;
  }
  if (/^\s*Satellite\b/i.test(raw) || /\bSatellite\b/i.test(raw)) return true;
  return false;
}

/**
 * Bounty antes de satélite: satélites para torneios PKO (“Satellite Bounty”) entram em bounty, como no filtro do site.
 * Evita `includes("B")` na string inteira (ex.: token `SUB` não deve virar bounty).
 */
export function classifyTournamentType(flags: string): TournamentRow["tournamentType"] {
  if (isBountyStructure(flags)) return "bounty";
  if (isSatelliteFormat(flags)) return "satellite";
  return "vanilla";
}
