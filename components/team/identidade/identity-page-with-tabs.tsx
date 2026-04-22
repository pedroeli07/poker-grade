"use client";

import { Suspense, useCallback, useMemo, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import IdentityTabBar, { type IdentityPageTab } from "./identity-tab-bar";
import { IDENTITY_PAGE_TABS } from "@/lib/constants/team/identity";

const TAB_PARAM = "tab" as const;

const VALID_TAB = new Set<string>(IDENTITY_PAGE_TABS.map((t) => t.value));

function parseTabParam(raw: string | null): IdentityPageTab {
  if (raw && VALID_TAB.has(raw)) return raw as IdentityPageTab;
  return "identidade";
}

type Props = {
  identidade: ReactNode;
  valores: ReactNode;
  regras: ReactNode;
  culturaAcao: ReactNode;
  onboarding: ReactNode;
};

function IdentityTabsFallback() {
  return (
    <div className="space-y-4">
      <div className="h-11 w-full max-w-2xl animate-pulse rounded-lg bg-muted/40" />
      <div className="min-h-[200px] rounded-xl border border-dashed border-border/60 bg-muted/20" />
    </div>
  );
}

/**
 * Aba ativa em `?tab=` (identidade | valores | regras | cultura-acao | onboarding).
 * Igual a filtros em URL: F5, revalidação pós-mutation e navegação mantêm a aba.
 */
function IdentityPageWithTabsInner({ identidade, valores, regras, culturaAcao, onboarding }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo(
    () => parseTabParam(searchParams.get(TAB_PARAM)),
    [searchParams],
  );

  const setActiveTab = useCallback(
    (tab: IdentityPageTab) => {
      const next = new URLSearchParams(searchParams.toString());
      if (tab === "identidade") {
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
    activeTab === "identidade"
      ? identidade
      : activeTab === "valores"
        ? valores
        : activeTab === "regras"
          ? regras
          : activeTab === "cultura-acao"
            ? culturaAcao
            : onboarding;

  return (
    <div className="space-y-4">
      <IdentityTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-6">{panel}</div>
    </div>
  );
}

export default function IdentityPageWithTabs(props: Props) {
  return (
    <Suspense fallback={<IdentityTabsFallback />}>
      <IdentityPageWithTabsInner {...props} />
    </Suspense>
  );
}
