import { create } from "zustand";

interface NotificationStore {
  open: boolean;
  unreadCount: number;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  setUnreadCount: (n: number) => void;
  decrementUnread: (by?: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  open: false,
  unreadCount: 0,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  decrementUnread: (by = 1) =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),
}));
