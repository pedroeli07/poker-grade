import type { LimitAction, Prisma, TargetType } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { escapeHtml, sendTransactionalEmailSafe } from "@/lib/mailer";
import { getAppBaseUrl, getProductionBaseUrl } from "@/lib/utils/app-routing";

function appBaseForEmail(): string {
  return getProductionBaseUrl() || getAppBaseUrl() || "";
}

function absPath(path: string): string {
  const base = appBaseForEmail();
  if (!base) return path;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Deduplica mantendo o primeiro formato visto por endereço normalizado. */
function uniqueEmails(addresses: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of addresses) {
    const e = raw.trim();
    if (!e) continue;
    const k = e.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
}

function emailShell(title: string, innerHtml: string): string {
  const safeTitle = escapeHtml(title);
  return `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; color: #1e293b; line-height: 1.55;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 22px 26px; border-radius: 10px 10px 0 0; color: #fff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700;">${safeTitle}</h1>
          <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.88;">Gestão de Grades</p>
        </div>
        <div style="padding: 24px 26px; background: #fff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
          ${innerHtml}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Mensagem automática — não responda a este e-mail.</p>
        </div>
      </div>`;
}

export async function getStaffNotificationEmails(): Promise<string[]> {
  const rows = await prisma.authUser.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.MANAGER, UserRole.COACH] } },
    select: { email: true },
  });
  return rows.map((r) => r.email).filter(Boolean);
}

async function getPlayerEmailAddresses(playerId: string): Promise<string[]> {
  const row = await prisma.player.findUnique({
    where: { id: playerId },
    select: { email: true, authAccount: { select: { email: true } } },
  });
  if (!row) return [];
  const raw: string[] = [];
  if (row.email?.trim()) raw.push(row.email.trim());
  if (row.authAccount?.email?.trim()) raw.push(row.authAccount.email.trim());
  return uniqueEmails(raw);
}

export async function sendLimitChangeEmails(params: {
  playerId: string;
  playerName: string;
  action: LimitAction;
  fromGrade: string;
  toGrade: string;
}): Promise<void> {
  const { playerId, playerName, action, fromGrade, toGrade } = params;
  if (action === "MAINTAIN") return;

  const subjectPlain =
    action === "UPGRADE"
      ? `Promoção de grade: ${toGrade} (Gestão de Grades)`
      : `Ajuste de grade: ${fromGrade} → ${toGrade}`;

  const playerBody = `
    <p>Olá, <strong>${escapeHtml(playerName)}</strong>,</p>
    <p>${
      action === "UPGRADE"
        ? `Parabéns! Sua grade foi alterada de <strong>${escapeHtml(fromGrade)}</strong> para <strong>${escapeHtml(toGrade)}</strong>.`
        : `Sua grade foi alterada de <strong>${escapeHtml(fromGrade)}</strong> para <strong>${escapeHtml(toGrade)}</strong>.`
    }</p>
    <p><a href="${escapeHtml(absPath("/jogador/minha-grade"))}" style="color: #2563eb;">Abrir minha grade no app</a></p>
  `;

  const staffBody = `
    <p><strong>${escapeHtml(playerName)}</strong> teve a grade alterada (${action}):</p>
    <p><strong>${escapeHtml(fromGrade)}</strong> → <strong>${escapeHtml(toGrade)}</strong></p>
    <p><a href="${escapeHtml(absPath(`/admin/jogadores/${playerId}`))}" style="color: #2563eb;">Ver jogador no painel</a></p>
  `;

  const [playerEmails, staffEmails] = await Promise.all([
    getPlayerEmailAddresses(playerId),
    getStaffNotificationEmails(),
  ]);

  const playerHtml = emailShell(action === "UPGRADE" ? "Sua grade subiu" : "Sua grade foi ajustada", playerBody);
  const staffHtml = emailShell(`Grade: ${playerName}`, staffBody);

  await sendTransactionalEmailSafe(uniqueEmails(playerEmails), subjectPlain, playerHtml, "LIMIT_PLAYER");
  await sendTransactionalEmailSafe(
    uniqueEmails(staffEmails),
    `[Staff] ${playerName}: grade ${action === "UPGRADE" ? "↑" : "↓"} ${fromGrade} → ${toGrade}`,
    staffHtml,
    "LIMIT_STAFF"
  );
}

