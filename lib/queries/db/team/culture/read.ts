"use server";

import type { TeamCulture } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EMPTY_CULTURE } from "@/lib/constants/team/defaults";
import { staffListRead, staffRead } from "@/lib/queries/db/team/staff-read";

export async function getTeamCulture() {
  return staffRead<TeamCulture | null>(null, ensureCulture);
}

async function ensureCulture() {
  return (await prisma.teamCulture.findFirst()) ?? prisma.teamCulture.create({ data: EMPTY_CULTURE });
}

export async function listTeamOperationalRules() {
  return staffListRead(() => prisma.teamOperationalRule.findMany({ orderBy: { createdAt: "asc" } }));
}
