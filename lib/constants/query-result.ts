import type { Err } from "@/lib/types";

export const fail = (error: string): Err => ({ ok: false, error });

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export const IMPORT_PATHS = ["/dashboard/imports", "/dashboard/review", "/dashboard"] as const;

export const PLAYER_PATHS = [
  "/dashboard/players",
  "/dashboard/grades",
  "/dashboard/targets",
  "/dashboard",
] as const;

/** Default `staleTime` (ms) para TanStack Query: listagens, cliente global e caches de UI. */
export const STALE_TIME = 30_000;
