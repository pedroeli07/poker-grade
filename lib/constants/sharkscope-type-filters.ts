import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";

/** Query suffix stored as SharkScopeCache.filterKey — must match cron + analytics. */
export const SHARKSCOPE_STATS_FILTER_10D = "?filter=Date:10D" as const;
export const SHARKSCOPE_STATS_FILTER_30D = "?filter=Date:30D" as const;
export const SHARKSCOPE_STATS_FILTER_90D = "?filter=Date:90D" as const;

function filterQuery(filterBody: string): string {
  return `?filter=${encodeURIComponent(filterBody)}`;
}

/** Chaves estáveis em `sharkscope_cache`; os valores são agregados localmente a partir de CT (não dependem de `Type:B` cobrir todas as variantes na API). */
export const SHARKSCOPE_TYPE_FILTER_KEY = {
  bounty30: filterQuery("Date:30D;Type:B"),
  satellite30: filterQuery("Date:30D;Type:SAT"),
  vanilla30: filterQuery("Date:30D;Type!:B;Type!:SAT"),
  bounty90: filterQuery("Date:90D;Type:B"),
  satellite90: filterQuery("Date:90D;Type:SAT"),
  vanilla90: filterQuery("Date:90D;Type!:B;Type!:SAT"),
} as const;

/** Chaves de cache `stats_30d` — agregados locais a partir de CT (janela 30d). */
export const SHARKSCOPE_TYPE_BREAKDOWN_KEYS = [
  { type: "Bounty" as const, filterKey: SHARKSCOPE_TYPE_FILTER_KEY.bounty30 },
  { type: "Satellite" as const, filterKey: SHARKSCOPE_TYPE_FILTER_KEY.satellite30 },
  { type: "Vanilla" as const, filterKey: SHARKSCOPE_TYPE_FILTER_KEY.vanilla30 },
];

/** Chaves de cache `stats_90d` — agregados locais a partir do mesmo fetch CT 90d (sem custo API extra). */
export const SHARKSCOPE_TYPE_BREAKDOWN_KEYS_90D = [
  { type: "Bounty" as const, filterKey: SHARKSCOPE_TYPE_FILTER_KEY.bounty90 },
  { type: "Satellite" as const, filterKey: SHARKSCOPE_TYPE_FILTER_KEY.satellite90 },
  { type: "Vanilla" as const, filterKey: SHARKSCOPE_TYPE_FILTER_KEY.vanilla90 },
];

export const ACTION_STYLE = {
  UPGRADE: { label: "Subida", icon: TrendingUp, color: "text-primary" },
  MAINTAIN: { label: "Manutenção", icon: ArrowRight, color: "text-muted-foreground" },
  DOWNGRADE: { label: "Descida", icon: TrendingDown, color: "text-primary" },
} as const;