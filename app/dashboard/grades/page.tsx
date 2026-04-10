import dynamicImport from "next/dynamic";
import { gradesPageMetadata } from "@/lib/constants/grades-page";
import { GradesPageSkeleton } from "@/components/grades/grades-page-skeleton";
import { getGradesPageProps } from "@/lib/grades/grades-page-server";

export const dynamic = "force-dynamic";

export const metadata = gradesPageMetadata;

const GradesPageClient = dynamicImport(() => import("./grades-page-client"), {
  loading: () => <GradesPageSkeleton />,
});

export default async function GradesPage() {
  const props = await getGradesPageProps();
  return <GradesPageClient {...props} />;
}
