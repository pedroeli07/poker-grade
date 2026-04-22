"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { processReview } from "@/lib/queries/db/review/update-mutations";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";
import { useInvalidate } from "@/hooks/use-invalidate";
import type { ReviewStatus } from "@prisma/client";
const log = createLogger("review.ui");

export function ReviewDecisionButtons({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const invalidateReview = useInvalidate("review");

  async function decide(status: ReviewStatus, label: string) {
    try {
      log.info("DecisÃ£o na fila de revisÃ£o", { reviewId, status });
      await processReview(reviewId, status);
      toast.success(label);
      invalidateReview();
      router.refresh();
    } catch (e) {
      log.error("Erro ao salvar decisÃ£o de revisÃ£o", undefined, {
        reviewId,
        status,
      });
      const msg =
        e instanceof Error ? e.message : "NÃ£o foi possÃ­vel salvar a decisÃ£o";
      toast.error("Erro", msg);
    }
  }

  return (
    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 text-emerald-500 hover:text-emerald-600 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
        onClick={() => decide("APPROVED", "Torneio aprovado")}
      >
        Aprovar
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 text-red-500 hover:text-red-600 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 cursor-pointer"
        onClick={() => decide("REJECTED", "Registrado como infraÃ§Ã£o")}
      >
        Infra
      </Button>
    </div>
  );
}
