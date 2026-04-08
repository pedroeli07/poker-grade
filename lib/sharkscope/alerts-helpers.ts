import type { SharkscopeAlertRow } from "@/lib/types";

export type SharkscopeAlertFilters = {
  severity: string;
  alertType: string;
  ack: string;
};

export function filterSharkscopeAlerts(
  alerts: SharkscopeAlertRow[],
  f: SharkscopeAlertFilters
): SharkscopeAlertRow[] {
  return alerts.filter((a) => {
    if (f.severity !== "all" && a.severity !== f.severity) return false;
    if (f.alertType !== "all" && a.alertType !== f.alertType) return false;
    if (f.ack === "unacknowledged" && a.acknowledged) return false;
    if (f.ack === "acknowledged" && !a.acknowledged) return false;
    return true;
  });
}

export function countUnacknowledgedAlerts(
  alerts: SharkscopeAlertRow[]
): number {
  return alerts.reduce((n, a) => n + (a.acknowledged ? 0 : 1), 0);
}
