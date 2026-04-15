import { PageSkeleton } from "@/components/page-skeleton";
import { memo } from "react";

const AlertsPageSkeleton = memo(function AlertsPageSkeleton() {
  return <PageSkeleton titleWidth="w-56" contentHeight="h-72" />;
});

AlertsPageSkeleton.displayName = "AlertsPageSkeleton";

export default AlertsPageSkeleton;
