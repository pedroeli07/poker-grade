import { requireSession } from "@/lib/auth/session";
import { getNotificationsPage } from "@/lib/queries/db/notification-queries";
import { NotificationFilterType } from "@/lib/types";

export async function getNotificationsPageInitial() {
  await requireSession();
  return getNotificationsPage(1, NotificationFilterType.ALL);
}
