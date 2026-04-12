import { PlayerNicksSection } from "@/components/player-nicks-section";
import type { PlayerProfileRecord } from "@/lib/types";
import { memo } from "react";

const PlayerProfileNicksSection = memo(function PlayerProfileNicksSection({
  player,
  canManage,
}: {
  player: PlayerProfileRecord;
  canManage: boolean;
}) {
  const visibleNicks = player.nicks.filter((n) => n.network !== "PlayerGroup");
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Nicks SharkScope</h3>
        <span className="text-xs text-muted-foreground">
          {visibleNicks.length} nick{visibleNicks.length !== 1 ? "s" : ""} cadastrado
          {visibleNicks.length !== 1 ? "s" : ""}
        </span>
      </div>
      <PlayerNicksSection
        playerId={player.id}
        initialNicks={visibleNicks.map((n) => ({
          ...n,
          createdAt: n.createdAt.toISOString(),
        }))}
        canManage={canManage}
      />
    </div>
  );
});

PlayerProfileNicksSection.displayName = "PlayerProfileNicksSection";

export default PlayerProfileNicksSection;
