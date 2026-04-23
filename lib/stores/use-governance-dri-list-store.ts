import type { GovernanceDriColumnFilters } from "@/lib/types/team/governance-dri-matrix";
import { createFilterStore } from "@/lib/stores/create-filter-store";

const defaultFilters: GovernanceDriColumnFilters = {
  area: null,
  responsible: null,
  rules: null,
};

export const useGovernanceDriListStore = createFilterStore<GovernanceDriColumnFilters>(
  defaultFilters,
  "gestao-grades:governance:dri:filters",
);
