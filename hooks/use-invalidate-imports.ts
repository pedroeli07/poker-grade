"use client";

import { useQueryClient } from "@tanstack/react-query";
import { importKeys } from "@/lib/queries/import-query-keys";

export function useInvalidateImports() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: importKeys.all });
  };
}
