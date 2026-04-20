import { CheckCheck } from "lucide-react";
import { notificationsPageMetadata } from "@/lib/constants/metadata";
import { memo } from "react";

const NotificationsPageHeader = memo(function NotificationsPageHeader({
  unreadCount,
  onMarkAllRead,
}: {
  unreadCount: number;
  onMarkAllRead: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-primary">{notificationsPageMetadata.title}</h2>
        <p className="text-muted-foreground mt-1">{notificationsPageMetadata.description}</p>
      </div>
      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-[15px] font-medium text-muted-foreground bg-blue-400/20 hover:bg-blue-400/30 hover:text-foreground transition-colors cursor-pointer"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>
    </div>
  );
});

NotificationsPageHeader.displayName = "NotificationsPageHeader";

export default NotificationsPageHeader;
