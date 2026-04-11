"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const selectValue = coachId ?? "__all__";

  return (
    <div className="flex w-full items-center gap-3 sm:w-auto">
      <span className="hidden shrink-0 text-[15px] font-semibold text-primary/80 lg:inline-block">
        Filtrar por coach:
      </span>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          const nextCoach =
            v === "__all__" ? null : v === REVIEW_NO_COACH_SENTINEL ? REVIEW_NO_COACH_SENTINEL : v;
          router.push(buildReviewPath({ playerId: null, coachId: nextCoach, page: 1 }));
        }}
      >
        <SelectTrigger className="h-10 w-full border-primary/10 bg-white text-[15px] shadow-sm sm:w-[260px]">
          <SelectValue placeholder="Todos os coaches" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__" className="text-[15px]">
            Todos os coaches
          </SelectItem>
          {coachOptions.map((opt) => (
            <SelectItem key={opt.id} value={opt.id} className="text-[15px]">
              {`${opt.name} (${opt.playerCount} jogador${opt.playerCount !== 1 ? "es" : ""})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

ReviewCoachSelect.displayName = "ReviewCoachSelect";

export default ReviewCoachSelect;