import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import type { PokerNetworkKey, PokerNetworkOption } from "@/lib/types";
import { memo } from "react";

const ScoutingSearchCard = memo(function ScoutingSearchCard({
  nick,
  setNick,
  network,
  setNetwork,
  networkOptions,
  isPending,
  handleSearch,
}: {
  nick: string;
  setNick: (v: string) => void;
  network: PokerNetworkKey;
  setNetwork: (v: PokerNetworkKey) => void;
  networkOptions: PokerNetworkOption[];
  isPending: boolean;
  handleSearch: () => void;
}) {
  return (
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
  );
});

ScoutingSearchCard.displayName = "ScoutingSearchCard";

export default ScoutingSearchCard;
