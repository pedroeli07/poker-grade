"use server";

import type { TeamTaskUpsert } from "@/lib/types/team/tasks";
import type { Ok, Err } from "@/lib/types/primitives";
import { createTeamTask } from "@/lib/queries/db/team/tasks/create-task";
import { updateTeamTask } from "@/lib/queries/db/team/tasks/update-task";

export async function upsertTeamTask(data: TeamTaskUpsert): Promise<Ok | Err> {
  const { id, ...rest } = data;
  return id ? updateTeamTask({ ...rest, id }) : createTeamTask(rest);
}
