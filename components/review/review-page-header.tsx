"use client";

import { memo } from "react";
import { AlertCircle } from "lucide-react";
import { reviewPageMetadata } from "@/lib/constants/metadata";

const ReviewPageHeader = memo(function ReviewPageHeader({
  pendingReviewsLength,
  totalFilteredPending,
  filterPlayerId,
  filterPlayerName,
  filterCoachLabel,
}: {
  pendingReviewsLength: number;
  totalFilteredPending: number;
  filterPlayerId: string | null;
  filterPlayerName: string | null;
  filterCoachLabel: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">{reviewPageMetadata.title}</h2>
        <p className="mt-1 text-muted-foreground">{reviewPageMetadata.description}</p>
      </div>
      {pendingReviewsLength > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/20 px-3 py-1.5">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-600">
            {filterPlayerId
              ? `${totalFilteredPending} pendente${totalFilteredPending !== 1 ? "s" : ""} (${filterPlayerName ?? ""})`
              : filterCoachLabel
                ? `${totalFilteredPending} pendente${totalFilteredPending !== 1 ? "s" : ""} (${filterCoachLabel})`
                : `${pendingReviewsLength} pendente${pendingReviewsLength !== 1 ? "s" : ""}`}
          </span>
        </div>
      )}
    </div>
  );
});

ReviewPageHeader.displayName = "ReviewPageHeader";

export default ReviewPageHeader;
