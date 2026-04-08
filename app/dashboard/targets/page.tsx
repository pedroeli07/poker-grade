import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, XCircle } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { STAFF_WRITE_ROLES } from "@/lib/auth/rbac";
import { getTargetsListRowsForSession } from "@/lib/data/targets-list";
import { prisma } from "@/lib/prisma";
import { NewTargetModal } from "@/components/new-target-modal";
import { Metadata } from "next";
import dynamicImport from "next/dynamic";

const TargetsPageClient = dynamicImport(
  () => import("./targets-page-client").then((m) => ({ default: m.TargetsPageClient })),
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
  title: "Targets e Metas",
  description: "Acompanhe ABI, ROI, Volume e gatilhos de subida/descida de limite.",
};


export default async function TargetsPage() {
  const session = await requireSession();
  const canCreate = STAFF_WRITE_ROLES.includes(session.role);

  const [rows, players] = await Promise.all([
    getTargetsListRowsForSession(session),
    canCreate
      ? session.role === "COACH" && session.coachId
        ? prisma.player.findMany({
            where: {
              OR: [{ coachId: session.coachId }, { driId: session.coachId }],
            },
            orderBy: { name: "asc" },
            select: { id: true, name: true, nickname: true },
          })
        : prisma.player.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true, nickname: true },
          })
      : [],
  ]);

  const onTrack = rows.filter((t) => t.status === "ON_TRACK");
  const attention = rows.filter((t) => t.status === "ATTENTION");
  const offTrack = rows.filter((t) => t.status === "OFF_TRACK");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Targets e Metas
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe ABI, ROI, Volume e gatilhos de subida/descida de limite.
          </p>
        </div>
        {canCreate && players.length > 0 ? (
          <NewTargetModal players={players} />
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="backdrop-blur-md shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)] bg-emerald-500/5 border border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/15 shrink-0">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-500">
                {onTrack.length}
              </div>
              <p className="text-xs text-muted-foreground">No Caminho Certo</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)] bg-amber-500/5 border border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/15 shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-500">
                {attention.length}
              </div>
              <p className="text-xs text-muted-foreground">Atenção Necessária</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)] bg-red-500/5 border border-red-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/15 shrink-0">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {offTrack.length}
              </div>
              <p className="text-xs text-muted-foreground">Fora da Meta</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TargetsPageClient initialRows={rows} />
    </div>
  );
}
