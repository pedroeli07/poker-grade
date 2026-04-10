import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { NewPlayerModal } from "@/components/new-player-modal";
import { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { loadPlayersListPageProps } from "../../../hooks/players/players-page-load";
import { SyncSharkScopeButton } from "@/components/sharkscope/sync-button";

const PlayersTableClient = dynamicImport(
  () =>
    import("./players-table-client").then((m) => ({
      default: m.PlayersTableClient,
    })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-full rounded-md bg-muted" />
        <div className="h-64 rounded-lg bg-muted" />
      </div>
    ),
  }
);

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Jogadores",
  description: "Gerencie o time de jogadores e aloque coaches responsáveis.",
};

export default async function PlayersPage() {
  const session = await requireSession();
  const { tablePayload, canEditPlayers, canCreatePlayer } =
    await loadPlayersListPageProps(session);

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Jogadores
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie o time de jogadores e aloque coaches responsáveis.
          </p>
        </div>
        {canCreatePlayer ? (
          <div className="shrink-0 self-start sm:self-center flex items-center gap-2">
            <SyncSharkScopeButton />
            <NewPlayerModal
              coaches={tablePayload.coaches}
              grades={tablePayload.grades}
            />
          </div>
        ) : null}
      </div>

      <Card className="min-w-0 max-w-full overflow-visible bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
        <CardContent className="min-w-0 max-w-full">
          {tablePayload.rows.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
              Nenhum jogador cadastrado ainda.
            </div>
          ) : (
            <PlayersTableClient
              initialPayload={tablePayload}
              canEditPlayers={canEditPlayers}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
