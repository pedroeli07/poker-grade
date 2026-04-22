import { formatPlayerTourneyDateParts } from "@/lib/jogador/player-tourneys-table";
import { memo } from "react";

const PlayerTourneyDateCell = memo(function PlayerTourneyDateCell({ date }: { date: Date }) {
  const { weekday, date: d, time } = formatPlayerTourneyDateParts(date);
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[11px] text-muted-foreground">{weekday}</span>
      <span className="text-sm font-medium tabular-nums">{d}</span>
      <span className="text-[11px] text-muted-foreground tabular-nums">{time}</span>
    </div>
  );
});

PlayerTourneyDateCell.displayName = "PlayerTourneyDateCell";

export default PlayerTourneyDateCell;
