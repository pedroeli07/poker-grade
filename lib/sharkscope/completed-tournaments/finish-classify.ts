/** Heurística a partir de posição vs field: “tardia” ~ top 12%; “precoce” ~ pior que ~55% do field. ITM usa prêmio > 0 na entrada. */
export function classifyFinish(position: number, entrants: number): { early: boolean; late: boolean } {
  if (!Number.isFinite(position) || position <= 0 || !Number.isFinite(entrants) || entrants < 2) {
    return { early: false, late: false };
  }
  const lateThreshold = Math.max(9, Math.ceil(entrants * 0.12));
  const earlyThreshold = Math.ceil(entrants * 0.55);
  return {
    early: position > earlyThreshold,
    late: position <= lateThreshold,
  };
}
