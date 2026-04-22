import type { NotificationType } from "@prisma/client";
import type { Bell } from "lucide-react";
import type { PaginatedPayload, PaginatedResult, WithId, Timestamped } from "../primitives";

type NotificationPayload = {
  type: NotificationType;
  title: string;
  message: string;
};

export type CreateNotificationInput = NotificationPayload & { userId: string; link?: string };

export type NotificationItem = WithId &
  Timestamped &
  NotificationPayload & {
    link: string | null;
    read: boolean;
  };
export type NotificationsPageData = PaginatedPayload<NotificationItem>;
export type NotificationsPageResult = PaginatedResult<NotificationItem>;
export type NotificationStore = {
  open: boolean;
  unreadCount: number;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  setUnreadCount: (n: number) => void;
  decrementUnread: (by?: number) => void;
};
export type NotificationStyle = { icon: typeof Bell; color: string; bg: string; label: string };
