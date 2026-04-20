import dynamicImport from "next/dynamic";
import { getScoutingPageProps } from "@/lib/data/sharkscope/scouting";
import ScoutingPageSkeleton from "@/components/sharkscope/scouting/scouting-page-skeleton";
import { sharkscopeScoutingPageMetadata } from "@/lib/constants/sharkscope/scouting";

export const dynamic = "force-dynamic";

export const metadata = sharkscopeScoutingPageMetadata;

const ScoutingClient = dynamicImport(() => import("./scouting-client"), {
  loading: () => <ScoutingPageSkeleton />,
});

export default async function ScoutingPage() {
  const props = await getScoutingPageProps();
  return <ScoutingClient {...props} />;
}
