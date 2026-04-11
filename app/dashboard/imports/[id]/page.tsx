import { notFound } from "next/navigation";
import { importDetailPageMetadata } from "@/lib/constants/metadata";
import { getImportDetailPageProps } from "@/lib/imports/import-detail-page-server";
import ImportsIdClient from "./imports-id-client";

export const dynamic = "force-dynamic";

export const metadata = importDetailPageMetadata;

export default async function ImportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const data = await getImportDetailPageProps(id, sp.tab);
  if (!data) notFound();

  return <ImportsIdClient {...data} />;
}
