import type { ImportsFilters } from "@/lib/types/columnKeys";
import { createFilterStore } from "./create-filter-store";

export const useImportsStore = createFilterStore<ImportsFilters>(
  {
    fileName: null,
    player: null,
    totalRows: null,
    played: null,
    extraPlay: null,
    didntPlay: null,
    date: null,
  },
  "gestao-grades:imports:filters"
);
