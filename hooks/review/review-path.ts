import { NO_COACH_QUERY, REVIEW_NO_COACH_SENTINEL } from "@/lib/constants/sharkscope/ui";
import type { ReviewPathFilters } from "@/lib/types/review/index";
export function buildReviewPath({
  playerId,
  coachId,
  page,
}: ReviewPathFilters) {
  const p = new URLSearchParams();
  if (playerId) p.set("player", playerId);
  if (coachId === REVIEW_NO_COACH_SENTINEL) p.set("coach", NO_COACH_QUERY);
  else if (coachId) p.set("coach", coachId);
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  return q ? `/admin/grades/revisao?${q}` : "/admin/grades/revisao";
}
