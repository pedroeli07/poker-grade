"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import { toTaskPrismaData } from "@/lib/queries/db/team/tasks/map-task";
import type { TeamTaskUpdateInput } from "@/lib/types/team/tasks";
import type { Ok, Err } from "@/lib/types/primitives";

export async function updateTeamTask(data: TeamTaskUpdateInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    const { id, ...rest } = data;
    const payload: Prisma.TeamTaskUpdateInput = toTaskPrismaData(rest);
    await prisma.teamTask.update({ where: { id }, data: payload });
    revalidateTeamPaths(TEAM_PATH.execution);
  });
}
