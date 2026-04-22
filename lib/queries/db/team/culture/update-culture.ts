"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import { cultureFormToPrisma } from "@/lib/queries/db/team/culture/map-culture-form";
import type { TeamCultureForm } from "@/lib/types/team/identity";
import type { Ok, Err } from "@/lib/types/primitives";

async function persistCulture(payload: ReturnType<typeof cultureFormToPrisma>) {
  const row = await prisma.teamCulture.findFirst();
  if (row) await prisma.teamCulture.update({ where: { id: row.id }, data: payload });
  else await prisma.teamCulture.create({ data: payload });
}

export async function updateTeamCulture(data: TeamCultureForm): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    await persistCulture(cultureFormToPrisma(data));
    revalidateTeamPaths(TEAM_PATH.identity);
  });
}
