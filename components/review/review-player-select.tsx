"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import ColumnFilter from "@/components/column-filter";
import { buildReviewPath } from "@/hooks/review/review-path";
import type { ReviewPlayerOption } from "@/lib/types/review/index";
const ReviewPlayerSelect = memo(function ReviewPlayerSelect({
  playerOptions,
  playerId,
  coachId,
}: {
  playerOptions: ReviewPlayerOption[];
  playerId: string | null;
  coachId: string | null;
}) {
  const router = useRouter();

  const options = useMemo(
    () =>
      playerOptions.map((opt) => ({
        value: opt.id,
        label: `${opt.name} (${opt.extraPlayCount} extra play${opt.extraPlayCount !== 1 ? "s" : ""})`,
      })),
    [playerOptions]
  );

  return (
    <ColumnFilter
      columnId="review-player"
      label="Jogador"
      ariaLabel="Filtrar por jogador"
      options={options}
      applied={playerId ? new Set([playerId]) : null}
      onApply={(next) => {
        const id = next === null || next.size === 0 ? null : [...next][0] ?? null;
        router.push(buildReviewPath({ playerId: id, coachId, page: 1 }));
      }}
      compact
      single
    />
  );
});

ReviewPlayerSelect.displayName = "ReviewPlayerSelect";

export default ReviewPlayerSelect;
