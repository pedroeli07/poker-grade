"use client";

import { Suspense, useCallback, useMemo, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TeamBlueTabBar from "@/components/team/team-blue-tab-bar";
import { GOVERNANCE_TABS, type GovernancePageTab } from "@/lib/constants/team/governance-ui";

const TAB_PARAM = "tab" as const;

const VALID_TAB = new Set<string>(GOVERNANCE_TABS.map((t) => t.value));

function parseTabParam(raw: string | null): GovernancePageTab {
  if (raw && VALID_TAB.has(raw)) return raw as GovernancePageTab;
  return "matriz-dri";
}

type Props = {
  matrizDri: ReactNode;
  fluxo: ReactNode;
  historico: ReactNode;
  regrasAlerta: ReactNode;
};

function GovernanceTabsFallback() {
  return (
    <div className="space-y-4">
      <div className="h-11 w-full max-w-2xl animate-pulse rounded-lg bg-muted/40" />
      <div className="min-h-[200px] rounded-xl border border-dashed border-border/60 bg-muted/20" />
    </div>
  );
}

/** Aba ativa em `?tab=` (matriz-dri | fluxo | historico), igual à página Identidade. */
function GovernancePageWithTabsInner({ matrizDri, fluxo, historico, regrasAlerta }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo(
    () => parseTabParam(searchParams.get(TAB_PARAM)),
    [searchParams],
  );

  const setActiveTab = useCallback(
    (tab: GovernancePageTab) => {
      const next = new URLSearchParams(searchParams.toString());
      if (tab === "matriz-dri") {
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
    activeTab === "matriz-dri"
      ? matrizDri
      : activeTab === "fluxo"
        ? fluxo
        : activeTab === "historico"
          ? historico
          : regrasAlerta;

  return (
    <div className="space-y-4">
      <TeamBlueTabBar
        tabs={GOVERNANCE_TABS}
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v as GovernancePageTab)}
      />
      <div className="mt-6">{panel}</div>
    </div>
  );
}

export default function GovernancePageWithTabs(props: Props) {
  return (
    <Suspense fallback={<GovernanceTabsFallback />}>
      <GovernancePageWithTabsInner {...props} />
    </Suspense>
  );
}
