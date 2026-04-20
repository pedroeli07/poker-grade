import dynamicImport from "next/dynamic";
import TargetsPageSkeleton from "@/components/targets/targets-page-skeleton";
import { getTargetsPageProps } from "@/lib/data/targets";
import { targetsPageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";

export const metadata = targetsPageMetadata;

const TargetsPageClient = dynamicImport(
  () => import("@/app/admin/grades/metas/targets-page-client"),
  { loading: () => <TargetsPageSkeleton /> }
);

export default async function PlayerTargetsPage() {
  const props = await getTargetsPageProps();
  return <TargetsPageClient {...props} />;
}