export type TargetCreatedEmailPayload = {
  name: string;
  category: string;
  targetType: TargetType;
  unit: string | null;
  numericValue: number | null;
  numericCurrent: number | null;
  greenThreshold: number | null;
  yellowThreshold: number | null;
  textValue: string | null;
  coachNotes: string | null;
};

function formatTargetDetails(t: TargetCreatedEmailPayload): string {
  const rows: string[] = [];
  rows.push(`<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Nome</strong></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(t.name)}</td></tr>`);
  rows.push(`<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Categoria</strong></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(t.category)}</td></tr>`);
  rows.push(`<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Tipo</strong></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(t.targetType)}</td></tr>`);
  if (t.unit) {
    rows.push(`<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Unidade</strong></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(t.unit)}</td></tr>`);
  }
  if (t.numericValue != null) {
    rows.push(`<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Valor alvo</strong></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(String(t.numericValue))}</td></tr>`);
  }
  if (t.numericCurrent != null) {
    rows.push(`<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Valor atual</strong></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(String(t.numericCurrent))}</td></tr>`);
  }
  if (t.greenThreshold != null) {
    rows.push(`<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Limiar verde</strong></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(String(t.greenThreshold))}</td></tr>`);
  }
  if (t.yellowThreshold != null) {
    rows.push(`<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Limiar amarelo</strong></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(String(t.yellowThreshold))}</td></tr>`);
  }
  if (t.textValue) {
    rows.push(`<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Texto</strong></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(t.textValue)}</td></tr>`);
  }
  if (t.coachNotes) {
    rows.push(`<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Notas do coach</strong></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(t.coachNotes)}</td></tr>`);
  }
  return `<table style="border-collapse:collapse;width:100%;font-size:14px;">${rows.join("")}</table>`;
}

export async function sendTargetCreatedEmails(playerId: string, playerName: string, target: TargetCreatedEmailPayload) {
  const detailTable = formatTargetDetails(target);
  const playerBody = `
    <p>Olá, <strong>${escapeHtml(playerName)}</strong>,</p>
    <p>Foi criada uma nova meta para você no sistema.</p>
    ${detailTable}
    <p style="margin-top:18px;"><a href="${escapeHtml(absPath("/jogador/metas"))}" style="color: #2563eb;">Ver minhas metas</a></p>
  `;
  const staffBody = `
    <p>Nova meta para <strong>${escapeHtml(playerName)}</strong>:</p>
    ${detailTable}
    <p style="margin-top:18px;"><a href="${escapeHtml(absPath("/admin/grades/metas"))}" style="color: #2563eb;">Abrir metas (admin)</a></p>
  `;

  const [playerEmails, staffEmails] = await Promise.all([
    getPlayerEmailAddresses(playerId),
    getStaffNotificationEmails(),
  ]);

  const subjPlayer = `Nova meta: ${target.name} (Gestão de Grades)`;
  const subjStaff = `[Staff] Meta criada — ${playerName}: ${target.name}`;

  await sendTransactionalEmailSafe(
    uniqueEmails(playerEmails),
    subjPlayer,
    emailShell("Nova meta para você", playerBody),
    "TARGET_PLAYER"
  );
  await sendTransactionalEmailSafe(
    uniqueEmails(staffEmails),
    subjStaff,
    emailShell(`Nova meta — ${playerName}`, staffBody),
    "TARGET_STAFF"
  );
}

const ALERT_TYPE_LABEL: Record<string, string> = {
  roi_drop: "ROI (10d) — queda acentuada",
  early_finish: "FP (10d) — finalizações precoces",
  late_finish: "FT (10d) — finalizações tardias",
  reentry_high: "Taxa de reentry (30d)",
  high_variance: "Alta variância (field médio)",
  group_not_found: "Grupo SharkScope indisponível",
  team_roi_below_avg: "ROI (10d) abaixo da média do time",
  team_fp_above_avg: "FP (10d) acima da média do time",
  team_ft_above_avg: "FT (10d) acima da média do time",
};

