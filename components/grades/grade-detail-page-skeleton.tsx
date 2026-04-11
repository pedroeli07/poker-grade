import { memo } from "react";

const GradeDetailPageSkeleton = memo(function GradeDetailPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-9 w-32 rounded-md bg-muted" />
      <div className="space-y-2">
        <div className="h-9 w-2/3 max-w-md rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl rounded-md bg-muted" />
      </div>
      <div className="h-40 rounded-xl bg-muted" />
    </div>
  );
});

GradeDetailPageSkeleton.displayName = "GradeDetailPageSkeleton";

export default GradeDetailPageSkeleton;
