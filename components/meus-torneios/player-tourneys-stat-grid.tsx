import PlayerTourneyStatCard from "@/components/meus-torneios/player-tourney-stat-card";
import { memo } from "react";

const PlayerTourneysStatGrid = memo(function PlayerTourneysStatGrid({
  total,
  played,
  extra,
  missed,
}: {
  total: number;
  played: number;
  extra: number;
  missed: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <PlayerTourneyStatCard label="Total" value={total} tone="blue" />
      <PlayerTourneyStatCard label="Played" value={played} tone="emerald" />
      <PlayerTourneyStatCard label="Extra play" value={extra} tone="red" />
      <PlayerTourneyStatCard label="Didn't play" value={missed} tone="zinc" />
    </div>
  );
});

PlayerTourneysStatGrid.displayName = "PlayerTourneysStatGrid";

export default PlayerTourneysStatGrid;
