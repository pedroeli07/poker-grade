import {
  ANALYTICS_ABILITY_BADGE_CLASS_RULES,
  ANALYTICS_ABILITY_BADGE_CLASS_TOP,
  ANALYTICS_CHART_LABEL_MAX_LEN,
  ANALYTICS_FINISH_SEVERITY_BADGE_CLASS,
  ANALYTICS_METRIC_BAR_AXIS,
  ANALYTICS_METRIC_BAR_DEFAULT_BLUE,
  ANALYTICS_METRIC_BAR_PCT_AXIS_METRICS,
  ANALYTICS_METRIC_BAR_SITE_FILLS,
  ANALYTICS_PROFIT_NEGATIVE_RED,
  ANALYTICS_PROFIT_POSITIVE_GREEN,
  ANALYTICS_ROI_BAR_FILLS,
  ANALYTICS_ROI_BAR_THRESHOLD_RULES,
  ANALYTICS_ROI_BAR_Y_AXIS,
  ANALYTICS_SITE_CHART_HEURISTIC_METRICS,
  ANALYTICS_SITE_PERIOD_LABEL,
  ANALYTICS_SITE_UI,
  ANALYTICS_TABLE_COMMON_NUM_SORT_KEYS,
  ANALYTICS_TABLE_INTL_USD_0,
  ANALYTICS_TABLE_INTL_USD_2,
  ANALYTICS_TABLE_MISSING_VALUE,
  analyticsSiteNPlayersLabel,
  BOUNTY_TIER_SORT_ORDER,
  entriesFmt,
  pctFmt,
  profitFmt,
  SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT,
} from "@/lib/constants/sharkscope/analytics";
import type { NetworkStat, TierStat, TypeStat } from "@/lib/types";
import type {
  AnalyticsMetricBarRow,
  AnalyticsRoiBarChartDatum,
  AnalyticsRoiBarRow,
  AnalyticsSortState,
  BountySortKey,
  MetricBarYAxisDomain,
  RankingEntry,
  RankingSortKey,
  RoiBarYAxisDomain,
  SharkscopeAnalyticsPeriod,
  SiteAnalyticsPayload,
  SiteAnalyticsPlayerRef,
  TierSortKey,
  SiteTableSortKey,
} from "@/lib/types/sharkscope/analytics";
import {
  mergeNetworkStatsForSelection,
  SITE_CHART_Y_METRICS,
  siteChartYValue,
  type SiteChartMetricRow,
  type SiteChartYMetric,
} from "@/lib/site-analytics-chart";
import { compareNumber, compareNumberNullsLast, compareString, type SortDir } from "@/lib/table-sort";

// ─── ROI bar (cores) ─────────────────────────────────────────────────────────

/** Cor da barra por ROI % (alinhado ao gráfico por métrica quando métrica = ROI). */
export function analyticsBarRoiFillByPercent(roi: number): string {
  for (const rule of ANALYTICS_ROI_BAR_THRESHOLD_RULES) {
    if (roi >= rule.min) return rule.fill;
  }
  return ANALYTICS_ROI_BAR_FILLS.negative;
}

// ─── Gráfico métricas por rede ───────────────────────────────────────────────

export function metricBarFillForCell(metric: SiteChartYMetric, v: number, key: string): string {
  const siteColor = ANALYTICS_METRIC_BAR_SITE_FILLS[key.toLowerCase()];
  if (siteColor) return siteColor;
  if (metric === "roi") return analyticsBarRoiFillByPercent(v);
  if (metric === "profit") return v >= 0 ? ANALYTICS_PROFIT_POSITIVE_GREEN : ANALYTICS_PROFIT_NEGATIVE_RED;
  return ANALYTICS_METRIC_BAR_DEFAULT_BLUE;
}

