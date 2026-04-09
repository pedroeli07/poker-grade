"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, Loader2, Bell } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { ALERT_TYPE_LABEL, SEVERITY_UI } from "@/lib/constants";
import type { SharkscopeAlertRow } from "@/lib/types";
import { useAlertsDashboard } from "@/hooks/sharkscope/alerts/use-alerts-dashboard";

export function AlertsClient({
  initialAlerts,
  canAcknowledge,
}: {
  initialAlerts: SharkscopeAlertRow[];
  canAcknowledge: boolean;
}) {
  const {
    filterSeverity,
    setFilterSeverity,
    filterType,
    setFilterType,
    filterAck,
    setFilterAck,
    filtered,
    unackedCount,
    isPending,
    acknowledge,
    acknowledgeAll,
  } = useAlertsDashboard(initialAlerts);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Alertas SharkScope
          </h2>
          <p className="text-muted-foreground mt-1">
            Alertas automáticos gerados pelo cron job diário.
          </p>
        </div>
        {canAcknowledge && unackedCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={acknowledgeAll}
          >
            {isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Reconhecer todos ({unackedCount})
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="red">🔴 Vermelho</SelectItem>
            <SelectItem value="yellow">🟡 Amarelo</SelectItem>
            <SelectItem value="green">🟢 Verde</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(ALERT_TYPE_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterAck} onValueChange={setFilterAck}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unacknowledged">Não reconhecidos</SelectItem>
            <SelectItem value="acknowledged">Reconhecidos</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground self-center ml-auto">
          {filtered.length} alerta{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum alerta com os filtros atuais.</p>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500/10 hover:bg-transparent">
                <TableHead>Severidade</TableHead>
                <TableHead>Jogador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Limite</TableHead>
                <TableHead>Data</TableHead>
                {canAcknowledge && <TableHead className="text-right">Ação</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((alert) => {
                const sev = SEVERITY_UI[alert.severity] ?? SEVERITY_UI.yellow;
                return (
                  <TableRow
                    key={alert.id}
                    className={`hover:bg-sidebar-accent/50 ${alert.acknowledged ? "opacity-50" : ""}`}
                  >
                    <TableCell>
                      <Badge className={`${sev.badge} text-xs`}>
                        <AlertTriangle
                          className={`mr-1 h-3 w-3 ${sev.iconClass}`}
                        />
                        {sev.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/players/${alert.player.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {alert.player.name}
                      </Link>
                      {alert.player.nickname && (
                        <span className="text-xs text-muted-foreground ml-1">
                          @{alert.player.nickname}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {ALERT_TYPE_LABEL[alert.alertType] ?? alert.alertType}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-semibold">
                      {alert.metricValue.toFixed(1)}
                      {alert.alertType.includes("roi") ? "%" : ""}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {alert.threshold.toFixed(0)}
                      {alert.alertType.includes("roi") ? "%" : ""}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(alert.triggeredAt), "dd/MM/yy HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    {canAcknowledge && (
                      <TableCell className="text-right">
                        {alert.acknowledged ? (
                          <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            OK
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={isPending}
                            onClick={() => acknowledge(alert.id)}
                          >
                            Reconhecer
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
