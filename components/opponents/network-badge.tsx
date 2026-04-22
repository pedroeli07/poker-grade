import { POKER_NETWORKS_UI } from "@/lib/constants/poker-networks";
import { memo } from "react";
import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg" | "xl";
const SIZE_PX: Record<Size, number> = { sm: 18, md: 22, lg: 36, xl: 44 };

const LABEL_TEXT: Record<Size, string> = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg font-medium",
};

const ROW_GAP: Record<Size, string> = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-2",
  xl: "gap-3",
};

const NetworkBadge = memo(function NetworkBadge({
  network,
  showLabel = true,
  size = "md",
  className,
  labelClassName,
}: {
  network: string;
  showLabel?: boolean;
  size?: Size;
  className?: string;
  /** Sobrescreve classes do texto do site (quando `showLabel`). */
  labelClassName?: string;
}) {
  const entry = POKER_NETWORKS_UI.find((n) => n.value === network);
  const label = entry?.label ?? network;
  const icon = entry?.icon ?? null;
  const px = SIZE_PX[size];

  return (
    <div className={cn("flex min-w-0 items-center", ROW_GAP[size], className)}>
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={icon}
          alt=""
          width={px}
          height={px}
          style={{ width: px, height: px }}
          className="shrink-0 rounded object-contain"
        />
      ) : (
        <span
          style={{ width: px, height: px }}
          className="flex shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground"
        >
          {label.trim().slice(0, 1).toUpperCase()}
        </span>
      )}
      {showLabel ? (
        <span className={cn("truncate", LABEL_TEXT[size], labelClassName)}>{label}</span>
      ) : null}
    </div>
  );
});

NetworkBadge.displayName = "NetworkBadge";

export default NetworkBadge;
