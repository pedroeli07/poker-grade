/** Query suffix stored as SharkScopeCache.filterKey — must match cron + analytics. */
export const SHARKSCOPE_STATS_FILTER_10D = "?filter=Date:10D" as const;
export const SHARKSCOPE_STATS_FILTER_30D = "?filter=Date:30D" as const;
export const SHARKSCOPE_STATS_FILTER_90D = "?filter=Date:90D" as const;

function filterQuery(filterBody: string): string {
  return `?filter=${encodeURIComponent(filterBody)}`;
}

export const SHARKSCOPE_TYPE_FILTER_KEY = {
  bounty30: filterQuery("Date:30D;Type:B"),
  satellite30: filterQuery("Date:30D;Type:SAT"),
  vanilla30: filterQuery("Date:30D;Type!:B;Type!:SAT"),
} as const;

export const SHARKSCOPE_TYPE_BREAKDOWN_KEYS = [
  { type: "Bounty" as const, filterKey: SHARKSCOPE_TYPE_FILTER_KEY.bounty30 },
  { type: "Satellite" as const, filterKey: SHARKSCOPE_TYPE_FILTER_KEY.satellite30 },
  { type: "Vanilla" as const, filterKey: SHARKSCOPE_TYPE_FILTER_KEY.vanilla30 },
];
