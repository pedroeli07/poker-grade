import { Users } from "lucide-react";
import { cardClassName } from "@/lib/constants";
import React from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card/60 p-4 ${cardClassName}`}
    >
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

export function EmptyState({
  hasFilters,
  canManageUsers,
}: {
  hasFilters: boolean;
  canManageUsers: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
      <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="font-medium text-muted-foreground">
        Nenhum registro encontrado
      </p>
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
