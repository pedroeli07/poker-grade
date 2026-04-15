import type { GradesColumnFilters, GradesColumnKey, GradesColumnOptions } from "@/lib/types";

const COL_LABEL: Record<GradesColumnKey, string> = {
  name: "Nome",
  description: "Descrição",
  rules: "Regras",
  players: "Jogadores",
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

export function buildGradesFilterSummaryLines(
  filters: GradesColumnFilters,
  options: GradesColumnOptions
): string[] {
  const lines: string[] = [];
  (Object.keys(COL_LABEL) as GradesColumnKey[]).forEach((key) => {
    const applied = filters[key];
    if (applied !== null) {
      lines.push(`${COL_LABEL[key]}: ${labelsFromSet(applied, options[key] ?? [])}`);
    }
  });
  return lines;
}
