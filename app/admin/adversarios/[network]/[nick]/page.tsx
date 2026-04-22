import OpponentDetailClient from "@/components/opponents/opponent-detail-client";
import { getOpponentDetailPageProps } from "@/lib/data/opponents";

export const dynamic = "force-dynamic";

export default async function AdminOpponentDetailPage({
  params,
}: {
  params: Promise<{ network: string; nick: string }>;
}) {
  const { network, nick } = await params;
  const props = await getOpponentDetailPageProps(decodeURIComponent(network), decodeURIComponent(nick));
  return <OpponentDetailClient {...props} basePath="/admin/adversarios" />;
}
