import type { UsuariosColumnKey } from "@/lib/types";
import type { SortDir } from "@/lib/table-sort";

const COL_LABEL: Record<UsuariosColumnKey, string> = {
  email: "Membro",
  role: "Cargo",
  status: "Status",
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

export function buildUsuariosFilterSummaryLines(
  searchQuery: string,
  filters: {
    email: Set<string> | null;
    role: Set<string> | null;
    status: Set<string> | null;
  },
  options: Record<UsuariosColumnKey, { value: string; label: string }[]>
): string[] {
  const lines: string[] = [];
  const q = searchQuery.trim();
  if (q) {
    lines.push(`Busca: ${q}`);
  }
  (Object.keys(COL_LABEL) as UsuariosColumnKey[]).forEach((key) => {
    const applied = filters[key];
    if (applied !== null) {
      lines.push(`${COL_LABEL[key]}: ${labelsFromSet(applied, options[key] ?? [])}`);
    }
  });
  return lines;
}

const SORT_LABEL: Record<UsuariosColumnKey, string> = {
  email: "Membro",
  role: "Cargo",
  status: "Status",
};

export function formatUsuariosSortSummary(
  sort: { key: UsuariosColumnKey; dir: SortDir } | null
): string | null {
  if (!sort) return null;
  const label = SORT_LABEL[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${label} (${dirPt})`;
}
