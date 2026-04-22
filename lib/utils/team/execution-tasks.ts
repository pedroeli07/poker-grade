import type { Prisma } from "@prisma/client";
import type { TaskStatusId } from "@/lib/constants/team/execution-ui";
import type { ExecutionTaskDTO } from "@/lib/data/team/execution-page";
import type { NormalizedExecutionTask } from "@/lib/types/team/execution";

export function tagsFromJson(j: Prisma.JsonValue): string[] {
  if (Array.isArray(j)) {
    return j
      .map((x) => {
        if (typeof x === "string") return x;
        if (x && typeof x === "object" && "label" in x) return String((x as { label: string }).label);
        return "";
      })
      .filter(Boolean);
  }
  return [];
}

export function normalizeTaskStatus(s: string): TaskStatusId {
  if (s === "TODO" || s === "IN_PROGRESS" || s === "DONE") return s;
  return "TODO";
}

export function normalizeExecutionTasks(tasks: ExecutionTaskDTO[]): NormalizedExecutionTask[] {
  return tasks.map((t) => ({
    ...t,
    _status: normalizeTaskStatus(t.status),
    _tags: tagsFromJson(t.tags),
  }));
}

export function filterExecutionTasksBySearch(tasks: NormalizedExecutionTask[], search: string) {
  const q = search.toLowerCase().trim();
  if (!q) return tasks;
  return tasks.filter(
    (t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)),
  );
}
