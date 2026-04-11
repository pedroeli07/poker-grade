import { Bell } from "lucide-react";
import { memo } from "react";

export type NotificationsFilterTab = "all" | "unread" | "read";

const NotificationsEmptyState = memo(function NotificationsEmptyState({ filter }: { filter: NotificationsFilterTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl text-muted-foreground">
      <Bell className="h-12 w-12 mb-4 opacity-20" />
      <p className="text-lg font-semibold text-foreground/60">Nenhuma notificação</p>
      <p className="text-sm mt-1">
        {filter === "unread" ? "Todas as notificações foram lidas." : "Sem notificações no momento."}
      </p>
    </div>
  );
});

NotificationsEmptyState.displayName = "NotificationsEmptyState";

export default NotificationsEmptyState;
