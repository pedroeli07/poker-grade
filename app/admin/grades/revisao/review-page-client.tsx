"use client";

import { memo } from "react";
import ReviewAllClearCard from "@/components/review/review-all-clear-card";
import ReviewGroupsSection from "@/components/review/review-groups-section";
import ReviewPageHeader from "@/components/review/review-page-header";
import ReviewToolbarCard from "@/components/review/review-toolbar-card";
import type { ReviewPageData } from "@/lib/types";

const ReviewPageClient = memo(function ReviewPageClient(data: ReviewPageData) {
  const {
    pendingReviews,
    showActions,
    coachOptions,
    playerOptions,
    filterCoachId,
    filterPlayerId,
    filterPlayerName,
    page,
    totalPages,
    paginatedGroups,
    pendingInView,
    totalFilteredPending,
    filterCoachLabel,
  } = data;

  return (
    <div className="space-y-6">
      <ReviewPageHeader
        pendingReviewsLength={pendingReviews.length}
        totalFilteredPending={totalFilteredPending}
        filterPlayerId={filterPlayerId}
        filterPlayerName={filterPlayerName}
        filterCoachLabel={filterCoachLabel}
      />

      {pendingReviews.length === 0 ? (
        <ReviewAllClearCard />
      ) : (
        <>
          <ReviewToolbarCard
            coachOptions={coachOptions}
            playerOptions={playerOptions}
            filterCoachId={filterCoachId}
            filterPlayerId={filterPlayerId}
            page={page}
            totalPages={totalPages}
            pendingInView={pendingInView}
            totalFilteredPending={totalFilteredPending}
          />
          <ReviewGroupsSection paginatedGroups={paginatedGroups} showActions={showActions} />
        </>
      )}
    </div>
  );
});

ReviewPageClient.displayName = "ReviewPageClient";

export default ReviewPageClient;
