"use client";

import { AlertTriangle } from "lucide-react";
import { memo } from "react";

const PlayerGroupTableCell = memo(function PlayerGroupTableCell({
  playerGroup,
  sharkGroupNotFound,
}: {
  playerGroup: string | null;
  sharkGroupNotFound?: boolean;
}) {
  if (!playerGroup) {
    return <span className="text-[12px] text-muted-foreground italic opacity-50">—</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="line-clamp-2 break-words text-[12px] text-muted-foreground">{playerGroup}</span>
      {sharkGroupNotFound && (
        <span className="inline-flex items-center gap-1 rounded-sm border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-[10px] font-medium text-amber-600">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          Não encontrado
        </span>
      )}
    </div>
  );
});

PlayerGroupTableCell.displayName = "PlayerGroupTableCell";

export default PlayerGroupTableCell;
