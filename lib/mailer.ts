import nodemailer from "nodemailer";
import { Resend } from "resend";
import { gmailUser, gmailAppPassword, resendApiKey, resendFrom } from "./constants/env";
import { USER_INVITE_EMAIL_SUBJECT } from "./constants/users";
import { createLogger } from "./logger";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const log = createLogger("mailer");

export const isMailerConfigured = () =>
  !!(resendApiKey || (gmailUser && gmailAppPassword));

function gmailTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

function requireMailer() {
  if (!isMailerConfigured()) {
    throw new Error(
      "Mailer não configurado: defina RESEND_API_KEY ou GMAIL_USER/GMAIL_APP_PASSWORD."
    );
  }
}

type MailPayload = { to: string; subject: string; html: string; context: string };

/**
 * Envia e-mail tentando Resend primeiro; se falhar (ex.: domínio não verificado no plano
 * gratuito envia só para o dono da conta) e Gmail estiver configurado, faz fallback para SMTP.
 */
async function deliverMail({ to, subject, html, context }: MailPayload) {
  requireMailer();
  let resendError: Error | null = null;

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({ from: resendFrom, to, subject, html });
      if (error) throw new Error(error.message);
      log.info(`Resend response (${context})`, { to, id: data?.id });
      return { provider: "resend" as const, id: data?.id };
    } catch (e) {
      resendError = e instanceof Error ? e : new Error(String(e));
      log.warn(`Resend falhou (${context}); tentando Gmail se disponível`, {
        to,
        message: resendError.message,
      });
      if (!(gmailUser && gmailAppPassword)) throw resendError;
    }
  }

  const info = await gmailTransporter().sendMail({
    from: `"Gestão Poker Team" <${gmailUser}>`,
    to,
    subject,
    html,
  });
  log.info(`SMTP response (${context})`, {
    to,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    fallbackFromResend: Boolean(resendError),
  });
  return info;
}

/**
 * E-mail transacional genérico: não propaga erro; regista falhas no log.
 * Ignora destinatários duplicados (case-insensitive).
 */
export async function sendTransactionalEmailSafe(
  recipients: string[],
  subject: string,
  html: string,
  context: string
): Promise<void> {
  if (!isMailerConfigured()) {
    log.warn(`Mailer não configurado; e-mails omitidos (${context})`);
    return;
  }
  const seen = new Set<string>();
  for (const raw of recipients) {
    const to = raw.trim();
    if (!to) continue;
    const key = to.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      await deliverMail({ to, subject, html, context: `${context}:${key}` });
    } catch (e) {
      log.error(
        `Falha ao enviar e-mail (${context})`,
        e instanceof Error ? e : undefined,
        { to: key }
      );
    }
  }
}

/**
 * Envia código de 6 dígitos para verificação de registro.
 */
export async function sendRegisterVerificationEmail(email: string, code: string, ip?: string) {
  const subject = `Cód. ${code} - Verificação de E-mail`;
  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2563eb;">Bem-vindo(a)!</h2>
        <p>Você iniciou o cadastro no nosso sistema de Gestão de Grades.</p>
        <p>Utilize o código de verificação abaixo para concluir a criação da sua conta:</p>
        <div style="margin: 30px 0; font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 15px; background: #f3f4f6; text-align: center; border-radius: 8px;">
          ${code}
        </div>
        <p>Este código expira em 15 minutos.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #888;">
          Se você não solicitou este código, por favor ignore este aviso.
          ${ip ? `<br/>Solicitado pelo IP: ${ip}` : ""}
        </p>
      </div>
    `;
  return deliverMail({ to: email, subject, html, context: "REGISTER" });
}

/**
 * Envia código de 6 dígitos para recuperação de senha.
 */
export async function sendPasswordResetEmail(email: string, code: string, ip?: string) {
  const subject = `Cód. ${code} - Redefinição de Senha`;
  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #ea580c;">Recuperação de Acesso</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Insira o código de 6 dígitos abaixo na tela de recuperação:</p>
        <div style="margin: 30px 0; font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 15px; background: #fff7ed; color: #ea580c; text-align: center; border-radius: 8px;">
          ${code}
        </div>
        <p>Este código expira em 15 minutos.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #888;">
          Se você não solicitou a redefinição de senha, sinta-se seguro para ignorar este e-mail.
          ${ip ? `<br/>Solicitado a partir do IP: ${ip}` : ""}
        </p>
      </div>
    `;
  return deliverMail({ to: email, subject, html, context: "RESET" });
}

export type SendInviteEmailParams = {
  /** Rótulo do cargo (ex.: Viewer, Coach). */
  roleLabel: string;
  /** URL absoluta da página `/register`, ou vazio se não configurada. */
  registerUrl: string;
};

/**
 * E-mail enviado quando um administrador adiciona um convite na página de utilizadores.
 */
export async function sendInviteEmail(toEmail: string, params: SendInviteEmailParams) {
  const { roleLabel, registerUrl } = params;
  const safeRole = escapeHtml(roleLabel);
  const linkBlock = registerUrl
    ? `<p style="margin: 24px 0;">
        <a href="${escapeHtml(registerUrl)}" style="display: inline-block; padding: 12px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Criar conta
        </a>
      </p>
      <p style="font-size: 13px; color: #64748b; word-break: break-all;">${escapeHtml(registerUrl)}</p>`
    : `<p style="color: #64748b;">Peça ao administrador o endereço (URL) da aplicação e abra a página de <strong>registo</strong> no navegador.</p>`;

  const html = `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 28px 32px; border-radius: 12px 12px 0 0; color: #fff;">
          <h2 style="margin: 0 0 4px 0; font-size: 22px;">🎯 Você foi convidado(a)</h2>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">Gestão de Grades — Poker Team Management</p>
        </div>
        <div style="padding: 28px 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="margin-top: 0;">Olá,</p>
          <p>Um administrador adicionou o seu e-mail (<strong>${escapeHtml(toEmail)}</strong>) à lista de convidados da plataforma <strong>Gestão de Grades</strong>, usada pelo time de poker para acompanhar grades de torneios, metas, revisões e estatísticas.</p>
          <div style="background: #f1f5f9; border-left: 3px solid #2563eb; padding: 12px 16px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0; font-size: 14px;"><strong>Seu cargo após o cadastro:</strong> ${safeRole}</p>
          </div>
          <p style="margin-bottom: 8px;"><strong>Como concluir o cadastro:</strong></p>
          <ol style="padding-left: 20px; margin: 8px 0 20px 0;">
            <li>Clique no botão abaixo para abrir a página de registo.</li>
            <li>Utilize <strong>este mesmo e-mail</strong> ao criar a conta.</li>
            <li>Solicite o <strong>código de verificação</strong> que chegará neste endereço e insira-o.</li>
            <li>Defina a sua senha e finalize o registo.</li>
          </ol>
          ${linkBlock}
          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Caso o botão não funcione, copie e cole o link acima no seu navegador. Se não esperava este convite, pode ignorar esta mensagem com segurança.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Gestão de Grades — Poker Team</p>
        </div>
      </div>
    `;
  return deliverMail({ to: toEmail, subject: USER_INVITE_EMAIL_SUBJECT, html, context: "INVITE" });
}
