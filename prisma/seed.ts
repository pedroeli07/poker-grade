import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";

async function main() {
  const email =
    process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase().trim() ||
    "admin@clteam.com";
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "ChangeMeNow!123";

  const existing = await prisma.authUser.findUnique({ where: { email } });
  if (existing) {
    console.log("Seed: usuário admin já existe:", email);
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.authUser.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed: admin criado:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
