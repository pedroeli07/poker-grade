/**
 * Lista os 49 PlayerStatisticDefinition do GET /metadata (custo 0).
 *   npx tsx scratch/sharkscope-probe-metadata.ts
 */
import "dotenv/config";
import crypto from "node:crypto";
import {
  sharkScopeAppKey,
  sharkScopeAppName,
  sharkScopePasswordHash,
  sharkScopeUsername,
} from "@/lib/constants/env";

function encodePwd() {
  return crypto
    .createHash("md5")
    .update(`${(sharkScopePasswordHash ?? "").toLowerCase()}${sharkScopeAppKey ?? ""}`)
    .digest("hex")
    .toLowerCase();
}

async function main() {
  const url = `https://www.sharkscope.com/api/${sharkScopeAppName}/metadata`;
  const r = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "probe",
      Username: sharkScopeUsername!,
      Password: encodePwd(),
    },
  });
  const j = (await r.json()) as {
    Response: {
      MetadataResponse: {
        PlayerStatisticsDefinitions: { PlayerStatisticDefinition: Record<string, string>[] };
      };
    };
  };
  const arr = j.Response.MetadataResponse.PlayerStatisticsDefinitions.PlayerStatisticDefinition;
  for (const x of arr) {
    console.log(`${x["@id"]}\t${x["@name"] ?? ""}`);
  }
}

main().catch(console.error);
