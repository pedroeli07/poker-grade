/**
 * Métricas de performance (server / Node).
 *
 * Desenvolvimento: ativo por defeito (desligar com LOG_PERF=0).
 * Produção: só com LOG_PERF=1.
 */

import { PERF_LOG_ANSI_CYAN, PERF_LOG_ANSI_DIM, PERF_LOG_ANSI_RESET } from "@/lib/constants/perf-log";

export function isPerfLoggingEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return process.env.LOG_PERF === "1";
  }
  return process.env.LOG_PERF !== "0";
}

function elapsedMs(start: number): number {
  return Math.round(performance.now() - start);
}

/** Uma linha por passo — formato estável para grep / dashboards locais. */
export function logPerf(
  area: string,
  step: string,
  start: number,
  extra?: Record<string, unknown>
): void {
  if (!isPerfLoggingEnabled()) return;
  const ms = elapsedMs(start);
  const meta = { area, step, ms, ...extra };
  console.info(
    `${PERF_LOG_ANSI_DIM}${PERF_LOG_ANSI_CYAN}[perf]${PERF_LOG_ANSI_RESET} ${area}.${step} ${PERF_LOG_ANSI_DIM}ms=${ms}${PERF_LOG_ANSI_RESET}`,
    meta
  );
}

export async function withPerf<T>(
  area: string,
  step: string,
  fn: () => Promise<T>,
  extra?: Record<string, unknown>
): Promise<T> {
  const t0 = performance.now();
  try {
    return await fn();
  } finally {
    logPerf(area, step, t0, extra);
  }
}

/** Envolve uma Promise com log de duração — preserva o tipo (útil em Promise.all). */
export function timed<T>(area: string, step: string, p: Promise<T>): Promise<T> {
  const t0 = performance.now();
  return p.finally(() => logPerf(area, step, t0));
}
