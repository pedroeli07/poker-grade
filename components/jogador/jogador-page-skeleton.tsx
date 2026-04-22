import { memo } from "react";
import { PageSkeleton } from "@/components/page-skeleton";

const JogadorPageSkeleton = memo(function JogadorPageSkeleton() {
  return (
    <PageSkeleton />
  );
});

JogadorPageSkeleton.displayName = "JogadorPageSkeleton";

export default JogadorPageSkeleton;
