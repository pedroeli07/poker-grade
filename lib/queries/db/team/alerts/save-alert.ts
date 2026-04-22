"use server";

import type { TeamAlertRuleUpsert } from "@/lib/types/team/alerts";
import type { Ok, Err } from "@/lib/types/primitives";
import { createTeamAlertRule } from "@/lib/queries/db/team/alerts/create-alert";
import { updateTeamAlertRule } from "@/lib/queries/db/team/alerts/update-alert";

export async function upsertTeamAlertRule(data: TeamAlertRuleUpsert): Promise<Ok | Err> {
  const { id, ...rest } = data;
  return id ? updateTeamAlertRule({ ...rest, id }) : createTeamAlertRule(rest);
}
