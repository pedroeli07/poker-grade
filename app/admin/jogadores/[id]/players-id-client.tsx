"use client";

import { memo } from "react";
import type { PlayerProfileViewModel } from "@/lib/types/player/index";
import PlayerProfileHeader from "@/components/players/profile/player-profile-header";
import PlayerProfileStatCards from "@/components/players/profile/player-profile-stat-cards";
import PlayerProfileGradeAssignments from "@/components/players/profile/player-profile-grade-assignments";
import PlayerProfileSidebar from "@/components/players/profile/player-profile-sidebar";
import PlayerProfileNicksSection from "@/components/players/profile/player-profile-nicks-section";

const PlayersIdClient = memo(function PlayersIdClient({
  player,
  assignmentsByType,
  onTrackCount,
  attentionCount,
  offTrackCount,
  canManage,
}: PlayerProfileViewModel) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PlayerProfileHeader player={player} />

      <PlayerProfileStatCards
        player={player}
        onTrackCount={onTrackCount}
        attentionCount={attentionCount}
        offTrackCount={offTrackCount}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <PlayerProfileGradeAssignments assignmentsByType={assignmentsByType} canManage={canManage} />
        <PlayerProfileSidebar player={player} />
      </div>

      <PlayerProfileNicksSection player={player} canManage={canManage} />
    </div>
  );
});

PlayersIdClient.displayName = "PlayersIdClient";

export default PlayersIdClient;
