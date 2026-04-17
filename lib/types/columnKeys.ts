import type { ColumnOptions, FilterMap } from "./primitives";

export type GradesColumnKey = "name" | "description" | "rules";
export type GradesColumnFilters = FilterMap<GradesColumnKey>;
export type GradesColumnOptions = ColumnOptions<GradesColumnKey>;

export type TargetsColKey =
  | "name"
  | "category"
  | "player"
  | "status"
  | "targetType"
  | "limitAction";
export type TargetsFilters = FilterMap<TargetsColKey>;
export type TargetsColumnOptions = ColumnOptions<TargetsColKey>;

export type ImportsColumnKey =
  | "fileName"
  | "player"
  | "totalRows"
  | "played"
  | "extraPlay"
  | "didntPlay"
  | "date";
export type ImportsFilters = FilterMap<ImportsColumnKey>;

export type PlayersTableColumnKey =
  | "name"
  | "nickname"
  | "email"
  | "nicks"
  | "playerGroup"
  | "coach"
  | "grade"
  | "abi"
  | "status";
export type PlayersTableColumnFilters = FilterMap<PlayersTableColumnKey>;

/** @deprecated Use GradesColumnKey */
export type ColumnKey = GradesColumnKey;
/** @deprecated Use GradesColumnFilters */
export type ColumnFilters = GradesColumnFilters;
/** @deprecated Use TargetsColKey */
export type ColKey = TargetsColKey;
/** @deprecated Use TargetsFilters */
export type Filters = TargetsFilters;
