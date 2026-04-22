import type { LucideIcon } from "lucide-react";
import { Globe, Layers, Trophy, Zap } from "lucide-react";
import type { SiteChartYMetric } from "@/lib/site-analytics-chart";
import { statBadgeAmber, statBadgeEmerald, statBadgeMuted, statBadgeRed } from "@/lib/constants/classes";
import type { SharkscopeAnalyticsPeriod, SharkscopeAnalyticsTab } from "@/lib/types/sharkscope/analytics/index";
import type { TypeStat } from "@/lib/types/sharkScopeTypes";
import type { StakeTierKey } from "@/lib/types/sharkScopeTypes";
// ═══ analytics-ui-colors ═══════════════════════════════════════════════════════

/**
 * Cores de UI para gráficos e badges de analytics SharkScope (hex estáveis para SVG/Recharts).
 */
export const ANALYTICS_ROI_BAR_FILLS = {
  positiveHigh: "#16a34a",
  positive: "#22c55e",
  warning: "#ca8a04",
  negative: "#dc2626",
} as const;

/**
 * Limiares ordenados (maior `min` primeiro) para cor da barra por ROI %.
 * Se nenhum limiar aplicar, usar `ANALYTICS_ROI_BAR_FILLS.negative`.
 */
export const ANALYTICS_ROI_BAR_THRESHOLD_RULES: ReadonlyArray<{ min: number; fill: string }> = [
  { min: 5, fill: ANALYTICS_ROI_BAR_FILLS.positiveHigh },
  { min: 0, fill: ANALYTICS_ROI_BAR_FILLS.positive },
  { min: -20, fill: ANALYTICS_ROI_BAR_FILLS.warning },
];

export const ANALYTICS_METRIC_BAR_DEFAULT_BLUE = "#3b82f6";
export const ANALYTICS_PROFIT_POSITIVE_GREEN = "#16a34a";
export const ANALYTICS_PROFIT_NEGATIVE_RED = "#dc2626";

/** Limiares para badge de capacidade (Ability), 0–100. */
export const ANALYTICS_ABILITY_BADGE_THRESHOLDS = { low: 40, mid: 60 } as const;

/**
 * Ordem de agrupamento de stake na tabela “Por tipo” (chaves `micro`, `low`, …).
 */
export const BOUNTY_TIER_SORT_ORDER: Record<string, number> = {
  micro: 0,
  low: 1,
  lowMid: 2,
  mid: 3,
  high: 4,
};

// ═══ analytics-chart-axis ══════════════════════════════════════════════════════

/** Fatores e valores por defeito para domínio do eixo Y no gráfico de métricas por rede. */
export const ANALYTICS_METRIC_BAR_AXIS = {
  spanPadRatio: 0.1,
  profitMaxPadRatio: 0.05,
  entriesPadMin: 1,
  entriesMaxPadRatio: 0.05,
  defaultPad: 2,
} as const;

/** ROI bar chart: padding vertical do eixo. */
export const ANALYTICS_ROI_BAR_Y_AXIS = {
  minPad: 3,
  rangePadRatio: 0.12,
  defaultMinR: 0,
  defaultMaxR: 10,
} as const;

/** Truncagem de rótulos no gráfico de barras (site / tier). */
export const ANALYTICS_CHART_LABEL_MAX_LEN = {
  network: 16,
  tier: 22,
} as const;

/** Métricas cujo eixo Y é tratado como percentagem (inclui 0 no mínimo). */
export const ANALYTICS_METRIC_BAR_PCT_AXIS_METRICS: ReadonlySet<SiteChartYMetric> = new Set([
  "roi",
  "itm",
  "earlyFinish",
  "lateFinish",
]);

/** Métricas “heurísticas” (ITM / FP / FT) no gráfico por site. */
export const ANALYTICS_SITE_CHART_HEURISTIC_METRICS: ReadonlySet<SiteChartYMetric> = new Set([
  "itm",
  "earlyFinish",
  "lateFinish",
]);

