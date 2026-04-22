"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import type { TeamIndicatorUpdateInput } from "@/lib/types/team/indicators";
import type { Ok, Err } from "@/lib/types/primitives";

export async function updateTeamIndicator(data: TeamIndicatorUpdateInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    const { id, ...rest } = data;
    await prisma.teamIndicator.update({ where: { id }, data: rest });
    revalidateTeamPaths(TEAM_PATH.indicators);
  });
}
