import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileSpreadsheet, AlertTriangle, ShieldCheck, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { requireSession } from "@/lib/auth/session";
import { IMPORT_ROLES } from "@/lib/auth/rbac";
import { getImportsForSession } from "@/lib/data/queries";
import { NewImportModal } from "@/components/new-import-modal";
import Link from "next/link";

export default async function ImportsPage() {
  const session = await requireSession();
  const imports = await getImportsForSession(session);
  const canImport = IMPORT_ROLES.includes(session.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Importações</h2>
          <p className="text-muted-foreground mt-1">
            Histórico de arquivos de torneios da Lobbyze importados no sistema.
          </p>
        </div>
        {canImport ? <NewImportModal /> : null}
      </div>

      <Card className="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]">
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {imports.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
              <FileSpreadsheet className="h-10 w-10 mx-auto mb-4 opacity-50" />
              Nenhuma importação realizada ainda.
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Jogador Identificado</TableHead>
                    <TableHead className="text-center">Total Torneios</TableHead>
                    <TableHead className="text-center">Dentro da Grade</TableHead>
                    <TableHead className="text-center">Suspeitos</TableHead>
                    <TableHead className="text-center">Fora de Grade</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imports.map((item) => (
                    <TableRow key={item.id} className="hover:bg-sidebar-accent/50 cursor-pointer group">
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/imports/${item.id}`}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{item.fileName}</span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity ml-1" />
                        </Link>
                      </TableCell>
                      <TableCell>{item.playerName || <span className="text-muted-foreground italic">Não Identificado</span>}</TableCell>
                      
                      <TableCell className="text-center font-bold">{item.totalRows}</TableCell>
                      
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          {item.matchedInGrade}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {item.suspect > 0 ? (
                          <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 glow-amber">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {item.suspect}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">0</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        {item.outOfGrade > 0 ? (
                          <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10 glow-red">
                            {item.outOfGrade}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">0</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right text-xs text-muted-foreground">
                        {format(item.createdAt, "dd/MM/yyyy • HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
