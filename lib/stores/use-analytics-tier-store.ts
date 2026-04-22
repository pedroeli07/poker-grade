import type { AnalyticsTierFilters } from "@/lib/types/sharkscope/analytics/index";
import { createFilterStore } from "./create-filter-store";

export const useAnalyticsTierStore = createFilterStore<AnalyticsTierFilters>(
  {
    tier: null,
  },
  "gestao-grades:analytics-tier:filters"
);