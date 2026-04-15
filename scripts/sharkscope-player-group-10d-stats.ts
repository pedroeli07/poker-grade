/**
 * Uma chamada à API SharkScope: estatísticas do Player Group nos últimos 10 dias
 * (TotalROI, finalização precoce / tardia — EarlyFinish & LateFinish na API).
 *
 * O jogador no SharkScope é identificado pelo **nome do grupo** (campo `playerGroup` no app),
 * ex.: joaofwebber_ para João Weber.
 *
 * Uso:
 *   npx tsx scripts/sharkscope-player-group-10d-stats.ts
 *   npx tsx scripts/sharkscope-player-group-10d-stats.ts joaofwebber_
 *   npx tsx scripts/sharkscope-player-group-10d-stats.ts --group "nome do grupo"
 *
 * Requer: SHARKSCOPE_APP_NAME, SHARKSCOPE_APP_KEY, SHARKSCOPE_USERNAME, SHARKSCOPE_PASSWORD_HASH
 */
import "dotenv/config";

import { sharkScopeAppKey, sharkScopeAppName } from "@/lib/constants";
import { extractStat } from "@/lib/sharkscope-parse";
import { sharkScopeGet } from "@/lib/utils";

function parseArgs(): string {
  const argv = process.argv.slice(2);
  let group: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--group" && argv[i + 1]) {
      group = argv[++i]!;
    } else if (a && !a.startsWith("-") && group === undefined) {
      group = a;
    }
  }
  return (group ?? "joaofwebber_").trim();
}

async function main() {
  const groupName = parseArgs();

  if (!sharkScopeAppName) {
    console.error("Defina SHARKSCOPE_APP_NAME no .env");
    process.exit(1);
  }

  if (!sharkScopeAppKey) {
    console.error("Defina SHARKSCOPE_APP_KEY no .env");
    process.exit(1);
  }

  const enc = encodeURIComponent(groupName);
  const path = `/networks/PlayerGroup/players/${enc}/statistics/TotalROI,AvROI,FinshesEarly,FinshesLate,Entries,Count?filter=${encodeURIComponent("Date:10D")}`;

  console.log("GET", path);
  console.log("Grupo (PlayerGroup):", groupName);
  console.log("Janela: últimos 10 dias (Date:10D)\n");

  const raw = await sharkScopeGet(path);

  const totalRoi = extractStat(raw, "TotalROI");
  const avRoi = extractStat(raw, "AvROI");
  const early = extractStat(raw, "EarlyFinish");
  const late = extractStat(raw, "LateFinish");
  const entries = extractStat(raw, "Entries");
  const count = extractStat(raw, "Count");

  console.log("— Resultado (API) —");
  console.log(`  Total ROI % (10d):     ${totalRoi != null ? totalRoi.toFixed(2) : "—"}`);
  console.log(`  AvROI % (10d):         ${avRoi != null ? avRoi.toFixed(2) : "—"}`);
  console.log(`  Finalização precoce %: ${early != null ? early.toFixed(2) : "—"}  (EarlyFinish)`);
  console.log(`  Finalização tardia %:  ${late != null ? late.toFixed(2) : "—"}  (LateFinish)`);
  console.log(`  Entries / Count:       ${entries ?? "—"} / ${count ?? "—"}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
