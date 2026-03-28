import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { registerBodySchema } from "@/lib/validation/schemas";
import { limitRegister } from "@/lib/rate-limit";
import { clientIp, assertSameOrigin } from "@/lib/api/origin";
import { logRateLimited, logValidationFailure } from "@/lib/security-log";
import { createLogger } from "@/lib/logger";
import { isSuperAdminEmail } from "@/lib/auth/bootstrap";
import { createAuthSession, applySessionCookie } from "@/lib/auth/issue-session";

const log = createLogger("auth.register");

const INVITE_ONLY_MSG =
  "Este e-mail não está autorizado a criar conta. Solicite um convite ao administrador.";

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
    logRateLimited("/api/auth/register", ip);
    return NextResponse.json(
      { error: "Muitas tentativas de registro. Tente mais tarde." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logValidationFailure("register.json");
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const parsed = registerBodySchema.safeParse(body);
  if (!parsed.success) {
    logValidationFailure("register.fields");
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      first.password?.[0] ||
      first.confirmPassword?.[0] ||
      first.email?.[0] ||
      "Dados inválidos.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { email, password, displayName: rawName } = parsed.data;
  const displayName =
    rawName?.trim().replace(/\s+/g, " ").slice(0, 200) || null;

  const exists = await prisma.authUser.findUnique({
    where: { email },
    select: { id: true },
  });
  if (exists) {
    log.info("Registro recusado: e-mail já existe", { email });
    return NextResponse.json(
      { error: "Este e-mail já está cadastrado." },
      { status: 409 }
    );
  }

  let role: UserRole;

  if (isSuperAdminEmail(email)) {
    role = UserRole.ADMIN;
  } else {
    const invite = await prisma.allowedEmail.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    if (!invite) {
      log.info("Registro recusado: sem convite", { email });
      return NextResponse.json({ error: INVITE_ONLY_MSG }, { status: 403 });
    }
    role = invite.role;
  }

  const passwordHash = await hashPassword(password);

  let newUserId: string;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.authUser.create({
        data: { email, displayName, passwordHash, role },
        select: { id: true, playerId: true, coachId: true },
      });
      if (!isSuperAdminEmail(email)) {
        await tx.allowedEmail.deleteMany({ where: { email } });
      }
      return user;
    });
    newUserId = result.id;
  } catch (e) {
    log.error(
      "Falha ao criar usuário",
      e instanceof Error ? e : undefined,
      { email }
    );
    return NextResponse.json(
      { error: "Não foi possível concluir o cadastro." },
      { status: 500 }
    );
  }

  log.info("Usuário registrado", { email, role });

  const newUser = await prisma.authUser.findUniqueOrThrow({
    where: { id: newUserId },
    select: { id: true, role: true, playerId: true, coachId: true, displayName: true, email: true },
  });

  const { token, sessionId } = await createAuthSession(newUser);
  log.info("Sessão criada após registro", { userId: newUserId, sessionId });

  const res = NextResponse.json({ ok: true, redirect: "/dashboard" });
  applySessionCookie(res, token);
  return res;
}
