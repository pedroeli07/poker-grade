import { create } from "zustand";

interface TopbarState {
  titleOverride: string | null;
  setTitle: (title: string | null) => void;
}

export const useTopbarStore = create<TopbarState>((set) => ({
  titleOverride: null,
  setTitle: (title) => set({ titleOverride: title }),
}));
