"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "@/components/column-filter";
import NumberRangeFilter from "@/components/number-range-filter";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import { isFilterActive } from "@/lib/number-filter";
import { isLastNoteFilterActive } from "@/lib/opponents/last-note-filter";
import type { OpponentListRow, OpponentsListPageProps } from "@/lib/types/opponent";
import NetworkBadge from "./network-badge";
import { OpponentClassificationTableBadge, OpponentStyleTableBadge } from "./opponent-table-badges";
import NewNoteDialog from "./new-note-dialog";
import EditOpponentNoteDialog from "./edit-opponent-note-dialog";
import { deleteOpponentNote } from "@/lib/queries/db/opponent/delete-mutations";
import { toast } from "@/lib/toast";
import { Pencil, Trash2, Users } from "lucide-react";
import { useOpponentsTablePage } from "@/hooks/opponents/use-opponents-table-page";
import { cn } from "@/lib/utils/cn";
import {
  dataTableHeaderRowActiveRingClass,
  dataTableHeaderRowClass,
  opponentsTableCol,
  opponentsTableNotesHeadClass,
} from "@/lib/constants/classes";
import SortButton from "@/components/sort-button";
import type { OpponentsTableSortKey } from "@/hooks/opponents/use-opponents-table-page";
import OpponentLastNoteColumnFilter from "./opponent-last-note-column-filter";

