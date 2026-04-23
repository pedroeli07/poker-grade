"use client";

import { Suspense, useCallback, useMemo, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TeamBlueTabBar from "@/components/team/team-blue-tab-bar";
import { INDICATORS_TABS, type IndicatorsPageTab } from "@/lib/constants/team/indicators";

const TAB_PARAM = "tab" as const;

const VALID_TAB = new Set<string>(INDICATORS_TABS.map((t) => t.value));

function parseTabParam(raw: string | null): IndicatorsPageTab {
  if (raw && VALID_TAB.has(raw)) return raw as IndicatorsPageTab;
  return "visao-geral";
}

type Props = {
  visaoGeral: ReactNode;
  performance: ReactNode;
  risco: ReactNode;
  execucao: ReactNode;
  qualidade: ReactNode;
  catalogo: ReactNode;
};

function IndicatorsTabsFallback() {
  return (
    <div className="space-y-4">
      <div className="h-11 w-full max-w-3xl animate-pulse rounded-lg bg-muted/40" />
      <div className="min-h-[200px] rounded-xl border border-dashed border-border/60 bg-muted/20" />
    </div>
  );
}

function IndicatorsPageWithTabsInner({
  visaoGeral,
  performance,
  risco,
  execucao,
  qualidade,
  catalogo,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo(
    () => parseTabParam(searchParams.get(TAB_PARAM)),
    [searchParams],
  );

  const setActiveTab = useCallback(
    (tab: IndicatorsPageTab) => {
      const next = new URLSearchParams(searchParams.toString());
      if (tab === "visao-geral") {
        next.delete(TAB_PARAM);
      } else {
        next.set(TAB_PARAM, tab);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const panel =
    activeTab === "visao-geral"
      ? visaoGeral
      : activeTab === "performance"
        ? performance
        : activeTab === "risco"
          ? risco
          : activeTab === "execucao"
            ? execucao
            : activeTab === "qualidade"
              ? qualidade
              : catalogo;

  return (
    <div className="space-y-4">
      <TeamBlueTabBar
        tabs={INDICATORS_TABS}
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v as IndicatorsPageTab)}
      />
      <div className="mt-6">{panel}</div>
    </div>
  );
}

export default function IndicatorsPageWithTabs(props: Props) {
  return (
    <Suspense fallback={<IndicatorsTabsFallback />}>
      <IndicatorsPageWithTabsInner {...props} />
    </Suspense>
  );
}
