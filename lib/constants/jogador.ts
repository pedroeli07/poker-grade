export const PLAYER_TOURNEYS_LS_PREFIX = "gestao-grades:player-tourneys:" as const;

export const PLAYER_TOURNEYS_WEEKDAY_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export const STAT_CARD_TONE_CLASSES = {
  emerald:
    "border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/[0.06] text-emerald-600 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.25),0_4px_14px_-4px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/15 dark:text-emerald-400 hover:shadow-[inset_0_1px_0_0_rgba(16,185,129,0.25),0_8px_20px_-4px_rgba(16,185,129,0.5)] hover:-translate-y-0.5",
  red: "border-red-500/30 bg-gradient-to-br from-red-500/20 via-red-500/10 to-red-500/[0.06] text-red-600 shadow-[inset_0_1px_0_0_rgba(239,68,68,0.25),0_4px_14px_-4px_rgba(239,68,68,0.35)] ring-1 ring-red-500/15 dark:text-red-400 hover:shadow-[inset_0_1px_0_0_rgba(239,68,68,0.25),0_8px_20px_-4px_rgba(239,68,68,0.5)] hover:-translate-y-0.5",
  zinc: "border-zinc-500/30 bg-gradient-to-br from-zinc-500/20 via-zinc-500/10 to-zinc-500/[0.06] text-zinc-600 shadow-[inset_0_1px_0_0_rgba(113,113,122,0.25),0_4px_14px_-4px_rgba(113,113,122,0.35)] ring-1 ring-zinc-500/15 dark:text-zinc-400 hover:shadow-[inset_0_1px_0_0_rgba(113,113,122,0.25),0_8px_20px_-4px_rgba(113,113,122,0.5)] hover:-translate-y-0.5",
  blue: "border-blue-500/30 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-blue-500/[0.06] text-blue-600 shadow-[inset_0_1px_0_0_rgba(59,130,246,0.25),0_4px_14px_-4px_rgba(37,99,235,0.35)] ring-1 ring-blue-500/15 dark:text-blue-400 hover:shadow-[inset_0_1px_0_0_rgba(59,130,246,0.25),0_8px_20px_-4px_rgba(37,99,235,0.5)] hover:-translate-y-0.5",
  amber:
    "border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/[0.06] text-amber-700 shadow-[inset_0_1px_0_0_rgba(245,158,11,0.25),0_4px_14px_-4px_rgba(245,158,11,0.35)] ring-1 ring-amber-500/15 dark:text-amber-400 hover:shadow-[inset_0_1px_0_0_rgba(245,158,11,0.25),0_8px_20px_-4px_rgba(245,158,11,0.5)] hover:-translate-y-0.5",
} as const;

export const SCHEDULING_DASHBOARD_TONE = {
  extra: { label: "Extra play", cls: "border-red-500/30 bg-red-500/15 text-red-500" },
  played: { label: "Played", cls: "border-emerald-500/30 bg-emerald-500/15 text-emerald-500" },
  missed: { label: "Didn't play", cls: "border-zinc-500/30 bg-zinc-500/15 text-zinc-500" },
} as const;
