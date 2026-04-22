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

export const PRIORITY_BADGE: Record<string, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-700",
  MEDIUM: "border-sky-200 bg-sky-50 text-sky-800",
  HIGH: "border-amber-200 bg-amber-50 text-amber-900",
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-900",
};

export function priorityBadgeClass(p: string) {
  return cn("text-[10px] font-semibold tracking-wide", PRIORITY_BADGE[p] ?? PRIORITY_BADGE.MEDIUM);
}

export function priorityLabel(v: string) {
  return TASK_PRIORITY_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

export const COLUMN_WRAP: Record<string, string> = {
  TODO: "border-slate-200/80 bg-slate-50/40",
  IN_PROGRESS: "border-indigo-200/80 bg-indigo-50/30",
  DONE: "border-emerald-200/80 bg-emerald-50/30",
};

export const COLUMN_HEADER: Record<string, string> = {
  TODO: "bg-slate-200/80 text-slate-800",
  IN_PROGRESS: "bg-indigo-200/60 text-indigo-900",
  DONE: "bg-emerald-200/60 text-emerald-900",
};
