import { memo } from "react";
import { PageSkeleton } from "@/components/page-skeleton";

const ReviewPageSkeleton = memo(function ReviewPageSkeleton() {
  return (
    <PageSkeleton />
  );
});

ReviewPageSkeleton.displayName = "ReviewPageSkeleton";

export default ReviewPageSkeleton;
