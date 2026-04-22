import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { PlayerTourneyRow } from "@/lib/data/minha-grade-tourneys";
import type { PlayerTourneysTableApi } from "@/hooks/use-player-tourneys-table";
import { FileSpreadsheet } from "lucide-react";
import { memo } from "react";
import PlayerTourneyTableRow from "@/components/meus-torneios/player-tourney-table-row";

const PlayerTourneysTableBody = memo(function PlayerTourneysTableBody({
  rows,
  table: t,
}: {
  rows: PlayerTourneyRow[];
  table: PlayerTourneysTableApi;
}) {
  if (rows.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
            <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum torneio importado ainda.</p>
            <p className="text-xs mt-1">Peça ao seu coach para importar sua planilha de torneios.</p>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (t.filtered.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
            Nenhum torneio com os filtros atuais.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {t.paginatedRows.map((row) => (
        <PlayerTourneyTableRow key={row.id} row={row} />
      ))}
    </TableBody>
  );
});

PlayerTourneysTableBody.displayName = "PlayerTourneysTableBody";

export default PlayerTourneysTableBody;
