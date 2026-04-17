"use client";

import { memo } from "react";
import { Check, Copy } from "lucide-react";
import { AppTooltip } from "@/components/ui/app-tooltip";
import { useCopyFeedback } from "@/hooks/use-copy-feedback";

export const GradeDescriptionTooltip = memo(function GradeDescriptionTooltip({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  const { copied, copy } = useCopyFeedback({
    successTitle: "Descrição copiada!",
    getDescription: () => description,
  });

  return (
    <AppTooltip
      content={
        <div
          className="flex flex-col gap-2 p-1.5 cursor-pointer max-w-[400px]"
          onClick={(e) => copy(description, e)}
        >
          <div className="flex items-center justify-between gap-4 border-b border-foreground/10 pb-1.5">
            <span className="font-semibold text-zinc-100 text-[13px]">Descrição Completa</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="cursor-pointer h-3.5 w-3.5 opacity-50 text-zinc-100" />
            )}
          </div>
          <div className="text-[13px] whitespace-pre-wrap text-zinc-200 break-words">
            {description}
          </div>
          <p className="text-[10px] text-blue-400 mt-1 italic text-right">
            Clique para copiar
          </p>
        </div>
      }
    >
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => copy(description, e)}
        onKeyDown={(e) => e.key === "Enter" && copy(description, e)}
        className="cursor-copy w-full min-w-0 group/badge"
      >
        {children}
      </div>
    </AppTooltip>
  );
});

GradeDescriptionTooltip.displayName = "GradeDescriptionTooltip";