const dtf = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export default function OpponentsListClient({
  rows,
  canCreate,
  basePath,
}: OpponentsListPageProps & { basePath: string }) {
  const {
    filtered,
    filters,
    options,
    setCol,
    numFilters,
    setNumFilter,
    toggleSort,
    sort,
    clearFilters,
    anyFilter,
    hasActiveView,
    filterSummaryLines,
    sortSummary,
    uniqueNotes,
    lastNoteFilter,
    setLastNoteFilter,
  } = useOpponentsTablePage(rows);

  const totalCount = rows.length;
  const router = useRouter();
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [pendingDelete, startDelete] = useTransition();

  return (
    <div className="min-w-0 max-w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Adversários</h2>
          <p className="mt-1 text-muted-foreground">
            Base coletiva de notas sobre adversários do time.
          </p>
        </div>
        {canCreate ? (
          <NewNoteDialog
            existingOpponents={rows.map((r) => ({ network: r.network, nick: r.nick }))}
          />
        ) : null}
      </div>

      {totalCount === 0 ? (
        <EmptyState canCreate={canCreate} existingOpponents={[]} />
      ) : (
        <>
          <DataTableToolbar
            filteredCount={filtered.length}
            totalCount={totalCount}
            entityLabels={["adversário", "adversários"]}
            hasActiveView={hasActiveView}
            anyFilter={anyFilter}
            sortSummary={sortSummary}
            filterSummaryLines={filterSummaryLines}
            onClear={clearFilters}
          />
          <DataTableShell hasActiveView={hasActiveView}>
            <Table className="table-fixed w-full max-w-full bg-white">
              <TableHeader>
                <TableRow
                  className={cn(
                    dataTableHeaderRowClass,
                    hasActiveView && dataTableHeaderRowActiveRingClass
                  )}
                >
                  <TableHead className={cn(opponentsTableCol.adversario, "text-center")}>
                    <div className="flex items-center justify-center gap-0.5">
                      <SortButton<OpponentsTableSortKey>
                        columnKey="nick"
                        sort={sort}
                        toggleSort={toggleSort}
                        kind="string"
                        label="Nickname"
                      />
                      <ColumnFilter
                        columnId="nick"
                        ariaLabel="Nickname"
                        label={
                          <FilteredColumnTitle active={filters.nick !== null}>Nickname</FilteredColumnTitle>
                        }
                        options={options.nick}
                        applied={filters.nick}
                        onApply={setCol("nick")}
                      />
                    </div>
                  </TableHead>
                  <TableHead className={cn(opponentsTableCol.site, "text-center")}>
                    <div className="flex items-center justify-center gap-0.5">
                      <SortButton<OpponentsTableSortKey>
                        columnKey="network"
                        sort={sort}
                        toggleSort={toggleSort}
                        kind="string"
                        label="site"
                      />
                      <ColumnFilter
                        columnId="network"
                        ariaLabel="Site"
                        label={
                          <FilteredColumnTitle active={filters.network !== null}>Site</FilteredColumnTitle>
                        }
                        options={options.network}
                        applied={filters.network}
                        onApply={setCol("network")}
                      />
                    </div>
                  </TableHead>
                  <TableHead className={cn(opponentsTableCol.tag, "text-center")}>
                    <div className="flex items-center justify-center gap-0.5">
                      <SortButton<OpponentsTableSortKey>
                        columnKey="tag"
                        sort={sort}
                        toggleSort={toggleSort}
                        kind="string"
                        label="tag"
                      />
                      <ColumnFilter
                        columnId="tag"
                        ariaLabel="Tag"
                        label={
                          <FilteredColumnTitle active={filters.tag !== null}>Tag</FilteredColumnTitle>
                        }
                        options={options.tag}
                        applied={filters.tag}
                        onApply={setCol("tag")}
                      />
                    </div>
                  </TableHead>
                  <TableHead className={cn(opponentsTableCol.estilo, "text-center")}>
                    <div className="flex items-center justify-center gap-0.5">
                      <SortButton<OpponentsTableSortKey>
                        columnKey="style"
                        sort={sort}
                        toggleSort={toggleSort}
                        kind="string"
                        label="estilo"
                      />
                      <ColumnFilter
                        columnId="style"
                        ariaLabel="Estilo"
                        label={
                          <FilteredColumnTitle active={filters.style !== null}>Estilo</FilteredColumnTitle>
                        }
                        options={options.style}
                        applied={filters.style}
                        onApply={setCol("style")}
                      />
                    </div>
                  </TableHead>
                  <TableHead className={opponentsTableNotesHeadClass}>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center justify-center gap-0.5">
                        <SortButton<OpponentsTableSortKey>
                          columnKey="notesCount"
                          sort={sort}
                          toggleSort={toggleSort}
                          kind="number"
                          label="notas"
                        />
                        <NumberRangeFilter
                          ariaLabel="Notas"
                          label={
                            <FilteredColumnTitle active={isFilterActive(numFilters.notes ?? null)}>
                              Notas
                            </FilteredColumnTitle>
                          }
                          value={numFilters.notes ?? null}
                          onChange={setNumFilter("notes")}
                          suffix=""
                          uniqueValues={uniqueNotes}
                        />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className={cn(opponentsTableCol.ultima, "text-center")}>
                    <div className="flex items-center justify-center gap-0.5">
                      <SortButton<OpponentsTableSortKey>
                        columnKey="lastNoteAt"
                        sort={sort}
                        toggleSort={toggleSort}
                        kind="date"
                        label="última"
                      />
                      <OpponentLastNoteColumnFilter
                        columnId="lastNoteAt"
                        ariaLabel="Última"
                        label={
                          <FilteredColumnTitle active={isLastNoteFilterActive(lastNoteFilter)}>
                            Última
                          </FilteredColumnTitle>
                        }
                        options={options.lastNote}
                        applied={lastNoteFilter}
                        onApply={setLastNoteFilter}
                      />
                    </div>
                  </TableHead>
                  <TableHead className={cn(opponentsTableCol.actions, "text-right")}>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Ações
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow className="border-b border-border/60 bg-white hover:bg-white">
                    <TableCell colSpan={7} className="h-24 bg-white text-center text-muted-foreground">
                      Nenhum adversário encontrado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <Row
                      key={`${r.network}:${r.nickKey}`}
                      row={r}
                      basePath={basePath}
                      onEdit={() => setEditNoteId(r.editableNoteId)}
                      onDelete={() => {
                        if (!r.editableNoteId) return;
                        if (!confirm("Excluir esta nota? Ela deixará de aparecer para você nesta linha."))
                          return;
                        startDelete(async () => {
                          const res = await deleteOpponentNote(r.editableNoteId!);
                          if (!res.ok) {
                            toast.error(res.error);
                            return;
                          }
                          toast.success("Nota excluída");
                          router.refresh();
                        });
                      }}
                      deletePending={pendingDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </DataTableShell>
          <EditOpponentNoteDialog
            noteId={editNoteId}
            open={editNoteId !== null}
            onOpenChange={(o) => {
              if (!o) setEditNoteId(null);
            }}
          />
        </>
      )}
    </div>
  );
}

function Row({
  row,
  basePath,
  onEdit,
  onDelete,
  deletePending,
}: {
  row: OpponentListRow;
  basePath: string;
  onEdit: () => void;
  onDelete: () => void;
  deletePending: boolean;
}) {
  const href = `${basePath}/${encodeURIComponent(row.network)}/${encodeURIComponent(row.nick)}`;
  const canAct = Boolean(row.editableNoteId);
  return (
    <TableRow className="border-b border-border/60 bg-white hover:bg-muted/35">
      <TableCell className={cn(opponentsTableCol.adversario, "py-3 text-center align-middle")}>
        <Link href={href} className="block min-w-0 truncate font-medium text-foreground hover:underline">
          {row.nick}
        </Link>
      </TableCell>
      <TableCell className={cn(opponentsTableCol.site, "py-3 align-middle text-center")}>
        <Link href={href} className="flex min-w-0 justify-center">
          <NetworkBadge network={row.network} size="md" />
        </Link>
      </TableCell>
      <TableCell className={cn(opponentsTableCol.tag, "py-3 align-middle text-center")}>
        {row.consolidated.classification ? (
          <OpponentClassificationTableBadge
            value={row.consolidated.classification}
            tie={row.consolidated.classificationTie}
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className={cn(opponentsTableCol.estilo, "py-3 align-middle text-center")}>
        {row.consolidated.style ? (
          <OpponentStyleTableBadge value={row.consolidated.style} tie={row.consolidated.styleTie} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className={cn(opponentsTableCol.notas, "py-3 text-center align-middle tabular-nums")}>
        {row.notesCount}
      </TableCell>
      <TableCell className={cn(opponentsTableCol.ultima, "py-3 text-center align-middle text-muted-foreground")}>
        {dtf.format(new Date(row.lastNoteAt))}
      </TableCell>
      <TableCell className={cn(opponentsTableCol.actions, "py-2 text-right align-middle")}>
        {canAct ? (
          <div className="flex justify-end gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              aria-label="Editar nota"
              title="Editar nota"
              onClick={(e) => {
                e.preventDefault();
                onEdit();
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              aria-label="Excluir nota"
              title="Excluir nota"
              disabled={deletePending}
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function EmptyState({
  canCreate,
  existingOpponents,
}: {
  canCreate: boolean;
  existingOpponents: { network: string; nick: string }[];
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <Users className="size-8 text-muted-foreground" />
        <div>
          <div className="font-medium">Nenhum adversário registrado</div>
          <p className="text-sm text-muted-foreground">
            Registre a primeira observação sobre um adversário.
          </p>
        </div>
        {canCreate ? (
          <NewNoteDialog
            existingOpponents={existingOpponents}
            trigger={<Button>Registrar primeiro adversário</Button>}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
