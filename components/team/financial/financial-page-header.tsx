"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memo } from "react";

export const FinancialPageHeader = memo(function FinancialPageHeader() {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Financeiro</h2>
        <p className="mt-1 text-muted-foreground">Gestão de caixa, repasses, makeup e custos operacionais</p>
      </div>
      <Button type="button" className="gap-2">
        <Download className="h-4 w-4" /> Exportar relatório
      </Button>
    </div>
  );
});

FinancialPageHeader.displayName = "FinancialPageHeader";
