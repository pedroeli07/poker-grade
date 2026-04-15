import { memo } from "react";
import { PageSkeleton } from "../page-skeleton";

const GradeDetailPageSkeleton = memo(function GradeDetailPageSkeleton() {
  return <PageSkeleton titleWidth="w-32" contentHeight="h-6" />;
});

GradeDetailPageSkeleton.displayName = "GradeDetailPageSkeleton";

export default GradeDetailPageSkeleton;