export function metricBarYAxisDomain(metric: SiteChartYMetric, values: number[]): MetricBarYAxisDomain {
  const minV = values.length ? Math.min(...values) : 0;
  const maxV = values.length ? Math.max(...values) : 1;
  const span = maxV - minV || 1;
  const ax = ANALYTICS_METRIC_BAR_AXIS;
  const pad = Math.max(
    Math.abs(span) * ax.spanPadRatio,
    metric === "profit"
      ? Math.abs(maxV) * ax.profitMaxPadRatio
      : metric === "entries"
        ? Math.max(ax.entriesPadMin, maxV * ax.entriesMaxPadRatio)
        : ax.defaultPad
  );
  const isPctAxis = ANALYTICS_METRIC_BAR_PCT_AXIS_METRICS.has(metric);
  const domainMin = isPctAxis
    ? Math.min(0, minV) - pad
    : metric === "entries"
      ? Math.max(0, minV - pad)
      : minV - pad;
  return { domainMin, domainMax: maxV + pad };
}

// ─── ROI bar chart (dados) ───────────────────────────────────────────────────

export function mapRoiBarChartData(rows: AnalyticsRoiBarRow[]): AnalyticsRoiBarChartDatum[] {
  const out: AnalyticsRoiBarChartDatum[] = [];
  for (const r of rows) {
    if (r.roi === null) continue;
    out.push({ key: r.key, name: r.shortLabel, fullName: r.fullLabel, roi: r.roi });
  }
  return out;
}

export function roiBarYAxisDomain(rois: number[]): RoiBarYAxisDomain {
  const ax = ANALYTICS_ROI_BAR_Y_AXIS;
  const minR = rois.length ? Math.min(0, ...rois) : ax.defaultMinR;
  const maxR = rois.length ? Math.max(0, ...rois) : ax.defaultMaxR;
  const pad = Math.max(ax.minPad, (maxR - minR) * ax.rangePadRatio);
  return { minR, maxR, pad };
}

// ─── Badges (células) ────────────────────────────────────────────────────────

/** Mapeia severidade FP/FT para classe de badge. */
export function analyticsFinishSeverityBadgeClass(sev: "red" | "yellow" | "green"): string {
  return ANALYTICS_FINISH_SEVERITY_BADGE_CLASS[sev];
}

/** Capacidade 0–100: maior é melhor. */
export function analyticsAbilityBadgeClass(rounded: number): string {
  for (const rule of ANALYTICS_ABILITY_BADGE_CLASS_RULES) {
    if (rounded < rule.max) return rule.className;
  }
  return ANALYTICS_ABILITY_BADGE_CLASS_TOP;
}

// ─── Formatação de tabela (valores ausentes → placeholder) ───────────────────

function isMissingNumber(n: number | null | undefined): n is null | undefined {
  return n == null || !Number.isFinite(n);
}

function guardFmt(n: number | null | undefined, fn: (v: number) => string): string {
  return isMissingNumber(n) ? ANALYTICS_TABLE_MISSING_VALUE : fn(n as number);
}

export const fmtEntries = (n: number | null | undefined) =>
  guardFmt(n, (v) => v.toLocaleString("pt-BR", { maximumFractionDigits: 0 }));
export const fmtProfitUsd = (n: number | null | undefined) =>
  guardFmt(n, (v) => ANALYTICS_TABLE_INTL_USD_0.format(v));
export const fmtPct = (n: number | null | undefined) => guardFmt(n, (v) => `${v.toFixed(1)}%`);
export const fmtStake = (n: number | null | undefined) =>
  guardFmt(n, (v) => ANALYTICS_TABLE_INTL_USD_2.format(v));

// ─── Gráfico por site: formatadores de eixo ───────────────────────────────────

export function siteChartFormattersForMetric(metric: SiteChartYMetric) {
  const fmt = metric === "profit" ? profitFmt : metric === "entries" ? entriesFmt : pctFmt;
  return { tickFormatter: fmt, tooltipFormatter: fmt };
}

// ─── Ordenação de tabelas ───────────────────────────────────────────────────

