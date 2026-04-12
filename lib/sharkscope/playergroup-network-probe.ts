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

/** Conta redes em objetos de torneio (`@network` no nó Tournament de `CompletedTournaments`). */
export function collectTournamentNetworkHistogram(raw: unknown): Map<string, number> {
  const m = new Map<string, number>();

  function walk(o: unknown): void {
    if (o === null || o === undefined) return;
    if (Array.isArray(o)) {
      for (const x of o) walk(x);
      return;
    }
    if (typeof o !== "object") return;
    const r = o as Record<string, unknown>;
    const netRaw = r["@network"] ?? r.network ?? r.Network;
    const hasTournamentId =
      r.tournamentId !== undefined ||
      r["@id"] !== undefined ||
      typeof r.id === "string" ||
      typeof r.id === "number";
    if (
      typeof netRaw === "string" &&
      netRaw.length > 0 &&
      netRaw.length < 120 &&
      hasTournamentId &&
      looksLikeCompletedTournamentRow(r)
    ) {
      const key = netRaw.trim();
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    for (const v of Object.values(r)) walk(v);
  }

  walk(raw);
  return m;
}
