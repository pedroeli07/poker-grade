"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  /** Cor da seta do tooltip (deve combinar com o fundo em `className`). */
  arrowClassName?: string;
}

export function AppTooltip({ children, content, className, arrowClassName }: AppTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          className={className}
          arrowClassName={arrowClassName}
          side="top"
          align="center"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
