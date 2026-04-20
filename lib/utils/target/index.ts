import { LIMIT_ACTION_LABEL } from "@/lib/constants/grade";
import {
  CATEGORIES,
  TARGET_DISPLAY_PLACEHOLDER,
  TARGET_PROGRESS_TRACK_COLOR_CLASS,
  TARGET_STATUS_CONFIG,
  TARGET_STATUS_SUMMARY_ORDER,
  TARGET_SUMMARY_CARD_SURFACE,
  type TargetStatusConfig,
  type TargetStatusKey,
} from "@/lib/constants/target";
import { timeAgo } from "@/lib/utils/app-routing";
import type {
  TargetsColKey,
  TargetListRow,
  TargetListViewModel,
  TargetSummaryCardData,
  TargetsSummaryInput,
  TargetsTableSortState,
  TargetsColumnOptions,
  TargetsFilters,
} from "@/lib/types";
export type { TargetListViewModel, TargetSummaryCardData } from "@/lib/types";
import { compareString, SortDir } from "@/lib/table-sort";

// ================= STATUS =================

export const getTargetStatusConfig = (
  status: TargetListRow["status"]
): TargetStatusConfig =>
  TARGET_STATUS_CONFIG[status as TargetStatusKey] ??
  TARGET_STATUS_CONFIG.OFF_TRACK;

export const getTargetStatusLabel = (status: TargetListRow["status"]) =>
  getTargetStatusConfig(status).label;

export const getTargetProgressColor = (status: TargetListRow["status"]) =>
  TARGET_PROGRESS_TRACK_COLOR_CLASS[status as TargetStatusKey] ??
  TARGET_PROGRESS_TRACK_COLOR_CLASS.OFF_TRACK;

// ================= PROGRESS =================

export const getTargetProgressPercent = (
  current?: number | null,
  total?: number | null
): number =>
  current == null || total == null || total <= 0
    ? 0
    : Math.min(100, Math.round((current / total) * 100));

const P = TARGET_DISPLAY_PLACEHOLDER;

/**
 * "Volume (sessões, torneios)" → { title: "Volume", parenthetical: "(sessões, torneios)" }.
 * If there is no trailing "(…)" segment, returns the full string as `title`.
 */
export function splitCategoryLabelForDisplay(label: string): {
  title: string;
  parenthetical?: string;
} {
  const m = label.match(/^(.+?)\s+(\([^)]+\))\s*$/);
  if (!m) return { title: label };
  return { title: m[1].trim(), parenthetical: m[2] };
}

export const formatProgressDisplay = (
  current: string | number | null | undefined,
  total: string | number | null | undefined,
  unit?: string | null
): string =>
  total == null
    ? P
    : `${current ?? P} / ${total}${unit ? ` ${unit}` : ""}`;

export const progressLabel = (r: TargetListRow): string => {
  if (r.targetType === "NUMERIC" && r.numericValue != null) {
    return formatProgressDisplay(r.numericCurrent, r.numericValue, r.unit);
  }

  if (r.targetType === "TEXT") {
    return formatProgressDisplay(r.textCurrent, r.textValue);
  }

  return P;
};

// ================= SUMMARY =================

const STATUS_COUNT_MAP: Record<TargetStatusKey, keyof TargetsSummaryInput> = {
  ON_TRACK: "onTrack",
  ATTENTION: "attention",
  OFF_TRACK: "offTrack",
};

export const getStatusSummary = (targets: TargetListRow[]) => {
  const result = { onTrack: 0, attention: 0, offTrack: 0 };

  for (const t of targets) {
    const key = STATUS_COUNT_MAP[t.status as TargetStatusKey] ?? "offTrack";
    result[key]++;
  }

  return result;
};

// ================= VIEW MODEL =================

