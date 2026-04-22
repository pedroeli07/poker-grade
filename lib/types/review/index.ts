import { getPendingReviewsForSession } from "@/lib/queries/db/review/reads";
import type { BaseEntity, EntityRef, PlayerRef, WithId, WithIdAndStatus } from "../primitives";

type ReviewTournamentSummary = WithId & {
  date: string;
  site: string;
  buyInValue: number;
  tournamentName: string;
  speed: string | null;
  matchStatus: string;
};

export type ReviewItemView = BaseEntity &
  WithIdAndStatus<string> & {
    player: PlayerRef;
    tournament: ReviewTournamentSummary;
    justification: string | null;
    reviewNotes: string | null;
    isInfraction: boolean;
  };

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