// ═══ analytics-intl-table ══════════════════════════════════════════════════════

/**
 * Formatadores reutilizáveis para células de tabela de analytics (pt-BR, USD).
 * `Intl.NumberFormat` é custoso de instanciar — uma instância por formato.
 */
export const ANALYTICS_TABLE_INTL_USD_0 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const ANALYTICS_TABLE_INTL_USD_2 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

/** Placeholder quando número ausente ou inválido. */
export const ANALYTICS_TABLE_MISSING_VALUE = "—";

// ═══ analytics-metric-bar-chart ══════════════════════════════════════════════════

/** Altura total do SVG; margens internas são apertadas para maximizar área das barras. */
export const ANALYTICS_METRIC_BAR_CHART_HEIGHT = 520;

export const ANALYTICS_METRIC_BAR_SITE_FILLS: Record<string, string> = {
  gg: "#000000",
  "888": "#1e3a8a",
  partypoker: "#f97316",
  coinpoker: "url(#coinPokerGradient)",
  pokerstars: "#dc2626",
  /** FR / ES / PT — um tom abaixo do .com para distinguir pools regionais. */
  pokerstars_fr: "#991b1b",
  pokerstars_es: "#991b1b",
  pokerstars_pt: "#991b1b",
  ipoker: "#94a3b8",
  wpt: "url(#wptGlobalGradient)",
  chico: "#15803d",
};

// ═══ analytics-roi-bar-chart ═════════════════════════════════════════════════════

/** Altura do SVG do gráfico de barras ROI (tipo / tier). */
export const ANALYTICS_ROI_BAR_CHART_HEIGHT = 450;

// ═══ analytics-site-strings ════════════════════════════════════════════════════

/** Rótulos de período nos títulos de gráficos (PT). */
export const ANALYTICS_SITE_PERIOD_LABEL: Record<"30d" | "90d", string> = {
  "30d": "últimos 30 dias",
  "90d": "últimos 90 dias",
};

/** Textos da UI do painel “Por site” / filtros de jogador. */
export const ANALYTICS_SITE_UI = {
  teamWholeLower: "time inteiro",
  teamWholeTitle: "Time inteiro",
  selection: "seleção",
  onePlayer: "1 jogador",
  andJoiner: " e ",
} as const;

export function analyticsSiteNPlayersLabel(n: number): string {
  return `${n} jogadores`;
}

// ═══ analytics-table-sort ════════════════════════════════════════════════════════

/**
 * Chaves numéricas partilhadas pelas tabelas de analytics (ordenação).
 */
export const ANALYTICS_TABLE_COMMON_NUM_SORT_KEYS = new Set([
  "roi",
  "entries",
  "profit",
  "itm",
  "ability",
  "avStake",
  "earlyFinish",
  "lateFinish",
]);

// ═══ analytics-badge-ui ══════════════════════════════════════════════════════════

/** Classes Tailwind para severidade FP/FT (badges de %). */
export const ANALYTICS_FINISH_SEVERITY_BADGE_CLASS = {
  red: statBadgeRed,
  yellow: statBadgeAmber,
  green: statBadgeMuted,
} as const satisfies Record<"red" | "yellow" | "green", string>;

/** Regras ordenadas por `max` (capacidade Ability, 0–100). */
export const ANALYTICS_ABILITY_BADGE_CLASS_RULES: ReadonlyArray<{ max: number; className: string }> = [
  { max: ANALYTICS_ABILITY_BADGE_THRESHOLDS.low, className: statBadgeRed },
  { max: ANALYTICS_ABILITY_BADGE_THRESHOLDS.mid, className: statBadgeAmber },
];

/** Classe quando Ability ≥ limiar “mid”. */
export const ANALYTICS_ABILITY_BADGE_CLASS_TOP = statBadgeEmerald;

// ═══ sharkscope-analytics-labels ═══════════════════════════════════════════════════

