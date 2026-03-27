/**
 * Structured logging for server and client.
 * Search logs by scope: `[imports.actions]` or level: ERROR, SUCCESS.
 *
 * Env vars:
 *   LOG_LEVEL=debug|info|warn|error  (default: info in prod, debug in dev)
 *   LOG_SCOPES=scope1,scope2         (if set, only these scopes are logged)
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
    out[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : v;
  }
  return out;
}

// ── Level config ──────────────────────────────────────────
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
  if (raw === "debug") return "debug";
  if (raw === "warn") return "warn";
  if (raw === "error") return "error";
  if (raw === "info") return "info";
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

const MIN_LEVEL = LEVEL_ORDER[minLevelFromEnv()];

// Optional scope filter: LOG_SCOPES=imports.actions,grades.actions
const ALLOWED_SCOPES: Set<string> | null = (() => {
  const raw = process.env.LOG_SCOPES;
  if (!raw) return null;
  return new Set(raw.split(",").map((s) => s.trim()));
})();

function shouldEmit(scope: string, level: LogLevel): boolean {
  if (LEVEL_ORDER[level] < MIN_LEVEL) return false;
  if (ALLOWED_SCOPES && !ALLOWED_SCOPES.has(scope)) return false;
  return true;
}

// ── Production pino logger ────────────────────────────────
const prodLogger =
  typeof window === "undefined" && process.env.NODE_ENV === "production"
    ? pino({ level: process.env.LOG_LEVEL || "info" })
    : null;

// ── Dev console colours ───────────────────────────────────
const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[90m",    // grey
  info: "\x1b[36m",     // cyan
  success: "\x1b[32m",  // green
  warn: "\x1b[33m",     // yellow
  error: "\x1b[31m",    // red
};
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

function devLine(
  scope: string,
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): string {
  const color = LEVEL_COLORS[level];
  const tag = `${color}${BOLD}${level.toUpperCase().padEnd(7)}${RESET}`;
  const scopeStr = `${DIM}[${scope}]${RESET}`;
  const metaStr =
    meta && Object.keys(meta).length > 0
      ? ` ${DIM}${JSON.stringify(meta)}${RESET}`
      : "";
  return `${tag} ${scopeStr} ${message}${metaStr}`;
}

// ── Emit ──────────────────────────────────────────────────
function emit(
  scope: string,
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
  err?: unknown
): void {
  if (!shouldEmit(scope, level)) return;

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
    if (level === "error") prodLogger.error(data);
    else if (level === "warn") prodLogger.warn(data);
    else prodLogger.info(data);
    return;
  }

  const line = devLine(scope, level, message, safeMeta);

  if (level === "error") {
    if (err instanceof Error && err.stack) {
      console.error(line, `\n${DIM}${err.stack}${RESET}`);
    } else {
      console.error(line);
    }
  } else if (level === "warn") {
    console.warn(line);
  } else if (level === "debug") {
    console.debug(line);
  } else {
    console.info(line);
  }
}

// ── Public API ────────────────────────────────────────────
export type ScopedLogger = {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  success: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, cause?: Error, meta?: Record<string, unknown>) => void;
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

export const log = createLogger("app");
