"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import type { PlayerTableRow } from "@/lib/types";
import { memo } from "react";

const PlayerStatusTableCell = memo(function PlayerStatusTableCell({ status }: { status: PlayerTableRow["status"] }) {
  return (
    <TableCell className="w-[5%] min-w-0 whitespace-normal px-1.5 py-3 text-right align-middle">
      <div className="flex h-full min-h-[1.5rem] items-center justify-end">
        {status === "ACTIVE" ? (
          <Badge className="glow-success h-6 shrink-0 border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0 text-[11px] leading-none text-emerald-500 hover:bg-emerald-500/20">
            Ativo
          </Badge>
        ) : status === "SUSPENDED" ? (
          <Badge className="h-6 shrink-0 border-amber-500/25 bg-amber-500/10 px-1.5 py-0 text-[11px] leading-none text-amber-700">
            Suspenso
          </Badge>
        ) : (
          <Badge variant="secondary" className="h-6 shrink-0 px-1.5 py-0 text-[11px] leading-none">
            Inativo
          </Badge>
        )}
      </div>
    </TableCell>
  );
});

PlayerStatusTableCell.displayName = "PlayerStatusTableCell";

export default PlayerStatusTableCell;
