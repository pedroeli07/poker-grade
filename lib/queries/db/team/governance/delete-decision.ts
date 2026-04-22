"use server";

import { prisma } from "@/lib/prisma";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateDecisionsMural } from "@/lib/queries/db/team/governance/rev-gov-com";
import type { Ok, Err } from "@/lib/types/primitives";

export async function deleteTeamDecision(id: string): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    await prisma.teamDecision.delete({ where: { id } });
    revalidateDecisionsMural();
  });
}
