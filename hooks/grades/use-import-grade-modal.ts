"use client";

import { useCallback, useRef, useState, useTransition, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { importGradeFromJson } from "@/lib/queries/db/grade-queries";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";
import { isNextRedirectError } from "@/lib/utils";
import { useInvalidate } from "@/hooks/use-invalidate";
import { MODAL_DIALOG_CLOSE_RESET_MS } from "@/lib/constants/modals/modal-dialog-ui";
import { GRADE_JSON_IMPORT_INVALID_PT } from "@/lib/constants/modals/import-modals";

const log = createLogger("grade-modals");

export function useImportGradeModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const invalidateGrades = useInvalidate("grades");

  const resetState = useCallback(() => {
    setFile(null);
    setError(null);
    setDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (isPending) return;
      setOpen(value);
      if (!value) {
        setTimeout(() => {
          formRef.current?.reset();
          resetState();
        }, MODAL_DIALOG_CLOSE_RESET_MS);
      }
    },
    [isPending, resetState]
  );

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".json")) {
      setError(GRADE_JSON_IMPORT_INVALID_PT);
      return;
    }
    setFile(f);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!file) return;
      const formData = new FormData(e.currentTarget);

      startTransition(async () => {
        try {
          log.info("Iniciando import JSON da grade", { fileName: file.name });
          const text = await file.text();
          formData.append("jsonContent", text);
          await importGradeFromJson(formData);
          toast.success("Grade importada!", "Filtros Lobbyze convertidos em regras.");
          handleOpenChange(false);
          invalidateGrades();
          router.push("/dashboard/grades");
        } catch (err) {
          if (isNextRedirectError(err)) throw err;
          const msg = err instanceof Error ? err.message : "Erro desconhecido ao importar JSON";
          log.error("Erro na importação JSON", err instanceof Error ? err : undefined);
          setError(msg);
          toast.error("Não foi possível importar", msg);
        }
      });
    },
    [file, startTransition, handleOpenChange, invalidateGrades, router]
  );

  const openModal = useCallback(() => setOpen(true), []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  return {
    open,
    isPending,
    file,
    dragOver,
    error,
    inputRef,
    formRef,
    handleOpenChange,
    handleFileChange,
    handleDrop,
    handleSubmit,
    resetState,
    openModal,
    onDragOver,
    onDragLeave,
  };
}
