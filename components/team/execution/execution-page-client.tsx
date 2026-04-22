"use client";

import { memo } from "react";
import { useExecutionPage } from "@/hooks/team/use-execution-page";
import type { ExecutionPageData } from "@/lib/data/team/execution-page";
import { ExecutionPageHeader } from "./execution-page-header";
import { ExecutionKanbanBoard } from "./execution-kanban-board";
import { ExecutionTaskFormDialog } from "./execution-task-form-dialog";
import { ExecutionDeleteTaskDialog } from "./execution-delete-task-dialog";

const ExecutionPageClient = memo(function ExecutionPageClient({ tasks, staff }: ExecutionPageData) {
  const {
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
    tasksForColumn,
    canCreate,
    statusColumns,
  } = useExecutionPage({ tasks, staff });

  return (
    <div className="space-y-8 pb-8">
      <ExecutionPageHeader
        search={search}
        onSearchChange={setSearch}
        onNew={openCreate}
        canCreate={canCreate}
      />

      <ExecutionKanbanBoard
        statusColumns={statusColumns}
        tasksForColumn={tasksForColumn}
        onEditTask={openEdit}
        onRequestDelete={setDeleteId}
        onStatusChange={changeStatus}
        pending={pending}
      />

      <ExecutionTaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        onFormChange={setFormPatch}
        onSave={saveTask}
        staff={staff}
        pending={pending}
      />

      <ExecutionDeleteTaskDialog
        deleteId={deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
});

ExecutionPageClient.displayName = "ExecutionPageClient";

export default ExecutionPageClient;
