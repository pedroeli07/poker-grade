"use client";

import { useCallback, useTransition } from "react";
import type { EditPlayerModalProps } from "@/lib/types/player/index";
export function useEditPlayerModal({
  onOpenChange,
}: Pick<EditPlayerModalProps, "onOpenChange">) {
  const [isPending, startTransition] = useTransition();

  const handleDialogOpenChange = useCallback(
    (value: boolean) => {
      if (!value && isPending) return;
      onOpenChange(value);
    },
    [isPending, onOpenChange]
  );

  return { isPending, startTransition, handleDialogOpenChange };
}
