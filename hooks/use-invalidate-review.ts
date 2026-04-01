"use client";

import { useQueryClient } from "@tanstack/react-query";
import { reviewKeys } from "@/lib/queries/review-query-keys";

export function useInvalidateReview() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: reviewKeys.all });
  };
}
