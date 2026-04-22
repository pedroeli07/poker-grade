import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { getAppBaseUrl } from "@/lib/utils/app-routing";
import type { ImportBatchNotifyPayload } from "@/lib/types/imports/index";
const log = createLogger("notify-import-external");

async function staffEmailsForImport(): Promise<string[]> {
  const users = await prisma.authUser.findMany({
    where: { role: { in: ["ADMIN", "MANAGER", "COACH"] } },
    select: { email: true },
  });
  const extra = (process.env.IMPORT_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const set = new Set<string>();
  for (const u of users) set.add(u.email.toLowerCase());
  for (const e of extra) set.add(e);
  return [...set];
}

async function sendDiscord(text: string, reviewUrl: string): Promise<void> {
  const url = process.env.IMPORT_NOTIFY_DISCORD_WEBHOOK_URL?.trim();
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "Importação concluída — Conferência",
            description: text.slice(0, 3900),
            color: 0x3b82f6,
            url: reviewUrl || undefined,
          },
        ],
      }),
    });
    if (!res.ok) {
      log.warn("Discord webhook resposta não OK", { status: res.status });
    }
  } catch (e) {
    log.error("Falha Discord webhook", e instanceof Error ? e : undefined);
  }
}

async function sendResendEmail(
  to: string[],
  subject: string,
  text: string
): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.IMPORT_NOTIFY_FROM?.trim();
  if (!key || !from || to.length === 0) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.slice(0, 50),
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      log.warn("Resend resposta não OK", { status: res.status, errText });
    }
  } catch (e) {
    log.error("Falha e-mail Resend", e instanceof Error ? e : undefined);
  }
}

async function sendSmtpEmail(
  to: string[],
  subject: string,
  text: string
): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || user;
  if (!host || !user || !pass || !from || to.length === 0) return;
  try {
    const nodemailer = await import("nodemailer");
    const port = parseInt(process.env.SMTP_PORT ?? "465", 10);
    const secure = process.env.SMTP_SECURE !== "false";
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from,
      to: to.join(", "),
      subject,
      text,
    });
  } catch (e) {
    log.error("Falha e-mail SMTP", e instanceof Error ? e : undefined);
  }
}

async function sendTwilioWhatsApp(body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim();
  const rawTo = process.env.IMPORT_NOTIFY_WHATSAPP_TO?.trim();
  if (!sid || !token || !from || !rawTo) return;
  const numbers = rawTo.split(",").map((n) => n.trim()).filter(Boolean);
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const msg = body.slice(0, 1500);
  for (const to of numbers) {
    try {
      const params = new URLSearchParams({
        From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
        To: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
        Body: msg,
      });
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );
      if (!res.ok) {
        log.warn("Twilio WhatsApp resposta não OK", { status: res.status });
      }
    } catch (e) {
      log.error("Falha Twilio WhatsApp", e instanceof Error ? e : undefined);
    }
  }
}

function buildText(
  payload: ImportBatchNotifyPayload,
  reviewUrl: string,
  importsUrl: string
): string {
  const lines = [
    `Arquivo: ${payload.fileName}`,
    `Abas processadas: ${payload.sheetsProcessed}`,
    `Total extra plays (Lobbyize): ${payload.totalExtraPlays}`,
    "",
    payload.totalExtraPlays > 0
      ? "Há extra plays — abra a Conferência de Torneios no app para revisar."
      : "Sem extra plays nesta importação; conferência opcional.",
    reviewUrl ? `Conferência: ${reviewUrl}` : "",
    importsUrl ? `Importações: ${importsUrl}` : "",
    "",
    payload.summaryLines.length
      ? payload.summaryLines.slice(0, 15).join("\n")
      : "",
  ];
  return lines.filter(Boolean).join("\n").trim();
}

/**
 * Aviso único ao fim do arquivo (Discord / e-mail / WhatsApp).
 * Configure envs opcionais; sem env, ignora silenciosamente.
 */
export async function notifyImportBatchExternal(
  payload: ImportBatchNotifyPayload
): Promise<void> {
  const base = getAppBaseUrl();
  const reviewPath = "/admin/grades/revisao";
  const importsPath = "/admin/grades/importacoes";
  const reviewUrl = base ? `${base}${reviewPath}` : reviewPath;
  const importsUrl = base ? `${base}${importsPath}` : importsPath;

  const text = buildText(payload, reviewUrl, importsUrl);
  const subject = `[CL Team] Importação: ${payload.fileName} — conferência${
    payload.totalExtraPlays > 0 ? " pendente" : ""
  }`;

  const recipients = await staffEmailsForImport();

  const emailTasks: Promise<void>[] = [];
  if (process.env.RESEND_API_KEY?.trim() && process.env.IMPORT_NOTIFY_FROM?.trim()) {
    emailTasks.push(sendResendEmail(recipients, subject, text));
  } else {
    emailTasks.push(sendSmtpEmail(recipients, subject, text));
  }

  await Promise.all([
    sendDiscord(text, reviewUrl),
    ...emailTasks,
    sendTwilioWhatsApp(text),
  ]);
}
