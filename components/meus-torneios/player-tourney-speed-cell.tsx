import { speedPillClassName } from "@/lib/jogador/player-tourneys-table";
import { memo } from "react";

const PlayerTourneySpeedCell = memo(function PlayerTourneySpeedCell({ speed }: { speed: string | null }) {
  return (
    <span className={speedPillClassName(speed)}>{speed ?? "—"}</span>
  );
});

PlayerTourneySpeedCell.displayName = "PlayerTourneySpeedCell";

export default PlayerTourneySpeedCell;
