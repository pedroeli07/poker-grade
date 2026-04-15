/**
 * Verifica no código-fonte (sem chamar API) se o sync mantém o desenho otimizado:
 * - 1× statistics lifetime PlayerGroup (sem Date no path)
 * - 1× período em completedTournaments (Date:90D) + paginação
 * - 10d / 30d / 90d e tipos derivados com computeStatsFromRows localmente
 *
 * Uso: npx tsx scripts/verify-sharkscope-sync-footprint.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function main() {
  const daily = read("lib/sharkscope/run-daily-sync.ts");
  const gb = read("lib/sharkscope/group-site-breakdown-sync.ts");
  const errs: string[] = [];

  if (!gb.includes('encodeURIComponent("Date:90D")')) {
    errs.push(
      "group-site-breakdown-sync.ts: completedTournaments deve usar filter Date:90D (um período de fetch).",
    );
  }

  const statsLine = daily.split("\n").find((l) => l.trim().startsWith("const statsPath"));
  if (!statsLine?.includes("PlayerGroup")) {
    errs.push("run-daily-sync.ts: esperado const statsPath com PlayerGroup/statistics.");
  }
  if (statsLine && /Date:\d+D/i.test(statsLine)) {
    errs.push(
      "run-daily-sync.ts: statsPath PlayerGroup não deve incluir filtro Date:… na URL (lifetime).",
    );
  }

  if (
    !daily.includes("computeStatsFromRows(rows10d)") ||
    !daily.includes("computeStatsFromRows(rows30d)") ||
    !daily.includes("computeStatsFromRows(allRows)")
  ) {
    errs.push(
      "run-daily-sync.ts: esperado computeStatsFromRows(rows10d/rows30d/allRows) para janelas locais.",
    );
  }

  const pgStatsPaths = daily.match(/\/networks\/PlayerGroup\/players\/[^\s`]+\/statistics\//g) ?? [];
  if (pgStatsPaths.length < 1) {
    errs.push("run-daily-sync.ts: esperado pelo menos um path /networks/PlayerGroup/.../statistics/.");
  }

  if (errs.length) {
    console.error("verify-sharkscope-sync-footprint: falhou\n");
    for (const e of errs) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    "OK: footprint do sync (1× stats lifetime PlayerGroup + CT Date:90D + computeStatsFromRows local) verificado.",
  );
}

main();
