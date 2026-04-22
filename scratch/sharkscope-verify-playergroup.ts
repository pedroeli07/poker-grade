/**
 * Verificação pontual da API SharkScope (Player Group) — sem Prisma/cache.
 *
 * ## Executar (raiz do repo)
 *   npx tsx scratch/sharkscope-verify-playergroup.ts
 *
 * ## Variáveis de ambiente (.env)
 * - SHARKSCOPE_APP_NAME, SHARKSCOPE_APP_KEY, SHARKSCOPE_USERNAME, SHARKSCOPE_PASSWORD_HASH (obrigatórias)
 * - VERIFY_SHARKSCOPE_GROUP_NAME — nome do grupo (default: Bruno Sampaio CL 2025)
 * - VERIFY_BASE_URL — base da API, ex. https://www.sharkscope.com/api/seuapp (default: deriva de SHARKSCOPE_APP_NAME)
 * - VERIFY_SCENARIOS — lista separada por vírgula de ids de cenário (default: todos). Ex.: baseline,bounty_site
 * - VERIFY_APPEND_QUERY — sufixo extra na query string, ex. groupsExcludeOptedOut=true&groupsExcludeNotOptedIn=true
 *
 * ## Cota / custo
 * Cada cenário = 1 GET à API (statistics). Confira RemainingSearches no log após cada chamada.
 *
 * ## Interpretação
 * - bounty_site / nonbounty_site espelham filtros do site (Type B, BJ, MB, PB).
 * - bounty_app / vanilla_app / satellite_app espelham o que o cron grava hoje (ver lib/constants/sharkscope/type-filters.ts).
 * Se baseline e site baterem mas app não, o desvio do dashboard vem dos filtros Type, não da API bruta.
 *
 * ## IDs oficiais (GET /metadata → PlayerStatisticsDefinitions)
 * - **Entries** — inscrições (cada linha do CSV export / reentrada conta), como a coluna do site.
 * - **Count** — torneios agregados (multi-entry combinado por torneio); por isso Count < Entries.
 * - **TotalROI** — coluna "ROI tot." da pesquisa avançada (não confundir com **AvROI** = ROI médio).
 * - **ITM** — ITM% do site.
 * - **Ability** — Capacidade na UI; id oficial em metadata (não usar AvAbility).
 * Lista completa (metadata, grátis): `npx tsx scratch/sharkscope-probe-metadata.ts`
 *
 * ## Derivação temporal
 * Lucro e Entries podem mudar alguns pontos entre o dia da sua anotação e a execução; o comparativo usa
 * tolerâncias pequenas em lucro/entradas.
 */

import "dotenv/config";

import { encodeSharkScopePassword, sharkScopeResponseErrorMessage } from "@/lib/utils/sharkscope-client";
import { extractRemainingSearches, extractStat } from "@/lib/utils/sharkscope-extract";
import { parseSharkscopeStatisticNode } from "@/lib/sharkscope-stat-scan";
import {
  sharkScopeAppKey,
  sharkScopeAppName,
  sharkScopePasswordHash,
  sharkScopeUsername,
} from "@/lib/constants/env";

// --- Valores da sua pesquisa manual (últimos 30d) — comparados às stats Entries, TotalROI, ITM da API ---
const MANUAL_EXPECT: Record<
  string,
  Partial<{
    entries: number;
    profit: number;
    roiTotalPct: number;
    itm: number;
    early: number;
    late: number;
  }>
> = {
  baseline: { entries: 1196, profit: 2372, roiTotalPct: 4.5, itm: 20.5, early: 6.5, late: 8.8 },
  bounty_site: { entries: 813, profit: -90.15, roiTotalPct: -0.2, itm: 22, early: 3.9, late: 9.6 },
  nonbounty_site: { entries: 383, profit: 2462, roiTotalPct: 15.2, itm: 17.3, early: 9.4, late: 7.9 },
};

const SCENARIOS = [
  { id: "baseline", label: "30d agregado (site)", filter: "Date:30D" },
  { id: "bounty_site", label: "Bounty como no site (B,BJ,MB,PB)", filter: "Date:30D;Type:B,BJ,MB,PB" },
  { id: "nonbounty_site", label: "Exclui bounty como no site", filter: "Date:30D;Type!:B,BJ,MB,PB" },
  { id: "bounty_app", label: "Bounty como no app hoje ( só Type:B )", filter: "Date:30D;Type:B" },
  { id: "vanilla_app", label: "Vanilla como no app (Type!:B;Type!:SAT)", filter: "Date:30D;Type!:B;Type!:SAT" },
  { id: "satellite_app", label: "Satélite como no app (Type:SAT)", filter: "Date:30D;Type:SAT" },
] as const;

