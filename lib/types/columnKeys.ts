import type { ColumnOptions, FilterMap } from "./primitives";

/** Key + filtros + opções de coluna a partir de um tuplo de chaves. */
type ColBundle<T extends readonly string[]> = {
  Key: T[number];
  Filters: FilterMap<T[number]>;
  Options: ColumnOptions<T[number]>;
};

type Cols = {
  grades: readonly ["name", "description", "rules"];
  targets: readonly ["name", "category", "player", "status", "targetType", "limitAction"];
  imports: readonly ["fileName", "player", "totalRows", "played", "extraPlay", "didntPlay", "date"];
  players: readonly ["name", "nickname", "email", "nicks", "playerGroup", "coach", "grade", "abi", "status"];
};

type G = ColBundle<Cols["grades"]>;
type Tar = ColBundle<Cols["targets"]>;
type I = ColBundle<Cols["imports"]>;
type P = ColBundle<Cols["players"]>;

export type GradesColumnKey = G["Key"];
export type GradesColumnFilters = G["Filters"];
export type GradesColumnOptions = G["Options"];
export type ColumnKey = GradesColumnKey;

export type TargetsColKey = Tar["Key"];
export type TargetsFilters = Tar["Filters"];
export type TargetsColumnOptions = Tar["Options"];
export type ColKey = TargetsColKey;
export type Filters = TargetsFilters;

export type ImportsColumnKey = I["Key"];
export type ImportsFilters = I["Filters"];

export type PlayersTableColumnKey = P["Key"];
export type PlayersTableColumnFilters = P["Filters"];