export const buildTargetListViewModel = (
  target: TargetListRow
): TargetListViewModel => {
  const statusConfig = getTargetStatusConfig(target.status);

  const limitActionConfig =
    target.limitAction != null
      ? LIMIT_ACTION_LABEL[target.limitAction as keyof typeof LIMIT_ACTION_LABEL]
      : null;

  const isNumeric =
    target.targetType === "NUMERIC" && target.numericValue != null;

  const progressPercent = isNumeric
    ? getTargetProgressPercent(target.numericCurrent, target.numericValue)
    : 0;

  return {
    id: target.id,
    name: target.name,
    category: target.category,
    playerId: target.playerId,
    playerName: target.playerName,

    textCurrent: target.textCurrent,
    textValue: target.textValue,

    statusConfig,

    hasLimitAction: !!target.limitAction,
    limitActionLabel: limitActionConfig?.label ?? "",
    limitActionColor: limitActionConfig?.color ?? "",

    isNumeric,
    progressPercent,
    progressColor: getTargetProgressColor(target.status),

    progressCurrent: target.numericCurrent ?? P,
    progressTotal: target.numericValue?.toString() ?? P,
    progressUnit: target.unit,

    showCardProgressBar: target.numericCurrent != null,
    showTableProgressBar:
      target.numericCurrent != null &&
      target.numericValue != null &&
      target.numericValue > 0,

    categoryLabel:
      CATEGORIES.find((c) => c.value === target.category)?.label ?? target.category,
    coachNotes: target.coachNotes,
    coachNotesPreview: target.coachNotes
      ? target.coachNotes.length > 60
        ? `${target.coachNotes.slice(0, 60)}…`
        : target.coachNotes
      : "",
    updatedAtLabel: timeAgo(target.updatedAt),
    updatedAtIso: new Date(target.updatedAt).toISOString(),
  };
};

export const mapTargetsToViewModels = (rows: TargetListRow[]) =>
  rows.map(buildTargetListViewModel);

// ================= SORT =================

const SORT_HANDLERS = {
  name: (a: TargetListRow, b: TargetListRow, dir: SortDir) =>
    compareString(a.name, b.name, dir),

  player: (a: TargetListRow, b: TargetListRow, dir: SortDir) =>
    compareString(a.playerName, b.playerName, dir),

  targetType: (a: TargetListRow, b: TargetListRow, dir: SortDir) =>
    compareString(a.targetType, b.targetType, dir),

  status: (a: TargetListRow, b: TargetListRow, dir: SortDir) =>
    compareString(
      getTargetStatusLabel(a.status),
      getTargetStatusLabel(b.status),
      dir
    ),
} satisfies Record<
  string,
  (a: TargetListRow, b: TargetListRow, dir: SortDir) => number
>;

export const sortTargetsTableRows = (
  rows: TargetListRow[],
  sort: TargetsTableSortState
): TargetListRow[] => {
  if (!sort) return rows;

  const handler = SORT_HANDLERS[sort.key as keyof typeof SORT_HANDLERS];
  if (!handler) return rows;

  return [...rows].sort((a, b) => handler(a, b, sort.dir));
};

// ================= SUMMARY CARDS =================

export const getTargetsSummaryCardsData = (
  summary: TargetsSummaryInput
): TargetSummaryCardData[] =>
  TARGET_STATUS_SUMMARY_ORDER.map((statusKey) => ({
    statusKey,
    config: getTargetStatusConfig(statusKey),
    count: summary[STATUS_COUNT_MAP[statusKey]],
    cardSurfaceClass: TARGET_SUMMARY_CARD_SURFACE[statusKey],
  }));

// ================= FILTERS =================

const COL_LABEL: Record<TargetsColKey, string> = {
  name: "Meta",
  category: "Categoria",
  player: "Jogador",
  status: "Status",
  targetType: "Progresso",
  limitAction: "Ação de limite",
};

function createLabelMap(opts: { value: string; label: string }[]) {
  return new Map(opts.map((o) => [o.value, o.label]));
}

function labelsFromSet(set: Set<string>, map: Map<string, string>) {
  if (!set.size) return "(nenhum valor selecionado)";
  return [...set].map((v) => map.get(v) ?? v).join(", ");
}

export function buildTargetsFilterSummaryLines(
  filters: TargetsFilters,
  options: TargetsColumnOptions,
  opts?: { omitPlayer?: boolean }
): string[] {
  const lines: string[] = [];

  for (const key of Object.keys(COL_LABEL) as TargetsColKey[]) {
    if (opts?.omitPlayer && key === "player") continue;
    const applied = filters[key];

    if (applied !== null) {
      const map = createLabelMap(options[key] ?? []);
      lines.push(`${COL_LABEL[key]}: ${labelsFromSet(applied, map)}`);
    }
  }

  return lines;
}

// ================= SORT LABEL =================

const SORT_LABEL: Partial<Record<TargetsColKey, string>> = {
  name: "Meta",
  player: "Jogador",
  targetType: "Progresso",
  status: "Status",
};

export const formatTargetsSortSummary = (
  sort: { key: TargetsColKey; dir: SortDir } | null
): string | null => {
  if (!sort) return null;

  const label = SORT_LABEL[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";

  return `${label} (${dirPt})`;
};