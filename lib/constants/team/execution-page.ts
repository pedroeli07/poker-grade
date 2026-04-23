import type { ExecutionTaskFormState } from "@/lib/types/team/execution";

export const EMPTY_EXECUTION_TASK_FORM: ExecutionTaskFormState = {
  id: undefined,
  title: "",
  description: "",
  authUserId: "",
  priority: "MEDIUM",
  status: "TODO",
  prazo: "",
  criterio: "",
  tagEntries: [],
};
