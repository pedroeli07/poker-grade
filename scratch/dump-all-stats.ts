import { prisma } from "@/lib/prisma";

async function main() {
  const c = await prisma.sharkScopeCache.findFirst({
    where: { dataType: "stats_30d", expiresAt: { gt: new Date() } },
    select: { rawData: true, playerNick: { select: { nick: true } } },
  });
  if (!c) { console.log("No cache found"); return; }
  
  console.log("Nick:", c.playerNick.nick);
  const raw = c.rawData as Record<string, any>;
  const st = raw?.Response?.PlayerResponse?.PlayerView?.PlayerGroup?.Statistics?.Statistic;
  
  if (st) {
     console.log(JSON.stringify(st, null, 2));
  } else {
     console.log("No statistics block found.");
  }
  
  await prisma.$disconnect();
}
main().catch(console.error);
