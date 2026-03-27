import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive } from "lucide-react";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { canManageGrades } from "@/lib/auth/rbac";
import { getGradesForSession } from "@/lib/data/queries";
import { DeleteGradeButton } from "@/components/delete-grade-button";
import { NewGradeModal, ImportGradeModal } from "@/components/grade-modals";

export default async function GradesPage() {
  const session = await requireSession();
  const grades = await getGradesForSession(session);
  const manage = canManageGrades(session);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grades</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os perfis de grades e filtros da Lobbyze.
          </p>
        </div>
        {manage ? (
          <div className="flex gap-2">
            <ImportGradeModal />
            <NewGradeModal />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {grades.map((grade) => (
          <Card key={grade.id} className="glass-card overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-1">{grade.name}</CardTitle>
                {manage ? (
                  <DeleteGradeButton gradeId={grade.id} gradeName={grade.name} />
                ) : null}
              </div>
              <CardDescription className="line-clamp-2 min-h-[40px]">
                {grade.description || "Sem descrição"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Archive className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{grade._count.rules}</span> Regras
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {grade._count.assignments} Jogadores
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/grades/${grade.id}`}>
                    Ver Regras
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {grades.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-border rounded-lg text-muted-foreground">
            <Archive className="h-10 w-10 mx-auto mb-4 opacity-50" />
            <p>Nenhuma grade cadastrada.</p>
            <p className="text-sm">Importe um JSON da Lobbyze para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
