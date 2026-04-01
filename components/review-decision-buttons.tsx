"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { processReview } from "@/app/dashboard/review/actions";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";
import { useInvalidateReview } from "@/hooks/use-invalidate-review";
import type { ReviewStatus } from "@/lib/types";

const log = createLogger("review.ui");

export function ReviewDecisionButtons({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const invalidateReview = useInvalidateReview();

  async function decide(status: ReviewStatus, label: string) {
    try {
      log.info("Decisão na fila de revisão", { reviewId, status });
      await processReview(reviewId, status);
      toast.success(label);
      invalidateReview();
      router.refresh();
    } catch (e) {
      log.error("Erro ao salvar decisão de revisão", undefined, {
        reviewId,
        status,
      });
      const msg =
        e instanceof Error ? e.message : "Não foi possível salvar a decisão";
      toast.error("Erro", msg);
    }
  }

  return (
    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
        onClick={() => decide("APPROVED", "Torneio aprovado")}
      >
        Aprovar
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 text-red-500 border-red-500/30 hover:bg-red-500/10 cursor-pointer"
        onClick={() => decide("REJECTED", "Registrado como infração")}
      >
        Infra
      </Button>
    </div>
  );
}
