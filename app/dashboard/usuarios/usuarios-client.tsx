"use client";

import { useMemo, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import type { UsuarioDirectoryRow, UsuariosColumnKey } from "@/lib/types";
import { useUsuariosStore } from "@/lib/stores/use-usuarios-store";
import {
  Search,
  UserPlus,
  Users,
  Shield,
  Clock,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Crown,
  Sparkles,
  UserCheck,
  LayoutGrid,
  Table2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cardClassName } from "@/lib/constants";
import { cn, distinctOptions } from "@/lib/utils";
import { UsuariosInviteModal } from "./invite-modal";
import {
  deleteAuthAccount,
  deletePendingInvite,
  updateAuthAccount,
  updatePendingInvite,
} from "./actions";
import { toast } from "@/lib/toast";
import { isSuperAdminEmail } from "@/lib/auth/bootstrap";
import { ColumnFilter } from "@/components/column-filter";
import { ROLE_OPTIONS } from "@/lib/constants";
import { RoleVisual } from "@/lib/types";

const ROLE_VISUAL: Record<UserRole, RoleVisual> = {
  [UserRole.ADMIN]: {
    label: "Admin",
    icon: <Crown className="h-3.5 w-3.5" />,
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/25",
  },
  [UserRole.MANAGER]: {
    label: "Manager",
    icon: <Shield className="h-3.5 w-3.5" />,
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/25",
  },
  [UserRole.COACH]: {
    label: "Coach",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/25",
  },
  [UserRole.PLAYER]: {
    label: "Player",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/25",
  },
  [UserRole.VIEWER]: {
    label: "Viewer",
    icon: <Users className="h-3.5 w-3.5" />,
    text: "text-muted-foreground",
    bg: "bg-muted/80 border-border",
  },
};

function UsuarioDeleteDialog({
  open,
  onOpenChange,
  row,
  disabled,
  onAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: UsuarioDirectoryRow;
  disabled: boolean;
  onAction: (
    fn: () => Promise<{ error?: string; success?: boolean }>,
    onSuccess?: () => void
  ) => void;
}) {
  const isPendingInvite = row.kind === "pending";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && disabled) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className="sm:max-w-[440px] border-border/80 bg-card/95 p-0 gap-0 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-b from-destructive/8 to-transparent px-6 pt-6 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
        </div>
        <AlertDialogHeader className="space-y-2 px-6 text-left">
          <AlertDialogTitle className="text-xl font-semibold tracking-tight">
            {isPendingInvite ? "Cancelar convite?" : "Excluir conta?"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                <span className="font-mono text-sm text-foreground">
                  {row.email}
                </span>
              </p>
              <p>
                {isPendingInvite
                  ? "Este e-mail sai da lista de convites. Quem ainda não se cadastrou precisará de um novo convite."
                  : "A conta de acesso será removida deste sistema. Dados vinculados ao usuário podem ser afetados conforme as regras do app."}{" "}
                <span className="font-medium text-foreground">
                  Esta ação não pode ser desfeita.
                </span>
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t border-border/60 bg-muted/30 px-6 py-4 sm:justify-end gap-2">
          <AlertDialogCancel
            type="button"
            disabled={disabled}
            className="mt-0 border-border/80"
          >
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              const fd = new FormData();
              fd.set("id", row.id);
              onAction(async () =>
                isPendingInvite
                  ? deletePendingInvite(fd)
                  : deleteAuthAccount(fd)
              );
              onOpenChange(false);
            }}
            className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40"
          >
            {disabled ? "Removendo…" : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getInitials(email: string) {
  const local = email.split("@")[0] ?? "";
  const clean = local.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length >= 2) return clean.slice(0, 2).toUpperCase();
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase() || "?";
}

function RoleBadge({ role }: { role: UserRole }) {
  const v = ROLE_VISUAL[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        v.bg,
        v.text
      )}
    >
      {v.icon}
      {v.label}
    </span>
  );
}

function StatusBadge({ registered }: { registered: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          registered ? "bg-emerald-500" : "bg-amber-500"
        )}
      />
      <span className={registered ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/25" : "text-amber-600 bg-amber-500/10 border-amber-500/25"}>
        {registered ? "Ativo" : "Pendente"}
      </span>
    </span>
  );
}

type Props = {
  initialRows: UsuarioDirectoryRow[];
  canManageUsers: boolean;
};

