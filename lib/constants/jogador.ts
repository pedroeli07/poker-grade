export const PLAYER_TOURNEYS_LS_PREFIX = "gestao-grades:player-tourneys:" as const;

export const PLAYER_TOURNEYS_WEEKDAY_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

/** Sombra base mais ampla; `cardHover` reforça no hover (transição em `cardHoverLift`). */
export const STAT_CARD_TONES = {
  gray: {
    card:
      "border-gray-300/60 bg-gray-50/95 shadow-[0_8px_26px_rgba(107,114,128,0.2),0_2px_8px_rgba(107,114,128,0.08)] dark:border-gray-500/40 dark:bg-gray-950/30 dark:shadow-[0_8px_28px_rgba(107,114,128,0.25),0_2px_8px_rgba(107,114,128,0.1)]",
    cardHover:
      "hover:shadow-[0_18px_48px_rgba(107,114,128,0.28),0_8px_20px_rgba(107,114,128,0.12)] dark:hover:shadow-[0_20px_52px_rgba(107,114,128,0.32),0_10px_24px_rgba(107,114,128,0.16)]",
    label: "text-gray-700/90 dark:text-gray-300/90",
    value: "text-gray-800 dark:text-gray-50",
    progress: "mt-3 h-1.5 bg-gray-200/50 dark:bg-gray-900/50 [&>div]:bg-gray-500",
  },
  blue: {
    card:
      "border-blue-300/60 bg-blue-50/95 shadow-[0_8px_26px_rgba(37,99,235,0.2),0_2px_8px_rgba(37,99,235,0.08)] dark:border-blue-500/40 dark:bg-blue-950/35 dark:shadow-[0_8px_28px_rgba(59,130,246,0.25),0_2px_8px_rgba(59,130,246,0.1)]",
    cardHover:
      "hover:shadow-[0_18px_48px_rgba(37,99,235,0.3),0_8px_20px_rgba(37,99,235,0.12)] dark:hover:shadow-[0_20px_52px_rgba(59,130,246,0.35),0_10px_24px_rgba(59,130,246,0.16)]",
    label: "text-blue-700/90 dark:text-blue-300/90",
    value: "text-blue-800 dark:text-blue-50",
    progress: "mt-3 h-1.5 bg-blue-200/50 dark:bg-blue-900/50 [&>div]:bg-blue-500",
  },
  emerald: {
    card:
      "border-emerald-300/60 bg-emerald-50/95 shadow-[0_8px_26px_rgba(16,185,129,0.2),0_2px_8px_rgba(16,185,129,0.08)] dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:shadow-[0_8px_28px_rgba(16,185,129,0.25),0_2px_8px_rgba(16,185,129,0.1)]",
    cardHover:
      "hover:shadow-[0_18px_48px_rgba(5,150,105,0.28),0_8px_20px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_20px_52px_rgba(16,185,129,0.32),0_10px_24px_rgba(16,185,129,0.16)]",
    label: "text-emerald-700/90 dark:text-emerald-300/90",
    value: "text-emerald-800 dark:text-emerald-50",
    progress: "mt-3 h-1.5 bg-emerald-200/50 dark:bg-emerald-900/50 [&>div]:bg-emerald-500",
  },
  /** Coral / extra play — tom rose suave */
  red: {
    card:
      "border-rose-300/60 bg-rose-50/95 shadow-[0_8px_26px_rgba(244,63,94,0.2),0_2px_8px_rgba(244,63,94,0.08)] dark:border-rose-500/40 dark:bg-rose-950/30 dark:shadow-[0_8px_28px_rgba(244,63,94,0.25),0_2px_8px_rgba(244,63,94,0.1)]",
    cardHover:
      "hover:shadow-[0_18px_48px_rgba(225,29,72,0.28),0_8px_20px_rgba(244,63,94,0.12)] dark:hover:shadow-[0_20px_52px_rgba(244,63,94,0.32),0_10px_24px_rgba(244,63,94,0.16)]",
    label: "text-rose-700/90 dark:text-rose-300/90",
    value: "text-rose-800 dark:text-rose-50",
    progress: "mt-3 h-1.5 bg-rose-200/50 dark:bg-rose-900/50 [&>div]:bg-rose-500",
  },
  zinc: {
    card:
      "border-slate-300/60 bg-slate-50/95 shadow-[0_8px_26px_rgba(71,85,105,0.2),0_2px_8px_rgba(71,85,105,0.08)] dark:border-slate-500/40 dark:bg-slate-900/50 dark:shadow-[0_8px_28px_rgba(0,0,0,0.32),0_2px_8px_rgba(148,163,184,0.12)]",
    cardHover:
      "hover:shadow-[0_18px_48px_rgba(51,65,85,0.24),0_8px_20px_rgba(71,85,105,0.1)] dark:hover:shadow-[0_20px_52px_rgba(0,0,0,0.4),0_10px_24px_rgba(0,0,0,0.2)]",
    label: "text-slate-600 dark:text-slate-400",
    value: "text-slate-800 dark:text-slate-100",
    progress: "mt-3 h-1.5 bg-slate-200/50 dark:bg-slate-800 [&>div]:bg-slate-500",
  },
  amber: {
    card:
      "border-amber-300/60 bg-amber-50/95 shadow-[0_8px_26px_rgba(217,119,6,0.2),0_2px_8px_rgba(245,158,11,0.1)] dark:border-amber-500/40 dark:bg-amber-950/30 dark:shadow-[0_8px_28px_rgba(245,158,11,0.22),0_2px_8px_rgba(245,158,11,0.1)]",
    cardHover:
      "hover:shadow-[0_18px_48px_rgba(180,83,9,0.28),0_8px_20px_rgba(217,119,6,0.12)] dark:hover:shadow-[0_20px_52px_rgba(245,158,11,0.3),0_10px_24px_rgba(245,158,11,0.16)]",
    label: "text-amber-800/90 dark:text-amber-300/90",
    value: "text-amber-900 dark:text-amber-50",
    progress: "mt-3 h-1.5 bg-amber-200/50 dark:bg-amber-900/50 [&>div]:bg-amber-500",
  },
} as const;

export const SCHEDULING_DASHBOARD_TONE = {
  extra: { label: "Extra play", cls: "border-red-500/30 bg-red-500/15 text-red-500" },
  played: { label: "Played", cls: "border-emerald-500/30 bg-emerald-500/15 text-emerald-500" },
  missed: { label: "Didn't play", cls: "border-zinc-500/30 bg-zinc-500/15 text-zinc-500" },
} as const;
