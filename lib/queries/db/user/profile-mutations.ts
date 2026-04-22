"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { userQueriesLog } from "@/lib/constants/queries-mutations";
import { ErrorTypes } from "@/lib/types/primitives";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function updateProfile(data: {
  displayName?: string;
  whatsapp?: string;
  discord?: string;
}) {
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  if (!session) return { error: ErrorTypes.FORBIDDEN };

  try {
    await prisma.authUser.update({
      where: { id: session.userId },
      data: {
        displayName: data.displayName,
        whatsapp: data.whatsapp,
        discord: data.discord,
      },
    });
    revalidatePath("/admin/meu-perfil");
    revalidatePath("/admin/usuarios");
    return { success: true as const };
  } catch (e) {
    userQueriesLog.error("updateProfile", e instanceof Error ? e : undefined);
    return { error: "Falha ao atualizar o perfil." };
  }
}

export async function updateAvatar(dataUrl: string | null) {
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  if (!session) return { error: ErrorTypes.FORBIDDEN };

  if (dataUrl !== null) {
    const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
    if (!match) return { error: "Imagem inválida." };
    const mime = match[1].toLowerCase();
    if (!ALLOWED_AVATAR_MIME.has(mime)) return { error: "Formato não suportado (use PNG, JPEG, WebP ou GIF)." };
    const approxBytes = Math.floor((match[2].length * 3) / 4);
    if (approxBytes > MAX_AVATAR_BYTES) return { error: "Imagem muito grande (máx. 2MB)." };
  }

  try {
    await prisma.authUser.update({
      where: { id: session.userId },
      data: { avatarUrl: dataUrl },
    });
    revalidatePath("/admin/meu-perfil");
    return { success: true as const };
  } catch (e) {
    userQueriesLog.error("updateAvatar", e instanceof Error ? e : undefined);
    return { error: "Falha ao atualizar o avatar." };
  }
}
