"use client";

import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GOVERNANCE_FLOW_CARDS } from "@/lib/constants/team/governance-ui";
import { cn } from "@/lib/utils/cn";

export function GovernanceFlowSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de decisão</CardTitle>
        <CardDescription>Quando escalar uma decisão para aprovação superior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col items-center justify-center gap-4 py-4 md:flex-row">
          {[
            { title: "Coach identifica", sub: "necessidade de mudança", ring: false },
            { title: "Avalia impacto", sub: "ABI, makeup, risco", ring: false },
            { title: "Decide ou escala", sub: "Conforme regras", ring: true },
          ].map(({ title, sub, ring }, i) => (
            <div key={title} className="flex items-center gap-4">
              {i > 0 && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
              <div
                className={cn(
                  "w-40 rounded-xl border p-4 text-center shadow-sm",
                  ring ? "border-primary/40 bg-primary/5 ring-2 ring-primary/30" : "bg-card",
                )}
              >
                <p className={cn("text-sm font-bold", ring && "text-primary")}>{title}</p>
                <p className="text-[12px] text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {GOVERNANCE_FLOW_CARDS.map(
            ({ bg, icon, iconBg, titleColor, title, items, itemColor }) => (
              <div key={title} className={cn("rounded-2xl border p-6", bg)}>
                <div className={cn("mb-4 flex items-center gap-2", titleColor)}>
                  <div
                    className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs", iconBg)}
                  >
                    {icon}
                  </div>
                  <h4 className="font-bold">{title}</h4>
                </div>
                <ul className={cn("space-y-2 text-sm", itemColor)}>
                  {items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
}
