"use client";

import { TableCell } from "@/components/ui/table";
import { memo } from "react";

const PlayerAbiTableCell = memo(function PlayerAbiTableCell({
  abiKey,
  abiLabel,
}: {
  abiKey: string;
  abiLabel: string;
}) {
  return (
    <TableCell className="w-[6%] min-w-0 px-0.5 py-3 text-center align-middle">
      <div className="flex min-h-[1.5rem] items-center justify-center">
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