"use client";

import { AlertCircle, CheckCircle2, Zap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { VALUE_ENTRY_COLOR_CLASSES, VALUE_ENTRY_ICONS } from "@/lib/constants/team/identity";
import type { TeamCultureValue } from "@/lib/types/team/identity";

type Props = {
  valores: TeamCultureValue[];
};

export function ValoresComportamentosSection({ valores }: Props) {
  if (valores.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center text-muted-foreground">
        Nenhum comportamento definido.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-muted-foreground">Valores → Comportamentos</h3>
        <span className="text-xs text-muted-foreground">
          Como cada valor se manifesta na prática
        </span>
      </div>
      <Accordion type="single" collapsible className="space-y-2">
        {valores.map((valor, idx) => {
          const Icon = VALUE_ENTRY_ICONS[idx % VALUE_ENTRY_ICONS.length]!;
          const color = VALUE_ENTRY_COLOR_CLASSES[idx % VALUE_ENTRY_COLOR_CLASSES.length]!;
          return (
            <AccordionItem
              key={`comportamento-${idx}-${valor.title}`}
              value={`valor-${idx}`}
              className="rounded-lg border bg-white px-4 transition-all hover:bg-gray-50 data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="cursor-pointer py-4 hover:no-underline">
                <div className="flex w-full items-center gap-4 text-left">
                  <div className={`shrink-0 rounded-lg p-2 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold">{valor.title}</h4>
                    <p className="truncate text-sm text-muted-foreground">{valor.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-5 pt-0">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        REGRA
                      </div>
                      <p className="text-xs text-emerald-700/90">Cumprimento obrigatório</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> O que fazemos
                    </div>
                    <ul className="space-y-1.5">
                      {(valor.whatWeDo || "")
                        .split("\n")
                        .filter(Boolean)
                        .map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm leading-snug text-emerald-900/80"
                          >
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 opacity-50" />
                            {item}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="space-y-2 rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                        RECOMENDAÇÃO
                      </div>
                      <p className="text-xs text-rose-700/90">Fortemente sugerido</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-rose-700">
                      <AlertCircle className="h-4 w-4" /> O que NÃO fazemos
                    </div>
                    <ul className="space-y-1.5">
                      {(valor.whatWeDont || "")
                        .split("\n")
                        .filter(Boolean)
                        .map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm leading-snug text-rose-900/80"
                          >
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600 opacity-50" />
                            {item}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {valor.metrics && valor.metrics.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Zap className="h-4 w-4 text-muted-foreground" /> Métricas que comprovam execução
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {valor.metrics.map((m, mIdx) => (
                        <Card key={mIdx} className="bg-gray-100">
                          <CardContent className="space-y-2 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-bold leading-tight">{m.title}</div>
                              <div className="whitespace-nowrap rounded border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {m.source}
                              </div>
                            </div>
                            <div className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                              {m.description}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
