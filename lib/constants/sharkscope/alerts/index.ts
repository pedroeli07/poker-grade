// ─── alerts-table-ui ───────────────────────────────────────────────────────────

/** Padrão `date-fns` para coluna “disparado em”. */
const ALERT_TRIGGERED_AT_DATE_FORMAT = "dd/MM/yy HH:mm";

const ALERT_METRIC_BADGE_BASE_CLASS = "font-mono tabular-nums text-xs font-semibold";

const ALERT_METRIC_BADGE_AMBER_OUTLINE_CLASS =
  "border-amber-500/50 bg-amber-500/[0.1] text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-50";

/** ROI ≤ este valor (com `roi_drop`) força variante destrutiva. */
const ALERT_ROI_DROP_CRITICAL_MAX = -40;

/** `late_finish`: diferença (threshold − métrica) acima disto → crítico. */
const ALERT_LATE_FINISH_CRITICAL_MARGIN = 2;

/** Tipos de alerta cujo valor/threshold são tratados como %. */
function isSharkscopeAlertPercentMetric(alertType: string): boolean {
  return (
    alertType.includes("roi") ||
    alertType === "roi_drop" ||
    alertType === "early_finish" ||
    alertType === "late_finish" ||
    alertType === "reentry_high"
  );
}

// ─── sharkscope-alerts-page ────────────────────────────────────────────────────

// ─── alerts-messages ───────────────────────────────────────────────────────────

const INVITE_ONLY_MSG =
  "Este e-mail não está autorizado a criar conta. Solicite um convite ao administrador.";

const ALERT_TYPE_ROWS = [
  ["roi_drop", "Queda de ROI"],
  ["reentry_high", "Reentrada Alta"],
  ["abi_deviation", "Desvio de ABI"],
  ["high_variance", "Alta Variância"],
  ["low_volume", "Baixo Volume"],
  ["early_finish", "Finalização Precoce Alta"],
  ["late_finish", "Finalização Tardia Baixa"],
  ["group_not_found", "Grupo Shark não encontrado"],
] as const;

const ALERT_TYPE_LABEL: Record<string, string> = Object.fromEntries(ALERT_TYPE_ROWS);

const SEVERITY_ROWS = [
  ["red", "Vermelho", "bg-red-500/10 text-red-600 border-red-500/20", "text-red-500"],
  ["yellow", "Amarelo", "bg-amber-500/10 text-amber-600 border-amber-500/20", "text-amber-500"],
  ["green", "Verde", "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", "text-emerald-500"],
] as const;

const SEVERITY_UI: Record<string, { label: string; badge: string; iconClass: string }> =
  Object.fromEntries(
    SEVERITY_ROWS.map(([key, label, badge, iconClass]) => [key, { label, badge, iconClass }]),
  );

const SEVERITY_LABEL: Record<string, string> = {
    red: "Vermelho",
    yellow: "Amarelo",
    green: "Verde",
  };
  
const ACK_LABEL: Record<string, string> = {
    unacknowledged: "Não reconhecidos",
    acknowledged: "Reconhecidos",
  };

const SHARKSCOPE_ALERTS_LS_PAGE_SIZE = "gestao-grades:sharkscope-alerts:pageSize";
const SHARKSCOPE_ALERTS_LS_PAGE = "gestao-grades:sharkscope-alerts:page";
const SHARKSCOPE_ALERTS_LS_SELECTED = "gestao-grades:sharkscope-alerts:selectedIds";

const SHARKSCOPE_ALERTS_PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 300] as const;
const SHARKSCOPE_ALERTS_ALLOWED_PAGE_SIZE = new Set<number>(SHARKSCOPE_ALERTS_PAGE_SIZE_OPTIONS);

export { 
  ALERT_TRIGGERED_AT_DATE_FORMAT,
  ALERT_METRIC_BADGE_BASE_CLASS, 
  ALERT_METRIC_BADGE_AMBER_OUTLINE_CLASS, 
  ALERT_ROI_DROP_CRITICAL_MAX, 
  ALERT_LATE_FINISH_CRITICAL_MARGIN, 
  INVITE_ONLY_MSG, 
  ALERT_TYPE_LABEL, 
  SEVERITY_UI, 
  SEVERITY_LABEL, 
  ACK_LABEL,
  isSharkscopeAlertPercentMetric,
  SHARKSCOPE_ALERTS_LS_PAGE_SIZE,
  SHARKSCOPE_ALERTS_LS_PAGE,
  SHARKSCOPE_ALERTS_LS_SELECTED,
  SHARKSCOPE_ALERTS_PAGE_SIZE_OPTIONS,
  SHARKSCOPE_ALERTS_ALLOWED_PAGE_SIZE
};