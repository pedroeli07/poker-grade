"use client";

import { useCallback, useRef, useState, useTransition, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { uploadTournaments } from "@/lib/queries/db/imports";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";
import { isNextRedirectError } from "@/lib/utils";
import { useInvalidate } from "@/hooks/use-invalidate";
import type { UploadResult } from "@/lib/types";
import { MODAL_DIALOG_CLOSE_RESET_MS } from "@/lib/constants/modals";
import {
  LOBBYZE_IMPORT_ALLOWED_EXTENSIONS,
  LOBBYZE_IMPORT_INVALID_FORMAT_PT,
} from "@/lib/constants/modals";

const log = createLogger("imports.modal");

export function useNewImportModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const invalidateImports = useInvalidate("imports");

  const loading = isPending;

  const resetState = useCallback(() => {
    setFile(null);
    setError(null);
    setResult(null);
    setDragOver(false);
    setSelectedPlayerId("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (loading) return;
      setOpen(value);
      if (!value) setTimeout(resetState, MODAL_DIALOG_CLOSE_RESET_MS);
    },
    [loading, resetState]
  );

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    log.info("Arquivo selecionado", { name: f.name, size: f.size });
    setFile(f);
    setError(null);
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (!f) return;
      if (!LOBBYZE_IMPORT_ALLOWED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext))) {
        setError(LOBBYZE_IMPORT_INVALID_FORMAT_PT);
        return;
      }
      log.info("Arquivo arrastado", { name: f.name, size: f.size });
      setFile(f);
      setError(null);
    },
    []
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!file || !selectedPlayerId) return;

      setError(null);
      const formData = new FormData(e.currentTarget);
      formData.set("playerId", selectedPlayerId);

      startTransition(async () => {
        try {
          log.info("Enviando importaÃ§Ã£o");
          const res = await uploadTournaments(formData);

          if (!res.success) {
            const msg = res.error ?? "Erro desconhecido";
            log.warn("ImportaÃ§Ã£o retornou erro", { msg });
            setError(msg);
            toast.error("Falha na importaÃ§Ã£o", msg);
            return;
          }

          setResult({ processed: res.processed, summary: res.summary });
          setFile(null);
          toast.success("ImportaÃ§Ã£o concluÃ­da", `${res.processed} torneios processados`);
          invalidateImports();
          router.refresh();
        } catch (err) {
          if (isNextRedirectError(err)) throw err;

          const msg =
            err instanceof Error ? err.message : "Erro de comunicaÃ§Ã£o com o servidor";
          log.error("Falha no upload", err instanceof Error ? err : undefined);
          setError(msg);
          toast.error("Falha na importaÃ§Ã£o", msg);
        }
      });
    },
    [file, selectedPlayerId, startTransition, invalidateImports, router]
  );

  const openModal = useCallback(() => setOpen(true), []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  return {
    open,
    loading,
    file,
    error,
    result,
    dragOver,
    inputRef,
    selectedPlayerId,
    setSelectedPlayerId,
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
