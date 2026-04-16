"use client";

import { useMemo } from "react";
import type { TargetListRow } from "@/lib/types";
import { mapTargetsToViewModels } from "@/lib/utils/target";

export function useTargetListViewModels(rows: TargetListRow[]) {
  return useMemo(() => mapTargetsToViewModels(rows), [rows]);
}
