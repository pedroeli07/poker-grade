import type { AppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { canManagePlayerProfile, canViewPlayer } from "@/lib/utils";
import type { PlayerProfileLoadResult, PlayerProfileViewModel } from "@/lib/types";
import { playerProfileInclude } from "@/lib/constants";



export async function loadPlayerProfilePageData(
  session: AppSession,
  id: string
): Promise<PlayerProfileLoadResult> {
  const player = await prisma.player.findUnique({
    where: { id },
    include: playerProfileInclude,
  });

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
