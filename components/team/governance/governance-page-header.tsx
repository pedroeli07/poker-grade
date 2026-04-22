"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export type GovernancePageHeaderProps = {
  onNewDecision: () => void;
};

export function GovernancePageHeader({ onNewDecision }: GovernancePageHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Governança</h2>
        <p className="mt-1 text-muted-foreground">
          Matriz DRI, fluxos de decisão, histórico de deliberações e regras de alerta
        </p>
      </div>
      <Button className="gap-2 rounded-xl shadow-sm" onClick={onNewDecision}>
        <Plus className="h-4 w-4" /> Nova decisão
      </Button>
    </div>
  );
}
