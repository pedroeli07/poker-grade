import type { AnalyticsSiteFilters } from "@/lib/types/sharkscope/analytics/index";
import { createFilterStore } from "./create-filter-store";

export const useAnalyticsSiteStore = createFilterStore<AnalyticsSiteFilters>(
  {
    network: null,
  },
  "gestao-grades:analytics-site:filters"
);