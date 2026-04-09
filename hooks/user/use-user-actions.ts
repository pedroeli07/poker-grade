"use client";

import { useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export function useUserActions() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const runAction = useCallback(
    (
      fn: () => Promise<{ error?: string; success?: boolean }>,
      onSuccess?: () => void
    ) => {
      startTransition(async () => {
        const res = await fn();
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Operação concluída.");
          onSuccess?.();
        }
        router.refresh();
      });
    },
    [router]
  );

  return { runAction, pending };
}