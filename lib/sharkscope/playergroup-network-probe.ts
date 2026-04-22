/**
 * Descobre redes de poker presentes nos torneios de um Player Group via uma única
 * chamada `completedTournaments` (custo SharkScope: ~1 busca por até 100 torneios).
 *
 * Isto não substitui estatísticas agregadas por rede (ROI/lucro) — só mapeia quais
 * redes aparecem no histórico recente, alinhado à coluna "Rede" do export CSV.
 */

/** Torneio concluído na resposta SharkScope JSON: nó com `TournamentEntry` ou `@state` Completed (não confundir com `Players.Player`). */
function looksLikeCompletedTournamentRow(r: Record<string, unknown>): boolean {
  if (r.TournamentEntry != null) return true;
  if (r["@state"] === "Completed") return true;
  return false;
}

function hasTournamentIdentity(r: Record<string, unknown>): boolean {
  return (
    r.tournamentId !== undefined ||
    r["@id"] !== undefined ||
    typeof r.id === "string" ||
    typeof r.id === "number"
  );
}

function extractNetworkRaw(r: Record<string, unknown>): string | null {
  const netRaw = r["@network"] ?? r.network ?? r.Network;
  if (typeof netRaw !== "string") return null;
  if (netRaw.length === 0 || netRaw.length >= 120) return null;
  return netRaw.trim();
}

function maybeCountNetworkForNode(r: Record<string, unknown>, histogram: Map<string, number>): void {
  const key = extractNetworkRaw(r);
  if (!key || !hasTournamentIdentity(r) || !looksLikeCompletedTournamentRow(r)) return;
  histogram.set(key, (histogram.get(key) ?? 0) + 1);
}

function walkHistogram(o: unknown, histogram: Map<string, number>): void {
  if (o === null || o === undefined) return;
  if (Array.isArray(o)) {
    for (const x of o) walkHistogram(x, histogram);
    return;
  }
  if (typeof o !== "object") return;
  const r = o as Record<string, unknown>;
  maybeCountNetworkForNode(r, histogram);
  for (const v of Object.values(r)) walkHistogram(v, histogram);
}

/** Conta redes em objetos de torneio (`@network` no nó Tournament de `CompletedTournaments`). */
export function collectTournamentNetworkHistogram(raw: unknown): Map<string, number> {
  const histogram = new Map<string, number>();
  walkHistogram(raw, histogram);
  return histogram;
}
