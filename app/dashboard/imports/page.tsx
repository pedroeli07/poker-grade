import dynamicImport from "next/dynamic";
import { requireSession } from "@/lib/auth/session";
import { loadImportsListPageProps } from "@/hooks/imports/imports-page-load";
import { importsPageMetadata } from "@/lib/constants/metadata";
import ImportsPageHeader from "@/components/imports/imports-page-header";

export const dynamic = "force-dynamic";

export const metadata = importsPageMetadata;

const ImportsClient = dynamicImport(() => import("./imports-client"), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-full rounded-md bg-muted" />
      <div className="h-72 rounded-lg bg-muted" />
    </div>
  ),
});

export default async function ImportsPage() {
  const session = await requireSession();
  const { imports, canDelete, canImport } = await loadImportsListPageProps(session);

  return (
    <div className="space-y-6">
      <ImportsPageHeader canImport={canImport} />
      <ImportsClient imports={imports} canDelete={canDelete} />
    </div>
  );
}
