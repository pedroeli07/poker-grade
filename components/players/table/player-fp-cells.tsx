import { memo } from "react";

export const pillClass =
  "inline-flex items-center justify-center tabular-nums px-2 py-1 rounded-md border text-xs font-bold min-w-[68px]";

const PlayerFpTenDayCell = memo(function PlayerFpTenDayCell({ value }: { value: number | null }) {
    if (value === null) return <span className="text-muted-foreground text-xs">—</span>;
    return (
      <span
        className={`${pillClass} ${
          value > 8
            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        }`}
      >
        {value.toFixed(1)}%
      </span>
    );
  });

  PlayerFpTenDayCell.displayName = "PlayerFpTenDayCell";

  export default PlayerFpTenDayCell;