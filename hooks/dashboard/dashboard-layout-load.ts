import type { AppSession } from "@/lib/types";
import { countUnreadNotificationsForUser } from "@/lib/queries/db/notification-unread-server";
import { DashboardShellProps } from "@/lib/types";

export async function loadDashboardShellProps(
  session: AppSession
): Promise<DashboardShellProps> {
  const initialUnreadCount = await countUnreadNotificationsForUser(session.userId);
  return {
    userRole: session.role,
    displayName: session.displayName,
    email: session.email,
    initialUnreadCount,
  };
}