function cmpCommonKey<T extends Record<string, unknown>>(
  a: T,
  b: T,
  key: string,
  dir: SortDir
): number | null {
  if (!ANALYTICS_TABLE_COMMON_NUM_SORT_KEYS.has(key)) return null;
  return compareNumberNullsLast((a[key] as number | null) ?? null, (b[key] as number | null) ?? null, dir);
}

function compareTier(a: string, b: string, dir: SortDir): number {
  const d = (BOUNTY_TIER_SORT_ORDER[a] ?? 99) - (BOUNTY_TIER_SORT_ORDER[b] ?? 99);
  return d !== 0 ? (dir === "asc" ? d : -d) : compareString(a, b, dir);
}

function sortRowsWithPrimary<T extends Record<string, unknown>>(
  rows: T[],
  sort: AnalyticsSortState<string> | null | undefined,
  primary: (a: T, b: T, key: string, dir: SortDir) => number | null
): T[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  return [...rows].sort((a, b) => {
    const p = primary(a, b, key, dir);
    if (p !== null) return p;
    return cmpCommonKey(a, b, key, dir) ?? 0;
  });
}

export function sortBountyTypeRows(rows: TypeStat[], sort: AnalyticsSortState<BountySortKey>): TypeStat[] {
  return sortRowsWithPrimary(rows, sort, (a, b, key, dir) => {
    if (key === "type")
      return compareString(
        SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[a.type],
        SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT[b.type],
        dir
      );
    return null;
  });
}

export function sortRankingRows(
  rows: RankingEntry[],
  sort: AnalyticsSortState<RankingSortKey>
): RankingEntry[] {
  return sortRowsWithPrimary(rows, sort, (a, b, key, dir) => {
    if (key === "player") return compareString(a.player.name, b.player.name, dir);
    if (key === "roi") return compareNumber(a.roi, b.roi, dir);
    return null;
  });
}

export function sortTierRows(rows: TierStat[], sort: AnalyticsSortState<TierSortKey>): TierStat[] {
  return sortRowsWithPrimary(rows, sort, (a, b, key, dir) => {
    if (key === "tier") return compareTier(a.tier, b.tier, dir);
    return null;
  });
}

export function sortSiteNetworkRows(
  rows: NetworkStat[],
  sort: AnalyticsSortState<SiteTableSortKey>
): NetworkStat[] {
  return sortRowsWithPrimary(rows, sort, (a, b, key, dir) => {
    if (key === "network") return compareString(a.label, b.label, dir);
    return null;
  });
}

// ─── Por site / tier: linhas de gráfico e textos ─────────────────────────────

function metricLabel(yMetric: SiteChartYMetric): string {
  return SITE_CHART_Y_METRICS.find((m) => m.id === yMetric)!.label;
}

function buildChartRows<T extends { label: string }>(
  rows: T[],
  getKey: (r: T) => string,
  maxLabelLen: number,
  getValue: (row: T) => number | null
): AnalyticsMetricBarRow[] {
  const truncAt = maxLabelLen - 2;
  const result: AnalyticsMetricBarRow[] = [];
  for (const row of rows) {
    const value = getValue(row);
    if (value == null || Number.isNaN(value)) continue;
    const label = row.label;
    result.push({
      key: getKey(row),
      shortLabel: label.length > maxLabelLen ? `${label.slice(0, truncAt)}…` : label,
      fullLabel: label,
      value,
    });
  }
  return result;
}

function buildChartRowsForMetric<T extends { label: string }>(
  rows: T[],
  getKey: (r: T) => string,
  maxLabelLen: number,
  yMetric: SiteChartYMetric
): AnalyticsMetricBarRow[] {
  return buildChartRows(rows, getKey, maxLabelLen, (row) =>
    siteChartYValue(row as SiteChartMetricRow, yMetric)
  );
}

