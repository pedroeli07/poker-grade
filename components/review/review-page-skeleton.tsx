import { memo } from "react";

const ReviewPageSkeleton = memo(function ReviewPageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-full max-w-md rounded-md bg-muted" />
      <div className="h-96 rounded-lg bg-muted" />
    </div>
  );
});

ReviewPageSkeleton.displayName = "ReviewPageSkeleton";

export default ReviewPageSkeleton;
