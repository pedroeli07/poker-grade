import { RITUAL_AREA_OPTIONS } from "@/lib/constants/team/rituals";
import { SEVERITY_CRITICAL, SEVERITY_INFO, SEVERITY_WARNING } from "@/lib/constants/team/severity";
import { cn } from "@/lib/utils/cn";

/** Areas for decisions & alert rules (PT labels, same as rituais + Geral). */
export const COMMUNICATION_AREA_OPTIONS = [
  "Geral",
  ...RITUAL_AREA_OPTIONS,
] as const;

export const DECISION_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "IMPLEMENTED", label: "Implementado" },
] as const;

export const DECISION_VISIBILITY_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "STAFF", label: "Staff" },
  { value: "ADMIN_ONLY", label: "Apenas gestores (admins)" },
] as const;

/** Tags sugeridas (decisões) — memó com nomes exibidos na UI. */
export const DECISION_TAG_CHIPS = [
  "ABI",
  "Financeiro",
  "Ritual",
  "Cultura",
  "Estanca-Sangria",
  "Performance",
  "Técnico",
  "Mental",
  "Operação",
  "Grades",
] as const;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-900",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-900",
  IMPLEMENTED: "border-sky-200 bg-sky-50 text-sky-900",
  /** Legado (antes de Implementado) */
  ARCHIVED: "border-slate-200 bg-slate-50 text-slate-600",
};

const LEGACY_STATUS_LABEL: Record<string, string> = { ARCHIVED: "Arquivada" };
const LEGACY_VISIBILITY_LABEL: Record<string, string> = { DRI: "DRI (legado)" };

const AREA_BADGE: Record<string, string> = {
  Geral: "border-slate-200 text-slate-600",
  Operação: "border-blue-200 text-blue-800 bg-blue-50/50",
  Financeira: "border-emerald-200 text-emerald-800 bg-emerald-50/50",
  Financeiro: "border-emerald-200 text-emerald-800 bg-emerald-50/50",
  Performance: "border-violet-200 text-violet-800 bg-violet-50/50",
  Rituais: "border-amber-200 text-amber-800 bg-amber-50/50",
  Mental: "border-purple-200 text-purple-800 bg-purple-50/50",
  Técnica: "border-amber-200 text-amber-900 bg-amber-50/50",
  Cultura: "border-rose-200 text-rose-800 bg-rose-50/50",
};

export function decisionStatusBadgeCls(status: string) {
  return STATUS_BADGE[status] ?? "border-slate-200 text-slate-600";
}

export function decisionAreaBadgeCls(area: string) {
  return AREA_BADGE[area] ?? "border-slate-200 text-slate-600";
}

/** Área no formulário de regra de alerta (exibida no modal). */
export const ALERT_AREA_OPTIONS = ["Financeiro", "Performance", "Rituais"] as const;

export const ALERT_METRIC_OPTIONS = [
  "Makeup",
  "ROI",
  "ABI",
  "Adesão rituais",
  "Auditoria pendentes",
  "Profit",
] as const;

export const ALERT_OPERATOR_OPTIONS = [
  { value: ">", label: "Maior que (>)" },
  { value: "<", label: "Menor que (<)" },
  { value: ">=", label: "Maior ou igual (>=)" },
  { value: "<=", label: "Menor ou igual (<=)" },
] as const;

export const ALERT_SEVERITY_FORM_OPTIONS = [
  { value: SEVERITY_INFO, label: "Info" },
  { value: SEVERITY_WARNING, label: "Atenção" },
  { value: SEVERITY_CRITICAL, label: "Crítico" },
] as const;

export const ALERT_RESPONSIBLE_ROLE_OPTIONS = [
  "Gestor (admin)",
  "Financeiro",
  "Coach",
  "Head coach",
] as const;

export function sevIconWrapCls(severity: string) {
  return cn(
    "flex h-8 w-8 items-center justify-center rounded-lg",
    severity === "CRITICAL" && "bg-rose-100 text-rose-600",
    severity === "ALERT" && "bg-amber-100 text-amber-700",
    severity === "WARNING" && "bg-amber-50 text-amber-600",
    severity === "INFO" && "bg-sky-100 text-sky-700",
    !["CRITICAL", "ALERT", "WARNING", "INFO"].includes(severity) && "bg-muted text-muted-foreground",
  );
}

export function sevPillCls(severity: string) {
  return cn(
    "border-none text-xs font-bold",
    severity === "CRITICAL" && "bg-rose-100 text-rose-800",
    severity === "ALERT" && "bg-amber-100 text-amber-900",
    severity === "WARNING" && "bg-amber-50 text-amber-800",
    severity === "INFO" && "bg-sky-100 text-sky-900",
    !["CRITICAL", "ALERT", "WARNING", "INFO"].includes(severity) && "bg-muted text-foreground",
  );
}

/**
 * Borda, leve fundo e sombra por severidade (cartões de regra de alerta).
 */
export function governanceAlertRuleCardFrameCls(severity: string) {
  if (severity === "CRITICAL") {
    return cn(
      "border-rose-400/60 bg-gradient-to-b from-rose-50/90 to-card dark:from-rose-950/35 dark:to-card",
      "shadow-md shadow-rose-500/18 dark:shadow-rose-900/30",
      "hover:-translate-y-0.5 hover:border-rose-500/75 hover:shadow-lg hover:shadow-rose-500/35",
    );
  }
  if (severity === "WARNING" || severity === "ALERT") {
    return cn(
      "border-amber-400/60 bg-gradient-to-b from-amber-50/85 to-card dark:from-amber-950/30 dark:to-card",
      "shadow-md shadow-amber-500/16 dark:shadow-amber-900/25",
      "hover:-translate-y-0.5 hover:border-amber-500/75 hover:shadow-lg hover:shadow-amber-500/32",
    );
  }
  if (severity === "INFO") {
    return cn(
      "border-sky-400/55 bg-gradient-to-b from-sky-50/85 to-card dark:from-sky-950/32 dark:to-card",
      "shadow-md shadow-sky-500/16 dark:shadow-sky-900/25",
      "hover:-translate-y-0.5 hover:border-sky-500/70 hover:shadow-lg hover:shadow-sky-500/30",
    );
  }
  return cn(
    "border-border/60 bg-card shadow-sm shadow-black/[0.04] dark:shadow-none",
    "hover:-translate-y-0.5 hover:border-muted-foreground/25 hover:shadow-md",
  );
}

/**
 * Cores do overlay em gradiente (pseudo-element) no hover, alinhadas à severidade.
 */
export function governanceAlertRuleCardOverlayFromCls(severity: string) {
  if (severity === "CRITICAL") return "before:from-rose-500/10";
  if (severity === "WARNING" || severity === "ALERT") return "before:from-amber-500/10";
  if (severity === "INFO") return "before:from-sky-500/10";
  return "before:from-primary/[0.04]";
}

export function statusLabel(
  value: string,
  list: readonly { value: string; label: string }[],
): string {
  return list.find((o) => o.value === value)?.label ?? LEGACY_STATUS_LABEL[value] ?? value;
}

export function decisionVisibilityLabel(value: string): string {
  return (
    DECISION_VISIBILITY_OPTIONS.find((o) => o.value === value)?.label ??
    LEGACY_VISIBILITY_LABEL[value] ??
    value
  );
}
