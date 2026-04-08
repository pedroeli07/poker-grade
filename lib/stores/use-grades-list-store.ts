import { create } from "zustand";
import type { ColumnFilters, ColumnKey } from "@/lib/types";

interface GradesListStore {
  filters: ColumnFilters;
  setColumnFilter: (key: ColumnKey, next: Set<string> | null) => void;
  clearFilters: () => void;
  hasAnyFilter: boolean;
}

const defaultFilters: ColumnFilters = {
  name: null,
  description: null,
  rules: null,
  players: null,
};

export const useGradesListStore = create<GradesListStore>((set) => ({
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