export const buildSiteChartRows = (rows: NetworkStat[], yMetric: SiteChartYMetric): AnalyticsMetricBarRow[] =>
  buildChartRowsForMetric(rows, (s) => s.network, ANALYTICS_CHART_LABEL_MAX_LEN.network, yMetric);

export const buildTierChartRows = (rows: TierStat[], yMetric: SiteChartYMetric): AnalyticsMetricBarRow[] =>
  buildChartRowsForMetric(rows, (s) => s.tier, ANALYTICS_CHART_LABEL_MAX_LEN.tier, yMetric);

export function canSiteFilterPlayers(siteAnalytics: SiteAnalyticsPayload): boolean {
  return siteAnalytics.hasPerPlayerBreakdown && siteAnalytics.playersWithSiteData.length > 0;
}

export function computeDisplaySiteStats(
  stats: NetworkStat[],
  siteAnalytics: SiteAnalyticsPayload,
  selectedPlayerIds: string[]
): NetworkStat[] {
  if (!canSiteFilterPlayers(siteAnalytics) || selectedPlayerIds.length === 0) return stats;
  const rowsList: NetworkStat[][] = [];
  for (const id of selectedPlayerIds) {
    const r = siteAnalytics.byPlayerId[id];
    if (Array.isArray(r) && r.length > 0) rowsList.push(r);
  }
  if (rowsList.length === 0) return stats;
  if (rowsList.length === 1) return rowsList[0]!;
  return mergeNetworkStatsForSelection(rowsList);
}

export function siteAnalyticsPeriodLabel(period: SharkscopeAnalyticsPeriod): string {
  return ANALYTICS_SITE_PERIOD_LABEL[period];
}

export function siteAnalyticsSelectionSummary(
  canFilterPlayers: boolean,
  selectedPlayerIds: string[],
  playersWithSiteData: SiteAnalyticsPlayerRef[]
): string {
  const ui = ANALYTICS_SITE_UI;
  if (!canFilterPlayers || selectedPlayerIds.length === 0)
    return playersWithSiteData.length === 1 ? playersWithSiteData[0]!.name : ui.teamWholeLower;

  const names: string[] = [];
  for (const id of selectedPlayerIds) {
    const n = playersWithSiteData.find((p) => p.id === id)?.name;
    if (n) names.push(n);
  }

  if (names.length === 0) return ui.selection;
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]!}${ui.andJoiner}${names[1]!}`;
  return analyticsSiteNPlayersLabel(names.length);
}

export function siteAnalyticsTriggerLabel(
  canFilterPlayers: boolean,
  selectedPlayerIds: string[],
  playersWithSiteData: SiteAnalyticsPlayerRef[]
): string {
  const ui = ANALYTICS_SITE_UI;
  if (!canFilterPlayers) return ui.teamWholeTitle;
  if (selectedPlayerIds.length === 0)
    return playersWithSiteData.length === 1 ? playersWithSiteData[0]!.name : ui.teamWholeTitle;
  if (selectedPlayerIds.length === 1)
    return playersWithSiteData.find((p) => p.id === selectedPlayerIds[0])?.name ?? ui.onePlayer;
  return analyticsSiteNPlayersLabel(selectedPlayerIds.length);
}

export const tierAnalyticsChartTitle = (yMetric: SiteChartYMetric, periodLabel: string): string =>
  `${metricLabel(yMetric)} por tier (${periodLabel})`;

export const siteAnalyticsChartTitle = (
  yMetric: SiteChartYMetric,
  periodLabel: string,
  selectionSummary: string
): string => `${metricLabel(yMetric)} por rede (${periodLabel}) — ${selectionSummary}`;

export function isSiteChartHeuristicMetric(yMetric: SiteChartYMetric): boolean {
  return ANALYTICS_SITE_CHART_HEURISTIC_METRICS.has(yMetric);
}

export {
  thCenter,
  tdCenter,
  filterWrap,
  SITE_ANALYTICS_SELECT_TRIGGER_CLASS,
} from "@/lib/constants/sharkscope/analytics";
