import type { AnalyticsRankingFilters } from "@/lib/types";
import { createFilterStore } from "./create-filter-store";

export const useAnalyticsRankingStore = createFilterStore<AnalyticsRankingFilters>({
  player: null,
});