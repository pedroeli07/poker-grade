import { memo } from "react";
import { IDENTITY_PAGE_TABS } from "@/lib/constants/team/identity";
import TeamBlueTabBar from "@/components/team/team-blue-tab-bar";

/** Tab `value` strings for the identity page (kept in sync with `IDENTITY_PAGE_TABS`). */
export type IdentityPageTab = (typeof IDENTITY_PAGE_TABS)[number]["value"];

const IdentityTabBar = memo(function IdentityTabBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: IdentityPageTab;
  setActiveTab: (t: IdentityPageTab) => void;
}) {
  return (
    <TeamBlueTabBar
      tabs={IDENTITY_PAGE_TABS}
      activeTab={activeTab}
      onTabChange={(v) => setActiveTab(v as IdentityPageTab)}
    />
  );
});

IdentityTabBar.displayName = "IdentityTabBar";

export default IdentityTabBar;
