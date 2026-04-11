import { memo } from "react";
import { pillClass } from "./player-fp-cells";

const PlayerFtTenDayCell = memo(function PlayerFtTenDayCell({ value }: { value: number | null }) {
    if (value === null) return <span className="text-muted-foreground text-xs">—</span>;
    return (
      <span
        className={`${pillClass} ${
          value < 8
            ? "bg-red-500/10 text-red-600 border-red-500/20"
            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        }`}
      >
        {value.toFixed(1)}%
      </span>
    );
  });

  PlayerFtTenDayCell.displayName = "PlayerFtTenDayCell";

  export default PlayerFtTenDayCell;
  