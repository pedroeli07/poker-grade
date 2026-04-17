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
  return !!(
    (f.severity && f.severity.size > 0) ||
    (f.alertType && f.alertType.size > 0) ||
    (f.player && f.player.size > 0) ||
    (f.data && f.data.size > 0) ||
    (f.valor !== null) ||
    (f.limite !== null) ||
    (f.ack && !(f.ack.size === 1 && f.ack.has("unacknowledged")))
  );
}

export function buildAlertsFilterSummaryLines(f: SharkscopeAlertFilters): string[] {
  const lines: string[] = [];
  if (f.severity && f.severity.size > 0) {
    const vals = Array.from(f.severity).map((k) => SEVERITY_LABEL[k] ?? k);
    lines.push(`Severidade: ${vals.join(", ")}`);
  }
  if (f.alertType && f.alertType.size > 0) {
    const vals = Array.from(f.alertType).map((k) => ALERT_TYPE_LABEL[k] ?? k);
    lines.push(`Tipo: ${vals.join(", ")}`);
  }
  if (f.player && f.player.size > 0) {
    const vals = Array.from(f.player);
    lines.push(`Jogador: ${vals.join(", ")}`);
  }
  if (f.data && f.data.size > 0) {
    const vals = Array.from(f.data);
    lines.push(`Data: ${vals.join(", ")}`);
  }
  if (f.valor !== null) {
    lines.push(`Valor filtrado`);
  }
  if (f.limite !== null) {
    lines.push(`Limite filtrado`);
  }
  if (f.ack && !(f.ack.size === 1 && f.ack.has("unacknowledged"))) {
    const vals = Array.from(f.ack).map((k) => ACK_LABEL[k] ?? k);
    lines.push(`Estado: ${vals.join(", ")}`);
  }
  return lines;
}
