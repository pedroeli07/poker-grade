"use client";

import { Card } from "@/components/ui/card";
import { VALUE_ENTRY_COLOR_CLASSES, VALUE_ENTRY_ICONS } from "@/lib/constants/team/identity";
import { cn } from "@/lib/utils/cn";
import type { TeamCultureValue } from "@/lib/types/team/identity";

type Props = {
  valores: TeamCultureValue[];
};

/**
 * Efeitos por valor — mesma ordem que `VALUE_ENTRY_COLOR_CLASSES`.
 * Apresentação estática (sem acordeão); hover no card.
 */
const VALUE_CARD_THEMES = [
  {
    card:
      "border-blue-500/30 bg-gradient-to-br from-blue-500/[0.08] via-card to-sky-50/40 shadow-[0_1px_0_0_rgba(59,130,246,0.14),0_10px_36px_-14px_rgba(37,99,235,0.2)] dark:from-blue-950/25 dark:via-card dark:to-slate-900/30",
    hover:
      "hover:border-blue-500/50 hover:shadow-[0_4px_0_0_rgba(37,99,235,0.1),0_22px_50px_-14px_rgba(37,99,235,0.35)] dark:hover:shadow-[0_22px_50px_-14px_rgba(37,99,235,0.25)]",
    iconExtra:
      "ring-1 ring-blue-500/30 shadow-[0_4px_16px_-6px_rgba(37,99,235,0.4)] transition-shadow duration-300 group-hover:ring-blue-500/50 group-hover:shadow-[0_0_22px_-4px_rgba(37,99,235,0.55)] motion-safe:group-hover:scale-[1.03]",
  },
  {
    card:
      "border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.08] via-card to-indigo-50/35 shadow-[0_1px_0_0_rgba(99,102,241,0.14),0_10px_36px_-14px_rgba(79,70,229,0.18)] dark:from-indigo-950/25 dark:via-card dark:to-slate-900/30",
    hover:
      "hover:border-indigo-500/50 hover:shadow-[0_4px_0_0_rgba(79,70,229,0.1),0_22px_50px_-14px_rgba(79,70,229,0.32)] dark:hover:shadow-[0_22px_50px_-14px_rgba(99,102,241,0.22)]",
    iconExtra:
      "ring-1 ring-indigo-500/30 shadow-[0_4px_16px_-6px_rgba(79,70,229,0.35)] transition-shadow duration-300 group-hover:ring-indigo-500/50 group-hover:shadow-[0_0_22px_-4px_rgba(99,102,241,0.5)] motion-safe:group-hover:scale-[1.03]",
  },
  {
    card:
      "border-purple-500/30 bg-gradient-to-br from-purple-500/[0.08] via-card to-purple-50/35 shadow-[0_1px_0_0_rgba(168,85,247,0.14),0_10px_36px_-14px_rgba(147,51,234,0.18)] dark:from-purple-950/25 dark:via-card dark:to-slate-900/30",
    hover:
      "hover:border-purple-500/50 hover:shadow-[0_4px_0_0_rgba(147,51,234,0.1),0_22px_50px_-14px_rgba(147,51,234,0.3)] dark:hover:shadow-[0_22px_50px_-14px_rgba(168,85,247,0.2)]",
    iconExtra:
      "ring-1 ring-purple-500/30 shadow-[0_4px_16px_-6px_rgba(147,51,234,0.35)] transition-shadow duration-300 group-hover:ring-purple-500/50 group-hover:shadow-[0_0_22px_-4px_rgba(168,85,247,0.5)] motion-safe:group-hover:scale-[1.03]",
  },
  {
    card:
      "border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.08] via-card to-emerald-50/35 shadow-[0_1px_0_0_rgba(16,185,129,0.14),0_10px_36px_-14px_rgba(5,150,105,0.18)] dark:from-emerald-950/25 dark:via-card dark:to-slate-900/30",
    hover:
      "hover:border-emerald-500/50 hover:shadow-[0_4px_0_0_rgba(5,150,105,0.1),0_22px_50px_-14px_rgba(5,150,105,0.3)] dark:hover:shadow-[0_22px_50px_-14px_rgba(16,185,129,0.2)]",
    iconExtra:
      "ring-1 ring-emerald-500/30 shadow-[0_4px_16px_-6px_rgba(5,150,105,0.35)] transition-shadow duration-300 group-hover:ring-emerald-500/50 group-hover:shadow-[0_0_22px_-4px_rgba(16,185,129,0.5)] motion-safe:group-hover:scale-[1.03]",
  },
  {
    card:
      "border-orange-500/30 bg-gradient-to-br from-orange-500/[0.08] via-card to-orange-50/35 shadow-[0_1px_0_0_rgba(249,115,22,0.14),0_10px_36px_-14px_rgba(234,88,12,0.18)] dark:from-orange-950/25 dark:via-card dark:to-slate-900/30",
    hover:
      "hover:border-orange-500/50 hover:shadow-[0_4px_0_0_rgba(234,88,12,0.1),0_22px_50px_-14px_rgba(234,88,12,0.3)] dark:hover:shadow-[0_22px_50px_-14px_rgba(249,115,22,0.2)]",
    iconExtra:
      "ring-1 ring-orange-500/30 shadow-[0_4px_16px_-6px_rgba(234,88,12,0.35)] transition-shadow duration-300 group-hover:ring-orange-500/50 group-hover:shadow-[0_0_22px_-4px_rgba(249,115,22,0.5)] motion-safe:group-hover:scale-[1.03]",
  },
  {
    card:
      "border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] via-card to-amber-50/40 shadow-[0_1px_0_0_rgba(245,158,11,0.16),0_10px_36px_-14px_rgba(217,119,6,0.2)] dark:from-amber-950/30 dark:via-card dark:to-slate-900/30",
    hover:
      "hover:border-amber-500/50 hover:shadow-[0_4px_0_0_rgba(217,119,6,0.1),0_22px_50px_-14px_rgba(217,119,6,0.32)] dark:hover:shadow-[0_22px_50px_-14px_rgba(245,158,11,0.22)]",
    iconExtra:
      "ring-1 ring-amber-500/30 shadow-[0_4px_16px_-6px_rgba(217,119,6,0.4)] transition-shadow duration-300 group-hover:ring-amber-500/50 group-hover:shadow-[0_0_22px_-4px_rgba(245,158,11,0.5)] motion-safe:group-hover:scale-[1.03]",
  },
  {
    card:
      "border-cyan-500/30 bg-gradient-to-br from-cyan-500/[0.08] via-card to-cyan-50/35 shadow-[0_1px_0_0_rgba(6,182,212,0.14),0_10px_36px_-14px_rgba(6,182,212,0.2)] dark:from-cyan-950/25 dark:via-card dark:to-slate-900/30",
    hover:
      "hover:border-cyan-500/50 hover:shadow-[0_4px_0_0_rgba(6,182,212,0.1),0_22px_50px_-14px_rgba(6,182,212,0.3)] dark:hover:shadow-[0_22px_50px_-14px_rgba(6,182,212,0.22)]",
    iconExtra:
      "ring-1 ring-cyan-500/30 shadow-[0_4px_16px_-6px_rgba(6,182,212,0.4)] transition-shadow duration-300 group-hover:ring-cyan-500/50 group-hover:shadow-[0_0_22px_-4px_rgba(6,182,212,0.5)] motion-safe:group-hover:scale-[1.03]",
  },
  {
    card:
      "border-rose-500/30 bg-gradient-to-br from-rose-500/[0.08] via-card to-rose-50/35 shadow-[0_1px_0_0_rgba(244,63,94,0.14),0_10px_36px_-14px_rgba(225,29,72,0.18)] dark:from-rose-950/25 dark:via-card dark:to-slate-900/30",
    hover:
      "hover:border-rose-500/50 hover:shadow-[0_4px_0_0_rgba(225,29,72,0.1),0_22px_50px_-14px_rgba(225,29,72,0.3)] dark:hover:shadow-[0_22px_50px_-14px_rgba(244,63,94,0.2)]",
    iconExtra:
      "ring-1 ring-rose-500/30 shadow-[0_4px_16px_-6px_rgba(225,29,72,0.35)] transition-shadow duration-300 group-hover:ring-rose-500/50 group-hover:shadow-[0_0_22px_-4px_rgba(244,63,94,0.5)] motion-safe:group-hover:scale-[1.03]",
  },
] as const;

