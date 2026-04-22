"use client";

import { useMemo } from "react";
import { getPasswordStrength } from "@/lib/auth/password-policy";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_STRENGTH_BAR_BG_MUTED,
  PASSWORD_STRENGTH_LABEL,
  PASSWORD_STRENGTH_MISSING_PREFIX,
  PASSWORD_STRENGTH_TRIVIAL_HINT_COMPACT,
  PASSWORD_STRENGTH_TRIVIAL_HINT_DEFAULT,
  passwordPolicyTypesHintLine,
} from "@/lib/constants/password";
import { barColor, formatPasswordLengthLine, labelColor, passwordCharsShortfall } from "@/lib/utils/password-strength-ui";
import { cn } from "@/lib/utils/cn";
import { PasswordStrengthProps } from "@/lib/types/view-types";
import { LEVEL_LABEL } from "@/lib/constants/target";
export function PasswordStrength({ password, className, compact }: PasswordStrengthProps) {
  const { level, percent, checks, trivialRejected } = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const len = password.length;
  const shortfall = passwordCharsShortfall(len, PASSWORD_MIN_LENGTH);

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-baseline justify-between gap-2 font-mono text-[10px] text-zinc-500">
          <span>{formatPasswordLengthLine(len, PASSWORD_MIN_LENGTH)}</span>
          {!checks.minLength && len > 0 ? (
            <span className="text-amber-400/90">
              {PASSWORD_STRENGTH_MISSING_PREFIX} {shortfall}
            </span>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-zinc-500">{PASSWORD_STRENGTH_LABEL}</span>
            <span
              className={cn("font-semibold", labelColor(level))}
              data-testid="password-strength-level"
            >
              {LEVEL_LABEL[level]}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-200 ease-out",
                barColor(level)
              )}
              style={{
                width: level === "empty" ? "0%" : `${Math.max(percent, 6)}%`,
              }}
            />
          </div>
        </div>
        <p className="font-mono text-[10px] leading-snug text-zinc-500">
          {passwordPolicyTypesHintLine(PASSWORD_MIN_LENGTH)}
        </p>
        {trivialRejected ? (
          <p className="text-[11px] text-red-400">{PASSWORD_STRENGTH_TRIVIAL_HINT_COMPACT}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-2 text-[10px] font-mono text-muted-foreground">
        <span>{formatPasswordLengthLine(len, PASSWORD_MIN_LENGTH)}</span>
        {!checks.minLength && len > 0 ? (
          <span className="text-amber-500/90">
            {PASSWORD_STRENGTH_MISSING_PREFIX} {shortfall}
          </span>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{PASSWORD_STRENGTH_LABEL}</span>
          <span className={cn("font-medium", labelColor(level))}>{LEVEL_LABEL[level]}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              PASSWORD_STRENGTH_BAR_BG_MUTED[level]
            )}
            style={{
              width: level === "empty" ? "0%" : `${Math.max(percent, 8)}%`,
            }}
          />
        </div>
      </div>
      {trivialRejected ? (
        <p className="text-xs text-destructive">{PASSWORD_STRENGTH_TRIVIAL_HINT_DEFAULT}</p>
      ) : null}
    </div>
  );
}
