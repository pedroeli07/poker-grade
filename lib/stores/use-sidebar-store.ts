import { create } from "zustand";
import { SidebarState } from "@/lib/types/dashboard/index";
export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
