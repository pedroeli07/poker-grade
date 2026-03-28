"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ReviewPlayerOption = {
  id: string;
  name: string;
  extraPlayCount: number;
};

export function buildReviewPath(playerId: string | null, page: number) {
  const p = new URLSearchParams();
  if (playerId) p.set("player", playerId);
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  return q ? `/dashboard/review?${q}` : "/dashboard/review";
}

export function ReviewPlayerSelect({
  playerOptions,
  playerId,
}: {
  playerOptions: ReviewPlayerOption[];
  playerId: string | null;
}) {
  const router = useRouter();
  const selectValue = playerId ?? "__all__";

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <span className="text-[15px] font-semibold text-primary/80 shrink-0 hidden md:inline-block">
        Filtrar por jogador:
      </span>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          const nextPlayer = v === "__all__" ? null : v;
          router.push(buildReviewPath(nextPlayer, 1));
        }}
      >
        <SelectTrigger className="h-10 text-[15px] bg-white w-full sm:w-[320px] shadow-sm border-primary/10">
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
}

export function ReviewPagination({
  playerId,
  page,
  totalPages,
}: {
  playerId: string | null;
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
        onClick={() => router.push(buildReviewPath(playerId, page - 1))}
        aria-label="Anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-semibold tabular-nums px-2 text-primary/80">
        {page} / {totalPages}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 border border-primary/10 bg-white hover:text-primary"
        disabled={page >= totalPages}
        onClick={() => router.push(buildReviewPath(playerId, page + 1))}
        aria-label="Próxima"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
