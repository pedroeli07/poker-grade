const sharkscopeStatMapCache = new WeakMap<object, Map<string, number>>();

function walkUnknown(obj: unknown, visit: (r: Record<string, unknown>) => void): void {
  if (obj === null || obj === undefined) return;
  if (Array.isArray(obj)) {
    for (const x of obj) walkUnknown(x, visit);
    return;
  }
  if (typeof obj !== "object") return;
  const rec = obj as Record<string, unknown>;
  visit(rec);
  for (const v of Object.values(rec)) walkUnknown(v, visit);
}

export function parseSharkscopeStatisticNode(rec: Record<string, unknown>): number | null {
  for (const k of ["$", "_", "value", "#text", "_text"]) {
    const v = rec[k];
    if (v === undefined || v === null) continue;
    const s = typeof v === "number" ? String(v) : String(v).trim().replace(/,/g, "");
    const n = parseFloat(s);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

function canonStatisticId(rawId: string): string | null {
  const x = rawId.trim().toLowerCase().replace(/\s/g, "");
  if (x === "avroi") return "avroi";
  if (
    x === "totalprofit" ||
    x === "profit" ||
    x === "netprofit" ||
    x === "avprofit" ||
    x === "totalprofitusd"
  ) {
    return "totalprofit";
  }
  if (x === "count") return "count";
  if (x === "avstake" || x === "stake" || x === "averagestake") return "avstake";
  if (x === "entrants") return "entrants";
  if (x === "earlyfinish" || x === "finshesearly") return "earlyfinish";
  if (x === "latefinish" || x === "finsheslate") return "latefinish";
  return null;
}

export function buildSharkscopeStatMap(rawData: unknown): Map<string, number> {
  const empty = new Map<string, number>();
  if (!rawData || typeof rawData !== "object") return empty;
  const root = rawData as object;
  const cached = sharkscopeStatMapCache.get(root);
  if (cached) return cached;

  const m = new Map<string, number>();
  walkUnknown(rawData, (rec) => {
    const id = rec["@id"] ?? rec["@name"] ?? rec.id ?? rec.name;
    if (typeof id !== "string") return;
    const k = canonStatisticId(id);
    if (!k) return;
    const n = parseSharkscopeStatisticNode(rec);
    if (n === null) return;
    if (!m.has(k)) m.set(k, n);
  });
  sharkscopeStatMapCache.set(root, m);
  return m;
}

export function lookupSharkscopeStat(rawData: unknown, statName: string): number | null {
  const want = statName.toLowerCase();
  const map = buildSharkscopeStatMap(rawData);

  const key =
    want === "avroi"
      ? "avroi"
      : want === "totalprofit"
        ? "totalprofit"
        : want === "count"
          ? "count"
          : want === "avstake"
            ? "avstake"
            : want === "entrants"
              ? "entrants"
              : want === "earlyfinish"
                ? "earlyfinish"
                : want === "latefinish"
                  ? "latefinish"
                  : null;

  if (!key) return null;
  return map.get(key) ?? null;
}
