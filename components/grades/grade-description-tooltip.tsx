"use client";

import { memo, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import { AppTooltip } from "@/components/ui/app-tooltip";
import { useCopyFeedback } from "@/hooks/use-copy-feedback";
import { cn } from "@/lib/utils/cn";
import { htmlToPlainText } from "@/lib/utils/html-to-plain-text";
import {
  GRADE_DESCRIPTION_TOOLTIP_ARROW_CLASS,
  GRADE_DESCRIPTION_TOOLTIP_CONTENT_CLASS,
} from "@/lib/constants/grade";

export const GradeDescriptionTooltip = memo(function GradeDescriptionTooltip({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  const plain = useMemo(() => htmlToPlainText(description), [description]);
  const { copied, copy } = useCopyFeedback({
    successTitle: "Descrição copiada!",
    getDescription: () => plain,
  });

  return (
    <AppTooltip
      className={cn(
        GRADE_DESCRIPTION_TOOLTIP_CONTENT_CLASS,
        "max-w-[min(400px,calc(100vw-2rem))]"
      )}
      arrowClassName={GRADE_DESCRIPTION_TOOLTIP_ARROW_CLASS}
      content={
        <div
          className="flex flex-col gap-2 p-1.5 cursor-pointer w-full max-w-[min(400px,calc(100vw-2rem))]"
          onClick={(e) => copy(plain, e)}
        >
          <div className="flex items-center justify-between gap-4 border-b border-primary-foreground/20 pb-1.5">
            <span className="font-semibold text-primary-foreground text-[13px]">Descrição Completa</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <Copy className="cursor-pointer h-3.5 w-3.5 opacity-70 text-primary-foreground" />
            )}
          </div>
          <div className="text-[13px] whitespace-pre-wrap text-primary-foreground/95 break-words">
            {plain}
          </div>
          <p className="text-[10px] text-primary-foreground/80 mt-1 italic text-right">
            Clique para copiar
          </p>
        </div>
      }
    >
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => copy(plain, e)}
        onKeyDown={(e) => e.key === "Enter" && copy(plain, e)}
        className="cursor-copy w-full min-w-0 group/badge"
      >
        {children}
      </div>
    </AppTooltip>
  );
});

GradeDescriptionTooltip.displayName = "GradeDescriptionTooltip";