/** Stats alinhadas ao site/CSV: Entries, TotalROI, ITM. Profit duplicado para compat com extractStat TotalProfit. */
const STAT_SEGMENT =
  "Entries,Count,TotalROI,AvROI,ITM,TotalProfit,Profit,NetProfit,TotalProfitUSD,TotalStake,AvStake,Ability,AvEntrants,FinshesEarly,FinshesLate,Entrants";

function sharkScopeHeaders(): HeadersInit {
  if (!sharkScopeUsername || !sharkScopePasswordHash || !sharkScopeAppKey) {
    throw new Error(
      "Credenciais SharkScope ausentes: SHARKSCOPE_USERNAME, SHARKSCOPE_PASSWORD_HASH, SHARKSCOPE_APP_KEY"
    );
  }
  return {
    Accept: "application/json",
    "User-Agent": "CLTeamApp/1.0 (verify-script)",
    Username: sharkScopeUsername,
    Password: encodeSharkScopePassword(),
  };
}

function apiBase(): string {
  const override = process.env.VERIFY_BASE_URL?.replace(/\/$/, "");
  if (override) return override;
  if (!sharkScopeAppName) throw new Error("SHARKSCOPE_APP_NAME ausente");
  return `https://www.sharkscope.com/api/${sharkScopeAppName}`;
}

function buildStatisticsPath(groupName: string, filterBody: string): string {
  const encodedNick = encodeURIComponent(groupName);
  const params = new URLSearchParams();
  params.set("filter", filterBody);
  const extra = process.env.VERIFY_APPEND_QUERY?.replace(/^\?/, "").trim();
  const qs = extra ? `${params.toString()}&${extra}` : params.toString();
  return `/networks/PlayerGroup/players/${encodedNick}/statistics/${STAT_SEGMENT}?${qs}`;
}

function publicUrl(path: string): string {
  return `${apiBase()}${path}`;
}

async function sharkScopeFetchJson(path: string): Promise<unknown> {
  const url = publicUrl(path);
  const res = await fetch(url, { headers: sharkScopeHeaders() });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Resposta não-JSON (HTTP ${res.status}): ${text.slice(0, 500)}`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 800)}`);
  }
  const err = sharkScopeResponseErrorMessage(data);
  if (err) throw new Error(err);
  return data;
}

type StatDumpRow = { id: string; name?: string; value: string };

/** Lista nós que parecem estatísticas (para achar ITM, ROI total, etc.). */
function dumpStatisticLikeNodes(obj: unknown, out: StatDumpRow[]): void {
  if (obj === null || obj === undefined) return;
  if (Array.isArray(obj)) {
    for (const x of obj) dumpStatisticLikeNodes(x, out);
    return;
  }
  if (typeof obj !== "object") return;
  const rec = obj as Record<string, unknown>;
  const idRaw = rec["@id"] ?? rec["@name"] ?? rec.id ?? rec.name;
  if (typeof idRaw === "string" && idRaw.length > 0) {
    const n = parseSharkscopeStatisticNode(rec);
    if (n !== null) {
      const name = typeof rec["@name"] === "string" ? rec["@name"] : undefined;
      out.push({ id: idRaw, name, value: String(n) });
    }
  }
  for (const v of Object.values(rec)) dumpStatisticLikeNodes(v, out);
}

function uniqueDump(rows: StatDumpRow[]): StatDumpRow[] {
  const seen = new Set<string>();
  const r: StatDumpRow[] = [];
  for (const row of rows) {
    const k = `${row.id}|${row.value}`;
    if (seen.has(k)) continue;
    seen.add(k);
    r.push(row);
  }
  r.sort((a, b) => a.id.localeCompare(b.id));
  return r;
}

function roiTotalFromProfitStake(profit: number | null, totalStake: number | null): number | null {
  if (profit === null || totalStake === null || totalStake === 0) return null;
  return (100 * profit) / totalStake;
}

/** Quando TotalStake não vem no JSON do grupo, espelha o site: ROI tot. ≈ lucro / (inscrições × stake médio). */
function roiTotalFromEntriesStake(
  profit: number | null,
  entries: number | undefined,
  avStake: number | null
): number | null {
  if (profit === null || entries === undefined || entries <= 0 || avStake === null || avStake === 0)
    return null;
  return (100 * profit) / (entries * avStake);
}