export const SHARKSCOPE_ANALYTICS_PERIODS: readonly SharkscopeAnalyticsPeriod[] = ["30d", "90d"];

const TAB_ROWS = [
  ["site", Globe, "Por Site"],
  ["ranking", Trophy, "Ranking"],
  ["tier", Layers, "Por TIER"],
  ["bounty", Zap, "Bounty / Vanilla / Sat"],
] as const satisfies readonly (readonly [SharkscopeAnalyticsTab, LucideIcon, string])[];

export const TAB_ICONS = Object.fromEntries(TAB_ROWS.map(([id, Icon]) => [id, Icon])) as Record<
  SharkscopeAnalyticsTab,
  LucideIcon
>;

export const TAB_IDS = TAB_ROWS.map(([id]) => id);

export const SHARKSCOPE_ANALYTICS_TAB_LABELS: Record<string, string> = Object.fromEntries(
  TAB_ROWS.map(([id, , label]) => [id, label]),
);

export const SHARKSCOPE_ANALYTICS_TYPE_LABEL_PT: Record<TypeStat["type"], string> = {
  Bounty: "Bounty / PKO",
  Vanilla: "Vanilla / Regular",
  Satellite: "Satélite",
};

// ═══ sharkscope-analytics-page ═══════════════════════════════════════════════════

/** Barrel: metadata + chaves localStorage usadas na página Analytics. */
export {
  sharkscopeAnalyticsPageMetadata,
  SHARKSCOPE_ANALYTICS_LS_PERIOD,
  SHARKSCOPE_ANALYTICS_LS_TAB,
} from "@/lib/constants/metadata";

// ═══ stake-tiers ═════════════════════════════════════════════════════════════════

/** Ordem fixa na UI (micro → high). */
export const STAKE_TIER_ORDER: readonly StakeTierKey[] = [
  "micro",
  "low",
  "lowMid",
  "mid",
  "high",
] as const;

/** Rótulos curtos para tabela / filtro. */
export const STAKE_TIER_LABEL_PT: Record<StakeTierKey, string> = {
  micro: "Micro Stakes (até $10)",
  low: "Low Stakes ($10–$25)",
  lowMid: "Low-Mid ($25–$50)",
  mid: "Mid Stakes ($50–$150)",
  high: "High Stakes ($150+)",
};

/**
 * Classifica ABI médio (AvStake) no tier de stake.
 * Limites: <10 | [10,25) | [25,50) | [50,150) | ≥150 (USD).
 */
export function classifyStakeTier(stake: number | null): StakeTierKey | null {
  if (stake === null || !Number.isFinite(stake)) return null;
  if (stake < 10) return "micro";
  if (stake < 25) return "low";
  if (stake < 50) return "lowMid";
  if (stake < 150) return "mid";
  return "high";
}

// ═══ shared table UI + formatters (barrel) ═══════════════════════════════════════

// Estilos de tabela compartilhados
export const ANALYTICS_TABLE_STYLES = {
  thCenter: "whitespace-nowrap text-center align-middle",
  tdCenter: "text-center align-middle",
  filterWrap: "flex justify-center w-full min-w-0",
} as const;

export const { thCenter, tdCenter, filterWrap } = ANALYTICS_TABLE_STYLES;

/** Formatação de porcentagem (ex.: 10.5% → 10,5%). */
export const pctFmt = (v: number) => `${v.toFixed(1)}%`;

/** Formatação de lucro em USD (ex.: 1000 → $1,000). */
export const profitFmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

/** Formatação de inscrições (ex.: 1000 → 1,000). */
export const entriesFmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

/** Select do gráfico por site: fundo neutro, sem hover de cor. */
export const SITE_ANALYTICS_SELECT_TRIGGER_CLASS =
  "w-full h-8 text-sm font-normal px-2 border border-gray-200 bg-white hover:bg-white focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-border dark:bg-card dark:hover:bg-card";

export * from "@/lib/constants/player";
