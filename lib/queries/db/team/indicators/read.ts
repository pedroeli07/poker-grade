"use server";

import { prisma } from "@/lib/prisma";
import { AUTH_USER_MIN } from "@/lib/constants/team/prisma-includes";
import { staffListRead } from "@/lib/queries/db/team/staff-read";

export async function listTeamIndicators() {
  return staffListRead(() =>
    prisma.teamIndicator.findMany({ orderBy: { name: "asc" }, include: { owner: AUTH_USER_MIN } }),
  );
}
