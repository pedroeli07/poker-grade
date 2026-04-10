import dynamicImport from "next/dynamic";
import { targetsPageMetadata } from "@/lib/constants/targets-page";
import { TargetsPageSkeleton } from "@/components/targets/targets-page-skeleton";
import { getTargetsPageProps } from "@/lib/targets/targets-page-server";

export const dynamic = "force-dynamic";

export const metadata = targetsPageMetadata;

const TargetsPageClient = dynamicImport(
  () => import("./targets-page-client"),
  { loading: () => <TargetsPageSkeleton /> }
);

export default async function TargetsPage() {
  const props = await getTargetsPageProps();
  return <TargetsPageClient {...props} />;
}
