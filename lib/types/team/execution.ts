import type { TaskStatusId } from "@/lib/constants/team/execution-ui";
import type { ExecutionTaskDTO } from "@/lib/data/team/execution-page";

export type NormalizedExecutionTask = ExecutionTaskDTO & { _status: TaskStatusId; _tags: string[] };

export type ExecutionTaskFormState = {
  id: string | undefined;
  title: string;
  description: string;
  authUserId: string;
  priority: string;
  status: string;
  prazo: string;
  criterio: string;
  tagsText: string;
};

export type ExecutionTaskCardProps = {
  task: NormalizedExecutionTask;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (id: string, status: string) => void;
  pending: boolean;
};

export type ExecutionTaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ExecutionTaskFormState;
  onFormChange: (patch: Partial<ExecutionTaskFormState>) => void;
  onSave: () => void;
  staff: { id: string; name: string }[];
  pending: boolean;
};

export type ExecutionDeleteTaskDialogProps = {
  deleteId: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
};

export type ExecutionPageHeaderProps = {
  search: string;
  onSearchChange: (q: string) => void;
  onNew: () => void;
  canCreate: boolean;
};

export type ExecutionKanbanBoardProps = {
  statusColumns: readonly { id: TaskStatusId; label: string }[];
  tasksForColumn: (status: TaskStatusId) => NormalizedExecutionTask[];
  onEditTask: (task: NormalizedExecutionTask) => void;
  onRequestDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  pending: boolean;
};
