import { requireSession } from "@/lib/auth/session";
import { getNotificationsPage } from "./actions";
import { NotificationsClient } from "./notifications-client";

export const metadata = {
  title: "Notificações | Gestão de Grades",
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireSession();
  const initial = await getNotificationsPage(1, "all");
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
