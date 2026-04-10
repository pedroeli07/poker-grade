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
  const url = `https://www.sharkscope.com/api/${sharkScopeAppName}/metadata`;
  try {
    const r = await fetch(url, { headers: sharkScopeHeaders() });
    if (r.ok) {
      const j = await r.json();
      const meta = j.Response.MetadataResponse;
      console.log("Keys in MetadataResponse:", Object.keys(meta));
      if (meta.PlayerStatisticsDefinitions) {
          const stats = meta.PlayerStatisticsDefinitions.PlayerStatisticDefinition;
          const relevant = stats.filter((s: any) => 
            s["@name"].toLowerCase().includes("finish") || 
            s["@id"].toLowerCase().includes("finish")
          );
          console.log("Relevant Stats:", JSON.stringify(relevant, null, 2));
      }
    } else {
      console.log("Failed (HTTP)", r.status);
    }
  } catch (e) {
    console.error(e);
  }
}

main().catch(console.error);
