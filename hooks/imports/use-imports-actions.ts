"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { deleteImports } from "@/lib/queries/db/imports";

export function useImportsActions({
  invalidate,
}: {
  invalidate: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [idsToDelete, setIdsToDelete] = useState<string[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (ids: string[], force?: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) =>
        (force ?? !prev.has(id)) ? next.add(id) : next.delete(id)
      );
      return next;
    });
  };

  const confirmDelete = () => {
    if (!idsToDelete) return;
    const ids = idsToDelete;
    startTransition(async () => {
      const res = await deleteImports(ids);
      setIdsToDelete(null);
      if (res.success) {
        toast.success(
          ids.length === 1
            ? "ImportaÃ§Ã£o excluÃ­da"
            : `${ids.length} importaÃ§Ãµes excluÃ­das`
        );
        setSelected(new Set());
        invalidate();
      } else {
        toast.error("Erro ao excluir", res.error ?? "Tente novamente.");
      }
    });
  };

  return {
    selected,
    setSelected,
    idsToDelete,
    setIdsToDelete,
    isPending,
    toggle,
    confirmDelete,
  };
}
