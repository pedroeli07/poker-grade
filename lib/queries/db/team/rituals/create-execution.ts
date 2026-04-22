"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import type { TeamRitualExecutionInput } from "@/lib/types/team/rituals";
import type { Ok, Err } from "@/lib/types/primitives";

export async function createTeamRitualExecution(data: TeamRitualExecutionInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    await prisma.teamRitualExecution.create({
      data: {
        ritualId: data.ritualId,
        checklist: data.checklist as Prisma.InputJsonValue,
        notes: data.notes,
        attendance: data.attendance as Prisma.InputJsonValue,
      },
    });
    revalidateTeamPaths(TEAM_PATH.rituals);
  });
}
