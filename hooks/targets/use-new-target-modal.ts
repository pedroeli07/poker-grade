"use client";

import { useCallback, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createTarget } from "@/lib/queries/db/target/create-mutations";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";
import { isNextRedirectError } from "@/lib/utils/auth-session";
import type { NewTargetModalProps } from "@/lib/types/target/index";
import { MODAL_DIALOG_CLOSE_RESET_MS } from "@/lib/constants/modals";
import {
  NEW_TARGET_MODAL_DEFAULT_CATEGORY,
  NEW_TARGET_MODAL_DEFAULT_LIMIT_ACTION,
  NEW_TARGET_MODAL_DEFAULT_TYPE,
} from "@/lib/constants/target";

export const useNewTargetModal = ({ players }: NewTargetModalProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [playerId, setPlayerId] = useState(() => players[0]?.id ?? "");
  const [targetType, setTargetType] = useState<string>(NEW_TARGET_MODAL_DEFAULT_TYPE);
  const [category, setCategory] = useState<string>(NEW_TARGET_MODAL_DEFAULT_CATEGORY);
  const [limitAction, setLimitAction] = useState<string>(NEW_TARGET_MODAL_DEFAULT_LIMIT_ACTION);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const invalidateTargets = useInvalidate("targets");

  const resetAfterClose = useCallback(() => {
    formRef.current?.reset();
    setPlayerId(players[0]?.id ?? "");
    setTargetType(NEW_TARGET_MODAL_DEFAULT_TYPE);
    setCategory(NEW_TARGET_MODAL_DEFAULT_CATEGORY);
    setLimitAction(NEW_TARGET_MODAL_DEFAULT_LIMIT_ACTION);
  }, [players]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (isPending) return;
      setOpen(value);
      if (!value) {
        setTimeout(resetAfterClose, MODAL_DIALOG_CLOSE_RESET_MS);
      }
    },
    [isPending, resetAfterClose]
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      formData.set("playerId", playerId);
      formData.set("targetType", targetType);
      formData.set("category", category);
      formData.set("limitAction", limitAction);

      startTransition(async () => {
        try {
          await createTarget(formData);
          toast.success("Target criado!", "A meta foi adicionada ao jogador.");
          handleOpenChange(false);
          invalidateTargets();
          router.refresh();
        } catch (err) {
          if (isNextRedirectError(err)) throw err;
          toast.error(
            "Erro ao criar target",
            err instanceof Error ? err.message : "Tente novamente."
          );
        }
      });
    },
    [
      playerId,
      targetType,
      category,
      limitAction,
      startTransition,
      handleOpenChange,
      invalidateTargets,
      router,
    ]
  );

  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  return {
    players,
    open,
    isPending,
    formRef,
    playerId,
    setPlayerId,
    targetType,
    setTargetType,
    category,
    setCategory,
    limitAction,
    setLimitAction,
    handleOpenChange,
    handleSubmit,
    openModal,
  };
}
