import type { NotificationItem } from "@/lib/types";
import NotificationsItem from "@/components/notifications/notifications-item";
import { memo } from "react";

const NotificationsList = memo(function NotificationsList({
  items,
  selected,
  onToggleSelect,
  onMarkRead,
  onDelete,
}: {
  items: NotificationItem[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {items.map((notif) => (
          <NotificationsItem
            key={notif.id}
            notif={notif}
            isSelected={selected.has(notif.id)}
            onToggleSelect={() => onToggleSelect(notif.id)}
            onMarkRead={() => onMarkRead(notif.id)}
            onDelete={() => onDelete(notif.id)}
          />
        ))}
      </div>
    </div>
  );
});

NotificationsList.displayName = "NotificationsList";

export default NotificationsList;
