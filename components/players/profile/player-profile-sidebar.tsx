import { Separator } from "@/components/ui/separator";
import PlayerProfileTargetsPanel from "@/components/players/profile/player-profile-targets-panel";
import PlayerProfileLimitHistory from "@/components/players/profile/player-profile-limit-history";
import type { PlayerProfileSidebarProps } from "@/lib/types/playerComponents";
import { memo } from "react";

const PlayerProfileSidebar = memo(function PlayerProfileSidebar({ player }: PlayerProfileSidebarProps) {
  return (
    <div className="space-y-6">
      <PlayerProfileTargetsPanel targets={player.targets} />
      <Separator />
      <PlayerProfileLimitHistory limitChanges={player.limitChanges} />
    </div>
  );
});

PlayerProfileSidebar.displayName = "PlayerProfileSidebar";

export default PlayerProfileSidebar;
