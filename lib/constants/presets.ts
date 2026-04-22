import type { LobbyzeFilterItem } from "@/lib/types/lobbyzeTypes";
const lobbyzeRows = (startId: number, item_texts: string[]): LobbyzeFilterItem[] =>
  item_texts.map((item_text, i) => ({ item_id: startId + i, item_text }));

export const SPEED_PRESETS = lobbyzeRows(1001, ["Regular", "Turbo", "Slow", "Hyper Turbo"]);
export const TOURNAMENT_TYPE_PRESETS = lobbyzeRows(2001, ["Regular", "Flight"]);
export const VARIANT_PRESETS = lobbyzeRows(3001, [
  "Knockout", "Mystery Bounty", "Mystery", "Regular", "PKO",
]);
export const GAME_TYPE_PRESETS = lobbyzeRows(4001, ["NLH", "PLO", "PLO5", "NLH 6+"]);
export const PLAYER_COUNT_PRESETS = lobbyzeRows(5001, [
  "Full Ring", "6-Max", "Heads Up", "8-Max",
]);
export const WEEKDAY_PRESETS = lobbyzeRows(6001, [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
]);

export const SITES_PRESETS = lobbyzeRows(7001, [
  "GG Network", "PokerStars", "iPoker", "888 Poker", "PartyPoker", "WPN Network", "Coin Poker", "WPT Global", "PokerStars.ES",
]);
