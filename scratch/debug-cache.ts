import { prisma } from "@/lib/prisma";

async function main() {
  // Check what's inside a successful stats_10d cache (PlayerGroup summary)
  const c = await prisma.sharkScopeCache.findFirst({
    where: { dataType: "stats_10d", expiresAt: { gt: new Date() } },
    select: { rawData: true, playerNick: { select: { nick: true } } },
  });
  if (!c) { console.log("No cache found"); return; }
  
  console.log("Nick:", c.playerNick.nick);
  const raw = c.rawData as Record<string, unknown>;
  const resp = (raw.Response as Record<string, unknown>);
  const pr = (resp?.PlayerResponse as Record<string, unknown>);
  const pv = (pr?.PlayerView as Record<string, unknown>);
  console.log("PlayerView keys:", pv ? Object.keys(pv) : null);
  const pg = (pv?.PlayerGroup as Record<string, unknown>);
  console.log("PlayerGroup keys:", pg ? Object.keys(pg) : null);
  console.log("PlayerGroup @name:", pg?.["@name"]);
  // Look for Statistics anywhere
  const st = pg?.Statistics;
  console.log("PlayerGroup.Statistics:", JSON.stringify(st, null, 2));
  
  // Also check stats_30d
  const c2 = await prisma.sharkScopeCache.findFirst({
    where: { dataType: "stats_30d", expiresAt: { gt: new Date() } },
    select: { rawData: true, playerNick: { select: { nick: true } } },
  });
  if (c2) {
    const raw2 = c2.rawData as Record<string, unknown>;
    const pr2 = (((raw2.Response as Record<string,unknown>)?.PlayerResponse) as Record<string,unknown>);
    const pv2 = (pr2?.PlayerView as Record<string,unknown>);
    const pg2 = (pv2?.PlayerGroup as Record<string,unknown>);
    console.log("\n=== stats_30d Nick:", c2.playerNick.nick);
    console.log("PlayerGroup keys:", pg2 ? Object.keys(pg2) : null);
    const st2 = pg2?.Statistics;
    console.log("Statistics keys:", st2 && typeof st2 === "object" ? Object.keys(st2 as object) : st2);
    const statArr = (st2 as Record<string,unknown>)?.Statistic;
    console.log("Statistic (first 5):", JSON.stringify(Array.isArray(statArr) ? statArr.slice(0, 5) : statArr, null, 2));
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
