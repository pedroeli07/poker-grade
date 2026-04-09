import { requireSession } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { loadImportDetailPageData } from "@/hooks/imports/import-detail-page-load";
import { ImportDetailView } from "./import-id-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detalhes de uma Importação",
  description: "Visualize os detalhes de uma importação da Lobbyze.",
};

export default async function ImportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const sp = await searchParams;

  const data = await loadImportDetailPageData(session, id, sp.tab);
  if (!data) notFound();

  return <ImportDetailView {...data} />;
}
