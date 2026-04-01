"use client";

import { useQueryClient } from "@tanstack/react-query";
import { targetKeys } from "@/lib/queries/target-query-keys";

export function useInvalidateTargets() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: targetKeys.all });
  };
}
