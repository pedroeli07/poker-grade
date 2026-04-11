"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import type { PlayerTableRow } from "@/lib/types";
import { memo } from "react";

const PlayerStatusTableCell = memo(function PlayerStatusTableCell({ status }: { status: PlayerTableRow["status"] }) {
  return (
    <TableCell className="w-[5%] min-w-0 whitespace-normal px-1.5 py-2 text-right align-top">
      <div className="flex justify-end">
        {status === "ACTIVE" ? (
          <Badge className="glow-success border-emerald-500/20 bg-emerald-500/10 px-1.5 text-[11px] text-emerald-500 hover:bg-emerald-500/20">
            Ativo
          </Badge>
        ) : status === "SUSPENDED" ? (
          <Badge className="border-amber-500/25 bg-amber-500/10 px-1.5 text-[11px] text-amber-700">Suspenso</Badge>
        ) : (
          <Badge variant="secondary" className="px-1.5 text-[11px]">
            Inativo
          </Badge>
        )}
      </div>
    </TableCell>
  );
});

PlayerStatusTableCell.displayName = "PlayerStatusTableCell";

export default PlayerStatusTableCell;
