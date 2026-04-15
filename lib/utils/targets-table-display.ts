import type { ColKey, Filters, TargetsColumnOptions } from "@/lib/types";
import type { SortDir } from "@/lib/table-sort";

const COL_LABEL: Record<ColKey, string> = {
  name: "Meta",
  category: "Categoria",
  player: "Jogador",
  status: "Status",
  targetType: "Progresso",
  limitAction: "Ação de limite",
};

function labelsFromSet(
  set: Set<string>,
  opts: { value: string; label: string }[]
): string {
  if (set.size === 0) return "(nenhum valor selecionado)";
  return [...set]
    .map((val) => opts.find((o) => o.value === val)?.label ?? val)
    .join(", ");
}

export function buildTargetsFilterSummaryLines(
  filters: Filters,
  options: TargetsColumnOptions
): string[] {
  const lines: string[] = [];
  (Object.keys(COL_LABEL) as ColKey[]).forEach((key) => {
    const applied = filters[key];
    if (applied !== null) {
      lines.push(`${COL_LABEL[key]}: ${labelsFromSet(applied, options[key] ?? [])}`);
    }
  });
  return lines;
}

const SORT_LABEL: Partial<Record<ColKey, string>> = {
  name: "Meta",
  player: "Jogador",
  targetType: "Progresso",
  status: "Status",
};

export function formatTargetsSortSummary(
  sort: { key: ColKey; dir: SortDir } | null
): string | null {
  if (!sort) return null;
  const label = SORT_LABEL[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${label} (${dirPt})`;
}
