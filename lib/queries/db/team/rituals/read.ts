"use server";

import { prisma } from "@/lib/prisma";
import { AUTH_USER_MIN } from "@/lib/constants/team/prisma-includes";
import { staffListRead } from "@/lib/queries/db/team/staff-read";

export async function listTeamRituals() {
  return staffListRead(() =>
    prisma.teamRitual.findMany({
      orderBy: { startAt: "asc" },
      include: { dri: AUTH_USER_MIN, executions: { orderBy: { executedAt: "desc" }, take: 20 } },
    }),
  );
}
