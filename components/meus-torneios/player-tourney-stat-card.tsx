import { STAT_CARD_TONE_CLASSES } from "@/lib/constants/jogador";
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
}: {
  label: string;
  value: number | string;
  sub?: string | null;
  tone?: StatCardTone;
  /** 0–100: mostra barra abaixo do valor */
  progressValue?: number | null;
}) {
  const toneClasses = tone ? STAT_CARD_TONE_CLASSES[tone] : "";
  return (
    <div className={cn("rounded-xl border p-5 transition-all duration-300", toneClasses)}>
      <p className="text-sm font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-4xl font-bold tabular-nums">{value}</p>
      {progressValue != null && (
        <Progress
          value={Math.min(100, Math.max(0, progressValue))}
          className="mt-3 h-1.5 bg-black/[0.1] dark:bg-white/20 [&>div]:bg-blue-500"
        />
      )}
      {sub ? <p className="mt-1 text-xs font-medium opacity-80">{sub}</p> : null}
    </div>
  );
});

PlayerTourneyStatCard.displayName = "PlayerTourneyStatCard";

export default PlayerTourneyStatCard;
