/**
 * Structured logging for server and client.
 * Search logs by scope: `[imports.actions]` or level: `ERROR`, `SUCCESS`.
 */

import pino from "pino";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "authorization",
  "secret",
  "cookie",
  "set-cookie",
]);

function redactMeta(
  meta?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = v;
    }
  }
  return out;
}

const prodLogger =
  typeof window === "undefined" && process.env.NODE_ENV === "production"
    ? pino({ level: process.env.LOG_LEVEL || "info" })
    : null;

export type LogLevel = "debug" | "info" | "success" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  success: 25,
  warn: 30,
  error: 40,
};

function minLevelFromEnv(): LogLevel {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error")
    return raw === "error" ? "error" : raw;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

const MIN = LEVEL_ORDER[minLevelFromEnv()];

function shouldEmit(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= MIN;
}

function format(
  scope: string,
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): string {
  const ts = new Date().toISOString();
  const safe = redactMeta(meta);
  const metaStr =
    safe && Object.keys(safe).length > 0 ? ` ${JSON.stringify(safe)}` : "";
  return `${ts} ${level.toUpperCase().padEnd(7)} [${scope}] ${message}${metaStr}`;
}

function emit(
  scope: string,
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
  err?: unknown
): void {
  if (!shouldEmit(level)) return;

  const line = format(scope, level, message, meta);
  const safeMeta = redactMeta(meta);

  if (prodLogger) {
    const data = {
      scope,
      msg: message,
      level,
      ...safeMeta,
      ...(err instanceof Error
        ? { errName: err.name, errMessage: err.message }
        : err !== undefined
          ? { err: String(err) }
          : {}),
    };
    if (level === "error") {
      prodLogger.error(data);
    } else if (level === "warn") {
      prodLogger.warn(data);
    } else {
      prodLogger.info(data);
    }
    return;
  }

  switch (level) {
    case "error":
      if (err instanceof Error) {
        console.error(line, err);
      } else if (err !== undefined) {
        console.error(line, err);
      } else {
        console.error(line);
      }
      break;
    case "warn":
      console.warn(line);
      break;
    case "debug":
      console.debug(line);
      break;
    default:
      console.info(line);
  }
}

export type ScopedLogger = {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  success: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (
    message: string,
    cause?: Error,
    meta?: Record<string, unknown>
  ) => void;
};

export function createLogger(scope: string): ScopedLogger {
  return {
    debug: (message, meta) => emit(scope, "debug", message, meta),
    info: (message, meta) => emit(scope, "info", message, meta),
    success: (message, meta) => emit(scope, "success", message, meta),
    warn: (message, meta) => emit(scope, "warn", message, meta),
    error: (message, cause, meta) => emit(scope, "error", message, meta, cause),
  };
}

/** Default logger when no scope is needed */
export const log = createLogger("app");