function themeAt(idx: number) {
  return VALUE_CARD_THEMES[idx % VALUE_CARD_THEMES.length]!;
}

export function IdentityValuePreviewCards({ valores }: Props) {
  return (
    <div className="space-y-3">
      {valores.map((valor, idx) => {
        const Icon = VALUE_ENTRY_ICONS[idx % VALUE_ENTRY_ICONS.length]!;
        const color = VALUE_ENTRY_COLOR_CLASSES[idx % VALUE_ENTRY_COLOR_CLASSES.length]!;
        const t = themeAt(idx);
        return (
          <Card
            key={`preview-${idx}-${valor.title}`}
            className={cn(
              "group gap-0 overflow-hidden border-2 p-0",
              "transition-[box-shadow,border-color] duration-300 ease-out motion-reduce:duration-150",
              t.card,
              t.hover,
            )}
          >
            <article className="flex items-start gap-4 p-4 text-left">
              <div
                className={cn(
                  "w-6 shrink-0 text-xl font-bold tabular-nums",
                  "text-muted-foreground/50 transition-colors",
                  "group-hover:text-foreground/70",
                )}
              >
                {idx + 1}
              </div>
              <div className={cn("shrink-0 rounded-lg p-2", color, t.iconExtra)} aria-hidden>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-bold leading-tight text-foreground">{valor.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{valor.description}</p>
              </div>
            </article>
          </Card>
        );
      })}
    </div>
  );
}
