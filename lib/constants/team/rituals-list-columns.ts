import type { RitualListColKey, RitualListSortKey } from "@/lib/types/team/rituals-list";
import type { ColumnSortKind } from "@/lib/types/dataTable";

export const RITUAL_LIST_COL_LABEL: Record<RitualListColKey, string> = {
  name: "Ritual",
  ritualType: "Tipo",
  area: "Área",
  dri: "DRI",
  recurrence: "Recorrência",
  startAt: "Data inicial",
  durationMin: "Duração",
  status: "Status",
};

export const RITUAL_TABLE_SORT_LABEL: Record<RitualListSortKey, string> = {
  name: "Ritual",
  startAt: "Data inicial",
  area: "Área",
  ritualType: "Tipo",
  recurrence: "Recorrência",
  driName: "DRI",
  status: "Status",
  durationMin: "Duração",
};

type HeadCol = {
  id: string;
  width: string;
  label: string;
  filterCol: RitualListColKey | null;
  sortKey: RitualListSortKey | null;
  sortKind: ColumnSortKind | null;
};

export const RITUAL_TABLE_HEAD_COLUMNS: HeadCol[] = [
  {
    id: "r-name",
    width: "w-[28%] min-w-[220px]",
    label: "Ritual",
    filterCol: "name",
    sortKey: "name",
    sortKind: "string",
  },
  {
    id: "r-type",
    width: "w-[9%]",
    label: "Tipo",
    filterCol: "ritualType",
    sortKey: "ritualType",
    sortKind: "string",
  },
  {
    id: "r-area",
    width: "w-[11%]",
    label: "Área",
    filterCol: "area",
    sortKey: "area",
    sortKind: "string",
  },
  {
    id: "r-dri",
    width: "w-[12%]",
    label: "DRI",
    filterCol: "dri",
    sortKey: "driName",
    sortKind: "string",
  },
  {
    id: "r-rec",
    width: "w-[10%]",
    label: "Recorrência",
    filterCol: "recurrence",
    sortKey: "recurrence",
    sortKind: "string",
  },
  {
    id: "r-when",
    width: "w-[9%] whitespace-nowrap",
    label: "Data inicial",
    filterCol: "startAt",
    sortKey: "startAt",
    sortKind: "date",
  },
  {
    id: "r-dur",
    width: "w-[7%]",
    label: "Duração",
    filterCol: "durationMin",
    sortKey: "durationMin",
    sortKind: "number",
  },
  {
    id: "r-st",
    width: "w-[9%]",
    label: "Status",
    filterCol: "status",
    sortKey: "status",
    sortKind: "string",
  },
];
