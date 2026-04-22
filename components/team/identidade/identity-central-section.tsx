"use client";

import { Eye, Flag, Target, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const EMPTY: Record<"purpose" | "vision" | "mission", string> = {
  purpose: "Nenhum propósito definido.",
  vision: "Nenhuma visão definida.",
  mission: "Nenhuma missão definida.",
};

/** Propósito, visão e missão — efeitos só em família azul; sem acordeão. */
const BLUE_THEME = {
  card:
    "border-primary/25 bg-gradient-to-br from-primary/[0.09] via-background to-sky-50/50 shadow-[0_1px_0_0_rgba(59,130,246,0.12),0_8px_32px_-12px_rgba(37,99,235,0.14)] dark:from-primary/15 dark:via-background dark:to-sky-950/20",
  cardHover:
    "hover:border-primary/45 hover:shadow-[0_4px_0_0_rgba(37,99,235,0.08),0_20px_48px_-16px_rgba(37,99,235,0.25)] dark:hover:shadow-[0_20px_48px_-16px_rgba(59,130,246,0.18)]",
  iconWrap:
    "bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_0_1px_rgba(37,99,235,0.06),0_4px_14px_-4px_rgba(37,99,235,0.3)]",
  iconWrapHover:
    "group-hover:ring-primary/50 group-hover:shadow-[0_0_24px_-4px_rgba(59,130,246,0.45)] motion-safe:group-hover:scale-105",
  badge:
    "border border-primary/25 bg-primary/10 text-primary dark:border-primary/35 dark:bg-primary/15 dark:text-sky-100",
} as const;

type Block = {
  key: keyof typeof EMPTY;
  label: string;
  icon: LucideIcon;
  text: string;
};

type Props = {
  purpose: string;
  vision: string;
  mission: string;
};

function IdentityBlockCard({ block, className }: { block: Block; className?: string }) {
  const Icon = block.icon;
  const body = block.text.trim() || EMPTY[block.key];
  const theme = BLUE_THEME;

  return (
    <Card
      className={cn(
        "group overflow-hidden border-2",
        "transition-[box-shadow,border-color] duration-300 ease-out motion-reduce:duration-150",
        theme.card,
        theme.cardHover,
        className,
      )}
    >
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "shrink-0 rounded-full p-2 transition-transform duration-300 ease-out motion-reduce:transition-transform motion-reduce:duration-0",
            "motion-reduce:group-hover:scale-100",
            theme.iconWrap,
            theme.iconWrapHover,
          )}
          aria-hidden
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <Badge variant="secondary" className={cn("uppercase tracking-wide font-extrabold", theme.badge)}>
            {block.label}
          </Badge>
          <p className="text-sm font-medium leading-relaxed text-foreground/90 sm:text-base">{body}</p>
        </div>
      </div>
    </Card>
  );
}

export function IdentityCentralSection({ purpose, vision, mission }: Props) {
  const blocks: Block[] = [
    { key: "purpose", label: "Propósito", icon: Target, text: purpose },
    { key: "vision", label: "Visão", icon: Eye, text: vision },
    { key: "mission", label: "Missão", icon: Flag, text: mission },
  ];

  return (
    <div className="space-y-4">
      <IdentityBlockCard block={blocks[0]!} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <IdentityBlockCard block={blocks[1]!} />
        <IdentityBlockCard block={blocks[2]!} />
      </div>
    </div>
  );
}
