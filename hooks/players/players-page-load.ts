import type { AppSession } from "@/lib/types";
import { syncOrphanCoachProfiles } from "@/lib/auth/ensure-coach-profile";
import { syncOrphanPlayerProfiles } from "@/lib/auth/ensure-player-profile";
import { canEditPlayers } from "@/lib/constants";
import { getPlayersTablePayloadForSession } from "@/lib/data/player";
import type { PlayersListPageProps } from "@/lib/types";


export async function loadPlayersListPageProps(
  session: AppSession
): Promise<PlayersListPageProps> {
  await Promise.all([syncOrphanCoachProfiles(), syncOrphanPlayerProfiles()]);
  const tablePayload = await getPlayersTablePayloadForSession(session);
  return {
    tablePayload,
    canEditPlayers: canEditPlayers(session),
  };
}
