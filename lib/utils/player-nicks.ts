import { POKER_NETWORKS } from "@/lib/constants/poker-networks";
import { PLAYER_NICKS_TOAST_ADD_SUCCESS_DETAIL_SUFFIX } from "@/lib/constants/player-nicks-ui";
import type { PokerNetworkKey } from "@/lib/types/primitives";
export function formatPlayerNickAddedToastDescription(
  nick: string,
  network: string
): string {
  const label = POKER_NETWORKS[network as PokerNetworkKey]?.label ?? network;
  return `${nick} (${label}) ${PLAYER_NICKS_TOAST_ADD_SUCCESS_DETAIL_SUFFIX}`;
}
