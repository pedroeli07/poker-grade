import type { IndicatorCatalogColumnFilters } from "@/lib/types/team/indicators-catalog-list";
import { createFilterStore } from "@/lib/stores/create-filter-store";

const defaultFilters: IndicatorCatalogColumnFilters = {
  name: null,
  resultType: null,
  definition: null,
  dataSource: null,
  responsibleName: null,
  meta: null,
  frequency: null,
  autoAction: null,
  glossary: null,
  link: null,
};

export const useIndicatorsCatalogListStore = createFilterStore<IndicatorCatalogColumnFilters>(
  defaultFilters,
  "gestao-grades:indicators:catalog:filters",
);
