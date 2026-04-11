import type { AppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { TargetLimit } from "@/lib/types";
import { UserRole } from "@prisma/client";

export async function loadHistoryPageData(session: AppSession) {
  const where =
    session.role === UserRole.PLAYER && session.playerId
      ? { playerId: session.playerId }
      : session.role === UserRole.COACH && session.coachId
        ? {
            player: {
              OR: [{ coachId: session.coachId }, { driId: session.coachId }],
            },
          }
        : {};

  const history = await prisma.limitChangeHistory.findMany({
    where,
    include: { player: { select: { id: true, name: true, nickname: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const upgrades = history.filter((h) => h.action === TargetLimit.UPGRADE).length;
  const downgrades = history.filter((h) => h.action === TargetLimit.DOWNGRADE).length;

  return {
    history,
    upgrades,
    downgrades,
  };
}

export type HistoryPageData = Awaited<ReturnType<typeof loadHistoryPageData>>;
