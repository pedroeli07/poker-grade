import dynamicImport from "next/dynamic";
import { notificationsPageMetadata } from "@/lib/constants/metadata";
import NotificationsPageSkeleton from "@/components/notifications/notifications-page-skeleton";
import { requireSession } from "@/lib/auth/session";
import { getNotificationsPage } from "@/lib/queries/db/notification/reads";
import { NotificationFilterType } from "@/lib/types/primitives";
export const metadata = notificationsPageMetadata;

export const dynamic = "force-dynamic";

async function getNotificationsPageInitial() {
  await requireSession();
  return getNotificationsPage(1, NotificationFilterType.ALL);
}

const NotificationsClient = dynamicImport(() => import("./notifications-client"), {
  loading: () => <NotificationsPageSkeleton />,
});

export default async function NotificationsPage() {
  const initial = await getNotificationsPageInitial();
  if (!initial.ok) {
    return (
      <div className="text-center py-16 text-muted-foreground">{initial.error}</div>
    );
  }
  return (
    <NotificationsClient
      initialData={{
        items: initial.items,
        total: initial.total,
        unreadCount: initial.unreadCount,
        page: initial.page,
        pageSize: initial.pageSize,
        totalPages: initial.totalPages,
      }}
    />
  );
}
