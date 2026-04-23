"use client";

import { memo } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TeamIndicatorDTO } from "@/lib/data/team/indicators-page";
import type { StaffSelectOption } from "@/lib/utils/team/staff-select-options-merge";
import {
  IndicatorPerformancePanel,
  IndicatorRiscoPanel,
  IndicatorExecutionRitualsPanel,
  IndicatorQualidadePanel,
} from "./indicators-tab-panels";
import IndicatorsPageWithTabs from "./indicators-page-with-tabs";
import { IndicatorsCatalogSection } from "./indicators-catalog-section";
import { IndicatorVisaoGeralPanel } from "./indicator-visao-geral-panel";

const IndicatorsPageClient = memo(function IndicatorsPageClient({
  indicators,
  staffOptions,
}: {
  indicators: TeamIndicatorDTO[];
  staffOptions: StaffSelectOption[];
}) {
  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Indicadores & Análises</h2>
          <p className="mt-1 text-muted-foreground">Acompanhamento de KPIs de resultado e de processo</p>
        </div>
        <Button type="button" asChild className="gap-2">
          <Link href="/admin/time/rituais">
            <Calendar className="h-4 w-4" /> Abrir WBR desta semana
          </Link>
        </Button>
      </div>

      <IndicatorsPageWithTabs
        visaoGeral={<IndicatorVisaoGeralPanel indicators={indicators} />}
        performance={<IndicatorPerformancePanel />}
        risco={<IndicatorRiscoPanel />}
        execucao={<IndicatorExecutionRitualsPanel />}
        qualidade={<IndicatorQualidadePanel />}
        catalogo={<IndicatorsCatalogSection indicators={indicators} staffOptions={staffOptions} />}
      />
    </div>
  );
});

IndicatorsPageClient.displayName = "IndicatorsPageClient";

export default IndicatorsPageClient;
