import type { AnalyticsSiteFilters } from "@/lib/types";
import { createFilterStore } from "./create-filter-store";

export const useAnalyticsSiteStore = createFilterStore<AnalyticsSiteFilters>({
  network: null,
});