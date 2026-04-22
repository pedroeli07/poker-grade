"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import type { TeamDriUpsert } from "@/lib/types/team/governance";
import type { Ok, Err } from "@/lib/types/primitives";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";

export async function upsertTeamDri(data: TeamDriUpsert): Promise<Ok | Err> {
  const { id, ...rest } = data;
  return runTeamMutation(async () => {
    if (id) {
      await prisma.teamDri.update({ where: { id }, data: rest });
    } else {
      await prisma.teamDri.upsert({
        where: { area: rest.area },
        create: rest,
        update: {
          rules: rest.rules,
          authUserId: rest.authUserId,
          responsibleName: rest.responsibleName,
        },
      });
    }
    revalidateTeamPaths(TEAM_PATH.governance);
  });
}
