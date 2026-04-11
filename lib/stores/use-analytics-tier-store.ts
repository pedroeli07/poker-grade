import type { AnalyticsTierFilters } from "@/lib/types";
import { createFilterStore } from "./create-filter-store";

export const useAnalyticsTierStore = createFilterStore<AnalyticsTierFilters>({
  tier: null,
});