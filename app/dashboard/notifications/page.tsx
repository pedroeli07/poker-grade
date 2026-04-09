import dynamicImport from "next/dynamic";
import { requireSession } from "@/lib/auth/session";
import { getNotificationsPage } from "@/lib/queries/db/notification-queries";
import { Metadata } from "next";
import { NotificationFilterType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Notificações",
  description: "Visualize suas notificações e marque como lidas.",
};

export const dynamic = "force-dynamic";

const NotificationsClient = dynamicImport(
  () =>
    import("./notifications-client").then((m) => ({
      default: m.NotificationsClient,
    })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-9 w-48 rounded-md bg-muted" />
        <div className="h-64 rounded-lg bg-muted" />
      </div>
    ),
  }
);

export default async function NotificationsPage() {
  await requireSession();
  const initial = await getNotificationsPage(1, NotificationFilterType.ALL);
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
