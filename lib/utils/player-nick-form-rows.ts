import { getPokerstarsMainNickFromRows } from "@/lib/constants/poker-networks";

export type PlayerNickFormRow = { network: string; nick: string };

export function updateNickNetworkAt(
  rows: PlayerNickFormRow[],
  index: number,
  network: string
): PlayerNickFormRow[] {
  const next = [...rows];
  next[index] = { ...next[index], network };
  if ((network === "pokerstars_fr" || network === "pokerstars_es") && !next[index].nick.trim()) {
    const main = getPokerstarsMainNickFromRows(next);
    if (main) next[index] = { ...next[index], nick: main };
  }
  return next;
}

export function updateNickValueAt(
  rows: PlayerNickFormRow[],
  index: number,
  nick: string
): PlayerNickFormRow[] {
  const next = [...rows];
  next[index] = { ...next[index], nick };
  return next;
}

export function removeNickRowAt(rows: PlayerNickFormRow[], index: number): PlayerNickFormRow[] {
  return rows.filter((_, i) => i !== index);
}

export function appendEmptyNickRow(rows: PlayerNickFormRow[]): PlayerNickFormRow[] {
  return [...rows, { network: "", nick: "" }];
}
