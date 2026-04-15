"use client";

import { useCallback, useEffect, useState } from "react";
import { updateGradeProfile } from "@/lib/queries/db/grade-queries";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";

export function useEditGradeDialog({
  gradeId,
  initialName,
  initialDescription,
}: {
  gradeId: string;
  initialName: string;
  initialDescription: string | null;
}) {
  const invalidateGrades = useInvalidate("grades");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription?.trim() ?? "");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setDescription(initialDescription?.trim() ?? "");
  }, [open, initialName, initialDescription]);

  const handleSave = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      const res = await updateGradeProfile(
        gradeId,
        name.trim(),
        description.trim() === "" ? null : description.trim()
      );
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Grade atualizada", initialName);
      setOpen(false);
      invalidateGrades();
    } catch {
      toast.error("Não foi possível salvar");
    } finally {
      setPending(false);
    }
  }, [pending, gradeId, name, description, initialName, invalidateGrades]);

  return {
    open,
    setOpen,
    name,
    setName,
    description,
    setDescription,
    pending,
    handleSave,
  };
}
