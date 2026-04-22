"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart, PieChart } from "lucide-react";

function IndicatorPanelShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function IndicatorVisaoGeralPanel() {
  return (
    <IndicatorPanelShell
      title="Visão geral"
      description="KPIs agregados de resultado e processo; integração com dados revirá em iteração futura."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {["Volume", "ROI time", "Adesão rituais"].map((k) => (
          <div
            key={k}
            className="flex flex-col items-center justify-center rounded-xl border bg-muted/20 py-6"
          >
            <PieChart className="mb-2 h-8 w-8 text-primary/60" />
            <div className="text-xs font-medium text-muted-foreground">{k}</div>
            <div className="text-xl font-bold text-muted-foreground">—</div>
          </div>
        ))}
      </div>
    </IndicatorPanelShell>
  );
}

export function IndicatorPerformancePanel() {
  return (
    <IndicatorPanelShell
      title="Performance"
      description="Curvas de ABI, lucro e tendência; placeholders até conectar fontes (SharkScope, reportes)."
    >
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/20">
        <LineChart className="h-10 w-10 text-muted-foreground/50" />
      </div>
    </IndicatorPanelShell>
  );
}

export function IndicatorRiscoPanel() {
  return (
    <IndicatorPanelShell
      title="Risco & variância"
      description="Makeup, downswings e exposição; métricas serão alimentadas pelo módulo financeiro."
    >
      <p className="text-sm text-muted-foreground">
        Nenhum dado de risco agregado ainda. Use os filtros acima quando as séries estiverem disponíveis.
      </p>
    </IndicatorPanelShell>
  );
}

export function IndicatorExecutionRitualsPanel() {
  return (
    <IndicatorPanelShell
      title="Execução & rituais"
      description="Cruzamento de rituais, tarefas e cumprimento; veja também a aba Execução e Rituais."
    >
      <p className="text-sm text-muted-foreground">
        Acompanhe WBR, 1:1 e demais rituais em <strong>Time → Rituais</strong>.
      </p>
    </IndicatorPanelShell>
  );
}

export function IndicatorQualidadePanel() {
  return (
    <IndicatorPanelShell
      title="Qualidade técnica"
      description="Estudo, análise de mãos e evolução técnica do time."
    >
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
      </div>
    </IndicatorPanelShell>
  );
}

export function IndicatorCatalogoPanel() {
  return (
    <IndicatorPanelShell
      title="Catálogo (admin)"
      description="Definição de KPIs, fórmulas, responsáveis e ações automáticas."
    >
      <p className="text-sm text-muted-foreground">
        O catálogo completo de indicadores configuráveis será exposto aqui; por ora é uma área reservada.
      </p>
    </IndicatorPanelShell>
  );
}
