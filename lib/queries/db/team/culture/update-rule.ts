"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import type { TeamOperationalRuleUpdateInput } from "@/lib/types/team/identity";
import type { Ok, Err } from "@/lib/types/primitives";

export async function updateTeamOperationalRule(
  data: TeamOperationalRuleUpdateInput,
): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    const { id, ...rest } = data;
    await prisma.teamOperationalRule.update({ where: { id }, data: rest });
    revalidateTeamPaths(TEAM_PATH.identity);
  });
}
