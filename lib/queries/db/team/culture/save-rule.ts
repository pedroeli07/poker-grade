"use server";

import type { TeamOperationalRuleUpsert } from "@/lib/types/team/identity";
import type { Ok, Err } from "@/lib/types/primitives";
import { createTeamOperationalRule } from "@/lib/queries/db/team/culture/create-rule";
import { updateTeamOperationalRule } from "@/lib/queries/db/team/culture/update-rule";

export async function upsertTeamOperationalRule(data: TeamOperationalRuleUpsert): Promise<Ok | Err> {
  const { id, ...rest } = data;
  return id ? updateTeamOperationalRule({ ...rest, id }) : createTeamOperationalRule(rest);
}
