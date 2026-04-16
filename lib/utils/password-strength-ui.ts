import type { StrengthLevel } from "@/lib/auth/password-policy";
import { PASSWORD_STRENGTH_STYLES } from "@/lib/constants/password-strength-ui";

export const barColor = (level: StrengthLevel) =>
  PASSWORD_STRENGTH_STYLES[level]?.bar ?? "bg-zinc-600";
export const labelColor = (level: StrengthLevel) =>
  PASSWORD_STRENGTH_STYLES[level]?.label ?? "text-zinc-500";
