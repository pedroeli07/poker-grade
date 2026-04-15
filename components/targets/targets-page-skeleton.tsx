import { PageSkeleton } from "@/components/page-skeleton";
import { memo } from "react";

const TargetsPageSkeleton = memo(function TargetsPageSkeleton() {
  return <PageSkeleton titleWidth="w-64" contentHeight="h-64" />;
});

TargetsPageSkeleton.displayName = "TargetsPageSkeleton";

export default TargetsPageSkeleton;
