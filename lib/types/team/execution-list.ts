import type { ColumnOptions, FilterMap } from "@/lib/types/primitives";

export const EXECUTION_TASK_FILTER_COLS = [
  "title",
  "priority",
  "status",
  "assignee",
  "dueAt",
  "tag",
] as const;

export type ExecutionTaskColKey = (typeof EXECUTION_TASK_FILTER_COLS)[number];
export type ExecutionTaskColumnFilters = FilterMap<ExecutionTaskColKey>;
export type ExecutionTaskColumnOptions = ColumnOptions<ExecutionTaskColKey>;

export type ExecutionTasksSetCol = (
  col: ExecutionTaskColKey,
) => (next: Set<string> | null) => void;

export type ExecutionTaskSortKey =
  | "title"
  | "priority"
  | "status"
  | "assigneeName"
  | "dueAt";
