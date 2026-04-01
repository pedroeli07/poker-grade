"use client";

import { useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "@/lib/queries/notification-query-keys";

export function useInvalidateNotifications() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: notificationKeys.all });
  };
}
