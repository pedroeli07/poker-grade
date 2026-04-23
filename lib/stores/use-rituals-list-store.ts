import type { RitualListColumnFilters } from "@/lib/types/team/rituals-list";
import { createFilterStore } from "@/lib/stores/create-filter-store";

const defaultFilters: RitualListColumnFilters = {
  name: null,
  ritualType: null,
  area: null,
  dri: null,
  recurrence: null,
  startAt: null,
  durationMin: null,
  status: null,
};

export const useRitualsListStore = createFilterStore<RitualListColumnFilters>(
  defaultFilters,
  "gestao-grades:rituals:list:filters",
);
