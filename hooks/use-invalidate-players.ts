"use client";

import { useQueryClient } from "@tanstack/react-query";
import { playerKeys } from "@/lib/queries/player-query-keys";

export function useInvalidatePlayers() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: playerKeys.all });
  };
}
