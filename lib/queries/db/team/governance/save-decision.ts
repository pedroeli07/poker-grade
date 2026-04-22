"use server";

import type { TeamDecisionUpsert } from "@/lib/types/team/governance";
import type { Ok, Err } from "@/lib/types/primitives";
import { createTeamDecision } from "@/lib/queries/db/team/governance/create-decision";
import { updateTeamDecision } from "@/lib/queries/db/team/governance/update-decision";

export async function upsertTeamDecision(data: TeamDecisionUpsert): Promise<Ok | Err> {
  const { id, decidedAt: when, ...rest } = data;
  return id
    ? updateTeamDecision({ ...rest, id, ...(when !== undefined ? { decidedAt: when } : {}) })
    : createTeamDecision(rest);
}
