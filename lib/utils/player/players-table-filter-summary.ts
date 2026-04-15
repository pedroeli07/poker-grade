import type { PlayersTableColumnFilters } from "@/lib/types";
import {
  isFilterActive,
  formatNumberValue,
  OP_LABELS,
  type NumberFilterValue,
} from "@/lib/number-filter";

export type PlayersTableFilterOptions = {
  name: { value: string; label: string }[];
  nicks: { value: string; label: string }[];
  playerGroup: { value: string; label: string }[];
  coach: { value: string; label: string }[];
  grade: { value: string; label: string }[];
  abi: { value: string; label: string }[];
  status: { value: string; label: string }[];
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

export function formatNumberFilterSummary(v: NumberFilterValue, suffix: string): string {
  if (v.op === "in" && v.values && v.values.length > 0) {
    return v.values.map((x) => formatNumberValue(x, suffix)).join(", ");
  }
  if (v.op === "between") {
    if (v.min !== null && v.max !== null) {
      return `${formatNumberValue(v.min, suffix)} – ${formatNumberValue(v.max, suffix)}`;
    }
    if (v.min !== null) return `≥ ${formatNumberValue(v.min, suffix)}`;
    if (v.max !== null) return `≤ ${formatNumberValue(v.max, suffix)}`;
  }
  if (v.op === "eq" && v.min !== null) {
    return `= ${formatNumberValue(v.min, suffix)}`;
  }
  if (v.min !== null) {
    return `${OP_LABELS[v.op]} ${formatNumberValue(v.min, suffix)}`;
  }
  return "";
}

export function buildPlayersFilterSummaryLines(
  filters: PlayersTableColumnFilters,
  options: PlayersTableFilterOptions,
  numFilters: Record<string, NumberFilterValue | null | undefined>
): string[] {
  const lines: string[] = [];

  if (filters.name !== null) {
    lines.push(`Nome: ${labelsFromSet(filters.name, options.name)}`);
  }
  if (filters.nicks !== null) {
    lines.push(`Nicks: ${labelsFromSet(filters.nicks, options.nicks)}`);
  }
  if (filters.playerGroup !== null) {
    lines.push(`Grupo Shark: ${labelsFromSet(filters.playerGroup, options.playerGroup)}`);
  }
  if (filters.coach !== null) {
    lines.push(`Coach: ${labelsFromSet(filters.coach, options.coach)}`);
  }
  if (filters.grade !== null) {
    lines.push(`Grade: ${labelsFromSet(filters.grade, options.grade)}`);
  }
  if (filters.abi !== null) {
    lines.push(`ABI: ${labelsFromSet(filters.abi, options.abi)}`);
  }
  if (filters.status !== null) {
    lines.push(`Status: ${labelsFromSet(filters.status, options.status)}`);
  }

  const roi = numFilters.roiTenDay;
  if (roi && isFilterActive(roi)) {
    lines.push(`ROI (10d): ${formatNumberFilterSummary(roi, "%")}`);
  }
  const fp = numFilters.fpTenDay;
  if (fp && isFilterActive(fp)) {
    lines.push(`FP (10d): ${formatNumberFilterSummary(fp, "%")}`);
  }
  const ft = numFilters.ftTenDay;
  if (ft && isFilterActive(ft)) {
    lines.push(`FT (10d): ${formatNumberFilterSummary(ft, "%")}`);
  }

  return lines;
}
