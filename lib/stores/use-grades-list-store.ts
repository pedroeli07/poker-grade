import type { GradesColumnFilters } from "@/lib/types";
import { createFilterStore } from "./create-filter-store";

export const useGradesListStore = createFilterStore<GradesColumnFilters>({
  name: null,
  description: null,
  rules: null,
});
