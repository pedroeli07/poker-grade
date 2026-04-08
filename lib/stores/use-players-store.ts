import { create } from "zustand";
import type { PlayersTableColumnFilters, PlayersTableColumnKey } from "@/lib/types";

interface PlayersStore {
  filters: PlayersTableColumnFilters;
  setColumnFilter: (key: PlayersTableColumnKey, next: Set<string> | null) => void;
  clearFilters: () => void;
  hasAnyFilter: boolean;
}

const defaultFilters: PlayersTableColumnFilters = {
  name: null,
  nickname: null,
  playerGroup: null,
  coach: null,
  grade: null,
  abi: null,
  status: null,
};

export const usePlayersStore = create<PlayersStore>((set) => ({
  filters: defaultFilters,
  hasAnyFilter: false,
  setColumnFilter: (key, next) =>
    set((state) => {
      const newFilters = { ...state.filters, [key]: next };
      const hasAny = Object.values(newFilters).some((v) => v !== null);
      return { filters: newFilters, hasAnyFilter: hasAny };
    }),
  clearFilters: () => set({ filters: defaultFilters, hasAnyFilter: false }),
}));
