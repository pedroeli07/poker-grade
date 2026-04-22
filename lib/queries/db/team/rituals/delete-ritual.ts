"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import type { Ok, Err } from "@/lib/types/primitives";

export async function deleteTeamRitual(id: string): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    await prisma.teamRitual.delete({ where: { id } });
    revalidateTeamPaths(TEAM_PATH.rituals);
  });
}
