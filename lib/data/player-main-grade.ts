import { prisma } from "@/lib/prisma";

/**
 * Sincroniza a grade principal (PlayerGradeAssignment MAIN ativa).
 * Evita múltiplas linhas inativas com o mesmo (playerId, MAIN, isActive=false).
 */
export async function setPlayerMainGrade(
  playerId: string,
  gradeProfileId: string | null
): Promise<void> {
  const active = await prisma.playerGradeAssignment.findFirst({
    where: { playerId, gradeType: "MAIN", isActive: true },
  });

  const none =
    gradeProfileId == null ||
    gradeProfileId === "" ||
    gradeProfileId === "none";

  if (none) {
    if (active) {
      await prisma.playerGradeAssignment.update({
        where: { id: active.id },
        data: { isActive: false, removedAt: new Date() },
      });
    }
    return;
  }

  const grade = await prisma.gradeProfile.findUnique({
    where: { id: gradeProfileId },
    select: { id: true },
  });
  if (!grade) {
    throw new Error("GRADE_NOT_FOUND");
  }

  if (active) {
    if (active.gradeId === gradeProfileId) return;
    await prisma.playerGradeAssignment.update({
      where: { id: active.id },
      data: { gradeId: gradeProfileId },
    });
    return;
  }

  const inactive = await prisma.playerGradeAssignment.findFirst({
    where: { playerId, gradeType: "MAIN", isActive: false },
  });

  if (inactive) {
    await prisma.playerGradeAssignment.update({
      where: { id: inactive.id },
      data: {
        isActive: true,
        removedAt: null,
        gradeId: gradeProfileId,
        assignedAt: new Date(),
      },
    });
    return;
  }

  await prisma.playerGradeAssignment.create({
    data: {
      playerId,
      gradeId: gradeProfileId,
      gradeType: "MAIN",
      isActive: true,
      notes: "Grade principal definida no cadastro do jogador.",
    },
  });
}
