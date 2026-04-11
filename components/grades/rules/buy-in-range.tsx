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
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-blue-400">
            ${min ?? "—"}
          </span>
          <span className="text-muted-foreground/60">—</span>
          <span className="font-mono text-lg font-bold text-blue-400">
            ${max ?? "—"}
          </span>
        </div>
        {min && max && (
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden w-full max-w-[140px]">
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