"use client";

import { useCallback, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createGradeProfile } from "@/lib/queries/db/grade";
import { toast } from "@/lib/toast";
import { isNextRedirectError } from "@/lib/utils";
import { useInvalidate } from "@/hooks/use-invalidate";
import { MODAL_DIALOG_CLOSE_RESET_MS } from "@/lib/constants/modals";

export function useNewGradeModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const invalidateGrades = useInvalidate("grades");

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (isPending) return;
      setOpen(value);
      if (!value) {
        setTimeout(() => {
          formRef.current?.reset();
        }, MODAL_DIALOG_CLOSE_RESET_MS);
      }
    },
    [isPending]
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      startTransition(async () => {
        try {
          const result = await createGradeProfile(formData);
          if (!result.ok) throw new Error(result.error);
          toast.success("Grade criada!", "Atribua a um jogador pela página Jogadores.");
          handleOpenChange(false);
          invalidateGrades();
          router.refresh();
          router.push(`/dashboard/grades/${result.id}`);
        } catch (err) {
          if (isNextRedirectError(err)) throw err;
          toast.error(
            "Erro ao criar grade",
            err instanceof Error ? err.message : "Tente novamente."
          );
        }
      });
    },
    [startTransition, handleOpenChange, invalidateGrades, router]
  );

  const openModal = useCallback(() => setOpen(true), []);

  return { open, isPending, formRef, handleOpenChange, handleSubmit, openModal };
}
