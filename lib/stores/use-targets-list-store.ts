import type { Filters } from "@/lib/types";
import { createFilterStore } from "./create-filter-store";

export const useTargetsListStore = createFilterStore<Filters>({
  name: null,
  category: null,
  player: null,
  status: null,
  targetType: null,
  limitAction: null,
});
