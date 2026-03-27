import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ACTION_CONFIG = {
  UPGRADE: {
    label: "Subida de Limite",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  },
  MAINTAIN: {
    label: "Manutenção",
    icon: Minus,
    color: "text-muted-foreground",
    bg: "bg-muted/50 border-border text-muted-foreground",
  },
  DOWNGRADE: {
    label: "Descida de Limite",
    icon: TrendingDown,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20 text-red-500",
  },
};

export default async function HistoryPage() {
  const session = await requireSession();

  const where =
    session.role === "PLAYER" && session.playerId
      ? { playerId: session.playerId }
      : session.role === "COACH" && session.coachId
        ? {
            player: {
              OR: [{ coachId: session.coachId }, { driId: session.coachId }],
            },
          }
        : {};

  const history = await prisma.limitChangeHistory.findMany({
    where,
    include: { player: { select: { id: true, name: true, nickname: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const upgrades = history.filter((h) => h.action === "UPGRADE").length;
  const downgrades = history.filter((h) => h.action === "DOWNGRADE").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Histórico de Limites</h2>
        <p className="text-muted-foreground mt-1">
          Registro de subidas, manutenções e descidas de grade dos jogadores.
        </p>
      </div>

      {/* Resumo */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 shrink-0">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-500">{upgrades}</div>
              <p className="text-xs text-muted-foreground">Subidas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 shrink-0">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{downgrades}</div>
              <p className="text-xs text-muted-foreground">Descidas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
              <History className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{history.length}</div>
              <p className="text-xs text-muted-foreground">Total de registros</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Linha do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              <History className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Nenhuma alteração de limite registrada.</p>
            </div>
          ) : (
            <div className="relative space-y-0">
              {/* Linha vertical */}
              <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />

              {history.map((item, idx) => {
                const cfg = ACTION_CONFIG[item.action];
                const ActionIcon = cfg.icon;
                return (
                  <div key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {/* Ícone */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-[34px] h-[34px] rounded-full border-2 shrink-0 bg-background ${
                        item.action === "UPGRADE"
                          ? "border-emerald-500/50"
                          : item.action === "DOWNGRADE"
                          ? "border-red-500/50"
                          : "border-border"
                      }`}
                    >
                      <ActionIcon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-xs ${cfg.bg}`}>{cfg.label}</Badge>
                            <span className="font-medium text-sm">{item.player.name}</span>
                            {item.player.nickname && (
                              <span className="text-xs text-muted-foreground">@{item.player.nickname}</span>
                            )}
                          </div>

                          {item.fromGrade && item.toGrade && (
                            <div className="flex items-center gap-2 mt-1.5 text-sm">
                              <span className="text-muted-foreground text-xs">{item.fromGrade}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-xs font-medium">{item.toGrade}</span>
                            </div>
                          )}

                          {item.reason && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{item.reason}</p>
                          )}
                        </div>

                        <time className="text-xs text-muted-foreground shrink-0">
                          {format(item.createdAt, "dd MMM yyyy", { locale: ptBR })}
                        </time>
                      </div>
                    </div>
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
