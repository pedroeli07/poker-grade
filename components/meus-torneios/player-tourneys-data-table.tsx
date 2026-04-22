import { Table } from "@/components/ui/table";
import type { PlayerTourneyRow } from "@/lib/data/minha-grade-tourneys";
import type { PlayerTourneysTableApi } from "@/hooks/use-player-tourneys-table";
import { memo } from "react";
import PlayerTourneysTableHeader from "@/components/meus-torneios/player-tourneys-table-header";
import PlayerTourneysTableBody from "@/components/meus-torneios/player-tourneys-table-body";

const PlayerTourneysDataTable = memo(function PlayerTourneysDataTable({
  rows,
  table: t,
}: {
  rows: PlayerTourneyRow[];
  table: PlayerTourneysTableApi;
}) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <PlayerTourneysTableHeader table={t} />
          <PlayerTourneysTableBody rows={rows} table={t} />
        </Table>
      </div>
    </div>
  );
});

PlayerTourneysDataTable.displayName = "PlayerTourneysDataTable";

export default PlayerTourneysDataTable;
