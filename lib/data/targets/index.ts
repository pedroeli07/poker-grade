import { STAFF_WRITE_ROLES } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/session";
import { getTargetsForSession } from "@/lib/queries/db/target";
import { prisma } from "@/lib/prisma";
import { TargetPageStatus, TargetListRow, TargetsPageProps, AppSession } from "@/lib/types";
import { UserRole } from "@prisma/client";

export async function getTargetsListRowsForSession(session: AppSession): Promise<TargetListRow[]> {
  const targets = await getTargetsForSession(session);
  return targets.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    playerId: t.player.id,
    playerName: t.player.name,
    status: t.status,
    targetType: t.targetType,
    limitAction: t.limitAction,
    numericValue: t.numericValue,
    numericCurrent: t.numericCurrent,
    textValue: t.textValue,
    textCurrent: t.textCurrent,
    unit: t.unit,
    coachNotes: t.coachNotes,
  }));
}

export async function loadTargetsPageProps(session: AppSession): Promise<TargetsPageProps> {
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
      attention: rows.filter((t) => t.status === TargetPageStatus.ATTENTION).length,
      offTrack: rows.filter((t) => t.status === TargetPageStatus.OFF_TRACK).length,
    },
  };
}

export async function getTargetsPageProps() {
  const session = await requireSession();
  return loadTargetsPageProps(session);
}
