import type { AnalyticsRankingFilters } from "@/lib/types/sharkscope/analytics/index";
import { createFilterStore } from "./create-filter-store";

export const useAnalyticsRankingStore = createFilterStore<AnalyticsRankingFilters>(
  {
    player: null,
  },
  "gestao-grades:analytics-ranking:filters"
);