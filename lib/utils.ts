import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
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