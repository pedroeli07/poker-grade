import { create } from "zustand";
import { NotificationStore } from "@/lib/types/notification/index";
export const useNotificationStore = create<NotificationStore>((set) => ({
  open: false,
  unreadCount: 0,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  decrementUnread: (by = 1) =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),
}));
