import { getPendingReviewsForSession } from "@/lib/queries/db";
import type { EntityRef } from "./primitives";

export type ReviewItem = Awaited<ReturnType<typeof getPendingReviewsForSession>>[number];

export type ReviewPlayerOption = EntityRef & { extraPlayCount: number };
export type ReviewCoachOption = EntityRef & { playerCount: number };

export type ReviewPathFilters = { playerId: string | null; coachId: string | null; page: number };

export type ReviewPlayerGroup = { player: ReviewItem["player"]; reviews: ReviewItem[] };

export type ReviewPageData = {
  pendingReviews: ReviewItem[];
  showActions: boolean;
  coachOptions: ReviewCoachOption[];
  playerOptions: ReviewPlayerOption[];
  filterCoachId: string | null;
  filterPlayerId: string | null;
  filterCoachLabel: string | null;
  filterPlayerName: string | null;
  page: number;
  totalPages: number;
  paginatedGroups: ReviewPlayerGroup[];
  pendingInView: number;
  totalFilteredPending: number;
};
