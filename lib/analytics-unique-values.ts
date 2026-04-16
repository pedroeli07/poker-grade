import { getUniqueValues } from "@/lib/match-number-filter";
import type { NetworkStat, RankingEntry, TierStat, TypeStat } from "@/lib/types";

/** Chaves alinhadas a `useAnalyticsFilter` / `matchNumberFilter` nas tabelas analytics. */
export const ANALYTICS_NUM_FILTER_KEYS = [
  "roi",
  "entries",
  "profit",
  "itm",
  "ability",
  "avStake",
  "earlyFinish",
  "lateFinish",
] as const;

export type AnalyticsNumFilterKey = (typeof ANALYTICS_NUM_FILTER_KEYS)[number];

/**
 * Forma numérica comum para documentação; cada linha real (TypeStat, …) expõe estes campos
 * com nullability específica — os seletores abaixo normalizam para `number | null`.
 */
export type AnalyticsStatNumericSlice = {
  roi: number | null;
  entries: number | null;
  profit: number | null;
  itm: number | null;
  ability: number | null;
  avStake: number | null;
  earlyFinish: number | null;
  lateFinish: number | null;
};

type Selector<T> = (row: T) => number | null;

/**
 * Para cada entrada do mapa de seletores, devolve o array de valores únicos (`getUniqueValues`).
 * Sem `any`: o tipo do resultado deriva das chaves e do retorno de cada seletora.
 */
export function buildUniqueValuesMap<
  T,
  const F extends Record<string, Selector<T>>,
>(data: T[], fields: F): { [K in keyof F]: number[] } {
  const result = {} as { [K in keyof F]: number[] };
  for (const key of Object.keys(fields) as (keyof F)[]) {
    const selector = fields[key];
    result[key] = getUniqueValues(data, selector);
  }
  return result;
}

/** Por tipo de torneio (aba Bounty) — chaves estáveis para UI / filtros. */
export const BOUNTY_TYPE_UNIQUE_FIELDS = {
  rois: (s: TypeStat) => s.roi,
  entries: (s: TypeStat) => s.entries,
  profits: (s: TypeStat) => s.profit,
  itms: (s: TypeStat) => s.itm,
  abilities: (s: TypeStat) => s.ability,
  stakes: (s: TypeStat) => s.avStake,
  early: (s: TypeStat) => s.earlyFinish,
  late: (s: TypeStat) => s.lateFinish,
} satisfies Record<string, Selector<TypeStat>>;

/** Ranking — `roi` é `number` na origem (compatível com `number | null` do filtro). */
export const RANKING_UNIQUE_FIELDS = {
  rois: (r: RankingEntry) => r.roi,
  entries: (r: RankingEntry) => r.entries,
  profits: (r: RankingEntry) => r.profit,
  itms: (r: RankingEntry) => r.itm,
  abilities: (r: RankingEntry) => r.ability,
  stakes: (r: RankingEntry) => r.avStake,
  early: (r: RankingEntry) => r.earlyFinish,
  late: (r: RankingEntry) => r.lateFinish,
} satisfies Record<string, Selector<RankingEntry>>;

/** Por rede (aba Por site). */
export const SITE_NETWORK_UNIQUE_FIELDS = {
  rois: (s: NetworkStat) => s.roi,
  profits: (s: NetworkStat) => s.profit,
  itms: (s: NetworkStat) => s.itm ?? null,
  early: (s: NetworkStat) => s.earlyFinish ?? null,
  late: (s: NetworkStat) => s.lateFinish ?? null,
  entries: (s: NetworkStat) => s.entries,
  abilities: (s: NetworkStat) => s.ability ?? null,
  avStakes: (s: NetworkStat) => s.avStake ?? null,
} satisfies Record<string, Selector<NetworkStat>>;

/** Por tier de stake. */
export const TIER_UNIQUE_FIELDS = {
  rois: (s: TierStat) => s.roi,
  profits: (s: TierStat) => s.profit,
  itms: (s: TierStat) => s.itm,
  entries: (s: TierStat) => s.entries,
  abilities: (s: TierStat) => s.ability,
  avStakes: (s: TierStat) => s.avStake,
  early: (s: TierStat) => s.earlyFinish,
  late: (s: TierStat) => s.lateFinish,
} satisfies Record<string, Selector<TierStat>>;

export type BountyTypeUniqueValues = {
  [K in keyof typeof BOUNTY_TYPE_UNIQUE_FIELDS]: number[];
};
export type RankingUniqueValues = {
  [K in keyof typeof RANKING_UNIQUE_FIELDS]: number[];
};
export type SiteNetworkUniqueValues = {
  [K in keyof typeof SITE_NETWORK_UNIQUE_FIELDS]: number[];
};
export type TierUniqueValues = {
  [K in keyof typeof TIER_UNIQUE_FIELDS]: number[];
};
