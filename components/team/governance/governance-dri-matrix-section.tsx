"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GovernanceDriDTO } from "@/lib/data/team/governance-page";
import { useGovernanceDriMatrixList } from "@/hooks/team/use-governance-dri-matrix-list";
import GovernanceDriMatrixToolbar from "@/components/team/governance/governance-dri-matrix-toolbar";
import GovernanceDriMatrixBody from "@/components/team/governance/governance-dri-matrix-body";

export type GovernanceDriMatrixSectionProps = {
  dris: GovernanceDriDTO[];
  onConfigure: () => void;
  onEdit: (dri: GovernanceDriDTO) => void;
  onRequestDelete: (id: string) => void;
};

export function GovernanceDriMatrixSection({
  dris,
  onConfigure,
  onEdit,
  onRequestDelete,
}: GovernanceDriMatrixSectionProps) {
  const {
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
    clearTableView,
    hasActiveView,
    sort,
    onSort,
  } = useGovernanceDriMatrixList(dris);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Matriz de responsabilidades (DRI)</CardTitle>
            <CardDescription>
              DRI = Directly Responsible Individual — quem responde por cada área. Filtre e ordene como no
              histórico de deliberações.
            </CardDescription>
          </div>
          <Button type="button" variant="default" className="gap-2 shrink-0" onClick={onConfigure}>
            <Plus className="h-4 w-4" /> Configurar área
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
        {!pageSizeHydrated ? (
          <div className="min-h-[200px] rounded-2xl border border-dashed border-border/60 bg-muted/20" aria-busy />
        ) : (
          <>
            <GovernanceDriMatrixToolbar
              matchedCount={matchedCount}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              onChangePage={changePage}
              onChangePageSize={changePageSize}
              pageItemCount={paginatedRows.length}
            />
            <GovernanceDriMatrixBody
              options={options}
              filters={filters}
              setCol={setCol}
              anyFilter={anyFilter}
              clearTableView={clearTableView}
              tableRows={paginatedRows}
              matchedCount={matchedCount}
              totalCount={totalCount}
              hasActiveView={hasActiveView}
              sort={sort}
              onSort={onSort}
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
