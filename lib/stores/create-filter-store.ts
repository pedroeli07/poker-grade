import { create } from "zustand";
import { FilterStore } from "@/lib/types";


export function createFilterStore<T extends Record<string, Set<string> | null>>(
  defaultFilters: T
) {
  return create<FilterStore<T>>((set) => ({
    filters: defaultFilters,
    hasAnyFilter: false,
    setColumnFilter: (key, next) =>
      set((state) => {
        const filters = { ...state.filters, [key]: next };
        const hasAnyFilter = Object.values(filters).some((v) => v !== null);
        return { filters, hasAnyFilter };
      }),
    clearFilters: () => set({ filters: defaultFilters, hasAnyFilter: false }),
  }));
}
