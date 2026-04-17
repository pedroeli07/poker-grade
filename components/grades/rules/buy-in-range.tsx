import { memo } from "react";

const BuyInRange = memo(function BuyInRange({
    min,
    max,
  }: {
    min: number | null;
    max: number | null;
  }) {
    if (!min && !max)
      return <span className="text-muted-foreground/50 text-sm">Sem restrição</span>;
  
    const pct = min && max ? ((min / max) * 100).toFixed(0) : null;
  
    return (
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="font-mono text-base font-bold tabular-nums text-blue-500">
            ${min ?? "—"}
          </span>
          <span className="text-muted-foreground/50">—</span>
          <span className="font-mono text-base font-bold tabular-nums text-blue-500">
            ${max ?? "—"}
          </span>
        </div>
        {min && max && (
          <div className="h-1.5 max-w-[120px] overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
              style={{ width: `${100 - Number(pct)}%` }}
            />
          </div>
        )}
      </div>
    );
  });

  BuyInRange.displayName = "BuyInRange";

  export default BuyInRange;