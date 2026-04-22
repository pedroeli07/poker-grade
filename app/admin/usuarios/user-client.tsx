"use client";

import { memo, type ChangeEvent } from "react";
import { Search, UserPlus, Users, UserCheck, Clock, LayoutGrid, Table2 } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import UserInviteModal from "@/components/modals/user-invite-modal";
import ColumnFilter from "@/components/column-filter";
import { UserCard } from "@/components/user/user-card";
import { UserTableRow } from "@/components/user/user-table-row";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import UserStatCard from "@/components/user/user-view-components";
import UserEmptyState from "@/components/user/user-empty-state";
import DataTableShell from "@/components/data-table/data-table-shell";
import DataTableToolbar from "@/components/data-table/data-table-toolbar";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import SortButton from "@/components/sort-button";
import { dataTableHeaderRowActiveRingClass, dataTableHeaderRowClass } from "@/lib/constants/classes";
import type { UserClientProps } from "@/lib/types/user/index";
import { useUserClient } from "@/hooks/users/use-users-client";

const UserClient = memo(function UserClient({ initialRows }: UserClientProps) {
  const {
    canManageUsers,
    inviteOpen,
    setInviteOpen,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    hydrated,
    tableSort,
    filters,
    options,
    anyFilter,
    filtered,
    sortedTableRows,
    toggleUserSort,
    stats,
    setCol,
    anyFilterOrSearch,
    hasTableActiveView,
    filterSummaryLines,
    sortSummary,
    clearTableView,
    clearFilters,
    runAction,
    pending,
    entityLabels,
  } = useUserClient(initialRows);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <UserInviteModal open={inviteOpen} onOpenChange={setInviteOpen} />

      {/* Header Area */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-primary">
            <Users className="h-7 w-7 text-primary" />
            Usuários
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Apenas administradores registram sem convite direto; os demais
            precisam estar na lista de liberação.
            {!canManageUsers && (
              <span className="mt-2 block text-xs">Acesso somente leitura.</span>
            )}
          </p>
        </div>
        {canManageUsers && (
          <Button
            className="glow-primary shrink-0"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Novo convite
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <UserStatCard label="Total na lista" value={stats.total} icon={Users} />
        <UserStatCard label="Contas ativas" value={stats.reg} icon={UserCheck} />
        <UserStatCard label="Convites pendentes" value={stats.pend} icon={Clock} />
      </div>

      {!hydrated ? null : (<>
      {/* Toolbar: Search & View Toggles */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Buscar por e-mail…"
            className="h-9 pl-9"
            aria-label="Buscar utilizadores por e-mail"
          />
        </div>
        <div className="inline-flex shrink-0 rounded-lg border border-border bg-muted/30 p-0.5">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className={cn("h-8 gap-2 text-xs", viewMode === "grid" && "bg-primary/12 text-primary")}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className={cn("h-8 gap-2 text-xs", viewMode === "table" && "bg-primary/12 text-primary")}
            onClick={() => setViewMode("table")}
          >
            <Table2 className="h-3.5 w-3.5" /> Tabela
          </Button>
        </div>
      </div>

      {/* Column Filters Notice (Grid Mode) */}
      {viewMode === "grid" && anyFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            Filtros ativos ({filtered.length} resultados). Ajuste na visão{" "}
            <strong className="text-foreground">Tabela</strong>.
          </span>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      )}

      {/* Main List Rendering */}
      {filtered.length === 0 ? (
        <UserEmptyState hasFilters={Boolean(searchQuery || anyFilter)} />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedTableRows.map((row) => (
            <UserCard
              key={row.id}
              row={row}
              disabled={pending}
              onAction={runAction}
            />
          ))}
        </div>
      ) : (
          <div className="space-y-3">
            <DataTableToolbar
              filteredCount={filtered.length}
              totalCount={initialRows.length}
              entityLabels={entityLabels}
              hasActiveView={hasTableActiveView}
              anyFilter={anyFilterOrSearch}
              sortSummary={sortSummary}
              filterSummaryLines={filterSummaryLines}
              onClear={clearTableView}
            />
            <DataTableShell hasActiveView={hasTableActiveView}>
              <div className="rounded-xl border border-border overflow-x-auto bg-card/10">
                <Table>
                  <TableHeader>
                    <TableRow
                      className={cn(
                        cardClassName,
                        dataTableHeaderRowClass,
                        hasTableActiveView && dataTableHeaderRowActiveRingClass
                      )}
                    >
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <SortButton
                            columnKey="email"
                            sort={tableSort}
                            toggleSort={toggleUserSort}
                            kind="string"
                            label="e-mail"
                          />
                          <ColumnFilter
                            columnId="u-email"
                            ariaLabel="Membro"
                            label={
                              <FilteredColumnTitle active={filters.email !== null}>
                                Membro
                              </FilteredColumnTitle>
                            }
                            options={options.email}
                            applied={filters.email}
                            onApply={setCol("email")}
                          />
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <SortButton
                            columnKey="role"
                            sort={tableSort}
                            toggleSort={toggleUserSort}
                            kind="string"
                            label="cargo"
                          />
                          <ColumnFilter
                            columnId="u-role"
                            ariaLabel="Cargo"
                            label={
                              <FilteredColumnTitle active={filters.role !== null}>
                                Cargo
                              </FilteredColumnTitle>
                            }
                            options={options.role}
                            applied={filters.role}
                            onApply={setCol("role")}
                          />
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <SortButton
                            columnKey="status"
                            sort={tableSort}
                            toggleSort={toggleUserSort}
                            kind="string"
                            label="status"
                          />
                          <ColumnFilter
                            columnId="u-status"
                            ariaLabel="Status"
                            label={
                              <FilteredColumnTitle active={filters.status !== null}>
                                Status
                              </FilteredColumnTitle>
                            }
                            options={options.status}
                            applied={filters.status}
                            onApply={setCol("status")}
                          />
                        </div>
                      </TableHead>
                      <TableHead className="text-center text-[15px] font-semibold text-muted-foreground">
                        WhatsApp
                      </TableHead>
                      <TableHead className="text-center text-[15px] font-semibold text-muted-foreground">
                        Discord
                      </TableHead>
                      {canManageUsers && (
                        <TableHead className="text-right w-[14px]"></TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTableRows.map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        disabled={pending}
                        onAction={runAction}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DataTableShell>
          </div>
      )}
      </>)}
    </div>
  );
});

UserClient.displayName = "UserClient";

export default UserClient;
