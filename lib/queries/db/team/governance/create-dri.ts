"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import type { TeamDriCreateInput } from "@/lib/types/team/governance";
import type { Ok, Err } from "@/lib/types/primitives";

export async function createTeamDri(data: TeamDriCreateInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    await prisma.teamDri.create({ data });
    revalidateTeamPaths(TEAM_PATH.governance);
  });
}
