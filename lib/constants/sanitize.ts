import { LobbyzeItem } from "../types";
import { sanitizeText } from "../utils";

export const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeLobbyzeItems(items: LobbyzeItem[]): LobbyzeItem[] {
  return items.map(s => ({ item_id: s.item_id, item_text: sanitizeText(s.item_text, 200) }));
}