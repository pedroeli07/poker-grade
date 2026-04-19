const NETWORK_ROWS = [
  ["gg", "GGPoker", "/gg-poker-logo.png", "gg"],
  ["pokerstars", "PokerStars", "/poker-stars-logo.png", "pokerstars"],
  /**
   * Pool FR (cliente FR / parte do “FR-ES-PT” no site). API: `pokerstarsfr` — não confundir com ES ou .com.
   * @see SharkScope `allpokerstars` = pokerstars + pokerstarsit + pokerstarsfr + pokerstarses
   */
  ["pokerstars_fr", "PokerStars FR", "/poker-stars-logo.png", "pokerstarsfr"],
  ["pokerstars_es", "PokerStars ES", "/poker-stars-logo.png", "pokerstarses"],
  ["pokerstars_pt", "PokerStars PT", "/poker-stars-logo.png", "pokerstarspt"],
  ["888", "888 Poker", "/888-poker-logo.png", "888"],
  ["partypoker", "Party Poker", "/party-poker-logoo.png", "partypoker"],
  ["ipoker", "iPoker", "/i-poker-logo.png", "ipoker"],
  ["wpt", "WPT Global", "/wpt-poker-logo.png", "wpt"],
  ["coinpoker", "Coin Poker", "/coin-poker-logo.jpeg", "coinpoker"],
  ["chico", "Chico Poker", "/chico-poker-logo.png", "chico"],
] as const;

export const POKER_NETWORKS_UI = NETWORK_ROWS.map(([value, label, icon]) => ({ value, label, icon }));

/**
 * Texto de site vindos de import/Lobby (ex.: "PartyPoker", "888poker") → chave de rede da app.
 * Mesma lógica usada no histórico de torneios do jogador.
 */
const SITE_LABEL_MATCHERS: ReadonlyArray<{ readonly match: RegExp; readonly key: (typeof NETWORK_ROWS)[number][0] }> = [
  { match: /ggpoker|gg\s*network|^gg$|ggnetwork/i, key: "gg" },
  { match: /pokerstars\s*fr/i, key: "pokerstars_fr" },
  { match: /pokerstars\s*es/i, key: "pokerstars_es" },
  { match: /pokerstars\s*pt/i, key: "pokerstars_pt" },
  { match: /pokerstars|pstars/i, key: "pokerstars" },
  { match: /888/i, key: "888" },
  { match: /partypoker|party\s*poker/i, key: "partypoker" },
  { match: /ipoker/i, key: "ipoker" },
  { match: /wpt/i, key: "wpt" },
  { match: /coinpoker|coin\s*poker/i, key: "coinpoker" },
  { match: /chico/i, key: "chico" },
];

export function pokerNetworkKeyFromSiteLabel(site: string): string | null {
  for (const row of SITE_LABEL_MATCHERS) {
    if (row.match.test(site)) return row.key;
  }
  return null;
}

/** Ícone em `/public` para o texto de site, ou null se não houver logo conhecido. */
export function pokerSiteIconFromSiteLabel(site: string): string | null {
  const key = pokerNetworkKeyFromSiteLabel(site);
  if (!key) return null;
  return POKER_NETWORKS_UI.find((n) => n.value === key)?.icon ?? null;
}

export const LOBBYZE_TO_SHARKSCOPE: Record<number, string> = {
  2: "gg",
  3: "partypoker",
  10: "pokerstars",
  335: "wpt",
  6: "ipoker",
  406: "coinpoker",
  1: "pokerstars",
  5: "888",
  12: "chico",
};

export const POKER_NETWORKS = Object.fromEntries(
  NETWORK_ROWS.map(([key, label, , sharkscopeCode]) => [key, { label, sharkscopeCode }]),
) as {
  readonly gg: { label: string; sharkscopeCode: string };
  readonly pokerstars: { label: string; sharkscopeCode: string };
  readonly pokerstars_fr: { label: string; sharkscopeCode: string };
  readonly pokerstars_es: { label: string; sharkscopeCode: string };
  readonly pokerstars_pt: { label: string; sharkscopeCode: string };
  readonly "888": { label: string; sharkscopeCode: string };
  readonly partypoker: { label: string; sharkscopeCode: string };
  readonly ipoker: { label: string; sharkscopeCode: string };
  readonly wpt: { label: string; sharkscopeCode: string };
  readonly coinpoker: { label: string; sharkscopeCode: string };
  readonly chico: { label: string; sharkscopeCode: string };
};

/** Chaves de rede da app — `sharkscopeNetworkToAppKey` e mapeamentos CT. */
export const POKER_NETWORK_KEYS_SET = new Set(Object.keys(POKER_NETWORKS));

export const NETWORK_OPTS = Object.entries(POKER_NETWORKS).map(([k, v]) => ({
  value: k as keyof typeof POKER_NETWORKS,
  label: v.label,
}));

/**
 * Segmento de rede na URL SharkScope (`/networks/{segment}/players/{nick}/...`).
 * Pode diferir da chave em `PlayerNick.network` (ex.: `pokerstars_fr` → `pokerstarsfr`, `pokerstars_es` → `pokerstarses`).
 */
export function sharkscopeApiNetworkSegment(appNetworkKey: string): string {
  const entry = POKER_NETWORKS[appNetworkKey as keyof typeof POKER_NETWORKS];
  return entry?.sharkscopeCode ?? appNetworkKey;
}

/** Nick da linha PokerStars principal (para pré-preencher PokerStars FR-ES-PT). */
export function getPokerstarsMainNickFromRows(
  nicks: readonly { network: string; nick: string }[],
): string | undefined {
  const row = nicks.find((n) => n.network === "pokerstars" && n.nick.trim());
  return row?.nick.trim();
}

/** FR/ES partilham o mesmo nick que a linha `pokerstars` quando o campo está vazio. */
export function shouldPrefillPokerstarsMainNick(network: string): boolean {
  return network === "pokerstars_fr" || network === "pokerstars_es";
}

export const ABI_ALVO_TARGET_NAME = "ABI alvo";
