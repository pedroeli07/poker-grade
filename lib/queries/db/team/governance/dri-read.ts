"use server";

import { prisma } from "@/lib/prisma";
import { AUTH_USER_MIN } from "@/lib/constants/team/prisma-includes";
import { staffListRead } from "@/lib/queries/db/team/staff-read";

export async function listTeamDri() {
  return staffListRead(() =>
    prisma.teamDri.findMany({ orderBy: { area: "asc" }, include: { authUser: AUTH_USER_MIN } }),
  );
}