function alertLabel(type: string): string {
  return ALERT_TYPE_LABEL[type] ?? type;
}

/** E-mail aos jogadores afetados por um lote de alertas recém-criados. */
export async function sendSharkAlertPlayerEmails(
  alerts: Prisma.AlertLogCreateManyInput[],
  playerNameById: Map<string, string>
): Promise<void> {
  if (!alerts.length) return;

  const byPlayer = new Map<string, Prisma.AlertLogCreateManyInput[]>();
  for (const a of alerts) {
    const list = byPlayer.get(a.playerId) ?? [];
    list.push(a);
    byPlayer.set(a.playerId, list);
  }

  for (const [playerId, list] of byPlayer) {
    const name = playerNameById.get(playerId) ?? "Jogador";
    const bullets = list
      .map((a) => {
        const label = alertLabel(a.alertType);
        const valStr =
          a.metricValue !== undefined && a.metricValue !== null
            ? ` — valor ${typeof a.metricValue === "number" ? a.metricValue.toFixed(2) : String(a.metricValue)}`
            : "";
        const sev = a.severity ? ` [${a.severity}]` : "";
        return `<li><strong>${escapeHtml(label)}</strong>${escapeHtml(sev)}${escapeHtml(valStr)}</li>`;
      })
      .join("");

    const playerEmails = await getPlayerEmailAddresses(playerId);
    const playerBody = `
      <p>Olá, <strong>${escapeHtml(name)}</strong>,</p>
      <p>O sistema registrou alerta(s) nas suas estatísticas SharkScope (última sincronização):</p>
      <ul style="margin:12px 0;padding-left:20px;">${bullets}</ul>
      <p>Consulte os detalhes com o staff ou no painel de alertas.</p>
      <p><a href="${escapeHtml(absPath("/jogador/minha-grade"))}" style="color: #2563eb;">Abrir o app</a></p>
    `;
    await sendTransactionalEmailSafe(
      uniqueEmails(playerEmails),
      `Alertas SharkScope — ${name}`,
      emailShell("Alertas nas suas estatísticas", playerBody),
      "ALERT_PLAYER"
    );
  }
}

/** Um único e-mail ao staff com todos os alertas criados numa corrida de sync (evita spam). */
export async function sendSharkAlertStaffDigest(
  alerts: Prisma.AlertLogCreateManyInput[],
  playerNameById: Map<string, string>
): Promise<void> {
  if (!alerts.length) return;
  const staffEmails = await getStaffNotificationEmails();
  const byPlayer = new Map<string, Prisma.AlertLogCreateManyInput[]>();
  for (const a of alerts) {
    const list = byPlayer.get(a.playerId) ?? [];
    list.push(a);
    byPlayer.set(a.playerId, list);
  }
  const staffLines: string[] = [];
  for (const [playerId, list] of byPlayer) {
    const name = playerNameById.get(playerId) ?? "Jogador";
    staffLines.push(
      `<li><strong>${escapeHtml(name)}</strong>: ${list
        .map((a) => `${escapeHtml(alertLabel(a.alertType))} (${escapeHtml(String(a.severity))})`)
        .join("; ")}</li>`
    );
  }
  const staffBody = `
    <p>Resumo de alertas SharkScope gerados nesta sincronização (${alerts.length}):</p>
    <ul style="margin:12px 0;padding-left:20px;">${staffLines.join("")}</ul>
    <p><a href="${escapeHtml(absPath("/admin/sharkscope/alertas"))}" style="color: #2563eb;">Abrir página de alertas</a></p>
  `;
  await sendTransactionalEmailSafe(
    uniqueEmails(staffEmails),
    `[Staff] Alertas SharkScope (${alerts.length})`,
    emailShell("Alertas SharkScope", staffBody),
    "ALERT_STAFF_DIGEST"
  );
}
