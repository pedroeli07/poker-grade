"use client";

import { memo } from "react";
import { CheckCircle2 } from "lucide-react";
import { cardClassName } from "@/lib/constants";

const ReviewAllClearCard = memo(function ReviewAllClearCard() {
  return (
    <div className={`${cardClassName} flex flex-col items-center justify-center py-20`}>
      <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-500/40" />
      <p className="font-medium text-foreground/70">Tudo em dia!</p>
      <p className="mt-1 text-sm">Nenhum torneio pendente de revisão no momento.</p>
    </div>
  );
});

ReviewAllClearCard.displayName = "ReviewAllClearCard";

export default ReviewAllClearCard;
