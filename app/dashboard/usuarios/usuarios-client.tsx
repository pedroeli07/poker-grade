"use client";

import { useMemo, useState, useTransition, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import type { UsuarioDirectoryRow } from "@/lib/types/usuarios";
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
  List as ListIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UsuariosInviteModal } from "./invite-modal";
import {
  deleteAuthAccount,
  deletePendingInvite,
  updateAuthAccount,
  updatePendingInvite,
} from "./actions";
import { toast } from "@/lib/toast";
import { isSuperAdminEmail } from "@/lib/auth/bootstrap";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: UserRole.VIEWER, label: "Viewer" },
  { value: UserRole.PLAYER, label: "Player" },
  { value: UserRole.COACH, label: "Coach" },
  { value: UserRole.MANAGER, label: "Manager" },
  { value: UserRole.ADMIN, label: "Admin" },
];

type RoleVisual = { label: string; text: string; bg: string; icon: React.ReactNode };

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
      <span className={registered ? "text-emerald-600" : "text-amber-600"}>
        {registered ? "Ativo" : "Pendente"}
      </span>
    </span>
  );
}

type Props = { initialRows: UsuarioDirectoryRow[] };

export function UsuariosClient({ initialRows }: Props) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "REGISTERED" | "PENDING">(
    "ALL"
  );
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return initialRows.filter((u) => {
      if (
        searchQuery &&
        !u.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
        return false;
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter === "REGISTERED" && !u.isRegistered) return false;
      if (statusFilter === "PENDING" && u.isRegistered) return false;
      return true;
    });
  }, [initialRows, searchQuery, roleFilter, statusFilter]);

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
      <UsuariosInviteModal open={inviteOpen} onOpenChange={setInviteOpen} />

      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Users className="h-7 w-7 text-muted-foreground" />
            Usuários
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Contas ativas e convites pendentes. Apenas o e-mail administrador
            principal registra sem convite; os demais precisam estar na lista.
          </p>
        </div>
        <Button
          type="button"
          className="glow-primary shrink-0"
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          Novo convite
        </Button>
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
            placeholder="Buscar e-mail…"
            className="bg-background pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as UserRole | "ALL")}
          >
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os cargos</SelectItem>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as "ALL" | "REGISTERED" | "PENDING")
            }
          >
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="REGISTERED">Ativos</SelectItem>
              <SelectItem value="PENDING">Pendentes</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border border-border p-0.5">
            <Button
              type="button"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("table")}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState hasFilters={Boolean(searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL")} />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((row) => (
            <UserCard
              key={`${row.kind}-${row.id}`}
              row={row}
              disabled={pending}
              onAction={(fn, ok) => runAction(fn, ok)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <div className="min-w-[640px]">
          <div className="grid grid-cols-[1fr_120px_100px_100px] gap-2 border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
            <span>Membro</span>
            <span>Cargo</span>
            <span>Status</span>
            <span className="text-right">Ações</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((row) => (
              <UserTableRow
                key={`${row.kind}-${row.id}`}
                row={row}
                disabled={pending}
                onAction={(fn, ok) => runAction(fn, ok)}
              />
            ))}
          </div>
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
    <div className="rounded-xl border border-border bg-card/60 p-4">
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

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
      <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="font-medium text-muted-foreground">Nenhum registro encontrado</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "Ajuste os filtros ou a busca."
          : "Adicione um convite para autorizar um novo cadastro."}
      </p>
    </div>
  );
}

function UserCard({
  row,
  disabled,
  onAction,
}: {
  row: UsuarioDirectoryRow;
  disabled: boolean;
  onAction: (
    fn: () => Promise<{ error?: string; success?: boolean }>,
    onSuccess?: () => void
  ) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(row.email);
  const [role, setRole] = useState<UserRole>(row.role);

  useEffect(() => {
    setEmail(row.email);
    setRole(row.role);
  }, [row.email, row.role, row.id]);

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

  const remove = () => {
    if (!confirm("Remover este registro?")) return;
    const fd = new FormData();
    fd.set("id", row.id);
    onAction(async () =>
      row.kind === "pending"
        ? deletePendingInvite(fd)
        : deleteAuthAccount(fd)
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card/40 p-4 transition-colors hover:bg-card/60">
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
        {!editing && (
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
              onClick={remove}
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
  onAction,
}: {
  row: UsuarioDirectoryRow;
  disabled: boolean;
  onAction: (
    fn: () => Promise<{ error?: string; success?: boolean }>,
    onSuccess?: () => void
  ) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(row.email);
  const [role, setRole] = useState<UserRole>(row.role);

  useEffect(() => {
    setEmail(row.email);
    setRole(row.role);
  }, [row.email, row.role, row.id]);

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

  const remove = () => {
    if (!confirm("Remover este registro?")) return;
    const fd = new FormData();
    fd.set("id", row.id);
    onAction(async () =>
      row.kind === "pending"
        ? deletePendingInvite(fd)
        : deleteAuthAccount(fd)
    );
  };

  return (
    <div className="grid grid-cols-[1fr_120px_100px_100px] items-center gap-2 px-4 py-3 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-semibold">
          {getInitials(row.email)}
        </div>
        {editing ? (
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-8 bg-background font-mono text-xs"
            disabled={isBootstrap}
          />
        ) : (
          <span className="truncate font-mono text-xs" title={row.email}>
            {row.email}
          </span>
        )}
      </div>
      <div>
        {editing ? (
          <Select
            value={role}
            onValueChange={(v) => setRole(v as UserRole)}
            disabled={isBootstrap}
          >
            <SelectTrigger className="h-8 bg-background text-xs">
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
      </div>
      <div>
        <StatusBadge registered={row.isRegistered} />
      </div>
      <div className="flex justify-end gap-1">
        {editing ? (
          <>
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={save} disabled={disabled}>
              {disabled ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() => {
                setEditing(false);
                setEmail(row.email);
                setRole(row.role);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
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
              className="h-8 w-8 text-destructive"
              onClick={remove}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
