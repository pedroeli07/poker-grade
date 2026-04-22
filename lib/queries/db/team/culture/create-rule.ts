"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import type { TeamOperationalRuleCreateInput } from "@/lib/types/team/identity";
import type { Ok, Err } from "@/lib/types/primitives";

export async function createTeamOperationalRule(
  data: TeamOperationalRuleCreateInput,
): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    await prisma.teamOperationalRule.create({ data: { ...data, active: true } });
    revalidateTeamPaths(TEAM_PATH.identity);
  });
}
