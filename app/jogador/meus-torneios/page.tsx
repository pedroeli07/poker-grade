import { requireSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { loadPlayerTournamentHistory } from "@/lib/data/minha-grade-tourneys";
import PlayerTourneysClient from "./player-tourneys-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meus Torneios",
  description: "Histórico de torneios importados.",
};

export default async function MinhaGradeTorneiosPage() {
  const session = await requireSession();

  if (session.role !== (UserRole.PLAYER as UserRole)) {
    redirect("/admin/dashboard");
  }
  if (!session.playerId) {
    redirect("/jogador/minha-grade");
  }

  const rows = await loadPlayerTournamentHistory(session.playerId);

  return (
    <div className="space-y-6 max-w-[95%] w-full mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Meus Torneios</h2>
        <p className="text-muted-foreground mt-1">
          Histórico dos torneios importados. &quot;Extra play&quot; indica torneios jogados fora da sua grade atual.
        </p>
      </div>
      <PlayerTourneysClient rows={rows} />
    </div>
  );
}
