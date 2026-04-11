"use client";

import { POKER_NETWORKS_UI } from "@/lib/constants";
import type { PlayerTableRow } from "@/lib/types";
import { memo } from "react";

const PlayerNicksTableCell = memo(function PlayerNicksTableCell({ nicks }: { nicks: PlayerTableRow["nicks"] }) {
  const visible = nicks?.filter((n) => n.network !== "PlayerGroup") ?? [];
  if (visible.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-1 gap-y-1">
      {visible.map((n) => {
        const net = POKER_NETWORKS_UI.find((x) => x.value === n.network);
        return (
          <div
            key={n.network + n.nick}
            title={`${n.network}: ${n.nick}`}
            className="bg-muted/60 flex min-w-0 items-center gap-1 rounded px-1 py-0.5"
          >
            {net?.icon && (
              // eslint-disable-next-line @next/next/no-img-element -- small static network icons
              <img src={net.icon} alt={net.label} className="h-4 w-4 shrink-0 rounded-[2px] object-contain" />
            )}
            <span className="min-w-0 truncate font-mono text-[12px] leading-tight text-muted-foreground">
              {n.nick}
            </span>
          </div>
        );
      })}
    </div>
  );
});

PlayerNicksTableCell.displayName = "PlayerNicksTableCell";

export default PlayerNicksTableCell;
