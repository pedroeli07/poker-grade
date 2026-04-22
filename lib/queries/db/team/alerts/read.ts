"use server";

import { prisma } from "@/lib/prisma";
import { AUTH_USER_MIN } from "@/lib/constants/team/prisma-includes";
import { staffListRead } from "@/lib/queries/db/team/staff-read";

export async function listTeamAlertRules() {
  return staffListRead(() =>
    prisma.teamAlertRule.findMany({ orderBy: { name: "asc" }, include: { assignee: AUTH_USER_MIN } }),
  );
}
