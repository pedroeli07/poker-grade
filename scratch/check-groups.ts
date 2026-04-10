import { prisma } from "@/lib/prisma";

async function main() {
  const nicks = await prisma.playerNick.findMany({
    where: { network: 'PlayerGroup' },
    select: { id: true, nick: true, isActive: true, playerId: true, player: { select: { name: true } } }
  });
  console.log(JSON.stringify(nicks, null, 2));
  await prisma.$disconnect();
}
main().catch(console.error);
