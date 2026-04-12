/**
 * Compara TotalROI PlayerGroup com e sem filtro Network (documentação SharkScope).
 *   npx tsx scratch/sharkscope-probe-network-filter.ts
 */
import "dotenv/config";
import { extractStat, sharkScopeResponseErrorMessage } from "@/lib/utils";
import {
  sharkScopeAppKey,
  sharkScopeAppName,
  sharkScopePasswordHash,
  sharkScopeUsername,
} from "@/lib/constants/env";
import crypto from "node:crypto";

function pwd() {
  return crypto
    .createHash("md5")
    .update(`${(sharkScopePasswordHash ?? "").toLowerCase()}${sharkScopeAppKey ?? ""}`)
    .digest("hex")
    .toLowerCase();
}

async function get(path: string) {
  const url = `https://www.sharkscope.com/api/${sharkScopeAppName}${path}`;
  const r = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "probe-network-filter",
      Username: sharkScopeUsername!,
      Password: pwd(),
    },
  });
  const text = await r.text();
  const data = JSON.parse(text) as unknown;
  const err = sharkScopeResponseErrorMessage(data);
  return { ok: r.ok, err, totalRoi: extractStat(data, "TotalROI"), status: r.status };
}

async function main() {
  const group = process.env.VERIFY_SHARKSCOPE_GROUP_NAME?.trim() || "Bruno Sampaio CL 2025";
  const enc = encodeURIComponent(group);
  const paths = [
    ["baseline Date:30D", `/networks/PlayerGroup/players/${enc}/statistics/TotalROI?filter=${encodeURIComponent("Date:30D")}`],
    ["Network:pokerstars (lower)", `/networks/PlayerGroup/players/${enc}/statistics/TotalROI?filter=${encodeURIComponent("Date:30D;Network:pokerstars")}`],
    ["Network:PokerStars", `/networks/PlayerGroup/players/${enc}/statistics/TotalROI?filter=${encodeURIComponent("Date:30D;Network:PokerStars")}`],
    ["Network:WPN", `/networks/PlayerGroup/players/${enc}/statistics/TotalROI?filter=${encodeURIComponent("Date:30D;Network:WPN")}`],
  ] as const;

  for (const [label, path] of paths) {
    try {
      const x = await get(path);
      console.log(label, x);
    } catch (e) {
      console.log(label, "THROW", e instanceof Error ? e.message : e);
    }
  }
}

main().catch(console.error);
