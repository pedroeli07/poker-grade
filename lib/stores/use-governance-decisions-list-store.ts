import type { GovernanceDecisionColumnFilters } from "@/lib/types/team/governance-historical";
import { createFilterStore } from "@/lib/stores/create-filter-store";

const defaultFilters: GovernanceDecisionColumnFilters = {
  area: null,
  status: null,
  visibility: null,
  author: null,
  tag: null,
};

export const useGovernanceDecisionsListStore = createFilterStore<GovernanceDecisionColumnFilters>(
  defaultFilters,
  "gestao-grades:governance:decisions:filters",
);
