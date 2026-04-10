import { prisma } from "@/lib/prisma";

async function main() {
  const r10 = await prisma.sharkScopeCache.deleteMany({
    where: { dataType: "stats_10d" },
  });
  console.log(`Deleted ${r10.count} caches for 10D`);
  
  const r30 = await prisma.sharkScopeCache.deleteMany({
      where: { dataType: "stats_30d" },
  });
  console.log(`Deleted ${r30.count} caches for 30D`);

  await prisma.$disconnect();
}

main().catch(console.error);
