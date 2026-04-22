import "dotenv/config";
import crypto from "node:crypto";
import { extractStat } from "@/lib/utils/sharkscope-extract";
import { sharkScopeResponseErrorMessage } from "@/lib/utils/sharkscope-client";
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
  const group = "Bruno Sampaio CL 2025";
  const filter = process.argv[2] ?? "Date:30D";
  const stats =
    "Count,Entries,TotalROI,AvROI,ITM,Profit,TotalProfit,TotalStake,AvStake,FinshesEarly,FinshesLate";
  const path = `/networks/PlayerGroup/players/${encodeURIComponent(group)}/statistics/${stats}?filter=${encodeURIComponent(filter)}`;
  const url = `https://www.sharkscope.com/api/${sharkScopeAppName}${path}`;
  const r = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "probe",
      Username: sharkScopeUsername!,
      Password: encodePwd(),
    },
  });
  const data = JSON.parse(await r.text()) as unknown;
  const err = sharkScopeResponseErrorMessage(data);
  if (err) throw new Error(err);
  for (const s of stats.split(",")) {
    console.log(s, extractStat(data, s));
  }
}

main().catch(console.error);
