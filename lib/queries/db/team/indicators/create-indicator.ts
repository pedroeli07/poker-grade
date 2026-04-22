"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import type { TeamIndicatorCreateInput } from "@/lib/types/team/indicators";
import type { Ok, Err } from "@/lib/types/primitives";

export async function createTeamIndicator(data: TeamIndicatorCreateInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    await prisma.teamIndicator.create({ data });
    revalidateTeamPaths(TEAM_PATH.indicators);
  });
}
