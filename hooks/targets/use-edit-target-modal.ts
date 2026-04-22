"use client";

import { useCallback, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateTarget } from "@/lib/queries/db/target/update-mutations";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";
import { isNextRedirectError } from "@/lib/utils/auth-session";
import type { EditTargetModalProps } from "@/lib/types/target/index";
export function useEditTargetModal({ target, open, onOpenChange }: EditTargetModalProps) {
  const [isPending, startTransition] = useTransition();
  const [targetType, setTargetType] = useState<string>(target.targetType);
  const [category, setCategory] = useState<string>(target.category);
  const [limitAction, setLimitAction] = useState<string>(target.limitAction ?? "none");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const invalidateTargets = useInvalidate("targets");

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (isPending) return;
      onOpenChange(value);
    },
    [isPending, onOpenChange],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      fd.set("id", target.id);
      fd.set("targetType", targetType);
      fd.set("category", category);
      fd.set("limitAction", limitAction);

      startTransition(async () => {
        try {
          await updateTarget(fd);
          toast.success("Target atualizado!", "As alterações foram salvas.");
          onOpenChange(false);
          invalidateTargets();
          router.refresh();
        } catch (err) {
          if (isNextRedirectError(err)) throw err;
          toast.error(
            "Erro ao atualizar target",
            err instanceof Error ? err.message : "Tente novamente.",
          );
        }
      });
    },
    [target.id, targetType, category, limitAction, invalidateTargets, onOpenChange, router],
  );

  return {
    open,
    isPending,
    formRef,
    targetType,
    setTargetType,
    category,
    setCategory,
    limitAction,
    setLimitAction,
    handleOpenChange,
    handleSubmit,
  };
}
