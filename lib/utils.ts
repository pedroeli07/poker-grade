import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Returns true if `err` is a Next.js NEXT_REDIRECT error.
 * These must be re-thrown so the framework can navigate — never swallowed.
 */
export function isNextRedirectError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const digest = (err as { digest?: string }).digest;
  return (
    err.message === "NEXT_REDIRECT" ||
    (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT"))
  );
}
import { LobbyzeFilterItem } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

  // Helper formatting components
  export const formatList = (jsonObj: unknown) => {
    if (!jsonObj) return "Todos";
    try {
      const arr = typeof jsonObj === "string" ? JSON.parse(jsonObj) : jsonObj;
      if (!Array.isArray(arr) || arr.length === 0) return "Todos";
      return arr.map((item: LobbyzeFilterItem) => item.item_text).join(", ");
    } catch {
      return "Todos";
    }
  };

  export const formatBuyIn = (min: number | null, max: number | null) => {
    if (min === null && max === null) return "Qualquer";
    if (min !== null && max === null) return `+$${min}`;
    if (min === null && max !== null) return `Até $${max}`;
    return `$${min} - $${max}`;
  };

  export const canViewPlayer = (
    session: { role: string; coachId?: string | null; playerId?: string | null },
    player: { id: string; coachId: string | null; driId: string | null }
  ) => {
    if (session.role === "ADMIN" || session.role === "MANAGER" || session.role === "VIEWER")
      return true;
    if (session.role === "COACH" && session.coachId)
      return player.coachId === session.coachId || player.driId === session.coachId;
    if (session.role === "PLAYER") return session.playerId === player.id;
    return false;
  };

  export function schedulingCategory(scheduling: string | null) {
  const s = (scheduling ?? "").toLowerCase();
  if (s.includes("extra")) return "extra";
  if (s === "played" || s === "jogado") return "played";
  return "missed";
}