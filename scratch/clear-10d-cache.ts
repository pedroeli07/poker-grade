import { prisma } from "@/lib/prisma";

async function main() {
  const r = await prisma.sharkScopeCache.deleteMany({
    where: { dataType: "stats_10d" },
  });
  console.log("Deleted stats_10d cache rows:", r.count);
  await prisma.$disconnect();
}

main().catch(console.error);
