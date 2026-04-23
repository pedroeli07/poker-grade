import type { ColumnOptions, FilterMap } from "@/lib/types/primitives";

export const RITUAL_LIST_FILTER_COLS = [
  "name",
  "ritualType",
  "area",
  "dri",
  "recurrence",
  "startAt",
  "durationMin",
  "status",
] as const;

export type RitualListColKey = (typeof RITUAL_LIST_FILTER_COLS)[number];
export type RitualListColumnFilters = FilterMap<RitualListColKey>;
export type RitualListColumnOptions = ColumnOptions<RitualListColKey>;

export type RitualListSetCol = (col: RitualListColKey) => (next: Set<string> | null) => void;

export type RitualListSortKey =
  | "name"
  | "startAt"
  | "area"
  | "ritualType"
  | "recurrence"
  | "driName"
  | "status"
  | "durationMin";
