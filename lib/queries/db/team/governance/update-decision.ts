"use server";

import { prisma } from "@/lib/prisma";
import { runTeamMutation } from "@/lib/queries/db/team/team-mutation";
import { revalidateDecisionsMural } from "@/lib/queries/db/team/governance/rev-gov-com";
import type { TeamDecisionUpdateInput } from "@/lib/types/team/governance";
import type { Ok, Err } from "@/lib/types/primitives";

export async function updateTeamDecision(data: TeamDecisionUpdateInput): Promise<Ok | Err> {
  return runTeamMutation(async () => {
    const { id, decidedAt: when, ...rest } = data;
    await prisma.teamDecision.update({
      where: { id },
      data: { ...rest, ...(when ? { decidedAt: when } : {}) },
    });
    revalidateDecisionsMural();
  });
}
