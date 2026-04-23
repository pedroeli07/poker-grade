import { STAT_CARD_TONES } from "@/lib/constants/jogador";
import { cardHoverLift, cardHoverLiftShadow } from "@/lib/constants/interactive-card";
import type { StatCardTone } from "@/lib/types/jogador";
import { cn } from "@/lib/utils/cn";
import { memo } from "react";
import { Progress } from "@/components/ui/progress";

const PlayerTourneyStatCard = memo(function PlayerTourneyStatCard({
  label,
  value,
  sub,
  tone,
  progressValue,
  className,
}: {
  label: string;
  value: number | string;
  sub?: string | null;
  tone?: StatCardTone;
  /** 0–100: mostra barra abaixo do valor */
  progressValue?: number | null;
  className?: string;
}) {
  const t = tone ? STAT_CARD_TONES[tone] : null;
  return (
    <div
      className={cn(
        "flex min-h-[108px] flex-col justify-center gap-0.5 rounded-2xl border p-5 sm:min-h-[112px] sm:p-6",
        t ? [cardHoverLift, t.card, t.cardHover] : [cardHoverLiftShadow, "border-border/80 bg-card/90"],
        className,
      )}
    >
      <p className={cn("text-xs font-semibold uppercase tracking-wide", t ? t.label : "text-muted-foreground")}>
        {label}
      </p>
      <p
        className={cn(
          "text-[1.75rem] font-bold leading-tight tabular-nums tracking-tight md:text-[2rem]",
          t ? t.value : "text-foreground",
        )}
      >
        {value}
      </p>
      {progressValue != null && t && (
        <Progress
          value={Math.min(100, Math.max(0, progressValue))}
          className={cn("relative w-full", t.progress)}
        />
      )}
      {sub ? <p className="mt-1 text-xs font-medium text-muted-foreground">{sub}</p> : null}
    </div>
  );
});

PlayerTourneyStatCard.displayName = "PlayerTourneyStatCard";

export default PlayerTourneyStatCard;
