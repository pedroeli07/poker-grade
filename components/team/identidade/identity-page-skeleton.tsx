import { memo } from "react";

const IdentityPageSkeleton = memo(function IdentityPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-72 max-w-full rounded-md bg-muted" />
      <div className="h-11 w-full max-w-3xl rounded-lg bg-muted" />
      <div className="min-h-[240px] rounded-xl border border-dashed border-border/60 bg-muted/20" />
    </div>
  );
});

IdentityPageSkeleton.displayName = "IdentityPageSkeleton";

export default IdentityPageSkeleton;
