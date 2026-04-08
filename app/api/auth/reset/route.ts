import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { clientIp, assertSameOrigin } from "@/lib/api/origin";
import { limitRegister } from "@/lib/rate-limit";
import { createLogger } from "@/lib/logger";

const log = createLogger("auth.reset");

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = clientIp(request);
  const rl = await limitRegister(ip); 
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    const first = z.flattenError(parsed.error).fieldErrors;
    const msg =
      first.newPassword?.[0] ||
      first.code?.[0] ||
      first.email?.[0] ||
      "Dados inválidos.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { email, code, newPassword } = parsed.data;

  // 1. Procurar o Token de OTP
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: { email, type: "RESET" },
    orderBy: { createdAt: "desc" },
  });

  if (!tokenRecord || tokenRecord.code !== code) {
    return NextResponse.json({ error: "Código de redefinição inválido ou incorreto." }, { status: 400 });
  }

  if (new Date() > tokenRecord.expiresAt) {
    return NextResponse.json({ error: "O código expirou. Solicite um novo." }, { status: 400 });
  }

  // 2. Hash da nova senha
  const passwordHash = await hashPassword(newPassword);

  // 3. Atualizar usuário
  try {
    // Usamos updateMany porque pode dar throw de RecordNotFound no findUnique
    const updateResult = await prisma.authUser.updateMany({
      where: { email },
      data: { passwordHash },
    });

    if (updateResult.count === 0) {
       return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // 4. Apagar o token/outros tokens deste tipo
    await prisma.verificationToken.deleteMany({
      where: { email, type: "RESET" },
    });

    log.info("Senha redefinida com sucesso via OTP", { email });

    return NextResponse.json({ ok: true, redirect: "/login" });
  } catch (error) {
    log.error("Falha ao redefinir senha", error instanceof Error ? error : undefined, { email });
    return NextResponse.json({ error: "Ocorreu um erro interno. Tente mais tarde." }, { status: 500 });
  }
}
