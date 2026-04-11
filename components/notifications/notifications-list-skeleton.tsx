import { memo } from "react";

const NotificationsListSkeleton = memo(function NotificationsListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
      ))}
    </div>
  );
});

NotificationsListSkeleton.displayName = "NotificationsListSkeleton";

export default NotificationsListSkeleton;
