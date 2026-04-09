"use client";

import { useMemo } from "react";
import { getPasswordStrength, PASSWORD_MIN_LENGTH } from "@/lib/auth/password-policy";
import { barColor, cn, labelColor } from "@/lib/utils";
import { PasswordStrengthProps } from "@/lib/types";
import { LEVEL_LABEL } from "@/lib/constants";


export function PasswordStrength({ password, className, compact }: PasswordStrengthProps) {
  const { level, percent, checks, trivialRejected } = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const len = password.length;

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-baseline justify-between gap-2 font-mono text-[10px] text-zinc-500">
          <span>
            {len}/{PASSWORD_MIN_LENGTH}+ caracteres
          </span>
          {!checks.minLength && len > 0 ? (
            <span className="text-amber-400/90">
              faltam {PASSWORD_MIN_LENGTH - len}
            </span>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-zinc-500">Força da senha</span>
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
          Maiúsculas, minúsculas, números e símbolos ({PASSWORD_MIN_LENGTH}+)
        </p>
        {trivialRejected ? (
          <p className="text-[11px] text-red-400">
            Evite senhas óbvias como &quot;password&quot; ou &quot;123456&quot;.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-2 text-[10px] font-mono text-muted-foreground">
        <span>
          {len}/{PASSWORD_MIN_LENGTH}+ caracteres
        </span>
        {!checks.minLength && len > 0 ? (
          <span className="text-amber-500/90">
            faltam {PASSWORD_MIN_LENGTH - len}
          </span>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Força da senha</span>
          <span
            className={cn(
              "font-medium",
              level === "weak" && "text-destructive",
              level === "fair" && "text-amber-500",
              (level === "good" || level === "strong") && "text-emerald-500",
              level === "empty" && "text-muted-foreground"
            )}
          >
            {LEVEL_LABEL[level]}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              level === "empty" && "bg-muted-foreground/30",
              level === "weak" && "bg-destructive/80",
              level === "fair" && "bg-amber-500",
              level === "good" && "bg-emerald-500/80",
              level === "strong" && "bg-emerald-500"
            )}
            style={{
              width: level === "empty" ? "0%" : `${Math.max(percent, 8)}%`,
            }}
          />
        </div>
      </div>
      {trivialRejected ? (
        <p className="text-xs text-destructive">
          Evite senhas óbvias como &quot;password&quot; ou sequências comuns.
        </p>
      ) : null}
    </div>
  );
}
