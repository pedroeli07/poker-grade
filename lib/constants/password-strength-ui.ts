import type { StrengthLevel } from "@/lib/auth/password-policy";

export const PASSWORD_STRENGTH_STYLES: Record<StrengthLevel, { bar: string; label: string }> = {
  empty: { bar: "bg-zinc-600", label: "text-zinc-500" },
  weak: { bar: "bg-red-500", label: "text-red-400" },
  fair: { bar: "bg-amber-400", label: "text-amber-400" },
  good: { bar: "bg-lime-500", label: "text-lime-400" },
  strong: { bar: "bg-emerald-500", label: "text-emerald-400" },
};
