import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { ArrowLeft, Clock, DollarSign, Filter, Users, LayoutList } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LobbyzeFilterItem } from "@/lib/types";
import { formatBuyIn, formatList } from "@/lib/utils";
import { createLogger } from "@/lib/logger";
import { requireSession } from "@/lib/auth/session";
import { getGradeByIdForSession } from "@/lib/data/queries";

const pageLog = createLogger("grades.detail");

export default async function GradeRulesPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const grade = await getGradeByIdForSession(session, id);

  if (!grade) {
    pageLog.warn("Grade não encontrada ou sem permissão", { id });
    notFound();
  }

  pageLog.debug("Página de grade carregada", {
    id,
    rules: grade.rules.length,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/grades">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{grade.name}</h2>
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/10">
              {grade.rules.length} Regras
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {grade.description || "Nenhuma descrição fornecida para esta grade."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jogadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grade._count.assignments}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Regras Detalhadas (Filtros Lobbyze)
          </CardTitle>
          <CardDescription>
            Tudo o que for jogado e estiver dentro dos parâmetros abaixo será considerado "IN_GRADE".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-sidebar/50">
                  <TableHead className="w-[200px]">Nome (Filtro)</TableHead>
                  <TableHead>Sites</TableHead>
                  <TableHead>Buy-In ($)</TableHead>
                  <TableHead>Formato / Status</TableHead>
                  <TableHead>Extra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grade.rules.map((rule) => (
                  <TableRow key={rule.id} className="hover:bg-sidebar-accent/50">
                    <TableCell className="font-medium">{rule.filterName}</TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          try {
                            const arr = typeof rule.sites === 'string' ? JSON.parse(rule.sites) : rule.sites;
                            if (Array.isArray(arr) && arr.length > 0) {
                              return arr.map((s: LobbyzeFilterItem, i: number) => (
                                <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 whitespace-nowrap">
                                  {s.item_text}
                                </Badge>
                              ));
                            }
                          } catch {}
                          return "Todos";
                        })()}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-emerald-500 font-medium whitespace-nowrap">
                        <DollarSign className="h-3 w-3" />
                        {formatBuyIn(rule.buyInMin, rule.buyInMax)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3 w-3" /> {formatList(rule.speed)}
                        </div>
                        <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
                          <LayoutList className="h-3 w-3" /> {formatList(rule.tournamentType)}
                          {rule.variant ? ` | ${formatList(rule.variant)}` : ""}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-xs">
                        {rule.prizePoolMin && <div><span className="text-muted-foreground">GTD Min:</span> ${rule.prizePoolMin}</div>}
                        {rule.minParticipants && <div><span className="text-muted-foreground">Pts Min:</span> {rule.minParticipants}</div>}
                        {rule.excludePattern && <div><span className="text-red-400">Exclui:</span> {rule.excludePattern.replace(/\|/g, ", ")}</div>}
                        {rule.fromTime && rule.toTime && <div><span className="text-muted-foreground">Horário:</span> {rule.fromTime} - {rule.toTime}</div>}
                      </div>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
