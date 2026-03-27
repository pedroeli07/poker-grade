import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  Users,
  Zap,
  Tag,
  Ban,
  Timer,
  CalendarDays,
  Info,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LobbyzeFilterItem } from "@/lib/types";
import { requireSession } from "@/lib/auth/session";
import { getGradeByIdForSession } from "@/lib/data/queries";

function parseJson<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function Pills({
  items,
  variant = "default",
}: {
  items: LobbyzeFilterItem[];
  variant?: "sites" | "default" | "speed" | "variant";
}) {
  if (!items.length) return <span className="text-muted-foreground/50 text-sm">Todos</span>;

  const cls =
    variant === "sites"
      ? (text: string) =>
          text.toLowerCase().includes("pokerstars")
            ? "bg-red-500/12 text-red-300 border-red-500/25"
            : "bg-blue-500/12 text-blue-300 border-blue-500/25"
      : variant === "speed"
        ? () => "bg-amber-500/12 text-amber-300 border-amber-500/25"
        : variant === "variant"
          ? () => "bg-violet-500/12 text-violet-300 border-violet-500/25"
          : () => "bg-secondary text-secondary-foreground border-border";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cls(item.item_text)}`}
        >
          {item.item_text}
        </span>
      ))}
    </div>
  );
}

function BuyInRange({
  min,
  max,
}: {
  min: number | null;
  max: number | null;
}) {
  if (!min && !max)
    return (
      <span className="text-muted-foreground/50 text-sm">Sem restrição</span>
    );

  const pct = min && max ? ((min / max) * 100).toFixed(0) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg font-bold text-emerald-400">
          ${min ?? "—"}
        </span>
        <span className="text-muted-foreground/60">—</span>
        <span className="font-mono text-lg font-bold text-emerald-400">
          ${max ?? "—"}
        </span>
      </div>
      {min && max && (
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden w-full max-w-[140px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
            style={{ width: `${100 - Number(pct)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default async function GradeRulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const grade = await getGradeByIdForSession(session, id);

  if (!grade) notFound();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/grades">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-4xl font-bold tracking-tight">{grade.name}</h2>
            <Badge
              variant="outline"
              className="border-primary/30 text-primary bg-primary/8 text-sm px-3"
            >
              {grade.rules.length} filtro{grade.rules.length !== 1 ? "s" : ""}
            </Badge>
            <Badge
              variant="outline"
              className="border-border text-muted-foreground text-sm px-3"
            >
              <Users className="h-4 w-4 mr-1.5" />
              {grade._count.assignments} jogador
              {grade._count.assignments !== 1 ? "es" : ""}
            </Badge>
          </div>
        </div>
      </div>

      {/* Coach explanation */}
      {grade.description && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 flex gap-5">
          <div className="shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Info className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-base font-semibold text-primary mb-1.5">
              Nota do Coach
            </p>
            <p className="text-[15px] text-foreground/80 leading-relaxed whitespace-pre-line">
              {grade.description}
            </p>
          </div>
        </div>
      )}

      {/* Section header */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3">
          Filtros da grade
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Filter cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {grade.rules.map((rule, idx) => {
          const sites = parseJson<LobbyzeFilterItem>(rule.sites);
          const speed = parseJson<LobbyzeFilterItem>(rule.speed);
          const variant = parseJson<LobbyzeFilterItem>(rule.variant);
          const tournamentType = parseJson<LobbyzeFilterItem>(rule.tournamentType);
          const weekDay = parseJson<LobbyzeFilterItem>(rule.weekDay);

          const hasExtra =
            rule.prizePoolMin ||
            rule.minParticipants ||
            rule.excludePattern ||
            (rule.fromTime && rule.toTime) ||
            weekDay.length > 0;

          return (
            <div
              key={rule.id}
              className="rounded-xl border border-border bg-card/60 overflow-hidden hover:border-border/80 transition-colors group"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center text-[13px] font-bold text-primary">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-base text-foreground">
                    {rule.filterName}
                  </span>
                </div>
                {rule.lobbyzeFilterId && (
                  <span className="text-xs text-muted-foreground/50 font-mono">
                    #{rule.lobbyzeFilterId}
                  </span>
                )}
              </div>

              {/* Card body */}
              <div className="p-6 space-y-6">
                {/* Sites */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Sites
                    </p>
                    <Pills items={sites} variant="sites" />
                  </div>
                </div>

                {/* Buy-in */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Buy-in
                    </p>
                    <BuyInRange min={rule.buyInMin} max={rule.buyInMax} />
                  </div>
                </div>

                {/* Speed */}
                {speed.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Speed
                      </p>
                      <Pills items={speed} variant="speed" />
                    </div>
                  </div>
                )}

                {/* Variant / Tournament type */}
                {(variant.length > 0 || tournamentType.length > 0) && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Tag className="h-5 w-5 text-violet-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Formato / Variante
                      </p>
                      <Pills
                        items={[...tournamentType, ...variant]}
                        variant="variant"
                      />
                    </div>
                  </div>
                )}

                {/* Extra constraints */}
                {hasExtra && (
                  <div className="pt-4 border-t border-border/50 space-y-3">
                    {rule.prizePoolMin && (
                      <div className="flex items-center gap-3 text-base text-muted-foreground">
                        <TrendingUp className="h-5 w-5 text-emerald-500/70" />
                        <span>
                          Garantido mín:{" "}
                          <strong className="text-foreground/80">
                            ${rule.prizePoolMin.toLocaleString()}
                          </strong>
                        </span>
                      </div>
                    )}
                    {rule.minParticipants && (
                      <div className="flex items-center gap-3 text-base text-muted-foreground">
                        <Users className="h-5 w-5 text-blue-500/70" />
                        <span>
                          Mín. entrants:{" "}
                          <strong className="text-foreground/80">
                            {rule.minParticipants}
                          </strong>
                        </span>
                      </div>
                    )}
                    {rule.fromTime && rule.toTime && (
                      <div className="flex items-center gap-3 text-base text-muted-foreground">
                        <Timer className="h-5 w-5 text-primary/70" />
                        <span>
                          Horário:{" "}
                          <strong className="text-foreground/80">
                            {rule.fromTime} — {rule.toTime}
                          </strong>
                        </span>
                      </div>
                    )}
                    {weekDay.length > 0 && (
                      <div className="flex items-center gap-3 text-base text-muted-foreground">
                        <CalendarDays className="h-5 w-5 text-primary/70" />
                        <span>
                          Dias:{" "}
                          <strong className="text-foreground/80">
                            {weekDay.map((d) => d.item_text).join(", ")}
                          </strong>
                        </span>
                      </div>
                    )}
                    {rule.excludePattern && (
                      <div className="flex items-center gap-3 text-base text-muted-foreground">
                        <Ban className="h-5 w-5 text-red-500/70" />
                        <span>
                          Excluir:{" "}
                          <strong className="text-red-500/80">
                            {rule.excludePattern.replace(/\|/g, ", ")}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {grade.rules.length === 0 && (
        <div className="bg-blue-500/10 flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
          <Target className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-xl">Nenhum filtro definido para esta grade.</p>
          <p className="text-base mt-1 text-muted-foreground/80">
            Faça o upload de um JSON da Lobbyze para importar os filtros.
          </p>
        </div>
      )}
    </div>
  );
}
