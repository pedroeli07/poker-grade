"use client";

import { useQueryClient } from "@tanstack/react-query";
import { gradeKeys } from "@/lib/queries/grade-query-keys";

export function useInvalidateGrades() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: gradeKeys.all });
  };
}