function logMetricBlock(scenarioId: string, title: string, raw: unknown) {
  const entries = extractStat(raw, "Entries");
  const count = extractStat(raw, "Count");
  const totalRoi = extractStat(raw, "TotalROI");
  const itm = extractStat(raw, "ITM");
  const profit = extractStat(raw, "TotalProfit");
  const totalStake = extractStat(raw, "TotalStake");
  const avroi = extractStat(raw, "AvROI");
  const stake = extractStat(raw, "AvStake");
  const early = extractStat(raw, "EarlyFinish");
  const late = extractStat(raw, "LateFinish");
  const avEntrants = extractStat(raw, "AvEntrants");
  const entrants = extractStat(raw, "Entrants");
  const roiFromStake = roiTotalFromProfitStake(profit, totalStake);
  const exp = MANUAL_EXPECT[scenarioId];
  const roiMirror =
    totalRoi === null && roiFromStake === null
      ? roiTotalFromEntriesStake(profit, exp?.entries, stake)
      : null;

  console.log(`  ${title}`);
  console.log(`    Entries ......... ${entries ?? "—"}  (inscrições = linhas no CSV export)`);
  console.log(`    Count ........... ${count ?? "—"}  (torneios agregados SharkScope)`);
  console.log(`    TotalROI ........ ${totalRoi ?? "—"}%  (coluna "ROI tot." do site)`);
  console.log(`    ITM ............. ${itm ?? "—"}%`);
  console.log(`    TotalProfit ..... ${profit ?? "—"}`);
  console.log(`    TotalStake ...... ${totalStake ?? "—"}`);
  if (roiFromStake !== null) {
    console.log(`    ROI (P/Stake) ... ${roiFromStake.toFixed(2)}%  (100×Profit/TotalStake, se existir)`);
  }
  if (roiMirror !== null) {
    console.log(`    ROI espelho ..... ${roiMirror.toFixed(2)}%  (fallback: Profit/(entries_ref×AvStake))`);
  }
  console.log(`    AvROI ........... ${avroi ?? "—"}%  (ROI médio — métrica diferente de TotalROI)`);
  console.log(`    AvStake ......... ${stake ?? "—"}`);
  console.log(`    EarlyFinish ..... ${early ?? "—"}`);
  console.log(`    LateFinish ...... ${late ?? "—"}`);
  console.log(`    AvEntrants ...... ${avEntrants ?? "—"}`);
  console.log(`    Entrants ........ ${entrants ?? "—"}`);
}

function approxEq(a: number | null, b: number, tol: number): boolean {
  if (a === null || a === undefined) return false;
  return Math.abs(a - b) <= tol;
}

function compareToManual(scenarioId: string, raw: unknown) {
  const exp = MANUAL_EXPECT[scenarioId];
  if (!exp) return;

  const entries = extractStat(raw, "Entries");
  const profit = extractStat(raw, "TotalProfit");
  const totalStake = extractStat(raw, "TotalStake");
  const avStake = extractStat(raw, "AvStake");
  const totalRoiApi = extractStat(raw, "TotalROI");
  const roiFromStake = roiTotalFromProfitStake(profit, totalStake);
  const roiFallback =
    totalRoiApi ?? roiFromStake ?? roiTotalFromEntriesStake(profit, exp.entries, avStake);
  const itm = extractStat(raw, "ITM");
  const early = extractStat(raw, "EarlyFinish");
  const late = extractStat(raw, "LateFinish");

  const lines: string[] = [];
  const entryTol = 6;
  const profitTol = 18;

  if (exp.entries !== undefined) {
    if (entries !== null && approxEq(entries, exp.entries, entryTol)) {
      lines.push(`    ✓ Entries (inscrições) ~ ${exp.entries}`);
    } else {
      lines.push(`    ✗ Entries: API=${entries} esperado≈${exp.entries} (tol ±${entryTol}; deriva de data/filtro)`);
    }
  }
  if (exp.profit !== undefined) {
    lines.push(
      approxEq(profit, exp.profit, profitTol)
        ? `    ✓ TotalProfit ~ ${exp.profit}`
        : `    ✗ TotalProfit: API=${profit} esperado≈${exp.profit} (tol ±${profitTol})`
    );
  }
  if (exp.roiTotalPct !== undefined) {
    if (roiFallback !== null) {
      const src = totalRoiApi !== null ? "TotalROI" : roiFromStake !== null ? "Profit/TotalStake" : "espelho P/(E×AvStake)";
      const tol = totalRoiApi !== null ? 0.12 : roiFromStake !== null ? 0.35 : 1.5;
      lines.push(
        approxEq(roiFallback, exp.roiTotalPct, tol)
          ? `    ✓ ROI tot. (${src}) ~ ${exp.roiTotalPct}%`
          : `    ✗ ROI tot. (${src}): API=${roiFallback.toFixed(2)}% esperado≈${exp.roiTotalPct}%`
      );
    } else {
      lines.push(`    ✗ ROI tot.: TotalROI ausente e sem fallback`);
    }
  }
  if (exp.itm !== undefined) {
    lines.push(
      approxEq(itm, exp.itm, 0.35)
        ? `    ✓ ITM ~ ${exp.itm}%`
        : `    ✗ ITM: API=${itm} esperado≈${exp.itm}%`
    );
  }
  if (exp.early !== undefined) {
    lines.push(
      approxEq(early, exp.early, 0.35)
        ? `    ✓ EarlyFinish ~ ${exp.early}%`
        : `    ✗ EarlyFinish: API=${early} esperado≈${exp.early}%`
    );
  }
  if (exp.late !== undefined) {
    lines.push(
      approxEq(late, exp.late, 0.35)
        ? `    ✓ LateFinish ~ ${exp.late}%`
        : `    ✗ LateFinish: API=${late} esperado≈${exp.late}%`
    );
  }

  if (lines.length) {
    console.log("  Comparativo manual:");
    for (const L of lines) console.log(L);
  }
}

