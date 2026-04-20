import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { loadPlayerProfilePageData } from "@/hooks/players/player-profile-page-load";
import PlayersIdClient from "./players-id-client";
import { playerProfilePageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";

export const metadata = playerProfilePageMetadata;

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const result = await loadPlayerProfilePageData(session, id);
  if (result.status === "not_found") notFound();
  if (result.status === "forbidden") redirect("/admin/jogadores");

  return <PlayersIdClient {...result.data} />;
}
