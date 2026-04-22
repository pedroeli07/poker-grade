import type { OpponentClassification, OpponentStyle } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { OPPONENT_CLASSIFICATION_LABELS, OPPONENT_STYLE_LABELS } from "@/lib/types/opponent";

const CLASSIFICATION_BADGE_CLASS: Record<OpponentClassification, string> = {
  FISH:
    "border-emerald-500/35 bg-emerald-500/[0.14] text-emerald-900 shadow-sm dark:text-emerald-100",
  REG: "border-blue-500/35 bg-blue-500/[0.14] text-blue-900 shadow-sm dark:text-blue-100",
  WHALE:
    "border-violet-500/35 bg-violet-500/[0.14] text-violet-900 shadow-sm dark:text-violet-100",
  NIT: "border-slate-400/40 bg-slate-500/[0.12] text-slate-800 shadow-sm dark:text-slate-200",
  SHARK: "border-rose-500/35 bg-rose-500/[0.14] text-rose-900 shadow-sm dark:text-rose-100",
  UNKNOWN:
    "border-zinc-400/40 bg-zinc-500/[0.1] text-zinc-700 shadow-sm dark:text-zinc-300",
};

const STYLE_BADGE_CLASS: Record<OpponentStyle, string> = {
  LAG: "border-amber-500/40 bg-amber-500/[0.15] text-amber-950 shadow-sm dark:text-amber-100",
  TAG: "border-sky-500/35 bg-sky-500/[0.14] text-sky-950 shadow-sm dark:text-sky-100",
  PASSIVE:
    "border-slate-400/40 bg-slate-500/[0.12] text-slate-800 shadow-sm dark:text-slate-200",
  AGGRESSIVE:
    "border-red-500/35 bg-red-500/[0.12] text-red-900 shadow-sm dark:text-red-100",
  TIGHT: "border-cyan-500/35 bg-cyan-500/[0.14] text-cyan-950 shadow-sm dark:text-cyan-100",
  LOOSE:
    "border-lime-500/35 bg-lime-500/[0.14] text-lime-950 shadow-sm dark:text-lime-100",
  UNKNOWN:
    "border-zinc-400/40 bg-zinc-500/[0.1] text-zinc-700 shadow-sm dark:text-zinc-300",
};

export function OpponentClassificationTableBadge({
  value,
  tie,
}: {
  value: OpponentClassification;
  tie: boolean;
}) {
  const label = OPPONENT_CLASSIFICATION_LABELS[value];
  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-medium tabular-nums",
        CLASSIFICATION_BADGE_CLASS[value]
      )}
    >
      {label}
      {tie ? " (empate)" : ""}
    </Badge>
  );
}

export function OpponentStyleTableBadge({ value, tie }: { value: OpponentStyle; tie: boolean }) {
  const label = OPPONENT_STYLE_LABELS[value];
  return (
    <Badge variant="outline" className={cn("border font-medium tabular-nums", STYLE_BADGE_CLASS[value])}>
      {label}
      {tie ? " (empate)" : ""}
    </Badge>
  );
}
