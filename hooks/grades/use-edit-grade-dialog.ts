"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { htmlToPlainText } from "@/lib/utils/html-to-plain-text";
import { useInvalidate } from "@/hooks/use-invalidate";
import { updateGradeProfile } from "@/lib/queries/db/grade/update-mutations";

function descriptionForEdit(raw: string | null | undefined): string {
  return htmlToPlainText(raw?.trim() ?? "");
}

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
  const [description, setDescription] = useState(() => descriptionForEdit(initialDescription));
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setDescription(descriptionForEdit(initialDescription));
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
