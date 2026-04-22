"use server";

import { prisma } from "@/lib/prisma";
import { dashboardQueryRead } from "@/lib/queries/db/query-pipeline";
import { getTargetsListRowsForSession } from "@/lib/data/targets";
import { coachPlayerFilter } from "../shared";
import { UserRole } from "@prisma/client";
import { ErrorTypes } from "@/lib/types/primitives";
import { AppSession } from "@/lib/types/auth";

export async function getTargetsForSession(session: AppSession) {
  const where =
    session.role === UserRole.COACH && session.coachId
      ? { player: coachPlayerFilter(session.coachId) }
      : session.role === UserRole.PLAYER && session.playerId
        ? { playerId: session.playerId }
        : session.role === UserRole.ADMIN || session.role === UserRole.MANAGER || session.role === UserRole.VIEWER
          ? {}
          : { id: "___none___" };

  return prisma.playerTarget.findMany({ where, include: { player: true }, orderBy: { createdAt: "desc" } });
}

export async function assertTargetWritableBySession(session: AppSession, targetId: string): Promise<void> {
  const t = await prisma.playerTarget.findUnique({ where: { id: targetId }, select: { id: true, playerId: true } });
  if (!t) throw new Error(ErrorTypes.NOT_FOUND);
  if (session.role === UserRole.ADMIN || session.role === UserRole.MANAGER) return;
  if (session.role === UserRole.COACH && session.coachId) {
    const p = await prisma.player.findFirst({
      where: { id: t.playerId, ...coachPlayerFilter(session.coachId) },
      select: { id: true },
    });
    if (!p) throw new Error(ErrorTypes.FORBIDDEN);
    return;
  }
  throw new Error(ErrorTypes.FORBIDDEN);
}

export async function getTargetsListDataAction() {
  return dashboardQueryRead.readRows(getTargetsListRowsForSession);
}
