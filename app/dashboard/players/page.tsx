import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings2 } from "lucide-react";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { STAFF_WRITE_ROLES } from "@/lib/auth/rbac";
import { getPlayersForSession } from "@/lib/data/queries";
import { prisma } from "@/lib/prisma";
import { NewPlayerModal } from "@/components/new-player-modal";

export default async function PlayersPage() {
  const session = await requireSession();
  const [players, coaches] = await Promise.all([
    getPlayersForSession(session),
    session.role === "COACH" && session.coachId
      ? prisma.coach.findMany({ where: { id: session.coachId }, orderBy: { name: "asc" } })
      : prisma.coach.findMany({ orderBy: { name: "asc" } }),
  ]);
  const canCreate = STAFF_WRITE_ROLES.includes(session.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Jogadores</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie o time de jogadores e aloque coaches responsáveis.
          </p>
        </div>
        {canCreate ? <NewPlayerModal coaches={coaches} /> : null}
      </div>

      <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
              Nenhum jogador cadastrado ainda.
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Nome</TableHead>
                    <TableHead>Nickname</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Grade Principal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => {
                    const mainGrade = player.gradeAssignments[0]?.gradeProfile;
                    return (
                      <TableRow key={player.id} className="hover:bg-sidebar-accent/50">
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>{player.nickname || "-"}</TableCell>
                        <TableCell>
                          {player.coach ? (
                            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                              {player.coach.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Sem Coach</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {mainGrade ? (
                            <span className="text-sm font-medium">{mainGrade.name}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Não atribuída</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {player.status === "ACTIVE" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 glow-success border-emerald-500/20">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild title="Gerenciar Perfil">
                            <Link href={`/dashboard/players/${player.id}`}>
                              <Settings2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
