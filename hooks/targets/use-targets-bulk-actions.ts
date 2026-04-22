"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { deleteTargets } from "@/lib/queries/db/target/delete-mutations";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";

export function useTargetsBulkActions() {
  const router = useRouter();
  const invalidateTargets = useInvalidate("targets");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [idsToDelete, setIdsToDelete] = useState<string[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = useCallback((ids: string[], force?: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) =>
        (force ?? !prev.has(id)) ? next.add(id) : next.delete(id)
      );
      return next;
    });
  }, []);

  const confirmDelete = useCallback(() => {
    if (!idsToDelete?.length) return;
    const ids = idsToDelete;
    startTransition(() => {
      void (async () => {
        try {
          await deleteTargets(ids);
          toast.success(
            ids.length === 1 ? "Target excluído" : `${ids.length} targets excluídos`
          );
          setIdsToDelete(null);
          setSelected(new Set());
          invalidateTargets();
          router.refresh();
        } catch (err) {
          toast.error(
            "Erro ao excluir",
            err instanceof Error ? err.message : "Tente novamente."
          );
        }
      })();
    });
  }, [idsToDelete, invalidateTargets, router]);

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
