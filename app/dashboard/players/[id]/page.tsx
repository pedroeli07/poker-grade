import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { Metadata } from "next";
import { loadPlayerProfilePageData } from "@/hooks/players/player-profile-page-load";
import { PlayersIdClient } from "./players-id-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detalhes de um Jogador",
  description: "Visualize os detalhes de um jogador e suas grades, targets e histórico de limites.",
};

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const result = await loadPlayerProfilePageData(session, id);
  if (result.status === "not_found") notFound();
  if (result.status === "forbidden") redirect("/dashboard/players");

  return <PlayersIdClient {...result.data} />;
}
