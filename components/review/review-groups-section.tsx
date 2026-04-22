"use client";

import { memo } from "react";
import ReviewPlayerGroupCard from "@/components/review/review-player-group-card";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import type { ReviewPlayerGroup } from "@/lib/types/review/index";
const ReviewGroupsSection = memo(function ReviewGroupsSection({
  paginatedGroups,
  showActions,
}: {
  paginatedGroups: ReviewPlayerGroup[];
  showActions: boolean;
}) {
  if (paginatedGroups.length === 0) {
    return <div className={`${cardClassName} py-12 text-center`}>Nenhum jogador nesta página.</div>;
  }

  return (
    <div className="mt-2 space-y-6">
      {paginatedGroups.map((group) => (
        <ReviewPlayerGroupCard key={group.player.id} group={group} showActions={showActions} />
      ))}
    </div>
  );
});

ReviewGroupsSection.displayName = "ReviewGroupsSection";

export default ReviewGroupsSection;
