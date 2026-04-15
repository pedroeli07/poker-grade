import { PageSkeleton } from "@/components/page-skeleton";
import { memo } from "react";

const ScoutingPageSkeleton = memo(function ScoutingPageSkeleton() {
  return <PageSkeleton titleWidth="w-48" contentHeight="h-40" />;
});

ScoutingPageSkeleton.displayName = "ScoutingPageSkeleton";

export default ScoutingPageSkeleton;
