"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildReviewPath } from "@/hooks/review/review-path";

const ReviewPagination = memo(function ReviewPagination({
  playerId,
  coachId,
  page,
  totalPages,
}: {
  playerId: string | null;
  coachId: string | null;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 border border-primary/10 bg-white hover:text-primary"
        disabled={page <= 1}
        onClick={() => router.push(buildReviewPath({ playerId, coachId, page: page - 1 }))}
        aria-label="Anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="px-2 text-sm font-semibold tabular-nums text-primary/80">
        {page} / {totalPages}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 border border-primary/10 bg-white hover:text-primary"
        disabled={page >= totalPages}
        onClick={() => router.push(buildReviewPath({ playerId, coachId, page: page + 1 }))}
        aria-label="Próxima"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});

ReviewPagination.displayName = "ReviewPagination";

export default ReviewPagination;