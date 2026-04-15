"use client";

import { useMemo } from "react";
import type { TargetListRow } from "@/lib/types";
import { mapTargetsToViewModels } from "@/lib/utils/target/target-utils";

export function useTargetListViewModels(rows: TargetListRow[]) {
  return useMemo(() => mapTargetsToViewModels(rows), [rows]);
}
