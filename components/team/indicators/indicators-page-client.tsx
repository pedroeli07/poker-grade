"use client";

import { memo } from "react";
import Link from "next/link";
import { Calendar, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDICATORS_FILTER_SELECTS, INDICATORS_TABS } from "@/lib/constants/team/indicators";
import {
  IndicatorVisaoGeralPanel,
  IndicatorPerformancePanel,
  IndicatorRiscoPanel,
  IndicatorExecutionRitualsPanel,
  IndicatorQualidadePanel,
  IndicatorCatalogoPanel,
} from "./indicators-tab-panels";

const PANELS: Record<string, React.FC> = {
  "visao-geral": IndicatorVisaoGeralPanel,
  performance: IndicatorPerformancePanel,
  risco: IndicatorRiscoPanel,
  execucao: IndicatorExecutionRitualsPanel,
  qualidade: IndicatorQualidadePanel,
  catalogo: IndicatorCatalogoPanel,
};

const IndicatorsPageClient = memo(function IndicatorsPageClient() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Indicadores & analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhamento de KPIs de resultado e de processo</p>
        </div>
        <Button type="button" asChild className="gap-2">
          <Link href="/admin/time/rituais">
            <Calendar className="h-4 w-4" /> Abrir WBR desta semana
          </Link>
        </Button>
      </div>

      <div className="flex w-full flex-wrap items-center gap-1 rounded-xl border bg-card p-1.5 shadow-sm">
        <div className="flex items-center gap-2 border-r border-border px-3 py-1.5 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4 text-primary" />
          <span>Filtros</span>
        </div>
        {INDICATORS_FILTER_SELECTS.map(
          ({ defaultValue, width, placeholder, options }, idx, arr) => (
            <div key={defaultValue} className="flex items-center gap-1">
              <Select defaultValue={defaultValue}>
                <SelectTrigger
                  className={`${width} h-9 border-0 bg-transparent font-medium shadow-none hover:bg-muted/50 focus:ring-0`}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {idx < arr.length - 1 && <div className="hidden h-5 w-px bg-border sm:block" />}
            </div>
          ),
        )}
      </div>

      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-0 rounded-lg border bg-card p-1 md:w-fit">
          {INDICATORS_TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-2 rounded-md px-4 py-2 text-xs font-semibold data-[state=active]:bg-muted"
            >
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {INDICATORS_TABS.map(({ value }) => {
          const C = PANELS[value];
          if (!C) return null;
          return (
            <TabsContent key={value} value={value}>
              <C />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
});

IndicatorsPageClient.displayName = "IndicatorsPageClient";

export default IndicatorsPageClient;
