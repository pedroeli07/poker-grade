"use server";

import type { TeamRitualUpsert } from "@/lib/types/team/rituals";
import type { Ok, Err } from "@/lib/types/primitives";
import { createTeamRitual } from "@/lib/queries/db/team/rituals/create-ritual";
import { updateTeamRitual } from "@/lib/queries/db/team/rituals/update-ritual";

export async function upsertTeamRitual(data: TeamRitualUpsert): Promise<Ok | Err> {
  const { id, ...rest } = data;
  return id ? updateTeamRitual({ ...rest, id }) : createTeamRitual(rest);
}
