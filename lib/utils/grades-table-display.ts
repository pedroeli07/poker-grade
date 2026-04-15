import type { GradesColumnKey } from "@/lib/types/columnKeys";
import type { SortDir } from "@/lib/table-sort";

const SORT_LABEL: Record<GradesColumnKey, string> = {
  name: "Nome",
  description: "Descrição",
  rules: "Regras",
  players: "Jogadores",
};

export function formatGradesTableSortSummary(
  sort: { key: GradesColumnKey; dir: SortDir } | null
): string | null {
  if (!sort) return null;
  const label = SORT_LABEL[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${label} (${dirPt})`;
}
