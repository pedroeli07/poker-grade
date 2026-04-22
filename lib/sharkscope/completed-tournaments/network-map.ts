import { POKER_NETWORK_KEYS_SET } from "@/lib/constants/poker-networks";

export function sharkscopeNetworkToAppKey(networkRaw: string): string | null {
  const n = networkRaw.trim();
  if (!n) return null;

  const lower = n.toLowerCase();

  if (lower.includes("pokerstars.es") || lower.includes("pokerstarses")) return "pokerstars_es";
  if (lower.includes("fr-es-pt")) return "pokerstars_fr";
  if (lower.includes("pokerstars")) return "pokerstars";
  if (lower === "ggnetwork" || lower === "gg") return "gg";
  if (lower.includes("partypoker") || lower === "party") return "partypoker";
  if (lower === "ipoker") return "ipoker";
  if (lower === "888poker" || lower === "888") return "888";
  if (lower === "wpn") return "wpt";
  const noSpace = lower.replace(/[\s_-]+/g, "");
  if (noSpace === "coinpoker" || noSpace.startsWith("coinpoker")) return "coinpoker";
  if (lower.includes("chico")) return "chico";

  if (POKER_NETWORK_KEYS_SET.has(lower)) return lower;

  return null;
}
