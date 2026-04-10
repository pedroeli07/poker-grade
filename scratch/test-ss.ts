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
  const groupName = "Fabiano CL 2022";
  const url = `https://www.sharkscope.com/api/${sharkScopeAppName}/networks/PlayerGroup/players/${encodeURIComponent(groupName)}/statistics/AvROI,Count,TotalProfit,AvStake,EarlyFinish,LateFinish?filter=Class:SCHEDULED;Date:30D`;
  console.log(`URL: ${url}`);
  try {
    const r = await fetch(url, { headers: sharkScopeHeaders() });
    if (r.ok) {
        const j = await r.json();
        console.log(JSON.stringify(j, null, 2));
    } else {
        console.log("Failed (HTTP)", r.status);
    }
  } catch (e) {
    console.error(e);
  }
}

main().catch(console.error);
