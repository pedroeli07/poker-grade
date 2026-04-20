import {
  loadSharkscopePlayerDebug,
  listPlayersWithGroupForDebug,
} from "@/lib/data/sharkscope/player-debug";
import { PlayerDebugClient } from "./player-debug-client";
import { PlayerDebugResults } from "./player-debug-results";

export default async function SharkscopePlayerDebugPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const playerId = typeof sp.player === "string" ? sp.player : "";
  const api10d = sp.api10d === "1" || sp.api10d === "true";
  const api365d = sp.api365d === "1" || sp.api365d === "true";
  const apiLifetime = sp.apiLife === "1" || sp.apiLife === "true";
  const apiCtOnePage = sp.apiCt === "1" || sp.apiCt === "true";

  const players = await listPlayersWithGroupForDebug();
  const data = playerId.trim()
    ? await loadSharkscopePlayerDebug(playerId, {
        api10d,
        api365d,
        apiLifetime,
        apiCtOnePage,
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Debug — um jogador (SharkScope)</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Escolha um jogador com Grupo Shark. Use <strong>Sincronizar KPIs (só API)</strong> para atualizar
          só as estatísticas oficiais desse <code className="text-xs">playerGroup</code> (poucas buscas na
          API) e comparar ROI/FP/FT com a pesquisa manual no SharkScope. Quando bater com o site, pode
          repetir noutros ecrãs; <strong>Sincronizar completo</strong> traz também torneios 90d (mais caro).
          <strong> Carregar diagnóstico</strong> lê cache e, se marcar, faz chamadas granulares isoladas.
        </p>
      </div>

      <PlayerDebugClient
        players={players}
        playerId={playerId}
        opts={{ api10d, api365d, apiLifetime, apiCtOnePage }}
      >
        {data?.ok === true ? (
          <PlayerDebugResults data={data} />
        ) : data?.ok === false ? (
          <p className="text-sm text-destructive">{data.error}</p>
        ) : null}
      </PlayerDebugClient>
    </div>
  );
}
