"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import ColumnFilter from "@/components/column-filter";
import { REVIEW_NO_COACH_SENTINEL } from "@/lib/constants";
import { buildReviewPath } from "@/hooks/review/review-path";
import type { ReviewCoachOption } from "@/lib/types";

const ReviewCoachSelect = memo(function ReviewCoachSelect({
  coachOptions,
  coachId,
}: {
  coachOptions: ReviewCoachOption[];
  coachId: string | null;
}) {
  const router = useRouter();

  const options = useMemo(
    () =>
      coachOptions.map((opt) => ({
        value: opt.id,
        label: `${opt.name} (${opt.playerCount} jogador${opt.playerCount !== 1 ? "es" : ""})`,
      })),
    [coachOptions]
  );

  return (
    <ColumnFilter
      columnId="review-coach"
      label="Coach"
      ariaLabel="Filtrar por coach"
      options={options}
      applied={coachId ? new Set([coachId]) : null}
      onApply={(next) => {
        const raw = next === null || next.size === 0 ? null : [...next][0] ?? null;
        const nextCoach =
          raw === null
            ? null
            : raw === REVIEW_NO_COACH_SENTINEL
              ? REVIEW_NO_COACH_SENTINEL
              : raw;
        router.push(buildReviewPath({ playerId: null, coachId: nextCoach, page: 1 }));
      }}
      compact
      single
    />
  );
});

ReviewCoachSelect.displayName = "ReviewCoachSelect";

export default ReviewCoachSelect;
