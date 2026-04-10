"use client";

import { useMemo, useState, useCallback } from "react";
import { Search, UserPlus, Users, UserCheck, Clock, LayoutGrid, Table2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, distinctOptions } from "@/lib/utils";
import { UsuariosInviteModal } from "@/components/user/user-invite-modal";
import { ColumnFilter } from "@/components/column-filter";
import { useUsuariosStore } from "@/lib/stores/use-usuarios-store";
import { useUserActions } from "@/hooks/user/use-user-actions";
import { ROLE_VISUAL } from "@/components/user/user-badges";
import { StatCard, EmptyState } from "@/components/user/user-view-components";
import { UserCard } from "@/components/user/user-card";
import { UserTableRow } from "@/components/user/user-table-row";
import type { UsuarioDirectoryRow, UsuariosColumnKey } from "@/lib/types";
import { cardClassName } from "@/lib/constants";

export function UsuariosClient({
  initialRows,
  canManageUsers,
}: {
  initialRows: UsuarioDirectoryRow[];
  canManageUsers: boolean;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
    useUsuariosStore();
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const { runAction, pending } = useUserActions();

  // Opções de filtros de coluna
  const options = useMemo(
    () => ({
      email: distinctOptions(initialRows, (r) => ({
        value: r.email,
        label: r.email,
      })),
      role: distinctOptions(initialRows, (r) => ({
        value: r.role,
        label: ROLE_VISUAL[r.role].label,
      })),
      status: distinctOptions(initialRows, (r) => ({
        value: r.isRegistered ? "REGISTERED" : "PENDING",
        label: r.isRegistered ? "Ativo" : "Pendente",
      })),
    }),
    [initialRows]
  );

  // Lógica de filtragem centralizada
  const filtered = useMemo(() => {
    return initialRows.filter((u) => {
      const s = searchQuery.toLowerCase().trim();
      if (s && !u.email.toLowerCase().includes(s)) return false;

      if (filters.email && !filters.email.has(u.email)) return false;
      if (filters.role && !filters.role.has(u.role)) return false;

      const statusVal = u.isRegistered ? "REGISTERED" : "PENDING";
      if (filters.status && !filters.status.has(statusVal)) return false;

      return true;
    });
  }, [initialRows, searchQuery, filters]);

  // Estatísticas do topo
  const stats = useMemo(() => {
    const reg = initialRows.filter((u) => u.isRegistered).length;
    return {
      total: initialRows.length,
      reg,
      pend: initialRows.length - reg,
    };
  }, [initialRows]);

  const setCol = useCallback(
    (col: UsuariosColumnKey) => (next: Set<string> | null) =>
      setColumnFilter(col, next),
    [setColumnFilter]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <UsuariosInviteModal open={inviteOpen} onOpenChange={setInviteOpen} />

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
        <StatCard label="Total na lista" value={stats.total} icon={Users} />
        <StatCard label="Contas ativas" value={stats.reg} icon={UserCheck} />
        <StatCard label="Convites pendentes" value={stats.pend} icon={Clock} />
      </div>

      {/* Toolbar: Search & View Toggles */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por e-mail…"
            className="bg-background pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "table" && (
            <span className="text-xs text-muted-foreground mr-2">
              Mostrando <strong className="text-foreground">{filtered.length}</strong> de{" "}
              {initialRows.length}
            </span>
          )}
          <div className="inline-flex shrink-0 rounded-lg border border-border p-0.5 bg-muted/30">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className={cn("gap-2 h-8 text-xs", viewMode === "grid" && "bg-primary/12 text-primary")}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className={cn("gap-2 h-8 text-xs", viewMode === "table" && "bg-primary/12 text-primary")}
              onClick={() => setViewMode("table")}
            >
              <Table2 className="h-3.5 w-3.5" /> Tabela
            </Button>
          </div>
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
        <EmptyState
          hasFilters={Boolean(searchQuery || anyFilter)}
          canManageUsers={canManageUsers}
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((row) => (
            <UserCard
              key={row.id}
              row={row}
              disabled={pending}
              canManage={canManageUsers}
              onAction={runAction}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {anyFilter && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
                Limpar todos os filtros
              </Button>
            </div>
          )}
          <div className="rounded-xl border border-border overflow-x-auto bg-card/10">
            <Table>
              <TableHeader>
                <TableRow className={`${cardClassName} bg-blue-500/20 hover:bg-blue-500/20`}>
                  <TableHead>
                    <ColumnFilter
                      columnId="u-email"
                      label="Membro"
                      options={options.email}
                      applied={filters.email}
                      onApply={setCol("email")}
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnFilter
                      columnId="u-role"
                      label="Cargo"
                      options={options.role}
                      applied={filters.role}
                      onApply={setCol("role")}
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnFilter
                      columnId="u-status"
                      label="Status"
                      options={options.status}
                      applied={filters.status}
                      onApply={setCol("status")}
                    />
                  </TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground">WhatsApp</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground">Discord</TableHead>
                  {canManageUsers && <TableHead className="text-right w-[140px]">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <UserTableRow
                    key={row.id}
                    row={row}
                    disabled={pending}
                    canManage={canManageUsers}
                    onAction={runAction}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
