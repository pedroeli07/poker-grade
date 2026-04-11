"use client";

import { memo } from "react";
import { format } from "date-fns";
import { DollarSign, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReviewDecisionButtons } from "@/components/review-decision-buttons";
import type { ReviewItem } from "@/lib/types";

const ReviewTournamentReviewRow = memo(function ReviewTournamentReviewRow({
  review,
  showActions,
}: {
  review: ReviewItem;
  showActions: boolean;
}) {
  return (
    <div className="group flex items-center gap-5 bg-white px-6 py-4 transition-colors hover:bg-blue-100/5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <p
            className="line-clamp-1 max-w-[420px] text-[15px] font-semibold"
            title={review.tournament.tournamentName}
          >
            {review.tournament.tournamentName}
          </p>
          {review.tournament.matchStatus === "SUSPECT" ? (
            <Badge className="border border-amber-500/25 bg-amber-500/20 px-2 text-xs text-amber-500">
              Suspeito
            </Badge>
          ) : (
            <Badge className="border border-red-500/25 bg-red-500/10 px-2 text-xs text-red-500">
              <ShieldAlert className="mr-1 h-3 w-3" />
              Extra Play
            </Badge>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground/80">{review.tournament.site}</span>
          <span className="opacity-40">·</span>
          <span>{format(review.tournament.date, "dd/MM HH:mm")}</span>
          {review.tournament.speed && (
            <>
              <span className="opacity-40">·</span>
              <span>{review.tournament.speed}</span>
            </>
          )}
        </div>
      </div>

      <div className="min-w-[80px] shrink-0 text-right">
        <div className="flex items-center justify-end gap-1 font-mono text-[17px] font-bold text-foreground/90">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          {review.tournament.buyInValue.toFixed(2)}
        </div>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">buy-in</p>
      </div>

      {showActions ? (
        <div className="shrink-0">
          <ReviewDecisionButtons reviewId={review.id} />
        </div>
      ) : (
        <span className="shrink-0 text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
});

ReviewTournamentReviewRow.displayName = "ReviewTournamentReviewRow";

export default ReviewTournamentReviewRow;
