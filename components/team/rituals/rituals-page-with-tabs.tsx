"use client";

import { Suspense, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TeamBlueTabBar from "@/components/team/team-blue-tab-bar";
import {
  RITUALS_PAGE_TABS,
  parseRitualsPageTabParam,
  type RitualsPageTab,
} from "@/lib/constants/team/rituals-page-ui";
import type { RitualsPageData } from "@/lib/data/team/rituals-page";
import { RitualsPageContent } from "./rituals-page-client";

const TAB_PARAM = "tab" as const;

function RitualsTabsFallback() {
  return (
    <div className="space-y-4">
      <div className="h-11 w-full max-w-2xl animate-pulse rounded-lg bg-muted/40" />
      <div className="min-h-[200px] rounded-xl border border-dashed border-border/60 bg-muted/20" />
    </div>
  );
}

function RitualsPageWithTabsInner(props: RitualsPageData) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo(
    () => parseRitualsPageTabParam(searchParams.get(TAB_PARAM)),
    [searchParams],
  );

  const setActiveTab = useCallback(
    (tab: RitualsPageTab) => {
      const next = new URLSearchParams(searchParams.toString());
      if (tab === "lista") {
        next.delete(TAB_PARAM);
      } else {
        next.set(TAB_PARAM, tab);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <RitualsPageContent {...props} activeTab={activeTab} onTabChange={setActiveTab} />
  );
}

export default function RitualsPageWithTabs(props: RitualsPageData) {
  return (
    <Suspense fallback={<RitualsTabsFallback />}>
      <RitualsPageWithTabsInner {...props} />
    </Suspense>
  );
}
