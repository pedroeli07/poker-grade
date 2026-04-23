import { cn } from "@/lib/utils/cn";

/** Valores persistidos em `TeamIndicator.resultType`. */
export const INDICATOR_RESULT_PROCESS = "PROCESS" as const;
export const INDICATOR_RESULT_OUTCOME = "OUTCOME" as const;

export const INDICATOR_RESULT_TYPE_OPTIONS = [
  { value: INDICATOR_RESULT_PROCESS, label: "Processo" },
  { value: INDICATOR_RESULT_OUTCOME, label: "Resultado" },
] as const;

export const INDICATOR_RESULT_TYPE_LABEL: Record<string, string> = {
  [INDICATOR_RESULT_PROCESS]: "Processo",
  [INDICATOR_RESULT_OUTCOME]: "Resultado",
};

export function indicatorResultTypeBadgeCls(resultType: string) {
  return cn(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
    resultType === INDICATOR_RESULT_PROCESS
      ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200"
      : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
  );
}

export const INDICATOR_DATA_SOURCE_OPTIONS = [
  "Sistema de Rituais",
  "Reportes",
  "Sharkscope",
  "Financeiro",
  "Manual",
  "HM3",
] as const;

export const INDICATOR_AUTO_ACTION_OPTIONS = [
  "Nenhuma",
  "Criar Tarefa",
  "Marcar em Risco",
  "Sugerir Decisão no WBR",
] as const;

export const INDICATOR_FREQUENCY_OPTIONS = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "DAILY", label: "Diário" },
  { value: "MONTHLY", label: "Mensal" },
] as const;

export function indicatorFrequencyLabel(value: string) {
  return INDICATOR_FREQUENCY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function formatIndicatorMeta(targetValue: number, unit: string) {
  const u = unit.trim();
  if (u === "%") return `${targetValue}%`;
  if (u === "$") return `${targetValue}$`;
  return `${targetValue} ${u}`.trim();
}
