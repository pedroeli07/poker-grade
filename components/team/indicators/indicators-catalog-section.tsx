"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GovernanceConfirmDeleteDialog } from "@/components/team/governance/governance-confirm-delete-dialog";
import { cn } from "@/lib/utils/cn";
import { useIndicatorsCatalog } from "@/hooks/team/use-indicators-catalog";
import { useIndicatorsCatalogList } from "@/hooks/team/use-indicators-catalog-list";
import type { TeamIndicatorDTO } from "@/lib/data/team/indicators-page";
import type { StaffSelectOption } from "@/lib/utils/team/staff-select-options-merge";
import IndicatorFormDialog from "./indicator-form-dialog";
import IndicatorsCatalogToolbar from "./indicators-catalog-toolbar";
import IndicatorsCatalogTableBody from "./indicators-catalog-table-body";

export function IndicatorsCatalogSection({
  indicators,
  staffOptions,
}: {
  indicators: TeamIndicatorDTO[];
  staffOptions: StaffSelectOption[];
}) {
  const {
    search,
    setSearch,
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
    anyFilter,
    clearTableView,
    hasActiveView,
    sort,
    onSort,
  } = useIndicatorsCatalogList(indicators);

  const {
    pending,
    formOpen,
    setFormOpen,
    form,
    setForm,
    editingId,
    openNew,
    openEdit,
    save,
    deleteId,
    setDeleteId,
    confirmDelete,
  } = useIndicatorsCatalog(indicators, staffOptions);

  const deleteName = deleteId ? (indicators.find((r) => r.id === deleteId)?.name ?? null) : null;

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-4">
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="space-y-1 border-b border-border/60 bg-card">
          <CardTitle className="text-lg font-semibold tracking-tight">Catálogo de indicadores</CardTitle>
          <CardDescription>
            KPIs de processo e resultado: fórmula, fonte, DRI, meta e ações automáticas. Dados administrativos
            do time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <IndicatorsCatalogToolbar
            leading={
              <Button type="button" className="gap-2 shrink-0" onClick={openNew}>
                <Plus className="h-4 w-4" />
                Adicionar indicador
              </Button>
            }
            matchedCount={matchedCount}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onChangePage={changePage}
            onChangePageSize={changePageSize}
            pageItemCount={paginatedRows.length}
          />

          {!pageSizeHydrated ? (
            <div className="min-h-[240px] rounded-2xl border border-dashed border-border/60 bg-muted/20" aria-busy />
          ) : (
            <>
              <IndicatorsCatalogTableBody
                options={options}
                filters={filters}
                setCol={setCol}
                anyFilter={anyFilter}
                clearTableView={clearTableView}
                tableRows={paginatedRows}
                matchedCount={matchedCount}
                hasActiveView={hasActiveView}
                sort={sort}
                onSort={onSort}
                onEdit={openEdit}
                onRequestDelete={setDeleteId}
                totalInCatalog={indicators.length}
              />
            </>
          )}
        </CardContent>
      </Card>

      <IndicatorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingId={editingId}
        form={form}
        onFormChange={setForm}
        onSave={save}
        pending={pending}
        staff={staffOptions}
      />

      <GovernanceConfirmDeleteDialog
        open={!!deleteId}
        title="Excluir indicador?"
        description={
          <p>
            O indicador{" "}
            <span className="font-semibold text-foreground">{deleteName ?? "—"}</span> será removido do
            catálogo.
          </p>
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmPending={pending}
      />
    </div>
  );
}
