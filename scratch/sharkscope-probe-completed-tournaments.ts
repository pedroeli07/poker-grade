/**
 * Inspeciona o JSON de completedTournaments (Player Group) para ajustar collectTournamentNetworkHistogram.
 *
 *   npx tsx scratch/sharkscope-probe-completed-tournaments.ts
 *
 * Env: SHARKSCOPE_APP_NAME, SHARKSCOPE_APP_KEY, SHARKSCOPE_USERNAME, SHARKSCOPE_PASSWORD_HASH
 * Opcional: VERIFY_SHARKSCOPE_GROUP_NAME (default: Bruno Sampaio CL 2025)
 */
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { encodeSharkScopePassword, sharkScopeResponseErrorMessage } from "@/lib/utils/sharkscope-client";
import { extractRemainingSearches } from "@/lib/utils/sharkscope-extract";
import { sharkScopeAppKey, sharkScopeAppName, sharkScopePasswordHash, sharkScopeUsername } from "@/lib/constants/env";
import { collectTournamentNetworkHistogram } from "@/lib/sharkscope/playergroup-network-probe";

function apiBase(): string {
  const override = process.env.VERIFY_BASE_URL?.replace(/\/$/, "");
  if (override) return override;
  if (!sharkScopeAppName) throw new Error("SHARKSCOPE_APP_NAME ausente");
  return `https://www.sharkscope.com/api/${sharkScopeAppName}`;
}

function headers(): HeadersInit {
  if (!sharkScopeUsername || !sharkScopePasswordHash || !sharkScopeAppKey) {
    throw new Error("Credenciais SharkScope ausentes");
  }
  return {
    Accept: "application/json",
    "User-Agent": "CLTeamApp/1.0 (probe-ct)",
    Username: sharkScopeUsername,
    Password: encodeSharkScopePassword(),
  };
}

/** Coleta chaves que parecem rede / torneio em objetos folha (1 nível de profundidade útil). */
function sampleKeys(obj: unknown, depth = 0, out = new Set<string>()): Set<string> {
  if (depth > 12 || obj === null || obj === undefined) return out;
  if (Array.isArray(obj)) {
    if (obj.length > 0) sampleKeys(obj[0], depth + 1, out);
    return out;
  }
  if (typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out.add(k);
    if (typeof v === "object" && v !== null && !Array.isArray(v) && depth < 4) {
      sampleKeys(v, depth + 1, out);
    }
  }
  return out;
}

async function main() {
  const groupName = process.env.VERIFY_SHARKSCOPE_GROUP_NAME?.trim() || "Bruno Sampaio CL 2025";
  const enc = encodeURIComponent(groupName);
  const path = `/networks/PlayerGroup/players/${enc}/completedTournaments?order=Last,1~100&filter=${encodeURIComponent("Date:30D")}`;
  const url = `${apiBase()}${path}`;

  console.log("GET", url);
  const res = await fetch(url, { headers: headers() });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    console.error("Não-JSON:", text.slice(0, 600));
    process.exit(1);
  }
  if (!res.ok) {
    console.error("HTTP", res.status, text.slice(0, 800));
    process.exit(1);
  }
  const err = sharkScopeResponseErrorMessage(data);
  if (err) {
    console.error("API error:", err);
    process.exit(1);
  }

  const rem = extractRemainingSearches(data);
  if (rem !== null) console.log("RemainingSearches:", rem);

  const keys = [...sampleKeys(data)].sort();
  console.log("Chaves amostradas (parcial):", keys.slice(0, 60).join(", "), keys.length > 60 ? "..." : "");

  const hist = collectTournamentNetworkHistogram(data);
  console.log("Histograma (collectTournamentNetworkHistogram):", Object.fromEntries(hist));
  console.log("Total contagens:", [...hist.values()].reduce((a, b) => a + b, 0));

  if (process.env.DUMP === "1" || process.env.DUMP === "true") {
    const dumpPath = join(process.cwd(), "scratch", "sharkscope-completed-tournaments-sample.json");
    writeFileSync(dumpPath, JSON.stringify(data, null, 2), "utf8");
    console.log("Dump completo:", dumpPath);
  } else {
    console.log("Para gravar JSON em scratch/, rode com DUMP=1");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
