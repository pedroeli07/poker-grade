"use client";

import { memo } from "react";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import ReviewCoachSelect from "@/components/review/review-coach-select";
import ReviewPagination from "@/components/review/review-pagination";
import ReviewPlayerSelect from "@/components/review/review-player-select";
import type { ReviewCoachOption, ReviewPlayerOption } from "@/lib/types/review/index";
const ReviewToolbarCard = memo(function ReviewToolbarCard({
  coachOptions,
  playerOptions,
  filterCoachId,
  filterPlayerId,
  page,
  totalPages,
  pendingInView,
  totalFilteredPending,
}: {
  coachOptions: ReviewCoachOption[];
  playerOptions: ReviewPlayerOption[];
  filterCoachId: string | null;
  filterPlayerId: string | null;
  page: number;
  totalPages: number;
  pendingInView: number;
  totalFilteredPending: number;
}) {
  return (
    <div className={`flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between`}>
      <div className="flex w-full flex-col flex-wrap items-stretch gap-4 sm:flex-row sm:items-center lg:min-w-0 lg:flex-1">
        <ReviewCoachSelect coachOptions={coachOptions} coachId={filterCoachId} />
        <ReviewPlayerSelect
          playerOptions={playerOptions}
          playerId={filterPlayerId}
          coachId={filterCoachId}
        />
      </div>
      <div className="flex shrink-0 items-center gap-4 transition-opacity">
        <p className="mr-2 text-sm font-medium text-muted-foreground">
          {pendingInView} torneio{pendingInView !== 1 ? "s" : ""}
          {!filterPlayerId && totalFilteredPending !== pendingInView && (
            <span className="opacity-60"> ({totalFilteredPending} total)</span>
          )}
        </p>
        <ReviewPagination
          playerId={filterPlayerId}
          coachId={filterCoachId}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
});

ReviewToolbarCard.displayName = "ReviewToolbarCard";

export default ReviewToolbarCard;
