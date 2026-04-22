import { revalidateTag } from "next/cache";

/** Utilitários partilhados por syncs SharkScope (cron, breakdown, nicks). */

export function safeRevalidateSharkscopeAnalytics() {
  try {
    revalidateTag("sharkscope-analytics", "max");
  } catch {
    /* ignore */
  }
}

export function isAbortError(e: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "AbortError") ||
    (e instanceof Error && e.name === "AbortError")
  );
}

export function throwIfAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) {
    throw new DOMException("Sincronização cancelada", "AbortError");
  }
}

export function daysAgoTimestamp(days: number): number {
  return Math.floor(Date.now() / 1000) - days * 86400;
}
