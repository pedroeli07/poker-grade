import { PageSkeleton } from "@/components/page-skeleton";
import { memo } from "react";

const AnalyticsPageSkeleton = memo(function AnalyticsPageSkeleton() {
  return <PageSkeleton titleWidth="w-64" contentHeight="h-64" />;
});

AnalyticsPageSkeleton.displayName = "AnalyticsPageSkeleton";

export default AnalyticsPageSkeleton;
