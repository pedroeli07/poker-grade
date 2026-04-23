import type { ExecutionTaskColumnFilters } from "@/lib/types/team/execution-list";
import { createFilterStore } from "@/lib/stores/create-filter-store";

const defaultFilters: ExecutionTaskColumnFilters = {
  title: null,
  priority: null,
  status: null,
  assignee: null,
  dueAt: null,
  tag: null,
};

export const useExecutionTasksListStore = createFilterStore<ExecutionTaskColumnFilters>(
  defaultFilters,
  "gestao-grades:execution:tasks:filters",
);
