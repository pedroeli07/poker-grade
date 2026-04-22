"use server";

import { prisma } from "@/lib/prisma";
import { dashboardQueryRead } from "@/lib/queries/db/query-pipeline";
import { getPlayersTablePayloadForSession } from "@/lib/data/player";
import { coachPlayerFilter } from "../shared";
import { GradeType, UserRole } from "@prisma/client";
import { AppSession } from "@/lib/types/auth";

export async function getPlayersForSession(session: AppSession) {
  const base = {
    include: {
      coach: true,
      gradeAssignments: {
        where: { isActive: true, gradeType: GradeType.MAIN },
        include: { gradeProfile: true },
      },
      nicks: true,
      authAccount: { select: { avatarUrl: true } },
    },
    orderBy: { name: "asc" as const },
  };

  switch (session.role) {
    case UserRole.ADMIN:
    case UserRole.MANAGER:
    case UserRole.VIEWER:
      return prisma.player.findMany({ ...base, where: {} });
    case UserRole.COACH:
      if (!session.coachId) return [];
      return prisma.player.findMany({ ...base, where: coachPlayerFilter(session.coachId) });
    case UserRole.PLAYER:
      if (!session.playerId) return [];
      return prisma.player.findMany({ ...base, where: { id: session.playerId } });
    default:
      return [];
  }
}

export async function getPlayersTableDataAction() {
  return dashboardQueryRead.readPayload(getPlayersTablePayloadForSession);
}
