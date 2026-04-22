import { memo } from "react";

const RitualsPageSkeleton = memo(function RitualsPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-9 w-56 max-w-full rounded-md bg-muted" />
      <div className="h-10 w-full max-w-lg rounded-lg bg-muted" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-dashed border-border/60 bg-muted/25" />
        ))}
      </div>
      <div className="h-64 rounded-xl border border-dashed border-border/60 bg-muted/20" />
    </div>
  );
});

RitualsPageSkeleton.displayName = "RitualsPageSkeleton";

export default RitualsPageSkeleton;
