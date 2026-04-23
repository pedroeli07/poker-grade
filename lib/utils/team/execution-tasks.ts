import type { Prisma } from "@prisma/client";
import { EXEC_TAG_COLORS, type TaskStatusId } from "@/lib/constants/team/execution-ui";
import type { ExecutionTaskDTO } from "@/lib/data/team/execution-page";
import type { ExecutionTagItem, NormalizedExecutionTask } from "@/lib/types/team/execution";

function pickColorName(i: number) {
  return EXEC_TAG_COLORS[i % EXEC_TAG_COLORS.length]!.name;
}

export function tagItemsFromJson(j: Prisma.JsonValue): ExecutionTagItem[] {
  if (!Array.isArray(j)) return [];
  return j
    .map((x, i) => {
      if (typeof x === "string")
        return { label: x, colorName: pickColorName(i) };
      if (x && typeof x === "object" && "label" in x) {
        const o = x as { label: string; colorName?: string };
        return {
          label: String(o.label).trim(),
          colorName: o.colorName && EXEC_TAG_COLORS.some((c) => c.name === o.colorName) ? o.colorName : pickColorName(i),
        };
      }
      return { label: "", colorName: pickColorName(i) };
    })
    .filter((t) => t.label.length > 0);
}

export function normalizeTaskStatus(s: string): TaskStatusId {
  if (s === "TODO" || s === "IN_PROGRESS" || s === "DONE") return s;
  return "TODO";
}

export function normalizeExecutionTasks(tasks: ExecutionTaskDTO[]): NormalizedExecutionTask[] {
  return tasks.map((t) => ({
    ...t,
    _status: normalizeTaskStatus(t.status),
    _tagItems: tagItemsFromJson(t.tags),
  }));
}

export function filterExecutionTasksBySearch(tasks: NormalizedExecutionTask[], search: string) {
  const q = search.toLowerCase().trim();
  if (!q) return tasks;
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      t._tagItems.some((tag) => tag.label.toLowerCase().includes(q)),
  );
}
