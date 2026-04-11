"use client";

import { memo } from "react";
import Link from "next/link";
import { ExternalLink, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReviewTournamentReviewRow from "@/components/review/review-tournament-review-row";
import { cardClassName } from "@/lib/constants";
import { avatarColor, initials } from "@/lib/utils";
import type { ReviewPlayerGroup } from "@/lib/types";

const ReviewPlayerGroupCard = memo(function ReviewPlayerGroupCard({
  group,
  showActions,
}: {
  group: ReviewPlayerGroup;
  showActions: boolean;
}) {
  const { player, reviews } = group;

  return (
    <div className={`${cardClassName} overflow-hidden`}>
      <div className="flex items-center gap-4 border-b border-border/60 bg-primary/10 px-5 py-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor()}`}
        >
          {initials(player.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/dashboard/players/${player.id}`}
              className="flex items-center gap-1.5 text-lg font-semibold text-foreground transition-colors hover:text-primary"
            >
              {player.name}
              <ExternalLink className="h-4 w-4 opacity-40" />
            </Link>
            <Badge
              variant="outline"
              className="border-red-500/30 bg-red-500/10 px-2.5 text-sm text-red-500"
            >
              {reviews.length} extra play{reviews.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[15px] text-muted-foreground">
            <User className="h-4 w-4" />
            Coach: <span className="text-foreground/70">{player.coach?.name ?? "Sem coach"}</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {reviews.map((review) => (
          <ReviewTournamentReviewRow key={review.id} review={review} showActions={showActions} />
        ))}
      </div>
    </div>
  );
});

ReviewPlayerGroupCard.displayName = "ReviewPlayerGroupCard";

export default ReviewPlayerGroupCard;
