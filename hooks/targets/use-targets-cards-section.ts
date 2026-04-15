"use client";

import type { TargetListRow } from "@/lib/types";
import { useTargetListViewModels } from "@/hooks/targets/use-target-list-view-models";

export function useTargetsCardsSection(filtered: TargetListRow[]) {
  return useTargetListViewModels(filtered);
}
