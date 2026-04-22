"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import { toRitualPrismaData } from "@/lib/queries/db/team/rituals/map-ritual";
import type { TeamRitualCreateInput } from "@/lib/types/team/rituals";
import type { Ok, Err } from "@/lib/types/primitives";

export async function createTeamRitual(data: TeamRitualCreateInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    await prisma.teamRitual.create({ data: toRitualPrismaData(data) });
    revalidateTeamPaths(TEAM_PATH.rituals);
  });
}
