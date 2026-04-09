import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, assertSameOrigin } from "@/lib/api/origin";
import { limitRegister } from "@/lib/rate-limit"; // Usar o mesmo ou criar limitSendCode
import { createLogger } from "@/lib/logger";
import { sendRegisterVerificationEmail, sendPasswordResetEmail } from "@/lib/mailer";
import { isSuperAdminEmail, generateOTP } from "@/lib/utils";
import { sendCodeSchema } from "@/lib/schemas";
import { ErrorTypes } from "@/lib/types";

const log = createLogger("auth.send-code");

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: ErrorTypes.FORBIDDEN }, { status: 403 });
  }

  const ip = clientIp(request);
  const rl = await limitRegister(ip); // Reuse tempo rigoroso anti-spam para envios de OTP
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas requisições. Aguarde antes de pedir outro código." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: ErrorTypes.INVALID_DATA }, { status: 400 });
  }

  const parsed = sendCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail ou tipo inválido." }, { status: 400 });
  }

  const { email, type } = parsed.data;

  // 1. Verificar elegibilidade antes de gerar OTP e mandar spam
  if (type === "REGISTER") {
    const userExists = await prisma.authUser.findUnique({ where: { email } });
    if (userExists) {
      // Mensagem genérica para dificultar scanning
      return NextResponse.json({ ok: true }); 
    }

    if (!isSuperAdminEmail(email)) {
      const allowed = await prisma.allowedEmail.findUnique({ where: { email } });
      if (!allowed) {
        return NextResponse.json(
          { error: "Este e-mail não foi convidado para o sistema." },
          { status: 403 }
        );
      }
    }
  } else if (type === "RESET") {
    const userExists = await prisma.authUser.findUnique({ where: { email } });
    if (!userExists) {
      // Always return true for privacy
      return NextResponse.json({ ok: true });
    }
  }

  // 2. Apagar tokens não usados anteriores desse email p/ esse tipo
  await prisma.verificationToken.deleteMany({
    where: { email, type }
  });

  // 3. Gerar Code e Salvar
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  try {
    await prisma.verificationToken.create({
      data: {
        email,
        code,
        type,
        expiresAt,
      }
    });

    if (type === "REGISTER") {
      await sendRegisterVerificationEmail(email, code, ip);
    } else {
      await sendPasswordResetEmail(email, code, ip);
    }
    
    log.info("Código OTP enviado", { email, type });
    return NextResponse.json({ ok: true });
  } catch (err) {
    log.error("Erro ao enviar OTP", err instanceof Error ? err : undefined, { email, type });
    return NextResponse.json({ error: "Falha ao enviar e-mail. Tente novamente." }, { status: 500 });
  }
}
