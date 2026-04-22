"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { gradeKeys } from "@/lib/queries/grade-query-keys";
import { deleteGradeRule } from "@/lib/queries/db/grade/delete-mutations";
import { updateGradeRule } from "@/lib/queries/db/grade/update-mutations";
import { FIELD_CONFIG } from "@/lib/constants/grade";
import { parseValue, normalizeArray } from "@/lib/utils/parse-forms";
import type { GradeRuleCardRule, UpdateGradeRuleInput } from "@/lib/types/grade/index";
export function useEditableRule(rule: GradeRuleCardRule, manage: boolean, gradeProfileId: string) {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: gradeKeys.detail(gradeProfileId) });
    qc.invalidateQueries({ queryKey: gradeKeys.list() });
  };

  // ðŸ”¥ SINGLE STATE
  const [form, setForm] = useState(() => ({ ...rule }));
  const [meta, setMeta] = useState({
    editing: false,
    saving: false,
    deleting: false,
    deleteOpen: false,
  });

  // Só aplica dados do servidor quando o modal de edição está fechado. Caso contrário,
  // um refetch (React Query) sobrescrevia o rascunho — ex.: GTD máx voltava a null e salvava ∞.
  useEffect(() => {
    if (!meta.editing) {
      setForm({ ...rule });
    }
  }, [rule, meta.editing]);

  useEffect(() => {
    if (!manage) setMeta((s) => ({ ...s, editing: false }));
  }, [manage]);

  const isEditing = manage && meta.editing;

  const set = (key: string, value: unknown) =>
    setForm((s) => ({ ...s, [key]: value } as GradeRuleCardRule));

  const cancelEdit = () => {
    setForm(rule);
    setMeta((s) => ({ ...s, editing: false }));
  };

  async function handleSave() {
    setMeta((s) => ({ ...s, saving: true }));

    const errors: string[] = [];
    const payload: Record<string, unknown> = {};

    for (const [key, cfg] of Object.entries(FIELD_CONFIG)) {
      const val = form[key as keyof GradeRuleCardRule];

      if (cfg.type === "float" || cfg.type === "int") {
        const parsed = parseValue(cfg.type, val) as number | null | undefined;
        if (parsed !== null && parsed !== undefined && Number.isNaN(parsed)) {
          errors.push(`${key} inválido`);
        }
        payload[key] =
          parsed === null || parsed === undefined || Number.isNaN(parsed as number)
            ? null
            : parsed;
      }

      else if (cfg.type === "array") {
        payload[key] = normalizeArray(Array.isArray(val) ? val : []);
      }

      else if (cfg.type === "string") {
        payload[key] = typeof val === "string" ? val.trim() || null : null;
      }

      else {
        payload[key] = val;
      }
    }

    if (errors.length) {
      toast.error("Validação", errors.join(". "));
      setMeta((s) => ({ ...s, saving: false }));
      return;
    }

    payload.filterName ||= `Regra ${rule.id.slice(-4)}`;

    const res = await updateGradeRule(rule.id, payload as UpdateGradeRuleInput);

    if (!res.ok) toast.error("Erro ao salvar", res.error);
    else {
      toast.success("Atualizado");
      setMeta((s) => ({ ...s, editing: false }));
      invalidate();
    }

    setMeta((s) => ({ ...s, saving: false }));
  }

  async function handleDelete() {
    setMeta((s) => ({ ...s, deleting: true }));

    const res = await deleteGradeRule(rule.id);

    if (!res.ok) toast.error("Erro ao excluir", res.error);
    else {
      toast.success("Excluído");
      setMeta((s) => ({ ...s, deleteOpen: false }));
      invalidate();
    }

    setMeta((s) => ({ ...s, deleting: false }));
  }

  return {
    form,
    set,
    meta,
    isEditing,
    actions: { 
      handleSave, 
      handleDelete, 
      cancelEdit,
      setEditing: (val: boolean) => setMeta(s => ({ ...s, editing: val })),
      setDeleteOpen: (val: boolean) => setMeta(s => ({ ...s, deleteOpen: val }))
    },
  };
}