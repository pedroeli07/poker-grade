/** Stored in `team_operational_rules.severity` — English codes only. */
export const SEVERITY_NONE = "NONE" as const;
export const SEVERITY_CRITICAL = "CRITICAL" as const;
export const SEVERITY_WARNING = "WARNING" as const;
export const SEVERITY_ALERT = "ALERT" as const;
export const SEVERITY_INFO = "INFO" as const;

export type SeverityCode =
  | typeof SEVERITY_NONE
  | typeof SEVERITY_CRITICAL
  | typeof SEVERITY_WARNING
  | typeof SEVERITY_ALERT
  | typeof SEVERITY_INFO;

const LEGACY_SEVERITY: Record<string, SeverityCode> = {
  NENHUM: SEVERITY_NONE,
  CRITICO: SEVERITY_CRITICAL,
  ATENCAO: SEVERITY_WARNING,
  ALERTA: SEVERITY_ALERT,
};

export function coerceSeverity(raw: string | null | undefined): SeverityCode {
  if (raw == null || raw.trim() === "") return SEVERITY_NONE;
  if (
    raw === SEVERITY_NONE ||
    raw === SEVERITY_CRITICAL ||
    raw === SEVERITY_WARNING ||
    raw === SEVERITY_ALERT ||
    raw === SEVERITY_INFO
  ) {
    return raw;
  }
  return LEGACY_SEVERITY[raw] ?? SEVERITY_NONE;
}

/** Rule edit form: value = code, label = Portuguese (UI). */
export const SEVERITY_OPTIONS = [
  { value: SEVERITY_NONE, label: "Nenhum" },
  { value: SEVERITY_CRITICAL, label: "Crítico" },
  { value: SEVERITY_WARNING, label: "Atenção" },
  { value: SEVERITY_INFO, label: "Info" },
] as const;

/**
 * Long-form copy for the rule card (Portuguese, user-facing only).
 * Keys are English severity codes.
 */
export const SEVERITY_LABELS_PT: Record<string, string> = {
  [SEVERITY_CRITICAL]: "Crítico",
  [SEVERITY_WARNING]: "Atenção",
  [SEVERITY_ALERT]: "Atenção",
  [SEVERITY_INFO]: "Info",
  [SEVERITY_NONE]: "Sem grau",
};

export const SEVERITY_COLOR: Record<string, string> = {
  [SEVERITY_CRITICAL]: "text-rose-600",
  [SEVERITY_WARNING]: "text-amber-600",
  [SEVERITY_ALERT]: "text-amber-600",
  [SEVERITY_INFO]: "text-sky-600",
  [SEVERITY_NONE]: "text-muted-foreground",
};
