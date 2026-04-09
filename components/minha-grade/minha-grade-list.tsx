import { Zap, DollarSign, Clock, Tag, TrendingUp, Ban, Timer } from "lucide-react";
import { GRADE_TYPE_CONFIG } from "@/lib/constants";
import { parseJson } from "@/lib/utils";
import type { LobbyzeFilterItem, PlayerProfileViewModel } from "@/lib/types";

export function Pill({
  text,
  variant,
}: {
  text: string;
  variant: "site" | "speed" | "format";
}) {
  const cls = {
    site: text.toLowerCase().includes("pokerstars")
      ? "bg-red-500/10 text-red-600 border-red-500/20"
      : "bg-blue-500/10 text-blue-600 border-blue-500/20",
    speed: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    format: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold ${cls}`}
    >
      {text}
    </span>
  );
}

type MinhaGradeRuleRow = NonNullable<
  NonNullable<PlayerProfileViewModel["assignmentsByType"]["MAIN"]>
>["gradeProfile"]["rules"][number];

export function MinhaGradeList({
  gradeOrder,
  assignmentsByType,
}: {
  gradeOrder: ("ABOVE" | "MAIN" | "BELOW")[];
  assignmentsByType: PlayerProfileViewModel["assignmentsByType"];
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-3">
          Suas grades
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-5">
        {gradeOrder.map((type) => {
          const assignment = assignmentsByType[type];
          const cfg = GRADE_TYPE_CONFIG[type];
          const Icon = cfg.icon;

          if (!assignment) {
            return (
              <div
                key={type}
                className="rounded-xl border border-dashed border-border p-5 flex items-center gap-3 text-muted-foreground/60"
              >
                <Icon className="h-5 w-5" />
                <div>
                  <p className="font-semibold text-sm">{cfg.label}</p>
                  <p className="text-xs">{cfg.desc}</p>
                </div>
              </div>
            );
          }

          const grade = assignment.gradeProfile;
          const isMain = type === "MAIN";

          return (
            <div
              key={type}
              className={`rounded-2xl border overflow-hidden ${cfg.bg} ${
                isMain ? "ring-2 ring-primary/20" : ""
              }`}
            >
              {/* Grade header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isMain
                        ? "bg-primary/10"
                        : type === "ABOVE"
                          ? "bg-emerald-500/10"
                          : "bg-amber-500/10"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}
                      >
                        {cfg.label}
                      </span>
                      {isMain && (
                        <span className="text-xs text-muted-foreground">
                          - você está aqui
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mt-1">
                      {grade.name}
                    </h3>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {grade._count.rules} filtro{grade._count.rules !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Rules - main grade expanded; others collapsed */}
              {isMain && grade.rules.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 p-6">
                  {grade.rules.map((rule: MinhaGradeRuleRow, idx: number) => {
                    const sites = parseJson<LobbyzeFilterItem>(rule.sites);
                    const speed = parseJson<LobbyzeFilterItem>(rule.speed);
                    const variant = parseJson<LobbyzeFilterItem>(rule.variant);
                    const tournamentType = parseJson<LobbyzeFilterItem>(
                      rule.tournamentType
                    );

                    return (
                      <div
                        key={rule.id}
                        className="rounded-xl bg-background border border-border p-5 space-y-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-sm text-foreground">
                            {rule.filterName}
                          </span>
                        </div>

                        {sites.length > 0 && (
                          <div className="flex items-start gap-2.5">
                            <Zap className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="flex flex-wrap gap-1.5">
                              {sites.map((s, i) => (
                                <Pill key={i} text={s.item_text} variant="site" />
                              ))}
                            </div>
                          </div>
                        )}

                        {(rule.buyInMin || rule.buyInMax) && (
                          <div className="flex items-center gap-2.5">
                            <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="font-mono text-lg font-bold text-emerald-600">
                              ${rule.buyInMin ?? "?"} - ${rule.buyInMax ?? "?"}
                            </span>
                          </div>
                        )}

                        {speed.length > 0 && (
                          <div className="flex items-start gap-2.5">
                            <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex flex-wrap gap-1.5">
                              {speed.map((s, i) => (
                                <Pill key={i} text={s.item_text} variant="speed" />
                              ))}
                            </div>
                          </div>
                        )}

                        {(variant.length > 0 || tournamentType.length > 0) && (
                          <div className="flex items-start gap-2.5">
                            <Tag className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                            <div className="flex flex-wrap gap-1.5">
                              {[...tournamentType, ...variant].map((s, i) => (
                                <Pill
                                  key={i}
                                  text={s.item_text}
                                  variant="format"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {rule.prizePoolMin && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-3">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            GTD mín:{" "}
                            <strong className="text-foreground">
                              ${rule.prizePoolMin.toLocaleString()}
                            </strong>
                          </div>
                        )}
                        {rule.excludePattern && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-3">
                            <Ban className="h-4 w-4 text-red-500" />
                            Excluir:{" "}
                            <strong className="text-red-500/80">
                              {rule.excludePattern.replace(/\|/g, ", ")}
                            </strong>
                          </div>
                        )}
                        {rule.fromTime && rule.toTime && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-3">
                            <Timer className="h-4 w-4 text-primary/70" />
                            Horário: {rule.fromTime} - {rule.toTime}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!isMain && (
                <div className="px-6 py-4">
                  <p className="text-sm text-muted-foreground italic">
                    {cfg.desc}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
