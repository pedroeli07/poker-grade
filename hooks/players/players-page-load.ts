import type { AppSession } from "@/lib/auth/session";
import { syncOrphanCoachProfiles } from "@/lib/auth/ensure-coach-profile";
import { canCreate, canEditPlayers } from "@/lib/constants";
import { getPlayersTablePayloadForSession } from "@/lib/data/players-table";
import type { PlayersListPageProps } from "@/lib/types";


export async function loadPlayersListPageProps(
  session: AppSession
): Promise<PlayersListPageProps> {
  await syncOrphanCoachProfiles();
  const tablePayload = await getPlayersTablePayloadForSession(session);
  return {
    tablePayload,
    canEditPlayers: canEditPlayers(session),
    canCreatePlayer: canCreate(session),
  };
}
