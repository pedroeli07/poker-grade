"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import { toRitualPrismaData } from "@/lib/queries/db/team/rituals/map-ritual";
import type { TeamRitualUpdateInput } from "@/lib/types/team/rituals";
import type { Ok, Err } from "@/lib/types/primitives";

export async function updateTeamRitual(data: TeamRitualUpdateInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    const { id, ...rest } = data;
    const payload: Prisma.TeamRitualUpdateInput = { ...toRitualPrismaData(rest) };
    await prisma.teamRitual.update({ where: { id }, data: payload });
    revalidateTeamPaths(TEAM_PATH.rituals);
  });
}
