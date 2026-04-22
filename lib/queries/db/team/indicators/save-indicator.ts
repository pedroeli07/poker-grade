"use server";

import type { TeamIndicatorUpsert } from "@/lib/types/team/indicators";
import type { Ok, Err } from "@/lib/types/primitives";
import { createTeamIndicator } from "@/lib/queries/db/team/indicators/create-indicator";
import { updateTeamIndicator } from "@/lib/queries/db/team/indicators/update-indicator";

export async function upsertTeamIndicator(data: TeamIndicatorUpsert): Promise<Ok | Err> {
  const { id, ...rest } = data;
  return id ? updateTeamIndicator({ ...rest, id }) : createTeamIndicator(rest);
}
