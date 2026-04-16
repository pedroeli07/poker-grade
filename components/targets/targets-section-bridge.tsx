"use client";

import type { ReactNode } from "react";
import type { TargetsSummaryInput } from "@/lib/types";
import type { TargetSummaryCardData } from "@/lib/utils/target";
import { useTargetsSummaryCards } from "@/hooks/targets/use-targets-summary-cards";
import { memo } from "react";

const WithTargetsSummaryCards = memo(function WithTargetsSummaryCards({
  summary,
  children,
}: {
  summary: TargetsSummaryInput;
  children: (cardsData: TargetSummaryCardData[]) => ReactNode;
}) {
  const cardsData = useTargetsSummaryCards(summary);
  return <>{children(cardsData)}</>;
});

WithTargetsSummaryCards.displayName = "WithTargetsSummaryCards";

export { WithTargetsSummaryCards };
