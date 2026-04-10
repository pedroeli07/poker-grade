import * as crypto from "crypto";

const sharkScopeAppName = "clteam";
const sharkScopeAppKey = "fe64d2eb59";
const sharkScopePasswordHash = "d490cbdadae5f367541267493a186877";
const sharkScopeUsername = "carlosvribeiro0@gmail.com";

function encodeSharkScopePassword(): string {
  const combined = sharkScopePasswordHash.toLowerCase() + sharkScopeAppKey;
  return crypto.createHash("md5").update(combined).digest("hex").toLowerCase();
}

export const sharkScopeHeaders = (): HeadersInit => ({
  Accept: "application/json",
  "User-Agent": "CLTeamApp/1.0",
  Username: sharkScopeUsername,
  Password: encodeSharkScopePassword(),
});

async function main() {
  const groupName = "adriano silva cl 2025";
  const url = `https://www.sharkscope.com/api/${sharkScopeAppName}/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/AvROI,Count,FinshesEarly,FinshesLate?filter=Date:10D`;
  console.log(`URL: ${url}`);
  try {
    const r = await fetch(url, { headers: sharkScopeHeaders() });
    if (r.ok) {
        const j = await r.json();
        const stats = j?.Response?.PlayerResponse?.PlayerView?.PlayerGroup?.Statistics?.Statistic;
        console.log(JSON.stringify(stats, null, 2));
    } else {
        console.log("Failed (HTTP)", r.status);
    }
  } catch (e) {
    console.error(e);
  }
}

main().catch(console.error);
