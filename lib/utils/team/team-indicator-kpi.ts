/**
 * Lógica de exibição de KPIs do catálogo (alinhada ao `deriveStatus` do cl-admin).
 */

export type TeamIndicatorKpiStatus = "success" | "warning" | "danger" | "neutral";

const FALLING = new Set(["FALLING", "Decrescente"]);

/** Curva: `RISING` = maior é melhor; `FALLING` = menor é melhor (ex.: makeup). */
export function deriveTeamIndicatorKpiStatus(
  current: number,
  target: number,
  curveType: string,
): TeamIndicatorKpiStatus {
  if (target === 0) return "success";
  if (current === 0) return "neutral";

  const decrescente = FALLING.has(curveType);
  if (decrescente) {
    if (current <= target) return "success";
    if (current <= target * 1.15) return "warning";
    return "danger";
  }

  const ratio = current / target;
  if (ratio >= 0.9) return "success";
  if (ratio >= 0.7) return "warning";
  return "danger";
}

export function formatTeamIndicatorValue(value: number, unit: string) {
  const u = unit.trim();
  if (u === "%") return `${value}%`;
  if (u === "$") return `${value}$`;
  return `${value} ${u}`.trim();
}
