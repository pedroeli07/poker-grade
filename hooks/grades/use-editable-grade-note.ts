import { useState, useCallback } from "react";
import { updateGradeCoachNote } from "@/lib/queries/db/grade";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";

/**
 * Converts stored plain-text (with \n line breaks) to HTML so the rich-text
 * editor renders it identically to GradeDetailHeroDescription's display logic.
 * If content is already HTML (starts with '<'), it's passed through unchanged.
 */
function toEditorHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  // Already HTML from a previous WYSIWYG edit
  if (trimmed.startsWith("<")) return trimmed;
  // Plain text: split double newlines into paragraphs, single newlines into <br>
  return trimmed
    .split(/\n\s*\n+/)
    .filter(Boolean)
    .map((block) =>
      `<p>${block.trim().split("\n").map((l) => l.trim()).join("<br>")}</p>`
    )
    .join("");
}

export function useEditableGradeNote(gradeId: string, initialDescription: string | null) {
  const invalidateGrades = useInvalidate("grades");

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEdit = useCallback(() => {
    setEditContent(toEditorHtml(initialDescription ?? ""));
    setIsEditing(true);
  }, [initialDescription]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditContent("");
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const isEmpty =
        !editContent ||
        editContent.trim() === "" ||
        editContent === "<p></p>" ||
        editContent === "<p><br></p>";
      const res = await updateGradeCoachNote(gradeId, isEmpty ? null : editContent);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Descrição atualizada");
      setIsEditing(false);
      invalidateGrades();
    } catch {
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  }, [saving, editContent, gradeId, invalidateGrades]);

  return {
    isEditing,
    editContent,
    saving,
    setEditContent,
    actions: {
      handleEdit,
      handleCancel,
      handleSave,
    },
  };
}
