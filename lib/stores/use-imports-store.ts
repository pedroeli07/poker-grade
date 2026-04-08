import { create } from "zustand";
import type { ImportsColumnKey, ImportsFilters } from "@/lib/types";

interface ImportsStore {
  filters: ImportsFilters;
  setColumnFilter: (key: ImportsColumnKey, next: Set<string> | null) => void;
  clearFilters: () => void;
  hasAnyFilter: boolean;
}

const defaultFilters: ImportsFilters = {
  fileName: null,
  player: null,
  totalRows: null,
  played: null,
  extraPlay: null,
  didntPlay: null,
  date: null,
};

export const useImportsStore = create<ImportsStore>((set) => ({
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
