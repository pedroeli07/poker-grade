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
import { buildReviewPath } from "@/hooks/review/review-path";
import type { ReviewPlayerOption } from "@/lib/types";

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
  const selectValue = playerId ?? "__all__";

  return (
    <div className="flex w-full items-center gap-3 sm:w-auto">
      <span className="hidden shrink-0 text-[15px] font-semibold text-primary/80 lg:inline-block">
        Filtrar por jogador:
      </span>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          const nextPlayer = v === "__all__" ? null : v;
          router.push(buildReviewPath({ playerId: nextPlayer, coachId, page: 1 }));
        }}
      >
        <SelectTrigger className="h-10 w-full border-primary/10 bg-white text-[15px] shadow-sm sm:w-[320px]">
          <SelectValue placeholder="Todos os jogadores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__" className="text-[15px]">
            Todos os jogadores
          </SelectItem>
          {playerOptions.map((opt) => (
            <SelectItem key={opt.id} value={opt.id} className="text-[15px]">
              {`${opt.name} (${opt.extraPlayCount} extra play${opt.extraPlayCount !== 1 ? "s" : ""})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

ReviewPlayerSelect.displayName = "ReviewPlayerSelect";

export default ReviewPlayerSelect;