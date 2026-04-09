import { create } from "zustand";
import { TopbarState } from "@/lib/types";

export const useTopbarStore = create<TopbarState>((set) => ({
  titleOverride: null,
  setTitle: (title) => set({ titleOverride: title }),
}));
