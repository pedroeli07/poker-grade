import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SharkscopeAlertRow } from "@/lib/types";

export function formatAlertTriggeredAt(iso: string): string {
  return format(new Date(iso), "dd/MM/yy HH:mm", { locale: ptBR });
}

function isPercentMetric(alert: SharkscopeAlertRow): boolean {
  return (
    alert.alertType.includes("roi") ||
    alert.alertType === "roi_drop" ||
    alert.alertType === "early_finish" ||
    alert.alertType === "late_finish" ||
    alert.alertType === "reentry_high"
  );
}

export function formatAlertMetricValue(alert: SharkscopeAlertRow): string {
  const n = alert.metricValue.toFixed(1);
  return isPercentMetric(alert) ? `${n}%` : n;
}

export function formatAlertThreshold(alert: SharkscopeAlertRow): string {
  if (isPercentMetric(alert)) {
    return `${alert.threshold.toFixed(0)}%`;
  }
  return String(Math.round(alert.threshold));
}

export function getAlertMetricBadgeProps(alert: SharkscopeAlertRow): {
  variant: "destructive" | "secondary" | "outline";
  className: string;
} {
  const base = "font-mono tabular-nums text-xs font-semibold";
  const roiVeryLow = alert.alertType === "roi_drop" && alert.metricValue <= -40;
  const lateFinishCritical =
    alert.alertType === "late_finish" &&
    alert.metricValue < alert.threshold - 2;

  if (alert.severity === "red" || roiVeryLow || lateFinishCritical) {
    return {
      variant: "destructive",
      className: base,
    };
  }
  if (alert.severity === "yellow") {
    return {
      variant: "outline",
      className: `${base} border-amber-500/50 bg-amber-500/[0.1] text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-50`,
    };
  }
  return {
    variant: "secondary",
    className: base,
  };
}
