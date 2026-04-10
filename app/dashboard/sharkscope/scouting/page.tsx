import dynamicImport from "next/dynamic";
import { sharkscopeScoutingPageMetadata } from "@/lib/constants/sharkscope-scouting-page";
import { getScoutingPageProps } from "@/lib/sharkscope/scouting-page-server";
import { ScoutingPageSkeleton } from "@/components/sharkscope/scouting-page-skeleton";

export const dynamic = "force-dynamic";

export const metadata = sharkscopeScoutingPageMetadata;

const ScoutingClient = dynamicImport(
  () => import("./scouting-client").then((m) => ({ default: m.ScoutingClient })),
  { loading: () => <ScoutingPageSkeleton /> }
);

export default async function ScoutingPage() {
  const props = await getScoutingPageProps();
  return <ScoutingClient {...props} />;
}
