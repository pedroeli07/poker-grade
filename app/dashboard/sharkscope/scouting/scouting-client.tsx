"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Save, MessageSquare } from "lucide-react";
import { POKER_NETWORKS } from "@/lib/constants";
import type { PokerNetworkKey } from "@/lib/types";
import {
  ScoutingRoiDisplay,
  ScoutingStatCard,
} from "@/components/sharkscope/scouting-cells";
import { ScoutingSavedCard } from "@/components/sharkscope/scouting-saved-card";
import type { ScoutingClientProps } from "@/lib/types";
import { useScoutingDashboard } from "@/hooks/sharkscope/scouting/use-scouting-dashboard";

export function ScoutingClient({
  networkOptions,
  savedAnalyses: initialSaved,
}: ScoutingClientProps) {
  const {
    nick,
    setNick,
    network,
    setNetwork,
    searchResult,
    nickId,
    nlqQuestion,
    setNlqQuestion,
    nlqAnswer,
    notes,
    setNotes,
    saved,
    expandedId,
    isPending,
    searchStats,
    handleSearch,
    handleNlq,
    handleSave,
    toggleExpanded,
    removeSaved,
  } = useScoutingDashboard(networkOptions, initialSaved);

  const {
    roi: resultRoi,
    profit: resultProfit,
    count: resultCount,
    abi: resultAbi,
    entrants: resultEntrants,
  } = searchStats;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">
          Scouting SharkScope
        </h2>
        <p className="text-muted-foreground mt-1">
          Pesquise jogadores avulsos para avaliação de contratação.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pesquisar Jogador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto]">
            <div className="space-y-1.5">
              <Label className="text-sm">Nick</Label>
              <Input
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                placeholder="Ex: JohnDoe99"
                disabled={isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Rede</Label>
              <Select
                value={network}
                onValueChange={(v) => setNetwork(v as PokerNetworkKey)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {networkOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={isPending || !nick.trim()}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Pesquisar
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Consome 1 busca da cota SharkScope. Cota mensal: 5.000 buscas.
          </p>
        </CardContent>
      </Card>

      {searchResult && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Resultado: <span className="text-primary">{nick}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {POKER_NETWORKS[network]?.label}
                </Badge>
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={isPending}
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Salvar análise
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <ScoutingStatCard
                label="ROI"
                value={<ScoutingRoiDisplay roi={resultRoi} />}
              />
              <ScoutingStatCard
                label="Lucro Total"
                value={
                  resultProfit !== null ? (
                    <span
                      className={
                        resultProfit >= 0 ? "text-emerald-600" : "text-red-500"
                      }
                    >
                      {resultProfit >= 0 ? "+" : ""}${resultProfit.toFixed(0)}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <ScoutingStatCard
                label="Volume"
                value={resultCount !== null ? resultCount.toFixed(0) : "—"}
              />
              <ScoutingStatCard
                label="ABI Médio"
                value={resultAbi !== null ? `$${resultAbi.toFixed(0)}` : "—"}
              />
              <ScoutingStatCard
                label="Field Size"
                value={
                  resultEntrants !== null ? resultEntrants.toFixed(0) : "—"
                }
              />
            </div>

            {nickId && (
              <div className="border-t border-border/40 pt-4 space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Pergunta ao SharkScope (NLQ)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={nlqQuestion}
                    onChange={(e) => setNlqQuestion(e.target.value)}
                    placeholder="Ex: Qual foi a tendência de ROI nos últimos 3 meses?"
                    disabled={isPending}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleNlq();
                    }}
                  />
                  <Button
                    onClick={handleNlq}
                    disabled={isPending || !nlqQuestion.trim()}
                    variant="outline"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Perguntar"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Consome 1 busca adicional.
                </p>
                {nlqAnswer && (
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
                    <pre className="whitespace-pre-wrap font-sans text-xs">
                      {JSON.stringify(nlqAnswer, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-border/40 pt-4 space-y-2">
              <Label className="text-sm">Notas da análise</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre o jogador (estilo de jogo, fit com o time, etc.)"
                rows={3}
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {saved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Análises Salvas</h3>
          <div className="space-y-2">
            {saved.map((analysis) => (
              <ScoutingSavedCard
                key={analysis.id}
                analysis={analysis}
                expanded={expandedId === analysis.id}
                isPending={isPending}
                onToggle={toggleExpanded}
                onDelete={removeSaved}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
