"use client";

import { useMemo } from "react";
import type { TargetsSummaryInput } from "@/lib/types";
import { getTargetsSummaryCardsData } from "@/lib/utils/target";

export function useTargetsSummaryCards(summary: TargetsSummaryInput) {
  return useMemo(() => getTargetsSummaryCardsData(summary), [summary]);
}
