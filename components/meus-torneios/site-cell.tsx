import { POKER_NETWORKS_UI } from "@/lib/constants/poker-networks";
import { memo } from "react";

const SiteCell = memo(function SiteCell({ network, label }: { network: string | null; label: string }) {
  const icon = network ? POKER_NETWORKS_UI.find((n) => n.value === network)?.icon : null;
  return (
    <div className="flex min-w-0 items-center gap-2">
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" width={22} height={22} className="size-[22px] shrink-0 rounded object-contain" />
      ) : (
        <span className="flex size-[22px] shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
          {label.trim().slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="truncate text-sm">{label}</span>
    </div>
  );
});

SiteCell.displayName = "SiteCell";

export default SiteCell;
