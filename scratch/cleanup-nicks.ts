import { prisma } from "@/lib/prisma";

async function main() {
  const r = await prisma.playerNick.deleteMany({ where: { network: "Player Groups" } });
  console.log("Deleted stale 'Player Groups' nicks:", r.count);
  await prisma.$disconnect();
}

main().catch(console.error);
