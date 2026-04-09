import type { LogLevel } from "@/lib/types";
import pino from "pino";

export const prodLogger =
  typeof window === "undefined" && process.env.NODE_ENV === "production"
    ? pino({ level: process.env.LOG_LEVEL || "info" })
    : null;

export const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  grey: "\x1b[90m",
  cyan: "\x1b[96m",
  green: "\x1b[92m",
  yellow: "\x1b[93m",
  red: "\x1b[91m",
  blue: "\x1b[94m",
  white: "\x1b[97m",
};

export const LEVEL_STYLE: Record<LogLevel, { color: string; emoji: string; label: string }> = {
  debug: { color: ANSI.grey, emoji: "·", label: "DEBUG  " },
  info: { color: ANSI.cyan, emoji: "ℹ", label: "INFO   " },
  success: { color: ANSI.green, emoji: "✔", label: "SUCCESS" },
  warn: { color: ANSI.yellow, emoji: "⚠", label: "WARN   " },
  error: { color: ANSI.red, emoji: "✖", label: "ERROR  " },
};

export const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  success: 25,
  warn: 30,
  error: 40,
};

export const ALLOWED_SCOPES: Set<string> | null = (() => {
  const raw = process.env.LOG_SCOPES;
  if (!raw) return null;
  return new Set(raw.split(",").map((s) => s.trim()));
})();

export const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "authorization",
  "secret",
  "cookie",
  "set-cookie",
]);
