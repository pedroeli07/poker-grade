import type { ColumnOptions, FilterMap } from "./primitives";

export type GradesColumnKey = "name" | "description" | "rules" | "players";
export type GradesColumnFilters = FilterMap<GradesColumnKey>;
export type GradesColumnOptions = ColumnOptions<GradesColumnKey>;

export type ColKey = "name" | "category" | "player" | "status" | "targetType" | "limitAction";
export type Filters = FilterMap<ColKey>;
export type TargetsColumnOptions = ColumnOptions<ColKey>;

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
  | "playerGroup"
  | "coach"
  | "grade"
  | "abi"
  | "status";
export type PlayersTableColumnFilters = FilterMap<PlayersTableColumnKey>;

export type UsuariosColumnKey = "email" | "role" | "status";
export type UsuariosColumnFilters = FilterMap<UsuariosColumnKey>;

export type AnalyticsSiteFilters = Record<"network", Set<string> | null>;
export type AnalyticsSiteColumnKey = "network";
export type AnalyticsRankingFilters = Record<"player", Set<string> | null>;
export type AnalyticsRankingColumnKey = "player";
export type AnalyticsTierFilters = Record<"tier", Set<string> | null>;
export type AnalyticsTierColumnKey = "tier";
export type AnalyticsBountyFilters = Record<"type", Set<string> | null>;
export type AnalyticsBountyColumnKey = "type";

/** @deprecated Use GradesColumnKey */
export type ColumnKey = GradesColumnKey;
/** @deprecated Use GradesColumnFilters */
export type ColumnFilters = GradesColumnFilters;
