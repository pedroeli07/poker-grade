import { ALLOWED_SCOPES, ANSI, LEVEL_ORDER, LEVEL_STYLE, prodLogger, SENSITIVE_KEYS } from "@/lib/constants/logger-config";
import { logLevel, nodeEnv } from "@/lib/constants/env";
import type { LogLevel } from "@/lib/types/primitives";
export function shouldEmit(scope: string, level: LogLevel): boolean {
  const min = LEVEL_ORDER[minLevelFromEnv()];
  return LEVEL_ORDER[level] >= min && (!ALLOWED_SCOPES || ALLOWED_SCOPES.has(scope));
}

export function minLevelFromEnv(): LogLevel {
  const raw = logLevel?.toLowerCase();
  if (raw === "debug" || raw === "warn" || raw === "error" || raw === "info") return raw;
  return nodeEnv === "production" ? "info" : "debug";
}

export function redactMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(meta)) {
    out[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : meta[k];
  }
  return out;
}

export function shortTime(): string {
  const d = new Date();
  return (
    [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((n) => String(n).padStart(2, "0"))
      .join(":") +
    "." +
    String(d.getMilliseconds()).padStart(3, "0")
  );
}

export function formatMeta(meta: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(meta)) {
    const val = typeof v === "object" ? JSON.stringify(v) : String(v);
    parts.push(`${ANSI.dim}${k}${ANSI.reset}${ANSI.grey}=${ANSI.reset}${ANSI.white}${val}${ANSI.reset}`);
  }
  const joined = parts.join("  ");
  return joined ? `  ${joined}` : "";
}

export function devLine(scope: string, level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const { color, emoji, label } = LEVEL_STYLE[level];
  const ts = `${ANSI.dim}${shortTime()}${ANSI.reset}`;
  const tag = `${color}${ANSI.bold}${emoji} ${label}${ANSI.reset}`;
  const sc = `${ANSI.blue}[${scope}]${ANSI.reset}`;
  const msg = `${color}${message}${ANSI.reset}`;
  const metaStr = meta && Object.keys(meta).length > 0 ? formatMeta(meta) : "";
  return `${ts} ${tag} ${sc} ${msg}${metaStr}`;
}

export function emit(
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
    (level === "error" ? prodLogger.error : level === "warn" ? prodLogger.warn : prodLogger.info).call(
      prodLogger,
      data
    );
    return;
  }

  const line = devLine(scope, level, message, safeMeta);
  const log =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : level === "debug"
          ? console.debug
          : console.info;
  if (level === "error" && err instanceof Error && err.stack) {
    log(line, `\n${ANSI.dim}${err.stack}${ANSI.reset}`);
  } else {
    log(line);
  }
}
