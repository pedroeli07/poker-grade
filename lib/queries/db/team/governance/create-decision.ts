"use server";

import { prisma } from "@/lib/prisma";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateDecisionsMural } from "@/lib/queries/db/team/governance/rev-gov-com";
import type { TeamDecisionCreateInput } from "@/lib/types/team/governance";
import type { Ok, Err } from "@/lib/types/primitives";

export async function createTeamDecision(data: TeamDecisionCreateInput): Promise<Ok | Err> {
  return runTeamMutation(async (session) => {
    await prisma.teamDecision.create({ data: { ...data, authorId: session.userId } });
    revalidateDecisionsMural();
  });
}
