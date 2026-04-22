"use client";

import { POKER_NETWORKS_UI } from "@/lib/constants/poker-networks";
import { memo } from "react";

const SiteNetworkTableCell = memo(function SiteNetworkTableCell({ network, label }: { network: string; label: string }) {
  const icon = POKER_NETWORKS_UI.find((n) => n.value === network)?.icon;
  return (
    <div className="flex min-w-0 items-center gap-2">
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element -- logos em /public
        <img
          src={icon}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 rounded object-contain"
        />
      ) : (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
          {label.trim().slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="truncate font-medium">{label}</span>
    </div>
  );
});

SiteNetworkTableCell.displayName = "SiteNetworkTableCell";

export default SiteNetworkTableCell;