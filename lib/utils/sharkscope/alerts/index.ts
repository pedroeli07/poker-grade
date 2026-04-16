import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ACK_LABEL,
  ALERT_LATE_FINISH_CRITICAL_MARGIN,
  ALERT_METRIC_BADGE_AMBER_OUTLINE_CLASS,
  ALERT_METRIC_BADGE_BASE_CLASS,
  ALERT_ROI_DROP_CRITICAL_MAX,
  ALERT_TRIGGERED_AT_DATE_FORMAT,
  ALERT_TYPE_LABEL,
  isSharkscopeAlertPercentMetric,
  SEVERITY_LABEL,
} from "@/lib/constants/sharkscope/alerts";
import type { SharkscopeAlertFilters, SharkscopeAlertRow } from "@/lib/types";

export function formatAlertTriggeredAt(iso: string): string {
  return format(new Date(iso), ALERT_TRIGGERED_AT_DATE_FORMAT, { locale: ptBR });
}

export function formatAlertMetricValue(alert: SharkscopeAlertRow): string {
  const n = alert.metricValue.toFixed(1);
  return isSharkscopeAlertPercentMetric(alert.alertType) ? `${n}%` : n;
}

export function formatAlertThreshold(alert: SharkscopeAlertRow): string {
  if (isSharkscopeAlertPercentMetric(alert.alertType)) {
    return `${alert.threshold.toFixed(0)}%`;
  }
  return String(Math.round(alert.threshold));
}

export function getAlertMetricBadgeProps(alert: SharkscopeAlertRow): {
  variant: "destructive" | "secondary" | "outline";
  className: string;
} {
  const base = ALERT_METRIC_BADGE_BASE_CLASS;
  const roiVeryLow = alert.alertType === "roi_drop" && alert.metricValue <= ALERT_ROI_DROP_CRITICAL_MAX;
  const lateFinishCritical =
    alert.alertType === "late_finish" &&
    alert.metricValue < alert.threshold - ALERT_LATE_FINISH_CRITICAL_MARGIN;

  if (alert.severity === "red" || roiVeryLow || lateFinishCritical) {
    return {
      variant: "destructive",
      className: base,
    };
  }
  if (alert.severity === "yellow") {
    return {
      variant: "outline",
      className: `${base} ${ALERT_METRIC_BADGE_AMBER_OUTLINE_CLASS}`,
    };
  }
  return {
    variant: "secondary",
    className: base,
  };
}

export function alertsHasActiveView(f: SharkscopeAlertFilters): boolean {
  return f.severity !== "all" || f.alertType !== "all" || f.ack !== "all";
}

export function buildAlertsFilterSummaryLines(f: SharkscopeAlertFilters): string[] {
  const lines: string[] = [];
  if (f.severity !== "all") {
    lines.push(`Severidade: ${SEVERITY_LABEL[f.severity] ?? f.severity}`);
  }
  if (f.alertType !== "all") {
    lines.push(`Tipo: ${ALERT_TYPE_LABEL[f.alertType] ?? f.alertType}`);
  }
  if (f.ack !== "all") {
    lines.push(`Estado: ${ACK_LABEL[f.ack] ?? f.ack}`);
  }
  return lines;
}
