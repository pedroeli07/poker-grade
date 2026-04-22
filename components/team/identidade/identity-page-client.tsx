"use client";

import { memo } from "react";
import type { IdentityPageData } from "@/lib/data/team/identity-page";
import IdentityPageWithTabs from "./identity-page-with-tabs";
import EditIdentityModal from "./edit-identity-modal";
import { IdentityValuePreviewCards } from "./identity-value-preview-cards";
import { IdentityCentralSection } from "./identity-central-section";
import { ValoresComportamentosSection } from "./valores-comportamentos-section";
import EditRuleModal from "./edit-rule-modal";
import RuleCard from "./rule-card";
import CulturaEmAcaoTab from "./cultura-em-acao-tab";
import OnboardingWizard from "./onboarding-wizard";

const IdentityPageClient = memo(function IdentityPageClient({
  cultura,
  valores,
  mandatoryRules,
  recommendationRules,
  culturaEmAcao,
}: IdentityPageData) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Identidade & Regras</h2>
          <p className="mt-1 text-muted-foreground">
            Cultura operacional do time — auditável, mensurável e integrada aos rituais.
          </p>
        </div>
      </div>

      <IdentityPageWithTabs
        identidade={
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border bg-card p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary" /> Identidade central
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden text-xs text-muted-foreground md:block">
                  Somente leitura • Alterações exigem decisão estratégica
                </span>
                <EditIdentityModal
                  initialData={cultura}
                  trigger={{ label: "Editar", className: "gap-1" }}
                />
              </div>
            </div>

            <IdentityCentralSection
              purpose={cultura?.purpose ?? ""}
              vision={cultura?.vision ?? ""}
              mission={cultura?.mission ?? ""}
            />

            <div className="border-t pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-muted-foreground">Nossos valores (como vivemos)</h3>
              </div>
              {valores.length > 0 ? (
                <IdentityValuePreviewCards valores={valores} />
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center text-muted-foreground">
                  Nenhum valor definido.
                </div>
              )}
            </div>
          </div>
        }
        valores={<ValoresComportamentosSection valores={valores} />}
        regras={
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-bold tracking-tight">Regras operacionais</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="hidden flex-col items-end gap-1.5 text-xs text-muted-foreground md:flex">
                  <span className="flex items-center gap-1.5">
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      REGRA
                    </span>{" "}
                    Cumprimento obrigatório
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      RECOMENDAÇÃO
                    </span>{" "}
                    Fortemente sugerido
                  </span>
                </div>
                <EditRuleModal trigger={{ label: "Nova regra", icon: "plus", className: "gap-1" }} />
              </div>
            </div>

            {[
              {
                label: "Regras obrigatórias",
                items: mandatoryRules,
                empty: "Nenhuma regra obrigatória definida.",
              },
              {
                label: "Recomendações",
                items: recommendationRules,
                empty: "Nenhuma recomendação definida.",
              },
            ].map(({ label, items, empty }) => (
              <div key={label} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {label}
                </h4>
                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((rule) => (
                      <RuleCard key={rule.id} rule={rule} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                    {empty}
                  </div>
                )}
              </div>
            ))}
          </div>
        }
        culturaAcao={<CulturaEmAcaoTab data={culturaEmAcao} />}
        onboarding={
          <OnboardingWizard
            valueCount={valores.length}
            mandatoryRuleCount={mandatoryRules.length}
            recommendationRuleCount={recommendationRules.length}
          />
        }
      />
    </div>
  );
});

IdentityPageClient.displayName = "IdentityPageClient";

export default IdentityPageClient;
