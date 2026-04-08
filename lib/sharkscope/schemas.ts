import { z } from "zod";
import { POKER_NETWORKS } from "../constants";
import { PokerNetworkKey } from "../types";

const keys = Object.keys(POKER_NETWORKS) as PokerNetworkKey[];

export const zodPokerNetwork = z.enum(keys as [PokerNetworkKey, ...PokerNetworkKey[]]);
