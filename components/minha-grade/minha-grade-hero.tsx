import { ChevronRight } from "lucide-react";
import { GRADE_TYPE_CONFIG } from "@/lib/constants";
import type { PlayerProfileViewModel } from "@/lib/types";

export function MinhaGradeHero({
  player,
  assignmentsByType,
  gradeOrder,
}: {
  player: { name: string; nickname: string | null; coach?: { name: string } | null };
  assignmentsByType: PlayerProfileViewModel["assignmentsByType"];
  gradeOrder: ("ABOVE" | "MAIN" | "BELOW")[];
}) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">
            CL Team
          </p>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            {player.name}
          </h1>
          {player.nickname && (
            <p className="text-muted-foreground mt-1 text-[15px]">
              @{player.nickname}
            </p>
          )}
          {player.coach && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
              Coach:{" "}
              <span className="font-semibold text-foreground">
                {player.coach.name}
              </span>
            </p>
          )}
        </div>

        {/* Grade path visual */}
        <div className="flex items-center gap-2 flex-wrap">
          {gradeOrder.map((type, i) => {
            const assignment = assignmentsByType[type];
            const cfg = GRADE_TYPE_CONFIG[type];
            const Icon = cfg.icon;
            const isMain = type === "MAIN";

            return (
              <div key={type} className="flex items-center gap-2">
                {i > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                )}
                <div
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold ${
                    isMain
                      ? `${cfg.badge} ring-2 ring-primary/30`
                      : assignment
                        ? cfg.badge
                        : "bg-muted text-muted-foreground/50 border-border"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isMain ? cfg.color : ""}`} />
                  <span className="hidden sm:block text-xs">
                    {assignment
                      ? assignment.gradeProfile.name.split(" - ")[0]
                      : "?"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
