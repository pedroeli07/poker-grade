import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateTeamPaths(...paths: string[]) {
  for (const p of paths) revalidatePath(p);
}
