import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ImportListRow, ReviewItem } from "@/lib/types";

export const importRowDateLabel = (r: ImportListRow) =>
  format(new Date(r.createdAt), "dd/MM/yyyy • HH:mm", { locale: ptBR });

export function groupByPlayer(reviews: ReviewItem[]) {
  const map = new Map<string, { player: ReviewItem["player"]; reviews: ReviewItem[] }>();
  for (const r of reviews) {
    if (!map.has(r.player.id)) map.set(r.player.id, { player: r.player, reviews: [] });
    map.get(r.player.id)!.reviews.push(r);
  }
  return [...map.values()].sort((a, b) => b.reviews.length - a.reviews.length);
}
