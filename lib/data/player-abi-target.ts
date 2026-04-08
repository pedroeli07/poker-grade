import { prisma } from "@/lib/prisma";
import { ABI_ALVO_TARGET_NAME } from "@/lib/constants";
import { isAbiAlvoTargetName } from "@/lib/utils";

export async function syncPlayerAbiAlvoTarget(
  playerId: string,
  value: number | null,
  unit: string | null
): Promise<void> {
  const activeAbis = (
    await prisma.playerTarget.findMany({
      where: { playerId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
  ).filter((t) => isAbiAlvoTargetName(t.name));

  if (value == null) {
    if (activeAbis.length === 0) return;
    await prisma.playerTarget.updateMany({
      where: { id: { in: activeAbis.map((r) => r.id) } },
      data: { isActive: false },
    });
    return;
  }

  const primary = activeAbis[0];
  if (primary) {
    await prisma.playerTarget.update({
      where: { id: primary.id },
      data: {
        name: ABI_ALVO_TARGET_NAME,
        category: "performance",
        targetType: "NUMERIC",
        numericValue: value,
        unit: unit ?? null,
        numericCurrent:
          primary.numericCurrent != null ? primary.numericCurrent : value,
      },
    });
    const extraIds = activeAbis.slice(1).map((r) => r.id);
    if (extraIds.length > 0) {
      await prisma.playerTarget.updateMany({
        where: { id: { in: extraIds } },
        data: { isActive: false },
      });
    }
    return;
  }

  await prisma.playerTarget.create({
    data: {
      playerId,
      name: ABI_ALVO_TARGET_NAME,
      category: "performance",
      targetType: "NUMERIC",
      numericValue: value,
      numericCurrent: value,
      unit: unit ?? null,
      status: "ATTENTION",
      isActive: true,
    },
  });
}
