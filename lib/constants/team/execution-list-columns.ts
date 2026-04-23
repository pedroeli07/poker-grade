import type { ColumnSortKind } from "@/lib/types/dataTable";
import type {
  ExecutionTaskColKey,
  ExecutionTaskSortKey,
} from "@/lib/types/team/execution-list";

export const EXECUTION_TASK_COL_LABEL: Record<ExecutionTaskColKey, string> = {
  title: "Tarefa",
  priority: "Prioridade",
  status: "Status",
  assignee: "Responsável",
  dueAt: "Prazo",
  tag: "Tag",
};

export const EXECUTION_CARD_FILTER_COLUMNS: [string, ExecutionTaskColKey, string][] = [
  ["execution-f-title", "title", "Tarefa"],
  ["execution-f-priority", "priority", "Prioridade"],
  ["execution-f-status", "status", "Status"],
  ["execution-f-assignee", "assignee", "Responsável"],
  ["execution-f-due", "dueAt", "Prazo"],
  ["execution-f-tag", "tag", "Tag"],
];

export const EXECUTION_TABLE_SORT_LABEL: Record<ExecutionTaskSortKey, string> = {
  title: "Tarefa",
  priority: "Prioridade",
  status: "Status",
  assigneeName: "Responsável",
  dueAt: "Prazo",
};

type HeadCol = {
  id: string;
  width: string;
  label: string;
  filterCol: ExecutionTaskColKey | null;
  sortKey: ExecutionTaskSortKey | null;
  sortKind: ColumnSortKind | null;
};

export const EXECUTION_TABLE_HEAD_COLUMNS: HeadCol[] = [
  {
    id: "e-title",
    width: "w-[34%] min-w-[240px]",
    label: "Tarefa",
    filterCol: "title",
    sortKey: "title",
    sortKind: "string",
  },
  {
    id: "e-priority",
    width: "w-[10%]",
    label: "Prioridade",
    filterCol: "priority",
    sortKey: "priority",
    sortKind: "string",
  },
  {
    id: "e-status",
    width: "w-[12%]",
    label: "Status",
    filterCol: "status",
    sortKey: "status",
    sortKind: "string",
  },
  {
    id: "e-assignee",
    width: "w-[15%]",
    label: "Responsável",
    filterCol: "assignee",
    sortKey: "assigneeName",
    sortKind: "string",
  },
  {
    id: "e-due",
    width: "w-[10%] whitespace-nowrap",
    label: "Prazo",
    filterCol: "dueAt",
    sortKey: "dueAt",
    sortKind: "date",
  },
  {
    id: "e-tags",
    width: "w-[12%]",
    label: "Tags",
    filterCol: "tag",
    sortKey: null,
    sortKind: null,
  },
];
