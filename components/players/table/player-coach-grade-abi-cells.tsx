"use client";

import { TableCell } from "@/components/ui/table";
import { playersTableCol } from "@/lib/constants/classes";
import { cn } from "@/lib/utils";
import { memo } from "react";

import type { PlayerAbiTableCellProps } from "@/lib/types/player";

const PlayerAbiTableCell = memo(function PlayerAbiTableCell({
  abiKey,
  abiLabel,
}: PlayerAbiTableCellProps) {
  return (
    <TableCell className={cn(playersTableCol.abi, "py-3 text-center align-middle")}>
      <div className="flex min-h-6 items-center justify-center">
        {abiKey !== "__none__" ? (
          <span className="font-mono text-sm font-bold tabular-nums">{abiLabel}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>
    </TableCell>
  );
});

PlayerAbiTableCell.displayName = "PlayerAbiTableCell";

export default PlayerAbiTableCell;