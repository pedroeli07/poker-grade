import { TableCell, TableRow } from "@/components/ui/table";
import type { PlayerTourneyRow } from "@/lib/data/minha-grade-tourneys";
import { cn } from "@/lib/utils/cn";
import { schedulingCategory } from "@/lib/utils/player";
import { memo } from "react";
import SiteCell from "@/components/meus-torneios/site-cell";
import PlayerTourneySchedulingBadge from "@/components/meus-torneios/player-tourney-scheduling-badge";
import PlayerTourneyPriorityBadge from "@/components/meus-torneios/player-tourney-priority-badge";
import PlayerTourneyDateCell from "@/components/meus-torneios/player-tourney-date-cell";
import PlayerTourneyRebuyCell from "@/components/meus-torneios/player-tourney-rebuy-cell";
import PlayerTourneySpeedCell from "@/components/meus-torneios/player-tourney-speed-cell";

const PlayerTourneyTableRow = memo(function PlayerTourneyTableRow({ row }: { row: PlayerTourneyRow }) {
  const cat = schedulingCategory(row.scheduling);
  return (
    <TableRow className={cn("hover:bg-muted/40", cat === "extra" && "bg-red-500/[0.04]")}>
      <TableCell className="whitespace-nowrap">
        <PlayerTourneyDateCell date={new Date(row.date)} />
      </TableCell>
      <TableCell>
        <SiteCell network={row.siteNetworkKey} label={row.site} />
      </TableCell>
      <TableCell className="text-right tabular-nums text-sm font-extrabold">
        {row.buyInCurrency ?? ""}
        {Number.isFinite(row.buyInValue) ? row.buyInValue.toFixed(2) : "—"}
      </TableCell>
      <TableCell className="max-w-[340px]">
        <span className="text-sm truncate block" title={row.tournamentName}>
          {row.tournamentName}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <PlayerTourneySchedulingBadge scheduling={row.scheduling} />
      </TableCell>
      <TableCell className="text-center">
        <PlayerTourneyRebuyCell rebuys={row.rebuys ?? 0} />
      </TableCell>
      <TableCell className="text-center text-xs text-muted-foreground">
        <PlayerTourneySpeedCell speed={row.speed} />
      </TableCell>
      <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
        {row.sharkId ?? "—"}
      </TableCell>
      <TableCell className="text-center">
        <PlayerTourneyPriorityBadge priority={row.priority} />
      </TableCell>
    </TableRow>
  );
});

PlayerTourneyTableRow.displayName = "PlayerTourneyTableRow";

export default PlayerTourneyTableRow;