function parseScenarioFilter(): Set<string> | null {
  const raw = process.env.VERIFY_SCENARIOS?.trim();
  if (!raw) return null;
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set(ids);
}

async function main() {
  if (!sharkScopeAppName) {
    console.error("SHARKSCOPE_APP_NAME ausente no .env");
    process.exit(1);
  }

  const groupName =
    process.env.VERIFY_SHARKSCOPE_GROUP_NAME?.trim() || "Bruno Sampaio CL 2025";

  const wanted = parseScenarioFilter();
  const toRun = SCENARIOS.filter((s) => !wanted || wanted.has(s.id));

  if (toRun.length === 0) {
    console.error(
      "Nenhum cenário selecionado. IDs válidos:",
      SCENARIOS.map((s) => s.id).join(", ")
    );
    process.exit(1);
  }

  if (wanted) {
    const invalid = [...wanted].filter((id) => !SCENARIOS.some((s) => s.id === id));
    if (invalid.length) {
      console.warn("VERIFY_SCENARIOS: ids desconhecidos (ignorados):", invalid.join(", "));
    }
  }

  console.log("=== SharkScope verify (PlayerGroup) ===");
  console.log("Grupo:", groupName);
  console.log("Base URL:", apiBase());
  console.log("Cenários:", toRun.map((s) => s.id).join(", "));
  console.log("");

  let firstDone = false;
  let lastRemaining: number | null = null;

  for (const scenario of toRun) {
    const path = buildStatisticsPath(groupName, scenario.filter);
    console.log(`--- [${scenario.id}] ${scenario.label} ---`);
    console.log("filter:", scenario.filter);
    console.log("GET (sem credenciais):", publicUrl(path));

    try {
      const raw = await sharkScopeFetchJson(path);
      const rem = extractRemainingSearches(raw);
      if (rem !== null) {
        if (lastRemaining !== null) console.log("RemainingSearches (antes≈última resposta):", lastRemaining);
        console.log("RemainingSearches (esta resposta):", rem);
        lastRemaining = rem;
      }

      logMetricBlock(scenario.id, "Métricas (extractStat)", raw);
      compareToManual(scenario.id, raw);

      if (!firstDone) {
        firstDone = true;
        const rows: StatDumpRow[] = [];
        dumpStatisticLikeNodes(raw, rows);
        const uniq = uniqueDump(rows);
        console.log(`  Dump de nós com @id/@name e valor (1º cenário, ${uniq.length} entradas únicas):`);
        const max = Math.min(uniq.length, 80);
        for (let i = 0; i < max; i++) {
          const r = uniq[i]!;
          const nm = r.name && r.name !== r.id ? ` name=${r.name}` : "";
          console.log(`    ${r.id}${nm} => ${r.value}`);
        }
        if (uniq.length > max) console.log(`    ... (${uniq.length - max} omitidos; aumente o script se precisar)`);
      }

      console.log("");
    } catch (e) {
      console.error(`  ERRO [${scenario.id}]:`, e instanceof Error ? e.message : e);
      console.log("");
    }
  }

  console.log("=== Resumo ===");
  console.log("• API: Entries=inscrições (CSV); Count=torneios agregados; TotalROI=ROI tot.; ITM=ITM%; AvROI=ROI médio.");
  console.log("• bounty_site vs bounty_app: se idênticos, Type:B equivale a B,BJ,MB,PB neste grupo.");
  console.log("• vanilla_app vs nonbounty_site: diferenças vêm de excluir SAT no vanilla e do recorte de bounty.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
