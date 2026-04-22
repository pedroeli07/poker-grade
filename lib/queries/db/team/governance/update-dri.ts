"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import type { TeamDriUpdateInput } from "@/lib/types/team/governance";
import type { Ok, Err } from "@/lib/types/primitives";

export async function updateTeamDri(data: TeamDriUpdateInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    const { id, ...rest } = data;
    await prisma.teamDri.update({ where: { id }, data: rest });
    revalidateTeamPaths(TEAM_PATH.governance);
  });
}
