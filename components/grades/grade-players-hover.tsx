import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { playersHoverScrollClass } from "@/lib/constants";
import { memo } from "react";

const GradePlayersHover = memo(function GradePlayersHover({
  count,
  players,
  gradeName,
  variant = "card",
}: {
  count: number;
  players: { id: string; name: string }[];
  gradeName: string;
  variant?: "card" | "table";
}) {

  const baseClass = "border-primary/20 bg-primary/6 text-primary text-xs"
  const badgeClass = variant === "card"
    ? `${baseClass} font-medium px-2 py-0.5`
    : `${baseClass} tabular-nums font-medium`;

  return (
    <HoverCard openDelay={220} closeDelay={120}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-help rounded-md border-0 bg-transparent p-0 text-left transition-opacity hover:opacity-90 focus-visible:outline-none",
            variant === "table" && "inline-flex"
          )}
          aria-label={`${count} jogador${count !== 1 ? "es" : ""} — passar o mouse para ver a lista`}
        >
          <Badge variant="outline" className={badgeClass}>
            {variant === "card" ? `${count} jogadores` : count}
          </Badge>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        sideOffset={8}
        collisionPadding={12}
        className="z-90 w-[min(92vw,22rem)] p-0 border border-border bg-popover shadow-lg"
      >
        <div className="border-b border-border px-3 py-2 flex items-center gap-2 bg-muted/40">
          <Users className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              Jogadores na grade
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {gradeName}
            </p>
          </div>
        </div>
        <div className="p-3">
          {players.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum jogador com assignment ativo nesta grade.
            </p>
          ) : (
            <ul className={playersHoverScrollClass}>
              {players.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/dashboard/players/${p.id}`}
                    className="block rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-primary/8 transition-colors"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
});

GradePlayersHover.displayName = "GradePlayersHover";

export default GradePlayersHover;
