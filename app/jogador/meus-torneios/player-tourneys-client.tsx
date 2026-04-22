"use client";

import { memo } from "react";
import { usePlayerTourneysTable } from "@/hooks/use-player-tourneys-table";
import type { PlayerTourneyRow } from "@/lib/data/minha-grade-tourneys";
import PlayerTourneysStatGrid from "@/components/meus-torneios/player-tourneys-stat-grid";
import PlayerTourneysPaginationBar from "@/components/meus-torneios/player-tourneys-pagination-bar";
import PlayerTourneysDataTable from "@/components/meus-torneios/player-tourneys-data-table";

const PlayerTourneysClient = memo(function PlayerTourneysClient({ rows }: { rows: PlayerTourneyRow[] }) {
  const t = usePlayerTourneysTable(rows);

  if (!t.filtersHydrated) {
    return <div aria-busy className="min-h-[400px]" />;
  }

  return (
    <div className="space-y-4">
      <PlayerTourneysStatGrid
        total={t.counts.total}
        played={t.counts.played}
        extra={t.counts.extra}
        missed={t.counts.missed}
      />
      <PlayerTourneysPaginationBar table={t} />
      <PlayerTourneysDataTable rows={rows} table={t} />
    </div>
  );
});

PlayerTourneysClient.displayName = "PlayerTourneysClient";

export default PlayerTourneysClient;
