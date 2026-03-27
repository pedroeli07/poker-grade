import { requireSession } from "@/lib/auth/session";
import { getNotificationsPage } from "./actions";
import { NotificationsClient } from "./notifications-client";

export const metadata = {
  title: "Notificações | Gestão de Grades",
};

export default async function NotificationsPage() {
  await requireSession();
  const initialData = await getNotificationsPage(1, "all");
  return <NotificationsClient initialData={initialData} />;
}
