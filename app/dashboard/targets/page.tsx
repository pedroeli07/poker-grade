import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { STAFF_WRITE_ROLES } from "@/lib/auth/rbac";
import { getTargetsForSession } from "@/lib/data/queries";
import { prisma } from "@/lib/prisma";
import { NewTargetModal } from "@/components/new-target-modal";

const STATUS_CONFIG = {
  ON_TRACK: {
    label: "No Caminho",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  },
  ATTENTION: {
    label: "Atenção",
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  },
  OFF_TRACK: {
    label: "Fora da Meta",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20 text-red-500",
  },
};

const LIMIT_ACTION_LABEL = {
  UPGRADE: { label: "Gatilho: Subida", color: "text-emerald-500" },
  MAINTAIN: { label: "Gatilho: Manutenção", color: "text-muted-foreground" },
  DOWNGRADE: { label: "Gatilho: Descida", color: "text-red-500" },
};

export default async function TargetsPage() {
  const session = await requireSession();
  const canCreate = STAFF_WRITE_ROLES.includes(session.role);

  const [targets, players] = await Promise.all([
    getTargetsForSession(session),
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

  const onTrack = targets.filter((t) => t.status === "ON_TRACK");
  const attention = targets.filter((t) => t.status === "ATTENTION");
  const offTrack = targets.filter((t) => t.status === "OFF_TRACK");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Targets e Metas</h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe ABI, ROI, Volume e gatilhos de subida/descida de limite.
          </p>
        </div>
        {canCreate && players.length > 0 ? (
          <NewTargetModal players={players} />
        ) : null}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="backdrop-blur-md shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)] bg-emerald-500/5 border border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/15 shrink-0">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-500">{onTrack.length}</div>
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
              <div className="text-2xl font-bold text-amber-500">{attention.length}</div>
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
              <div className="text-2xl font-bold text-red-500">{offTrack.length}</div>
              <p className="text-xs text-muted-foreground">Fora da Meta</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target list */}
      <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
        <CardHeader>
          <CardTitle>Todos os Targets</CardTitle>
          <CardDescription>
            Metas individuais estabelecidas para os jogadores do time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {targets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              <Target className="h-10 w-10 mx-auto mb-4 opacity-40" />
              <p className="font-medium">Nenhum target definido.</p>
              <p className="text-sm mt-1">
                Targets ajudam a justificar matematicamente as subidas de limite.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {targets.map((target) => {
                const cfg = STATUS_CONFIG[target.status];
                const StatusIcon = cfg.icon;
                const limitCfg = target.limitAction ? LIMIT_ACTION_LABEL[target.limitAction] : null;

                return (
                  <div
                    key={target.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-card/50 p-4 hover:border-border transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Top row */}
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium text-sm">{target.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50">
                          {target.category}
                        </Badge>
                        {limitCfg && (
                          <span className={`text-xs ${limitCfg.color}`}>{limitCfg.label}</span>
                        )}
                      </div>

                      {/* Player */}
                      <p className="text-xs text-muted-foreground">
                        Jogador:{" "}
                        <Link
                          href={`/dashboard/players/${target.player.id}`}
                          className="hover:text-primary transition-colors font-medium text-foreground"
                        >
                          {target.player.name}
                        </Link>
                      </p>

                      {/* Numeric progress */}
                      {target.targetType === "NUMERIC" && target.numericValue != null && (
                        <div className="flex items-center gap-3 pt-1">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[160px]">
                            {target.numericCurrent != null && target.numericValue > 0 && (
                              <div
                                className={`h-full rounded-full ${
                                  target.status === "ON_TRACK"
                                    ? "bg-emerald-500"
                                    : target.status === "ATTENTION"
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round((target.numericCurrent / target.numericValue) * 100)
                                  )}%`,
                                }}
                              />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            <strong className="text-foreground">
                              {target.numericCurrent ?? "—"}
                            </strong>
                            {" / "}
                            {target.numericValue}
                            {target.unit && (
                              <span className="ml-0.5 text-muted-foreground">{target.unit}</span>
                            )}
                          </span>
                        </div>
                      )}

                      {target.coachNotes && (
                        <p className="text-xs text-muted-foreground italic line-clamp-1">
                          {target.coachNotes}
                        </p>
                      )}
                    </div>

                    {/* Status badge */}
                    <Badge className={`${cfg.bg} shrink-0 flex items-center gap-1 text-xs`}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
