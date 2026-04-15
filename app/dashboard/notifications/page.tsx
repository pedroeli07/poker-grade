import dynamicImport from "next/dynamic";
import { notificationsPageMetadata } from "@/lib/constants/metadata";
import NotificationsPageSkeleton from "@/components/notifications/notifications-page-skeleton";
import { getNotificationsPageInitial } from "@/lib/utils/notification/notifications-page-server";

export const metadata = notificationsPageMetadata;

export const dynamic = "force-dynamic";

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
