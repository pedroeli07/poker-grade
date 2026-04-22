/** Chave YYYY-MM-DD no fuso local (alinhada a `<input type="date">`). */
export function dayKeyFromDate(d: Date): string {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type OpponentsLastNoteFilterState = {
  /** `null` = sem filtro por datas individuais (equivalente a “todas”). */
  unique: Set<string> | null;
  dateFrom: string | null;
  dateTo: string | null;
};

export function matchLastNoteColumnFilter(
  lastNoteAt: Date,
  f: OpponentsLastNoteFilterState
): boolean {
  const key = dayKeyFromDate(new Date(lastNoteAt));
  if (f.unique !== null && !f.unique.has(key)) return false;
  if (f.dateFrom && key < f.dateFrom) return false;
  if (f.dateTo && key > f.dateTo) return false;
  return true;
}

export function isLastNoteFilterActive(f: OpponentsLastNoteFilterState): boolean {
  if (f.unique !== null) return true;
  if (f.dateFrom || f.dateTo) return true;
  return false;
}
