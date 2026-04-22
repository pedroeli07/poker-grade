"use server";

import { prisma } from "@/lib/prisma";
import { TEAM_PATH } from "@/lib/constants/team/paths";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";
import type { TeamAlertRuleUpdateInput } from "@/lib/types/team/alerts";
import type { Ok, Err } from "@/lib/types/primitives";

export async function updateTeamAlertRule(data: TeamAlertRuleUpdateInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    const { id, ...rest } = data;
    await prisma.teamAlertRule.update({ where: { id }, data: rest });
    revalidateTeamPaths(TEAM_PATH.governance);
  });
}
