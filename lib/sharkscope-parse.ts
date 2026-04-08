/**
 * Extrai dados das respostas JSON da SharkScope (XML→JSON costuma usar @atributos e $ para texto).
 * Doc: Statistic usa atributo id (ex.: id="AvROI"), não name.
 */

type StatisticJson = {
  "@name"?: string;
  "@id"?: string;
  id?: string;
  $?: string | number;
};

function statisticId(s: StatisticJson): string | undefined {
  const raw = s["@name"] ?? s["@id"] ?? s.id;
  return typeof raw === "string" ? raw : undefined;
}

function statisticValue(s: StatisticJson): string | undefined {
  const v = s.$;
  if (v === undefined || v === null) return undefined;
  return typeof v === "number" ? String(v) : v;
}

function getStatArray(raw: unknown): StatisticJson[] {
  if (!raw || typeof raw !== "object") return [];

  const obj = raw as Record<string, unknown>;

  if ("Statistic" in obj) {
    const st = obj.Statistic;
    if (Array.isArray(st)) return st as StatisticJson[];
    if (st && typeof st === "object") return [st as StatisticJson];
  }

  if (Array.isArray(raw)) return raw as StatisticJson[];

  return [];
}

function dig(obj: Record<string, unknown>, ...keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

/**
 * Extrai o valor de uma estatística (ex.: AvROI, Count) da resposta.
 */
export function extractStat(rawData: unknown, statName: string): number | null {
  if (!rawData || typeof rawData !== "object") return null;

  const root = rawData as Record<string, unknown>;
  const want = statName.toLowerCase();

  const stats =
    dig(root, "Response", "PlayerResponse", "PlayerResults", "PlayerResult", "Statistics") ??
    dig(root, "Response", "PlayerResponse", "PlayerResults", "PlayerResult", "Player", "Statistics") ??
    dig(root, "Response", "PlayerResponse", "PlayerResults", "PlayerResult", "Statistic") ??
    dig(root, "PlayerResponse", "PlayerResults", "PlayerResult", "Statistics") ??
    dig(root, "PlayerResponse", "PlayerResults", "PlayerResult", "Player", "Statistics") ??
    dig(root, "Statistics") ??
    dig(root, "PlayerResults", "PlayerResult", "Statistics");

  const statArray = getStatArray(stats);

  const found = statArray.find(
    (s) => statisticId(s)?.toLowerCase() === want
  );
  if (!found) return null;

  const str = statisticValue(found);
  if (str === undefined) return null;
  const val = parseFloat(str);
  return isNaN(val) ? null : val;
}

/**
 * RemainingSearches vem em UserInfo na documentação XML; no JSON pode estar em UserInfo ou na raiz Response.
 */
export function extractRemainingSearches(rawData: unknown): number | null {
  if (!rawData || typeof rawData !== "object") return null;
  const root = rawData as Record<string, unknown>;
  const r =
    dig(root, "Response", "UserInfo", "RemainingSearches") ??
    dig(root, "Response", "RemainingSearches");
  if (r == null) return null;
  if (typeof r === "number") return r;
  if (typeof r === "object") {
    const v = (r as Record<string, unknown>)["$"];
    const n = parseFloat(String(v));
    return isNaN(n) ? null : n;
  }
  const n = parseFloat(String(r));
  return isNaN(n) ? null : n;
}

export function roiSeverity(roi: number): "red" | "yellow" | "green" {
  if (roi < -40) return "red";
  if (roi < -20) return "yellow";
  return "green";
}

export function reentrySeverity(rate: number): "red" | "yellow" | "green" {
  if (rate > 25) return "red";
  if (rate >= 18) return "yellow";
  return "green";
}

export function earlyFinishSeverity(rate: number): "red" | "yellow" | "green" {
  if (rate > 8) return "red";
  if (rate >= 6) return "yellow";
  return "green";
}

export function lateFinishSeverity(rate: number): "red" | "yellow" | "green" {
  if (rate < 8) return "red";
  if (rate <= 10) return "yellow";
  return "green";
}

