import { prisma } from "@/lib/prisma";

export const ABI_ALVO_TARGET_NAME = "ABI alvo";

export function isAbiAlvoTargetName(name: string): boolean {
  return /\babi\b/i.test(name.trim());
}

export function parseAbiAlvoInput(
  valueRaw: string | undefined | null,
  unitRaw: string | undefined | null
):
  | { ok: true; value: number | null; unit: string | null }
  | { ok: false; message: string } {
  const v = String(valueRaw ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");
  const u = String(unitRaw ?? "").trim();
  const unit = u === "" || u === "none" ? null : u.slice(0, 30);
  if (v === "") {
    return { ok: true, value: null, unit: null };
  }
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) {
    return { ok: false, message: "ABI alvo inválido." };
  }
  return { ok: true, value: n, unit };
}

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