export function UsuariosClient({ initialRows, canManageUsers }: Props) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { filters, setColumnFilter, clearFilters, hasAnyFilter: anyFilter } =
    useUsuariosStore();
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [pending, startTransition] = useTransition();

  const options = useMemo(
    () => ({
      email: distinctOptions(initialRows, (r: UsuarioDirectoryRow) => ({
        value: r.email,
        label: r.email,
      })),
      role: distinctOptions(initialRows, (r: UsuarioDirectoryRow) => ({
        value: r.role,
        label: ROLE_VISUAL[r.role as UserRole].label,
      })),
      status: distinctOptions(initialRows, (r: UsuarioDirectoryRow) => ({
        value: r.isRegistered ? "REGISTERED" : "PENDING",
        label: r.isRegistered ? "Ativo" : "Pendente",
      })),
    }),
    [initialRows]
  );

  const filtered = useMemo(() => {
    return initialRows.filter((u: UsuarioDirectoryRow) => {
      if (
        searchQuery &&
        !u.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
        return false;

      if (filters.email && !filters.email.has(u.email)) return false;
      if (filters.role && !filters.role.has(u.role)) return false;

      const statusVal = u.isRegistered ? "REGISTERED" : "PENDING";
      if (filters.status && !filters.status.has(statusVal)) return false;

      return true;
    });
  }, [initialRows, searchQuery, filters]);

  const setCol = useCallback(
    (col: UsuariosColumnKey) => (next: Set<string> | null) => {
      setColumnFilter(col, next);
    },
    [setColumnFilter]
  );

  const stats = useMemo(() => {
    const registeredCount = initialRows.filter((u) => u.isRegistered).length;
    return {
      total: initialRows.length,
      registeredCount,
      pendingCount: initialRows.length - registeredCount,
    };
  }, [initialRows]);

  const runAction = useCallback(
    (
      fn: () => Promise<{ error?: string; success?: boolean }>,
      onSuccess?: () => void
    ) => {
      startTransition(async () => {
        const res = await fn();
        if (res.error) toast.error(res.error);
        else {
          toast.success("Atualizado.");
          onSuccess?.();
        }
        router.refresh();
      });
    },
    [router]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {canManageUsers ? (
        <UsuariosInviteModal open={inviteOpen} onOpenChange={setInviteOpen} />
      ) : null}

      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-primary">
            <Users className="h-7 w-7 text-primary" />
            Usuários
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Contas ativas e convites pendentes. Apenas o e-mail administrador
            principal registra sem convite; os demais precisam estar na lista.
            {!canManageUsers ? (
              <span className="mt-2 block text-xs">
                Sua função tem acesso somente leitura. Convites e edições ficam
                com admin e manager.
              </span>
            ) : null}
          </p>
        </div>
        {canManageUsers ? (
          <Button
            type="button"
            className="glow-primary shrink-0"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Novo convite
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total na lista" value={stats.total} icon={Users} />
        <StatCard label="Contas ativas" value={stats.registeredCount} icon={UserCheck} />
        <StatCard label="Convites pendentes" value={stats.pendingCount} icon={Clock} />
      </div>

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
        <div className="flex flex-wrap items-center gap-2">
          {viewMode === "table" && (
            <span className="text-xs text-muted-foreground mr-2">
              Mostrando <span className="font-semibold text-foreground">{filtered.length}</span> de <span className="font-semibold text-foreground">{initialRows.length}</span>
            </span>
          )}
        <div
          className="inline-flex shrink-0 rounded-lg border border-border p-0.5 bg-muted/30"
          role="group"
          aria-label="Modo de visualização"
        >
          <Button
            type="button"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "gap-2 h-8 text-xs",
              viewMode === "grid" && "bg-primary/[0.12] text-primary shadow-none"
            )}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Cards
          </Button>
          <Button
            type="button"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "gap-2 h-8 text-xs",
              viewMode === "table" && "bg-primary/[0.12] text-primary shadow-none"
            )}
            onClick={() => setViewMode("table")}
          >
            <Table2 className="h-3.5 w-3.5" />
            Tabela
          </Button>
        </div>
        </div>
      </div>

      {viewMode === "grid" && anyFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            Filtros de coluna ativos ({filtered.length} de {initialRows.length} usuários). Ajuste na visão <strong className="text-foreground">Tabela</strong>.
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs shrink-0"
            onClick={clearFilters}
          >
            Limpar filtros
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          hasFilters={Boolean(searchQuery || anyFilter)}
          canManageUsers={canManageUsers}
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((row) => (
            <UserCard
              key={`${row.kind}-${row.id}-${row.email}-${row.role}-${row.isRegistered}`}
              row={row}
              disabled={pending}
              canManage={canManageUsers}
              onAction={(fn, ok) => runAction(fn, ok)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {anyFilter && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={clearFilters}
              >
                Limpar todos os filtros de coluna
              </Button>
            </div>
          )}
        <div className="rounded-xl border border-border overflow-x-auto bg-[oklch(1_0_0/80%)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500/10 hover:bg-transparent">
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
                {canManageUsers ? (
                  <TableHead className="text-right w-[140px]">Ações</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <UserTableRow
                  key={`${row.kind}-${row.id}-${row.email}-${row.role}-${row.isRegistered}`}
                  row={row}
                  disabled={pending}
                  canManage={canManageUsers}
                  onAction={(fn, ok) => runAction(fn, ok)}
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

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className={`rounded-xl border border-border bg-card/60 p-4 ${cardClassName}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  canManageUsers,
}: {
  hasFilters: boolean;
  canManageUsers: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
      <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="font-medium text-muted-foreground">Nenhum registro encontrado</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "Ajuste os filtros ou a busca."
          : canManageUsers
            ? "Adicione um convite para autorizar um novo cadastro."
            : "Não há usuários ou convites listados no momento."}
      </p>
    </div>
  );
}

function UserCard({
  row,
  disabled,
  canManage,
  onAction,
}: {
  row: UsuarioDirectoryRow;
  disabled: boolean;
  canManage: boolean;
  onAction: (
    fn: () => Promise<{ error?: string; success?: boolean }>,
    onSuccess?: () => void
  ) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [email, setEmail] = useState(row.email);
  const [role, setRole] = useState<UserRole>(row.role);

  const save = () => {
    const fd = new FormData();
    fd.set("id", row.id);
    fd.set("email", email.trim());
    fd.set("role", role);
    onAction(
      async () =>
        row.kind === "pending"
          ? updatePendingInvite(fd)
          : updateAuthAccount(fd),
      () => setEditing(false)
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card/40 p-4 transition-colors hover:bg-card/60">
      <UsuarioDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        row={row}
        disabled={disabled}
        onAction={onAction}
      />
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold">
          {getInitials(row.email)}
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 bg-background text-sm"
                disabled={row.kind === "account" && isSuperAdminEmail(row.email)}
              />
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
                disabled={
                  row.kind === "account" && isSuperAdminEmail(row.email)
                }
              >
                <SelectTrigger className="h-8 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={save} disabled={disabled}>
                  <Check className="h-3.5 w-3.5" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setEmail(row.email);
                    setRole(row.role);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="truncate font-mono text-sm" title={row.email}>
                {row.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <RoleBadge role={row.role} />
                <StatusBadge registered={row.isRegistered} />
              </div>
            </>
          )}
        </div>
        {!editing && canManage && (
          <div className="flex shrink-0 flex-col gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setEditing(true)}
              disabled={disabled}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function UserTableRow({
  row,
  disabled,
  canManage,
  onAction,
}: {
  row: UsuarioDirectoryRow;
  disabled: boolean;
  canManage: boolean;
  onAction: (
    fn: () => Promise<{ error?: string; success?: boolean }>,
    onSuccess?: () => void
  ) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [email, setEmail] = useState(row.email);
  const [role, setRole] = useState<UserRole>(row.role);

  const isBootstrap = row.kind === "account" && isSuperAdminEmail(row.email);

  const save = () => {
    const fd = new FormData();
    fd.set("id", row.id);
    fd.set("email", email.trim());
    fd.set("role", role);
    onAction(
      async () =>
        row.kind === "pending"
          ? updatePendingInvite(fd)
          : updateAuthAccount(fd),
      () => setEditing(false)
    );
  };

  return (
    <TableRow className="group hover:bg-sidebar-accent/50">
      <UsuarioDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        row={row}
        disabled={disabled}
        onAction={onAction}
      />
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold">
            {getInitials(row.email)}
          </div>
          {editing ? (
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 bg-background font-mono text-sm max-w-[280px]"
              disabled={isBootstrap}
            />
          ) : (
            <span className="truncate font-mono text-sm" title={row.email}>
              {row.email}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {editing ? (
          <Select
            value={role}
            onValueChange={(v) => setRole(v as UserRole)}
            disabled={isBootstrap}
          >
            <SelectTrigger className="h-8 bg-background text-sm w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <RoleBadge role={row.role} />
        )}
      </TableCell>
      <TableCell>
        <StatusBadge registered={row.isRegistered} />
      </TableCell>
      {canManage ? (
        <TableCell className="text-right">
          <div className="inline-flex items-center justify-end gap-1">
            {editing ? (
              <>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={save} disabled={disabled}>
                  {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => {
                    setEditing(false);
                    setEmail(row.email);
                    setRole(row.role);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setEditing(true)}
                  disabled={disabled}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => setDeleteOpen(true)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
