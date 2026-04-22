"use server";

import { prisma } from "@/lib/prisma";
import { AUTH_USER_MIN } from "@/lib/constants/team/prisma-includes";
import { staffListRead } from "@/lib/queries/db/team/staff-read";

export async function listTeamDecisions() {
  return staffListRead(() =>
    prisma.teamDecision.findMany({ orderBy: { decidedAt: "desc" }, include: { author: AUTH_USER_MIN } }),
  );
}
