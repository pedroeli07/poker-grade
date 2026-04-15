import type { ImportsColumnKey } from "@/lib/types";

const IMPORT_COLS = [
  ["fileName", "Arquivo", "imp-file"],
  ["player", "Jogador", "imp-player"],
  ["totalRows", "Total", "imp-total"],
  ["played", "Jogados", "imp-played"],
  ["extraPlay", "Extra Play", "imp-extra"],
  ["didntPlay", "Não Jogados", "imp-didnt"],
  ["date", "Data", "imp-date"],
] as const satisfies readonly (readonly [ImportsColumnKey, string, string])[];

export const IMPORTS_TABLE_COLUMN_ORDER: ImportsColumnKey[] = IMPORT_COLS.map((r) => r[0]);

export const IMPORTS_COLUMN_LABELS = Object.fromEntries(
  IMPORT_COLS.map(([k, label]) => [k, label]),
) as Record<ImportsColumnKey, string>;

export const IMPORTS_COLUMN_IDS = Object.fromEntries(
  IMPORT_COLS.map(([k, , id]) => [k, id]),
) as Record<ImportsColumnKey, string>;
