//lib/utils/notification/index.ts
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IMPORT_LIST_ROW_DATE_FORMAT } from "@/lib/constants/imports";
import type { ImportListRow, ReviewItem } from "@/lib/types";

const importRowDateLabel = (r: ImportListRow) =>
  format(new Date(r.createdAt), IMPORT_LIST_ROW_DATE_FORMAT, { locale: ptBR });

function groupByPlayer(reviews: ReviewItem[]) {
  const map = new Map<string, { player: ReviewItem["player"]; reviews: ReviewItem[] }>();
  for (const r of reviews) {
    if (!map.has(r.player.id)) map.set(r.player.id, { player: r.player, reviews: [] });
    map.get(r.player.id)!.reviews.push(r);
  }
  return [...map.values()].sort((a, b) => b.reviews.length - a.reviews.length);
}

export { importRowDateLabel, groupByPlayer };

/**
 * Normaliza links de notificações legados que foram gravados com rotas antigas.
 * Deve ser aplicado em todo lugar que renderiza notif.link antes de passar ao <Link>.
 */
const LEGACY_LINK_MAP: [RegExp, string][] = [
  // /dashboard/players/:id  →  /admin/jogadores/:id
  [/^\/dashboard\/players\/([^/]+)$/, "/admin/jogadores/$1"],
  // /dashboard/grades/:id  →  /admin/grades/perfis/:id
  [/^\/dashboard\/grades\/([^/]+)$/, "/admin/grades/perfis/$1"],
];

export function normalizeNotificationLink(link: string | null | undefined): string | null {
  if (!link) return null;
  for (const [pattern, replacement] of LEGACY_LINK_MAP) {
    if (pattern.test(link)) {
      return link.replace(pattern, replacement);
    }
  }
  return link;
}