"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Prisma } from "@prisma/client";
import { EMPTY_EXECUTION_TASK_FORM } from "@/lib/constants/team/execution-page";
import { TASK_STATUS_COLUMNS } from "@/lib/constants/team/execution-ui";
import type { ExecutionPageData } from "@/lib/data/team/execution-page";
import type { NormalizedExecutionTask, ExecutionTaskFormState } from "@/lib/types/team/execution";
import {
  filterExecutionTasksBySearch,
  normalizeExecutionTasks,
} from "@/lib/utils/team/execution-tasks";
import { deleteTeamTask } from "@/lib/queries/db/team/tasks/delete-task";
import { updateTeamTaskStatus } from "@/lib/queries/db/team/tasks/update-status";
import { upsertTeamTask } from "@/lib/queries/db/team/tasks/save-task";
import {
  parseRitualDriForSave,
  ritualDriFormValueFromRitual,
} from "@/lib/utils/team/ritual-dri-select";

export function useExecutionPage({ tasks: rawTasks, staff }: ExecutionPageData) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ExecutionTaskFormState>(EMPTY_EXECUTION_TASK_FORM);

  const tasks: NormalizedExecutionTask[] = useMemo(
    () => normalizeExecutionTasks(rawTasks),
    [rawTasks],
  );

  const filtered = useMemo(() => filterExecutionTasksBySearch(tasks, search), [tasks, search]);

  const setFormPatch = useCallback((patch: Partial<ExecutionTaskFormState>) => {
    setForm((p) => ({ ...p, ...patch }));
  }, []);

  const openCreate = useCallback(() => {
    setForm({
      ...EMPTY_EXECUTION_TASK_FORM,
      authUserId: staff[0]?.id ?? "",
    });
    setDialogOpen(true);
  }, [staff]);

  const openEdit = useCallback((t: NormalizedExecutionTask) => {
    setForm({
      id: t.id,
      title: t.title,
      description: t.description,
      authUserId: ritualDriFormValueFromRitual(t.authUserId, t.responsibleName),
      priority: t.priority,
      status: t._status,
      prazo: t.dueAt ? format(new Date(t.dueAt), "yyyy-MM-dd") : "",
      criterio: t.criteria[0] || t.expectedResult || "",
      tagEntries: t._tagItems.map((tag, i) => ({
        id: `tag-${t.id}-${i}-${tag.label}`,
        label: tag.label,
        colorName: tag.colorName,
      })),
    });
    setDialogOpen(true);
  }, []);

  const saveTask = useCallback(() => {
    if (!form.title.trim() || !form.authUserId.trim()) {
      toast.error("Preencha título e responsável.");
      return;
    }
    const assign = parseRitualDriForSave(form.authUserId);
    if (!assign.driId && !assign.responsibleName) {
      toast.error("Preencha título e responsável.");
      return;
    }
    const crit = form.criterio.trim();
    const tagPayload = form.tagEntries
      .map((e) => ({ label: e.label.trim(), colorName: e.colorName }))
      .filter((e) => e.label.length > 0);
    const due = form.prazo ? new Date(`${form.prazo}T12:00:00`) : null;
    const base = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      expectedResult: crit || null,
      criteria: crit ? [crit] : [],
      tags: tagPayload as unknown as Prisma.JsonValue,
      authUserId: assign.driId,
      responsibleName: assign.responsibleName,
      dueAt: due,
      sourceRitualId: null,
      sourceDecisionId: null,
    };
    start(async () => {
      const r = form.id
        ? await upsertTeamTask({ ...base, id: form.id })
        : await upsertTeamTask(base);
      if (r.ok) {
        toast.success(form.id ? "Tarefa atualizada." : "Tarefa criada.");
        setDialogOpen(false);
        router.refresh();
      } else toast.error(r.error || "Falha ao salvar.");
    });
  }, [form, router, start]);

  const changeStatus = useCallback(
    (id: string, status: string) => {
      start(async () => {
        const r = await updateTeamTaskStatus(id, status);
        if (r.ok) {
          router.refresh();
        } else toast.error(r.error || "Falha ao mover.");
      });
    },
    [router, start],
  );

  const confirmDelete = useCallback(
    (id: string) => {
      start(async () => {
        const r = await deleteTeamTask(id);
        if (r.ok) {
          toast.success("Tarefa excluída.");
          setDeleteId(null);
          router.refresh();
        } else toast.error(r.error || "Falha.");
      });
    },
    [router, start],
  );

  return {
    staff,
    pending,
    search,
    setSearch,
    dialogOpen,
    setDialogOpen,
    deleteId,
    setDeleteId,
    form,
    setFormPatch,
    openCreate,
    openEdit,
    saveTask,
    changeStatus,
    confirmDelete,
    filteredTasks: filtered,
    canCreate: staff.length > 0,
    statusColumns: TASK_STATUS_COLUMNS,
  };
}
