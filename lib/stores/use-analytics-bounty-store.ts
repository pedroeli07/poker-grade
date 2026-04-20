import type { AnalyticsBountyFilters } from "@/lib/types";
import { createFilterStore } from "./create-filter-store";

export const useAnalyticsBountyStore = createFilterStore<AnalyticsBountyFilters>(
  {
    type: null,
  },
  "gestao-grades:analytics-bounty:filters"
);