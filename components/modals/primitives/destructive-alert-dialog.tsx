"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
export function DestructiveAlertIconHeader({
  icon: Icon = Trash2,
  iconClassName,
}: {
  icon?: LucideIcon;
  /** Ex.: `text-amber-600` quando `icon` for `AlertTriangle`. */
  iconClassName?: string;
}) {
  return (
    <div className="bg-linear-to-b from-destructive/[0.07] to-transparent px-6 pt-6 pb-1">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/25 bg-destructive/10 shadow-sm">
        <Icon className={cn("h-5 w-5 text-destructive", iconClassName)} />
      </div>
    </div>
  );
}



export function DestructiveAlertWarningNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="note"
      className="rounded-xl border border-destructive/20 border-l-4 border-l-destructive/55 bg-gradient-to-br from-destructive/[0.08] to-destructive/[0.02] px-4 py-3.5 shadow-sm"
    >
      <p className="text-sm font-semibold leading-snug text-red-600">{children}</p>
    </div>
  );
}

export function DestructiveAlertDivider() {
  return (
    <div className="px-6 pb-2 pt-8" aria-hidden>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />
    </div>
  );
}

