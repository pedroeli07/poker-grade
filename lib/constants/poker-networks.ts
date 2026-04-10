const NETWORK_ROWS = [
  ["gg", "GGPoker", "/gg-poker-logo.png", "gg"],
  ["pokerstars", "PokerStars", "/poker-stars-logo.png", "pokerstars"],
  ["888", "888 Poker", "/888-poker-logo.png", "888"],
  ["partypoker", "Party Poker", "/party-poker-logoo.png", "partypoker"],
  ["ipoker", "iPoker", "/i-poker-logo.png", "ipoker"],
  ["wpt", "WPT Global", "/wpt-poker-logo.png", "wpt"],
  ["coinpoker", "CoinPoker", "/coin-poker-logo.jpeg", "coinpoker"],
] as const;

export const POKER_NETWORKS_UI = NETWORK_ROWS.map(([value, label, icon]) => ({ value, label, icon }));

export const LOBBYZE_TO_SHARKSCOPE: Record<number, string> = {
  2: "gg",
  3: "partypoker",
  10: "pokerstars",
  335: "wpt",
  6: "ipoker",
  406: "coinpoker",
  1: "pokerstars",
  5: "888",
};

export const POKER_NETWORKS = Object.fromEntries(
  NETWORK_ROWS.map(([key, label, , sharkscopeCode]) => [key, { label, sharkscopeCode }]),
) as {
  readonly gg: { label: string; sharkscopeCode: string };
  readonly pokerstars: { label: string; sharkscopeCode: string };
  readonly "888": { label: string; sharkscopeCode: string };
  readonly partypoker: { label: string; sharkscopeCode: string };
  readonly ipoker: { label: string; sharkscopeCode: string };
  readonly wpt: { label: string; sharkscopeCode: string };
  readonly coinpoker: { label: string; sharkscopeCode: string };
};

export const NETWORK_OPTS = Object.entries(POKER_NETWORKS).map(([k, v]) => ({
  value: k as keyof typeof POKER_NETWORKS,
  label: v.label,
}));

export const ABI_ALVO_TARGET_NAME = "ABI alvo";
