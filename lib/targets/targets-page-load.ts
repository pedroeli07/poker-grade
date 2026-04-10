import type { AppSession } from "@/lib/auth/session";
import { STAFF_WRITE_ROLES } from "@/lib/auth/rbac";
import { getTargetsListRowsForSession } from "@/lib/data/targets-list";
import { prisma } from "@/lib/prisma";
import { TargetPageStatus, type TargetsPageProps } from "@/lib/types";
import { UserRole } from "@prisma/client";

export async function loadTargetsPageProps(
  session: AppSession
): Promise<TargetsPageProps> {
  const canCreate = STAFF_WRITE_ROLES.includes(session.role);

  const [rows, players] = await Promise.all([
    getTargetsListRowsForSession(session),
    canCreate
      ? session.role === UserRole.COACH && session.coachId
        ? prisma.player.findMany({
            where: {
              OR: [{ coachId: session.coachId }, { driId: session.coachId }],
            },
            orderBy: { name: "asc" },
            select: { id: true, name: true, nickname: true },
          })
        : prisma.player.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true, nickname: true },
          })
      : [],
  ]);

  return {
    rows,
    players,
    canCreate,
    summary: {
      onTrack: rows.filter((t) => t.status === TargetPageStatus.ON_TRACK).length,
      attention: rows.filter((t) => t.status === TargetPageStatus.ATTENTION)
        .length,
      offTrack: rows.filter((t) => t.status === TargetPageStatus.OFF_TRACK)
        .length,
    },
  };
}
