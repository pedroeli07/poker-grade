/**
 * Structured logger — server and client.
 *
 * Env vars:
 *   LOG_LEVEL=debug|info|warn|error  (default: info prod, debug dev)
 *   LOG_SCOPES=scope1,scope2         (comma-sep allow-list)
 */

import pino from "pino";

// ── Sensitive key redaction ───────────────────────────────
const SENSITIVE_KEYS = new Set([
  "password", "passwordhash", "token", "authorization",
  "secret", "cookie", "set-cookie",
]);

function redactMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
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
  debug: 10, info: 20, success: 25, warn: 30, error: 40,
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

// ── Production logger (pino) ──────────────────────────────
const prodLogger =
  typeof window === "undefined" && process.env.NODE_ENV === "production"
    ? pino({ level: process.env.LOG_LEVEL || "info" })
    : null;

// ── Dev console formatting ────────────────────────────────
const ANSI = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  // Colours
  grey:    "\x1b[90m",
  cyan:    "\x1b[96m",
  green:   "\x1b[92m",
  yellow:  "\x1b[93m",
  red:     "\x1b[91m",
  blue:    "\x1b[94m",
  white:   "\x1b[97m",
};

const LEVEL_STYLE: Record<LogLevel, { color: string; emoji: string; label: string }> = {
  debug:   { color: ANSI.grey,   emoji: "·",  label: "DEBUG  " },
  info:    { color: ANSI.cyan,   emoji: "ℹ",  label: "INFO   " },
  success: { color: ANSI.green,  emoji: "✔",  label: "SUCCESS" },
  warn:    { color: ANSI.yellow, emoji: "⚠",  label: "WARN   " },
  error:   { color: ANSI.red,    emoji: "✖",  label: "ERROR  " },
};

function shortTime(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

function formatMeta(meta: Record<string, unknown>): string {
  const parts = Object.entries(meta)
    .map(([k, v]) => {
      const val = typeof v === "object" ? JSON.stringify(v) : String(v);
      return `${ANSI.dim}${k}${ANSI.reset}${ANSI.grey}=${ANSI.reset}${ANSI.white}${val}${ANSI.reset}`;
    })
    .join("  ");
  return parts ? `  ${parts}` : "";
}

function devLine(scope: string, level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const { color, emoji, label } = LEVEL_STYLE[level];
  const ts = `${ANSI.dim}${shortTime()}${ANSI.reset}`;
  const tag = `${color}${ANSI.bold}${emoji} ${label}${ANSI.reset}`;
  const sc = `${ANSI.blue}[${scope}]${ANSI.reset}`;
  const msg = `${color}${message}${ANSI.reset}`;
  const metaStr = meta && Object.keys(meta).length > 0 ? formatMeta(meta) : "";
  return `${ts} ${tag} ${sc} ${msg}${metaStr}`;
}

// ── Emit ──────────────────────────────────────────────────
function emit(scope: string, level: LogLevel, message: string, meta?: Record<string, unknown>, err?: unknown): void {
  if (!shouldEmit(scope, level)) return;

  const safeMeta = redactMeta(meta);

  if (prodLogger) {
    const data = {
      scope, msg: message, level, ...safeMeta,
      ...(err instanceof Error
        ? { errName: err.name, errMessage: err.message }
        : err !== undefined ? { err: String(err) } : {}),
    };
    if (level === "error") prodLogger.error(data);
    else if (level === "warn") prodLogger.warn(data);
    else prodLogger.info(data);
    return;
  }

  const line = devLine(scope, level, message, safeMeta);

  if (level === "error") {
    if (err instanceof Error && err.stack) {
      console.error(line, `\n${ANSI.dim}${err.stack}${ANSI.reset}`);
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

// ── Table helper ──────────────────────────────────────────
export function logTable(scope: string, rows: Record<string, unknown>[]): void {
  if (!shouldEmit(scope, "debug") || prodLogger) return;
  const sc = `${ANSI.blue}[${scope}]${ANSI.reset}`;
  console.info(`${ANSI.dim}${shortTime()}${ANSI.reset} ${sc}`);
  console.table(rows);
}

// ── Separator helper ──────────────────────────────────────
export function logSep(scope: string, label?: string): void {
  if (!shouldEmit(scope, "debug") || prodLogger) return;
  const line = "─".repeat(60);
  const text = label ? ` ${label} ` : "";
  console.info(`${ANSI.dim}${line}${text}${ANSI.reset}`);
}

// ── Public API ────────────────────────────────────────────
export type ScopedLogger = {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  success: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, cause?: Error, meta?: Record<string, unknown>) => void;
  table: (rows: Record<string, unknown>[]) => void;
  sep: (label?: string) => void;
};

export function createLogger(scope: string): ScopedLogger {
  return {
    debug:   (message, meta)        => emit(scope, "debug",   message, meta),
    info:    (message, meta)        => emit(scope, "info",    message, meta),
    success: (message, meta)        => emit(scope, "success", message, meta),
    warn:    (message, meta)        => emit(scope, "warn",    message, meta),
    error:   (message, cause, meta) => emit(scope, "error",   message, meta, cause),
    table:   (rows)                 => logTable(scope, rows),
    sep:     (label)                => logSep(scope, label),
  };
}

export const log = createLogger("app");
