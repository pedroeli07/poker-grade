import type { AppSession } from "@/lib/types";
import { getCachedPlayerWithProfileInclude } from "@/lib/data/player/cached-by-id";
import { canManagePlayerProfile, canViewPlayer } from "@/lib/utils";
import type { PlayerProfileLoadResult, PlayerProfileViewModel } from "@/lib/types";

export async function loadPlayerProfilePageData(
  session: AppSession,
  id: string
): Promise<PlayerProfileLoadResult> {
  const player = await getCachedPlayerWithProfileInclude(id);

  if (!player) return { status: "not_found" };
  if (!canViewPlayer(session, player)) return { status: "forbidden" };

  const gradeOrder = ["ABOVE", "MAIN", "BELOW"] as const;
  const assignmentsByType = Object.fromEntries(
    gradeOrder.map((t) => [t, player.gradeAssignments.find((a) => a.gradeType === t)])
  ) as PlayerProfileViewModel["assignmentsByType"];

  const onTrackCount = player.targets.filter((t) => t.status === "ON_TRACK").length;
  const attentionCount = player.targets.filter(
    (t) => t.status === "ATTENTION"
  ).length;
  const offTrackCount = player.targets.filter(
    (t) => t.status === "OFF_TRACK"
  ).length;

  const canManage = canManagePlayerProfile(session, player);

  return {
    status: "ok",
    data: {
      player,
      assignmentsByType,
      onTrackCount,
      attentionCount,
      offTrackCount,
      canManage,
    },
  };
}
