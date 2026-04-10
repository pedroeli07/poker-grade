import { prisma } from "@/lib/prisma";

async function main() {
  const nicks = await prisma.playerNick.findMany({
    where: { player: { name: 'Adriano' } },
    select: { id: true, nick: true, isActive: true, network: true }
  });
  console.log(JSON.stringify(nicks, null, 2));
  await prisma.$disconnect();
}
main().catch(console.error);
