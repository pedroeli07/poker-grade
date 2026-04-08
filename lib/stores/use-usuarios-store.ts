import { create } from "zustand";
import type { UsuariosColumnFilters, UsuariosColumnKey } from "@/lib/types";

interface UsuariosStore {
  filters: UsuariosColumnFilters;
  setColumnFilter: (key: UsuariosColumnKey, next: Set<string> | null) => void;
  clearFilters: () => void;
  hasAnyFilter: boolean;
}

const defaultFilters: UsuariosColumnFilters = {
  email: null,
  role: null,
  status: null,
};

export const useUsuariosStore = create<UsuariosStore>((set) => ({
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
