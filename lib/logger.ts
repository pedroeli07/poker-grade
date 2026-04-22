/**
 * Structured logger — server and client.
 *
 * Env vars:
 *   LOG_LEVEL=debug|info|warn|error  (default: info prod, debug dev)
 *   LOG_SCOPES=scope1,scope2         (comma-sep allow-list)
 *   LOG_PERF=0|1                     (métricas [perf] — ver lib/utils/perf.ts; dev: ativo salvo LOG_PERF=0)
 */

import { ANSI, prodLogger } from "./constants/logger-config";
import { ScopedLogger } from "@/lib/types/primitives";
import { shortTime, emit, shouldEmit } from "@/lib/utils/app-logger";
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
