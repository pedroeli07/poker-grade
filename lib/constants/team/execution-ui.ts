import { cn } from "@/lib/utils/cn";

/** Stored in `team_tasks.status` — must match `updateTeamTaskStatus` + board columns. */
export const TASK_STATUS_COLUMNS = [
  { id: "TODO", label: "A fazer" },
  { id: "IN_PROGRESS", label: "Em progresso" },
  { id: "DONE", label: "Concluída" },
] as const;

export type TaskStatusId = (typeof TASK_STATUS_COLUMNS)[number]["id"];

export const TASK_PRIORITY_OPTIONS = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "CRITICAL", label: "Crítica" },
] as const;

/** Aparência única para todos os níveis (cards e tabela de execução). */
export const PRIORITY_BADGE_CLASS =
  "border-slate-200/90 bg-slate-100/95 text-slate-800 dark:border-slate-600 dark:bg-slate-800/55 dark:text-slate-100";

/** Altura, padding e tipografia alinhados entre prioridade (ex. Crítica) e tags (ex. Treino). */
export const EXECUTION_META_BADGE_SIZE =
  "h-7 px-3 text-xs font-semibold tracking-wide";

export function priorityBadgeClass() {
  return cn(EXECUTION_META_BADGE_SIZE, PRIORITY_BADGE_CLASS);
}

export function priorityLabel(v: string) {
  return TASK_PRIORITY_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

export const COLUMN_WRAP: Record<string, string> = {
  TODO: "border-amber-200/90 bg-amber-50/50",
  IN_PROGRESS: "border-violet-200/80 bg-violet-50/40",
  DONE: "border-emerald-200/80 bg-emerald-50/30",
};

export const COLUMN_HEADER: Record<string, string> = {
  TODO: "bg-amber-200/80 text-amber-950",
  IN_PROGRESS: "bg-violet-200/70 text-violet-950",
  DONE: "bg-emerald-200/60 text-emerald-900",
};

/** Fundo do card (gradient) + borda + sombra por status — hover amplia a sombra. */
export const TASK_CARD_STATUS_STYLE: Record<string, string> = {
  TODO:
    "border-amber-200/70 bg-gradient-to-br from-amber-50 via-amber-50/60 to-white shadow-amber-200/40 hover:shadow-amber-300/60",
  IN_PROGRESS:
    "border-violet-200/70 bg-gradient-to-br from-violet-50 via-violet-50/60 to-white shadow-violet-200/40 hover:shadow-violet-300/60",
  DONE:
    "border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white shadow-emerald-200/40 hover:shadow-emerald-300/60",
};

/** Cor do nome do responsável / ícone de user por status. */
export const TASK_ASSIGNEE_TEXT: Record<string, string> = {
  TODO: "text-amber-800",
  IN_PROGRESS: "text-violet-800",
  DONE: "text-emerald-800",
};

/** Tag chips no modal e nos cards — mesma ideia de paleta pastel (nome persistido em JSON). */
export const EXEC_TAG_COLORS = [
  { name: "Blue", bg: "bg-sky-100", text: "text-sky-900", border: "border-sky-200" },
  { name: "Indigo", bg: "bg-indigo-100", text: "text-indigo-900", border: "border-indigo-200" },
  { name: "Violet", bg: "bg-violet-100", text: "text-violet-900", border: "border-violet-200" },
  { name: "Fuchsia", bg: "bg-fuchsia-100", text: "text-fuchsia-900", border: "border-fuchsia-200" },
  { name: "Rose", bg: "bg-rose-100", text: "text-rose-900", border: "border-rose-200" },
  { name: "Amber", bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-200" },
  { name: "Emerald", bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-200" },
  { name: "Teal", bg: "bg-teal-100", text: "text-teal-900", border: "border-teal-200" },
  { name: "Cyan", bg: "bg-cyan-100", text: "text-cyan-900", border: "border-cyan-200" },
  { name: "Lime", bg: "bg-lime-100", text: "text-lime-900", border: "border-lime-200" },
  { name: "Orange", bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-200" },
  { name: "Red", bg: "bg-red-100", text: "text-red-900", border: "border-red-200" },
  { name: "Slate", bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-200" },
  { name: "Pink", bg: "bg-pink-100", text: "text-pink-900", border: "border-pink-200" },
  { name: "BlueDeep", bg: "bg-sky-200", text: "text-sky-950", border: "border-sky-300" },
  { name: "IndigoDeep", bg: "bg-indigo-200", text: "text-indigo-950", border: "border-indigo-300" },
  { name: "VioletDeep", bg: "bg-violet-200", text: "text-violet-950", border: "border-violet-300" },
  { name: "FuchsiaDeep", bg: "bg-fuchsia-200", text: "text-fuchsia-950", border: "border-fuchsia-300" },
  { name: "RoseDeep", bg: "bg-rose-200", text: "text-rose-950", border: "border-rose-300" },
  { name: "AmberDeep", bg: "bg-amber-200", text: "text-amber-950", border: "border-amber-300" },
  { name: "EmeraldDeep", bg: "bg-emerald-200", text: "text-emerald-950", border: "border-emerald-300" },
  { name: "TealDeep", bg: "bg-teal-200", text: "text-teal-950", border: "border-teal-300" },
  { name: "LimeDeep", bg: "bg-lime-200", text: "text-lime-950", border: "border-lime-300" },
  { name: "Stone", bg: "bg-stone-200", text: "text-stone-900", border: "border-stone-300" },
] as const;

export type ExecTagColorName = (typeof EXEC_TAG_COLORS)[number]["name"];

export function execTagStyle(colorName: string) {
  return (
    EXEC_TAG_COLORS.find((c) => c.name === colorName) ?? EXEC_TAG_COLORS[0]
  );
}
