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
import { FileSpreadsheet, AlertTriangle, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { requireSession } from "@/lib/auth/session";
import { IMPORT_ROLES } from "@/lib/auth/rbac";
import { getImportsForSession } from "@/lib/data/queries";
import { NewImportModal } from "@/components/new-import-modal";

export default async function ImportsPage() {
  const session = await requireSession();
  const imports = await getImportsForSession(session);
  const canImport = IMPORT_ROLES.includes(session.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Importações</h2>
          <p className="text-muted-foreground mt-1">
            Histórico de arquivos de torneios da Lobbyze importados no sistema.
          </p>
        </div>
        {canImport ? <NewImportModal /> : null}
      </div>

      <Card className="glass-card">
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
                    <TableRow key={item.id} className="hover:bg-sidebar-accent/50">
                      <TableCell className="font-medium flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                        {item.fileName}
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
