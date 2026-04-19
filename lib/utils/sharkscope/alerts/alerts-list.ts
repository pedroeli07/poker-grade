import { ALERTS_SORT_KEY_LABEL } from "@/lib/constants/sharkscope/alerts";
import type { SharkscopeAlertRow } from "@/lib/types";

export function formatAlertsSortSummary(
  sort: { key: string; dir: "asc" | "desc" } | null
): string | null {
  if (!sort) return null;
  const label = ALERTS_SORT_KEY_LABEL[sort.key] ?? sort.key;
  return `${label} (${sort.dir === "asc" ? "A→Z" : "Z→A"})`;
}

export function buildAlertPlayerFilterOptions(
  alerts: SharkscopeAlertRow[]
): { value: string; label: string }[] {
  return Array.from(new Set(alerts.map((a) => a.player.name))).map((p) => ({
    value: p,
    label: p,
  }));
}

export function buildAlertDateFilterOptions(
  alerts: SharkscopeAlertRow[]
): { value: string; label: string }[] {
  return Array.from(new Set(alerts.map((a) => a.triggeredAt.split("T")[0]))).map((d) => {
    const dObj = new Date(d);
    return {
      value: d,
      label: Number.isNaN(dObj.getTime()) ? d : dObj.toLocaleDateString("pt-BR"),
    };
  });
}
