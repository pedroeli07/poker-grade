import { memo } from "react";

const PlayerTourneyRebuyCell = memo(function PlayerTourneyRebuyCell({ rebuys }: { rebuys: number }) {
  if (rebuys > 0) {
    return (
      <span className="inline-block">
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-muted text-foreground tabular-nums border border-border">
          {rebuys}
        </span>
      </span>
    );
  }
  return <span className="text-xs text-muted-foreground">—</span>;
});

PlayerTourneyRebuyCell.displayName = "PlayerTourneyRebuyCell";

export default PlayerTourneyRebuyCell;
