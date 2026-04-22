import type { AppSession } from "@/lib/types/auth";
import { syncOrphanCoachProfiles } from "@/lib/auth/ensure-coach-profile";
import { syncOrphanPlayerProfiles } from "@/lib/auth/ensure-player-profile";
import { canEditPlayers } from "@/lib/constants/navigation";
import { getPlayersTablePayloadForSession } from "@/lib/data/player";
import type { PlayersListPageProps } from "@/lib/types/player/index";
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
