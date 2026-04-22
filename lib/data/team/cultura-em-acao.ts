import { requireSession, type AppSession } from "@/lib/auth/session";
import { ALERT_TYPE_LABEL, isSharkscopeAlertPercentMetric } from "@/lib/constants/sharkscope/alerts";
import { getPlayersForSession } from "@/lib/queries/db/player/reads";
import { formatIsoWeekLabel, getIsoWeekRange } from "@/lib/utils/iso-week";
import { prisma } from "@/lib/prisma";
import { PlayerStatus, TargetStatus } from "@prisma/client";

function fmtMetric(alertType: string, n: number): string {
  if (isSharkscopeAlertPercentMetric(alertType)) {
    return `${n.toFixed(1)}%`;
  }
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

function alertDetail(alert: {
  alertType: string;
  metricValue: number;
  threshold: number;
}): string {
  return `${fmtMetric(alert.alertType, alert.metricValue)} vs limite ${fmtMetric(alert.alertType, alert.threshold)}`;
}

export type CulturaEmAcaoQuebraRow = {
  playerName: string;
  tipo: string;
  detalhe: string;
};

export type CulturaEmAcaoTag = { label: string; className: string };

export type CulturaEmAcaoExemplarRow = {
  nome: string;
  sub: string;
  tags: CulturaEmAcaoTag[];
};

export type CulturaEmAcaoRiscoRow = {
  nome: string;
  badge: string;
  issues: string[];
};

export type CulturaEmAcaoData = {
  weekLabel: string;
  adesaoRituaisPct: number | null;
  adesaoRituaisHasData: boolean;
  quebrasCount: number;
  quebras: CulturaEmAcaoQuebraRow[];
  exemplarCount: number;
  exemplares: CulturaEmAcaoExemplarRow[];
  riscoCount: number;
  riscos: CulturaEmAcaoRiscoRow[];
};

const TAG_MUTED = "bg-muted text-muted-foreground";
const TAG_EMERALD = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";

type TargetRow = {
  playerId: string;
  status: TargetStatus;
  name: string;
  numericCurrent: number | null;
  textCurrent: string | null;
  unit: string | null;
};

function groupActiveTargets(rows: TargetRow[]) {
  const m = new Map<string, TargetRow[]>();
  for (const r of rows) {
    if (!m.has(r.playerId)) m.set(r.playerId, []);
    m.get(r.playerId)!.push(r);
  }
  return m;
}

function exemplarTagRows(list: TargetRow[]): CulturaEmAcaoTag[] {
  const tags: CulturaEmAcaoTag[] = list.slice(0, 4).map((t) => {
    const val =
      t.numericCurrent != null
        ? `${t.name}: ${t.numericCurrent}${t.unit ? ` ${t.unit}` : ""}`
        : t.textCurrent
          ? `${t.name}: ${t.textCurrent}`
          : t.name;
    return { label: val, className: TAG_MUTED };
  });
  const anyRoi = list.find((t) => t.name.toLowerCase().includes("roi"));
  if (anyRoi?.numericCurrent != null) {
    const roiLabel = `ROI: ${anyRoi.numericCurrent > 0 ? "+" : ""}${anyRoi.numericCurrent.toFixed(1)}%`;
    if (!tags.some((x) => x.label.includes("ROI") || x.label === roiLabel)) {
      tags.push({
        label: roiLabel,
        className: anyRoi.numericCurrent >= 0 ? TAG_EMERALD : TAG_MUTED,
      });
    }
  }
  return tags;
}

export async function getCulturaEmAcaoDataForSession(session: AppSession): Promise<CulturaEmAcaoData> {
  const { start, end } = getIsoWeekRange(new Date());
  const weekLabel = formatIsoWeekLabel();

  const players = (await getPlayersForSession(session)).filter((p) => p.status === PlayerStatus.ACTIVE);
  const playerIds = players.map((p) => p.id);
  const byId = new Map(players.map((p) => [p.id, p]));

  if (playerIds.length === 0) {
    return {
      weekLabel,
      adesaoRituaisPct: null,
      adesaoRituaisHasData: false,
      quebrasCount: 0,
      quebras: [],
      exemplarCount: 0,
      exemplares: [],
      riscoCount: 0,
      riscos: [],
    };
  }

  const authForPlayers = await prisma.authUser.findMany({
    where: { playerId: { in: playerIds } },
    select: { id: true, playerId: true },
  });
  const userIds = authForPlayers.map((a) => a.id);

  const [participations, alerts, targets] = await Promise.all([
    userIds.length === 0
      ? []
      : prisma.teamRitualParticipation.findMany({
          where: {
            userId: { in: userIds },
            attendedAt: { gte: start, lte: end },
          },
          select: { attended: true },
        }),
    prisma.alertLog.findMany({
      where: {
        playerId: { in: playerIds },
        triggeredAt: { gte: start, lte: end },
        acknowledged: false,
      },
      orderBy: { triggeredAt: "desc" },
      take: 30,
      include: { player: { select: { name: true } } },
    }),
    prisma.playerTarget.findMany({
      where: { playerId: { in: playerIds }, isActive: true },
      select: {
        playerId: true,
        status: true,
        name: true,
        numericCurrent: true,
        textCurrent: true,
        unit: true,
      },
    }),
  ]);

  const totalP = participations.length;
  const okP = participations.filter((p) => p.attended).length;
  const adesaoRituaisHasData = totalP > 0;
  const adesaoRituaisPct = adesaoRituaisHasData ? Math.round((okP / totalP) * 100) : null;

  const quebras: CulturaEmAcaoQuebraRow[] = alerts.map((a) => ({
    playerName: a.player.name,
    tipo: ALERT_TYPE_LABEL[a.alertType] ?? a.alertType,
    detalhe: alertDetail(a),
  }));
  const quebrasCount = quebras.length;

  const byPlayerTargets = groupActiveTargets(targets as TargetRow[]);

  const riscoPlayerIds: string[] = [];
  for (const [pid, list] of byPlayerTargets) {
    if (list.some((t) => t.status === TargetStatus.OFF_TRACK)) {
      riscoPlayerIds.push(pid);
    }
  }
  riscoPlayerIds.sort(
    (a, b) => (byId.get(a)?.name ?? "").localeCompare(byId.get(b)?.name ?? "", "pt", { sensitivity: "base" }),
  );
  const riscoSet = new Set(riscoPlayerIds);
  const riscoCount = riscoPlayerIds.length;

  const riscos: CulturaEmAcaoRiscoRow[] = [];
  for (const pid of riscoPlayerIds.slice(0, 5)) {
    const list = byPlayerTargets.get(pid) ?? [];
    const off = list.filter((t) => t.status === TargetStatus.OFF_TRACK);
    const nome = byId.get(pid)?.name ?? pid;
    const issues = off.map((t) => {
      if (t.numericCurrent != null) {
        return `${t.name} fora do alvo (${t.numericCurrent}${t.unit ? ` ${t.unit}` : ""})`;
      }
      if (t.textCurrent) {
        return `${t.name}: ${t.textCurrent}`;
      }
      return `${t.name} fora do trilho`;
    });
    riscos.push({
      nome,
      badge: `${off.length} meta${off.length > 1 ? "s" : ""}`,
      issues: issues.length > 0 ? issues : ["Metas fora do trilho"],
    });
  }

  const exemplarPlayerIds: string[] = [];
  for (const [pid, list] of byPlayerTargets) {
    if (riscoSet.has(pid)) continue;
    if (list.length > 0 && list.every((t) => t.status === TargetStatus.ON_TRACK)) {
      exemplarPlayerIds.push(pid);
    }
  }
  exemplarPlayerIds.sort(
    (a, b) => (byId.get(a)?.name ?? "").localeCompare(byId.get(b)?.name ?? "", "pt", { sensitivity: "base" }),
  );
  const exemplarCount = exemplarPlayerIds.length;

  const exemplares: CulturaEmAcaoExemplarRow[] = [];
  for (const pid of exemplarPlayerIds.slice(0, 5)) {
    const list = byPlayerTargets.get(pid) ?? [];
    const nome = byId.get(pid)?.name ?? pid;
    const sub =
      list.length > 0
        ? `${list.length} meta${list.length > 1 ? "s" : ""} ativa${list.length > 1 ? "s" : ""} no verde`
        : "";
    exemplares.push({ nome, sub, tags: exemplarTagRows(list) });
  }

  return {
    weekLabel,
    adesaoRituaisPct,
    adesaoRituaisHasData,
    quebrasCount,
    quebras,
    exemplarCount,
    exemplares,
    riscoCount,
    riscos,
  };
}

export async function getCulturaEmAcaoData(): Promise<CulturaEmAcaoData> {
  const session = await requireSession();
  return getCulturaEmAcaoDataForSession(session);
}
