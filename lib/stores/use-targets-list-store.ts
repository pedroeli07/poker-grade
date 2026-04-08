import { create } from "zustand";
import type { ColKey, Filters } from "@/lib/types";

interface TargetsListStore {
  filters: Filters;
  setColumnFilter: (key: ColKey, next: Set<string> | null) => void;
  clearFilters: () => void;
  hasAnyFilter: boolean;
}

const defaultFilters: Filters = {
  name: null,
  category: null,
  player: null,
  status: null,
  targetType: null,
  limitAction: null,
};

export const useTargetsListStore = create<TargetsListStore>((set) => ({
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
