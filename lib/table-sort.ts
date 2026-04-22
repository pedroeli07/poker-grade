export type SortDir = "asc" | "desc";

/** Ordenação de coluna em tabelas (reutilizável em qualquer grid). */
export type TableSortState<K extends string = string> = { key: K; dir: SortDir } | null;

/** Próximo estado ao clicar no cabeçalho: primeira vez usa direção padrão por tipo de coluna. */
export function nextSortState<K extends string>(
  prev: TableSortState<K>,
  key: K,
  kind: "number" | "string" | "date"
): { key: K; dir: SortDir } {
  if (!prev || prev.key !== key) {
    const dir: SortDir =
      kind === "string" ? "asc" : kind === "date" ? "desc" : "desc";
    return { key, dir };
  }
  return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
}

export function compareNumberNullsLast(a: number | null, b: number | null, dir: SortDir): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  const d = a - b;
  return dir === "asc" ? d : -d;
}

export function compareNumber(a: number, b: number, dir: SortDir): number {
  const d = a - b;
  return dir === "asc" ? d : -d;
}

export function compareString(a: string, b: string, dir: SortDir): number {
  const c = a.localeCompare(b, "pt-BR", { sensitivity: "base" });
  return dir === "asc" ? c : -c;
}

export function compareDate(a: Date | string, b: Date | string, dir: SortDir): number {
  const ta = new Date(a).getTime();
  const tb = new Date(b).getTime();
  const d = ta - tb;
  return dir === "asc" ? d : -d;
}
