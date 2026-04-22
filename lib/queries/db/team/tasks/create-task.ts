"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import { toTaskPrismaData } from "@/lib/queries/db/team/tasks/map-task";
import type { TeamTaskCreateInput } from "@/lib/types/team/tasks";
import type { Ok, Err } from "@/lib/types/primitives";

export async function createTeamTask(data: TeamTaskCreateInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    await prisma.teamTask.create({ data: toTaskPrismaData(data) });
    revalidateTeamPaths(TEAM_PATH.execution);
  });
}
