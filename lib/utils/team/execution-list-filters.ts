import { distinctOptions } from "@/lib/utils/distinct-options";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_COLUMNS,
} from "@/lib/constants/team/execution-ui";
import type { NormalizedExecutionTask } from "@/lib/types/team/execution";
import {
  EXECUTION_TASK_COL_LABEL,
  EXECUTION_TABLE_SORT_LABEL,
} from "@/lib/constants/team/execution-list-columns";
import type {
  ExecutionTaskColumnFilters,
  ExecutionTaskColumnOptions,
  ExecutionTaskSortKey,
} from "@/lib/types/team/execution-list";
import type { SortDir } from "@/lib/table-sort";
import { compareDate, compareString } from "@/lib/table-sort";

const NONE_ASSIGNEE = "__sem_resp__";
const NONE_DUE = "__sem_prazo__";

function assigneeLabel(t: NormalizedExecutionTask) {
  return t.assignee?.displayName || t.responsibleName || "—";
}

function assigneeIdOrNone(t: NormalizedExecutionTask) {
  return t.authUserId ?? (t.responsibleName ? `name:${t.responsibleName}` : NONE_ASSIGNEE);
}

function localDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { dateStyle: "medium" });
}

const PRIORITY_ORDER: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

const STATUS_ORDER: Record<string, number> = {
  TODO: 0,
  IN_PROGRESS: 1,
  DONE: 2,
};

export function buildExecutionColumnOptions(
  tasks: NormalizedExecutionTask[],
): ExecutionTaskColumnOptions {
  const title = distinctOptions(tasks, (t) => ({ value: t.title, label: t.title }));
  const priority = TASK_PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
  const status = TASK_STATUS_COLUMNS.map((c) => ({ value: c.id, label: c.label }));
  const assignee = distinctOptions(tasks, (t) => ({
    value: assigneeIdOrNone(t),
    label: assigneeLabel(t),
  }));
  const dueMap = new Map<string, string>();
  let hasNone = false;
  for (const t of tasks) {
    if (!t.dueAt) {
      hasNone = true;
      continue;
    }
    const key = localDateKey(t.dueAt);
    if (!dueMap.has(key)) dueMap.set(key, localDateLabel(t.dueAt));
  }
  const dueAt = [...dueMap.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([value, label]) => ({ value, label }));
  if (hasNone) dueAt.push({ value: NONE_DUE, label: "Sem prazo" });

  const tagSet = new Set<string>();
  for (const t of tasks) {
    for (const tag of t._tagItems) tagSet.add(tag.label);
  }
  const tag = [...tagSet]
    .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }))
    .map((t) => ({ value: t, label: t }));

  return { title, priority, status, assignee, dueAt, tag };
}

export function filterExecutionTasks(
  tasks: NormalizedExecutionTask[],
  filters: ExecutionTaskColumnFilters,
): NormalizedExecutionTask[] {
  return tasks.filter((t) => {
    if (filters.title && !filters.title.has(t.title)) return false;
    if (filters.priority && !filters.priority.has(t.priority)) return false;
    if (filters.status && !filters.status.has(t._status)) return false;
    if (filters.assignee && !filters.assignee.has(assigneeIdOrNone(t))) return false;
    if (filters.dueAt) {
      const k = t.dueAt ? localDateKey(t.dueAt) : NONE_DUE;
      if (!filters.dueAt.has(k)) return false;
    }
    if (filters.tag) {
      const has = t._tagItems.some((x) => filters.tag!.has(x.label));
      if (!has) return false;
    }
    return true;
  });
}

export function sortExecutionTasks(
  rows: NormalizedExecutionTask[],
  sort: { key: ExecutionTaskSortKey; dir: SortDir } | null,
): NormalizedExecutionTask[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "title":
        return compareString(a.title, b.title, dir);
      case "priority": {
        const va = PRIORITY_ORDER[a.priority] ?? 0;
        const vb = PRIORITY_ORDER[b.priority] ?? 0;
        return dir === "asc" ? va - vb : vb - va;
      }
      case "status": {
        const va = STATUS_ORDER[a._status] ?? 0;
        const vb = STATUS_ORDER[b._status] ?? 0;
        return dir === "asc" ? va - vb : vb - va;
      }
      case "assigneeName":
        return compareString(assigneeLabel(a), assigneeLabel(b), dir);
      case "dueAt": {
        if (!a.dueAt && !b.dueAt) return 0;
        if (!a.dueAt) return dir === "asc" ? 1 : -1;
        if (!b.dueAt) return dir === "asc" ? -1 : 1;
        return compareDate(a.dueAt, b.dueAt, dir);
      }
      default:
        return 0;
    }
  });
  return copy;
}

export function buildExecutionFilterSummaryLines(
  options: ExecutionTaskColumnOptions,
  applied: ExecutionTaskColumnFilters,
): string[] {
  const lines: string[] = [];
  for (const key of Object.keys(EXECUTION_TASK_COL_LABEL) as (keyof ExecutionTaskColumnOptions)[]) {
    const set = applied[key];
    if (set === null || set.size === 0) continue;
    const opts = options[key] ?? [];
    const parts = [...set].map(
      (val) => opts.find((o) => o.value === val)?.label ?? val,
    );
    const label = EXECUTION_TASK_COL_LABEL[key];
    lines.push(`${label}: ${parts.join(", ")}`);
  }
  return lines;
}

export function formatExecutionTableSortSummary(
  sort: { key: ExecutionTaskSortKey; dir: SortDir } | null,
): string | null {
  if (!sort) return null;
  const l = EXECUTION_TABLE_SORT_LABEL[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${l} (${dirPt})`;
}

export { assigneeLabel as executionAssigneeLabel };
