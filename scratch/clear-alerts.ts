import { prisma } from "@/lib/prisma";

async function main() {
  const alerts = await prisma.alertLog.findMany({ select: { alertType: true } });
  console.log("Types:", new Set(alerts.map(a => a.alertType)));
  await prisma.alertLog.deleteMany({});
  console.log("Deleted all alerts to reset state");
  await prisma.$disconnect();
}
main().catch(console.error);
