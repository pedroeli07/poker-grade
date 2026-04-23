"use client";

import { memo } from "react";
import { useExecutionPage } from "@/hooks/team/use-execution-page";
import { useExecutionList } from "@/hooks/team/use-execution-list";
import type { ExecutionPageData } from "@/lib/data/team/execution-page";
import { ExecutionPageHeader } from "./execution-page-header";
import ExecutionTasksToolbar from "./execution-tasks-toolbar";
import ExecutionTasksBody from "./execution-tasks-body";
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
    filteredTasks,
    canCreate,
    statusColumns,
  } = useExecutionPage({ tasks, staff });

  const {
    view,
    setView,
    viewHydrated,
    pageSizeHydrated,
    page,
    pageSize,
    totalPages,
    changePage,
    changePageSize,
    filters,
    setCol,
    options,
    paginatedRows,
    matchedCount,
    totalCount,
    anyFilter,
    clearFilters,
    clearTableView,
    hasActiveView,
    sort,
    onSort,
  } = useExecutionList(filteredTasks);

  return (
    <div className="space-y-6 pb-8">
      <ExecutionPageHeader
        search={search}
        onSearchChange={setSearch}
        onNew={openCreate}
        canCreate={canCreate}
      />

      {!viewHydrated || !pageSizeHydrated ? (
        <div
          className="min-h-[320px] rounded-2xl border border-dashed border-border/60 bg-muted/20"
          aria-busy
        />
      ) : (
        <div className="space-y-4">
          <ExecutionTasksToolbar
            view={view}
            setView={setView}
            options={options}
            filters={filters}
            setCol={setCol}
            matchedCount={matchedCount}
            totalCount={totalCount}
            anyFilter={anyFilter}
            clearFilters={clearFilters}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onChangePage={changePage}
            onChangePageSize={changePageSize}
            pageItemCount={paginatedRows.length}
          />
          <ExecutionTasksBody
            view={view}
            options={options}
            filters={filters}
            setCol={setCol}
            anyFilter={anyFilter}
            clearTableView={clearTableView}
            tableRows={paginatedRows}
            kanbanRows={paginatedRows}
            matchedCount={matchedCount}
            hasActiveView={hasActiveView}
            sort={sort}
            onSort={onSort}
            statusColumns={statusColumns}
            onEditTask={openEdit}
            onRequestDelete={setDeleteId}
            onStatusChange={changeStatus}
            pending={pending}
          />
        </div>
      )}

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
        confirmPending={pending}
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
