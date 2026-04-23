"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { memo } from "react";
import type { ExecutionPageHeaderProps } from "@/lib/types/team/execution";

export const ExecutionPageHeader = memo(function ExecutionPageHeader({
  search,
  onSearchChange,
  onNew,
  canCreate,
}: ExecutionPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Execução</h2>
        <p className="mt-1 max-w-xl text-muted-foreground">
          Planos de ação, responsáveis e prazos — alinhado a decisões e rituais do time.
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-2 sm:max-w-md sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button type="button" className="shrink-0 gap-1" onClick={onNew} disabled={!canCreate}>
          <Plus className="h-4 w-4" /> Nova tarefa
        </Button>
      </div>
    </div>
  );
});

ExecutionPageHeader.displayName = "ExecutionPageHeader";
