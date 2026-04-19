import { NotificationFilterType } from "@/lib/types";

const NOTIFICATION_FILTER_LABEL: Record<NotificationFilterType, string> = {
  [NotificationFilterType.ALL]: "Todas",
  [NotificationFilterType.UNREAD]: "Não lidas",
  [NotificationFilterType.READ]: "Lidas",
};

export function getNotificationFilterLabel(filter: NotificationFilterType): string {
  return NOTIFICATION_FILTER_LABEL[filter];
}

export function countUnreadNotifications<T extends { read: boolean }>(items: T[]): number {
  return items.filter((n) => !n.read).length;
}
