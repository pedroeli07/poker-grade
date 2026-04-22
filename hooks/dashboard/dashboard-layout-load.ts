import type { AppSession } from "@/lib/types/auth";
import { countUnreadNotificationsForUser } from "@/lib/queries/db/notification-unread-server";
import { getCachedAuthUserProfileRow } from "@/lib/auth/cached-auth-user";
import { DashboardShellProps } from "@/lib/types/dashboard/index";
export async function loadDashboardShellProps(
  session: AppSession
): Promise<DashboardShellProps> {
  const [initialUnreadCount, profileRow] = await Promise.all([
    countUnreadNotificationsForUser(session.userId),
    getCachedAuthUserProfileRow(session.userId),
  ]);
  return {
    userRole: session.role,
    displayName: session.displayName,
    email: session.email,
    avatarUrl: profileRow?.avatarUrl ?? null,
    initialUnreadCount,
  };
}
