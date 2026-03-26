import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, AlertTriangle, XCircle, Plus } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getTargetsForSession } from "@/lib/data/queries";

export default async function TargetsPage() {
  const session = await requireSession();
  const targets = await getTargetsForSession(session);
  const onTrack = targets.filter((t) => t.status === "ON_TRACK");
  const attention = targets.filter((t) => t.status === "ATTENTION");
  const offTrack = targets.filter((t) => t.status === "OFF_TRACK");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Targets e Metas</h2>
          <p className="text-muted-foreground mt-1">
            Acompanhamento de metas individuais (ABI, ROI, Volume) e Gatilhos de Subida.
          </p>
        </div>
        <Button className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90" disabled>
          <Plus className="mr-2 h-4 w-4" />
          Novo Target
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> No Caminho Certo (On Track)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{onTrack.length}</div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Atenção Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{attention.length}</div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-red-500/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Fora da Meta (Off Track)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{offTrack.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Todos os Targets</CardTitle>
          <CardDescription>Visão geral de todas as metas estabelecidas para os jogadores.</CardDescription>
        </CardHeader>
        <CardContent>
          {targets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              <Target className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p>Nenhum target definido.</p>
              <p className="text-sm">Os targets ajudam a justificar matematicamente as subidas de limite.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Future lists mapped here */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
