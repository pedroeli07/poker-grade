import type { TargetListRow, TargetsSummaryInput, TargetsTableSortState } from "@/lib/types";
import {
  TARGET_STATUS_CONFIG,
  type TargetStatusConfig,
  type TargetStatusKey,
} from "@/lib/constants/target/target-status";
import { LIMIT_ACTION_LABEL } from "@/lib/constants/grade/grade-rule-editor";
import { compareString } from "@/lib/table-sort";

export const getTargetStatusConfig = (status: TargetListRow["status"]): TargetStatusConfig => {
  return TARGET_STATUS_CONFIG[status as TargetStatusKey] ?? TARGET_STATUS_CONFIG.OFF_TRACK;
};

export const getTargetStatusLabel = (status: TargetListRow["status"]): string => {
  return getTargetStatusConfig(status).label;
};

export const getTargetProgressPercent = (
  current: number | null | undefined,
  total: number | null | undefined
): number => {
  if (current == null || total == null || total <= 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
};

export const getTargetProgressColor = (status: TargetListRow["status"]): string => {
  switch (status) {
    case "ON_TRACK":
      return "bg-emerald-500";
    case "ATTENTION":
      return "bg-amber-500";
    default:
      return "bg-red-500";
  }
};

export const progressLabel = (r: TargetListRow): string => {
  if (r.targetType === "NUMERIC" && r.numericValue != null) {
    return `${r.numericCurrent ?? "—"} / ${r.numericValue}${r.unit ? ` ${r.unit}` : ""}`;
  }
  if (r.targetType === "TEXT") {
    return `${r.textCurrent ?? "—"} / ${r.textValue ?? "—"}`;
  }
  return "—";
};

export const formatProgressDisplay = (
  current: string | number | null | undefined,
  total: string | number | null | undefined,
  unit?: string | null
): string => {
  if (total == null) return "—";
  const currentStr = current ?? "—";
  const unitStr = unit ? ` ${unit}` : "";
  return `${currentStr} / ${total}${unitStr}`;
};

export const getStatusSummary = (
  targets: TargetListRow[]
): { onTrack: number; attention: number; offTrack: number } => {
  const result = { onTrack: 0, attention: 0, offTrack: 0 };
  for (const t of targets) {
    if (t.status === "ON_TRACK") result.onTrack++;
    else if (t.status === "ATTENTION") result.attention++;
    else result.offTrack++;
  }
  return result;
};

/**
 * Modelo de UI partilhado por lista de targets (card + tabela).
 * Construído apenas em `.ts` — componentes recebem `vm` e não importam `TargetListRow`.
 */
export interface TargetListViewModel {
  id: string;
  name: string;
  category: string;
  playerId: string;
  playerName: string;
  textCurrent: string | null;
  textValue: string | null;
  statusConfig: TargetStatusConfig;
  hasLimitAction: boolean;
  limitActionLabel: string;
  limitActionColor: string;
  isNumeric: boolean;
  progressPercent: number;
  progressColor: string;
  progressCurrent: string | number;
  progressTotal: string | number;
  progressUnit: string | null;
  /** Barra no layout card (track + preenchimento se houver current). */
  showCardProgressBar: boolean;
  /** Barra preenchida no layout tabela (só se meta numérica > 0). */
  showTableProgressBar: boolean;
}

export const buildTargetListViewModel = (target: TargetListRow): TargetListViewModel => {
  const statusConfig = getTargetStatusConfig(target.status);
  const hasLimitAction = target.limitAction !== null;
  const limitActionConfig = hasLimitAction
    ? LIMIT_ACTION_LABEL[target.limitAction as keyof typeof LIMIT_ACTION_LABEL]
    : null;
  const isNumeric = target.targetType === "NUMERIC" && target.numericValue != null;
  const progressPercent = isNumeric
    ? getTargetProgressPercent(target.numericCurrent, target.numericValue)
    : 0;
  const progressColor = getTargetProgressColor(target.status);

  return {
    id: target.id,
    name: target.name,
    category: target.category,
    playerId: target.playerId,
    playerName: target.playerName,
    textCurrent: target.textCurrent,
    textValue: target.textValue,
    statusConfig,
    hasLimitAction,
    limitActionLabel: limitActionConfig?.label ?? "",
    limitActionColor: limitActionConfig?.color ?? "",
    isNumeric,
    progressPercent,
    progressColor,
    progressCurrent: target.numericCurrent ?? "—",
    progressTotal: target.numericValue?.toString() ?? "—",
    progressUnit: target.unit,
    showCardProgressBar: target.numericCurrent != null,
    showTableProgressBar:
      target.numericCurrent != null &&
      target.numericValue != null &&
      target.numericValue > 0,
  };
};

export const mapTargetsToViewModels = (rows: TargetListRow[]): TargetListViewModel[] =>
  rows.map(buildTargetListViewModel);

/** Superfície do card de resumo (borda + fundo); evita `.replace()` frágil no TSX. */
export const TARGET_SUMMARY_CARD_SURFACE: Record<TargetStatusKey, string> = {
  ON_TRACK: "border border-emerald-500/20 bg-emerald-500/5",
  ATTENTION: "border border-amber-500/20 bg-amber-500/5",
  OFF_TRACK: "border border-red-500/20 bg-red-500/5",
};

export interface TargetSummaryCardData {
  statusKey: TargetStatusKey;
  config: TargetStatusConfig;
  count: number;
  cardSurfaceClass: string;
}

export const sortTargetsTableRows = (
  rows: TargetListRow[],
  sort: TargetsTableSortState
): TargetListRow[] => {
  if (!sort) return rows;
  const { key, dir } = sort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "name":
        return compareString(a.name, b.name, dir);
      case "player":
        return compareString(a.playerName, b.playerName, dir);
      case "targetType":
        return compareString(a.targetType, b.targetType, dir);
      case "status":
        return compareString(getTargetStatusLabel(a.status), getTargetStatusLabel(b.status), dir);
      default:
        return 0;
    }
  });
  return copy;
};

export const getTargetsSummaryCardsData = (summary: TargetsSummaryInput): TargetSummaryCardData[] => {
  const statusOrder: TargetStatusKey[] = ["ON_TRACK", "ATTENTION", "OFF_TRACK"];
  const summaryMap: Record<TargetStatusKey, number> = {
    ON_TRACK: summary.onTrack,
    ATTENTION: summary.attention,
    OFF_TRACK: summary.offTrack,
  };

  return statusOrder.map((statusKey) => ({
    statusKey,
    config: getTargetStatusConfig(statusKey),
    count: summaryMap[statusKey],
    cardSurfaceClass: TARGET_SUMMARY_CARD_SURFACE[statusKey],
  }));
};