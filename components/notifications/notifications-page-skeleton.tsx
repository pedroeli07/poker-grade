import { memo } from "react";
import { PageSkeleton } from "../page-skeleton";

const NotificationsPageSkeleton = memo(function NotificationsPageSkeleton() {
  return (
    <PageSkeleton />
  );
});

NotificationsPageSkeleton.displayName = "NotificationsPageSkeleton";

export default NotificationsPageSkeleton;
