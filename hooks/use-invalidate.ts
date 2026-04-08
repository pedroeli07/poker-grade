"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { gradeKeys } from "@/lib/queries/grade-query-keys";
import { importKeys } from "@/lib/queries/import-query-keys";
import { notificationKeys } from "@/lib/queries/notification-query-keys";
import { playerKeys } from "@/lib/queries/player-query-keys";
import { reviewKeys } from "@/lib/queries/review-query-keys";
import { targetKeys } from "@/lib/queries/target-query-keys";

/** Raízes de query por domínio — única fonte para invalidação em lote. */
export class InvalidateRegistry {
  static readonly roots = {
    grades: gradeKeys.all,
    imports: importKeys.all,
    notifications: notificationKeys.all,
    players: playerKeys.all,
    review: reviewKeys.all,
    targets: targetKeys.all,
  } as const;
}

export type InvalidateDomain = keyof typeof InvalidateRegistry.roots;

export function useInvalidate(domain: InvalidateDomain) {
  const qc = useQueryClient();
  const queryKey = InvalidateRegistry.roots[domain];
  return useCallback(
    () => void qc.invalidateQueries({ queryKey }),
    [qc, queryKey]
  );
}
