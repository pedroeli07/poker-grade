import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRole } from "@prisma/client";
import type { SharkscopeAlertRow } from "@/lib/types";
import {
  barColor,
  buildNetworkOptions,
  canDeleteImports,
  canEditGradeCoachNote,
  canManageGrades,
  canManagePlayerProfile,
  canReview,
  canViewPlayer,
  canWriteOperations,
  classifyTier,
  cn,
  countUnacknowledgedAlerts,
  descriptionPick,
  distinctOptions,
  earlyFinishSeverity,
  encodeSharkScopePassword,
  extractRemainingSearches,
  extractStat,
  filterOptionNeedsHoverPreview,
  filterOptionPreviewText,
  filterSharkscopeAlerts,
  formatBuyIn,
  formatList,
  formatMeta,
  getAppBaseUrl,
  getInitials,
  isNextRedirectError,
  isSuperAdminEmail,
  isTextSelected,
  labelColor,
  lateFinishSeverity,
  mapPrismaRuleToCard,
  matchesExcludePattern,
  matchesSpeed,
  mergeOptions,
  minLevelFromEnv,
  normalizeAuthEmail,
  normalizeSiteName,
  parseScoutingSearchPayload,
  pickSharkscopeStatsByPeriod,
  progressLabel,
  reentrySeverity,
  redactMeta,
  roiSeverity,
  sanitizeOptional,
  sanitizeText,
  sanitizeUserHtml,
  sharkscopeStatsHasData,
  shouldEmit,
  statusLabel,
  timeAgo,
} from "./app";

const session = (role: UserRole, extra: Partial<{ coachId: string | null; playerId: string | null }> = {}) =>
  ({
    userId: "u1",
    role,
    sessionId: "s1",
    playerId: null,
    coachId: null,
    displayName: null,
    email: "a@b.com",
    ...extra,
  }) as import("@/lib/auth/session").AppSession;

describe("cn", () => {
  it("merge tailwind", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("sanitizeText / sanitizeOptional", () => {
  it("trim e limite", () => {
    expect(sanitizeText("  ab  ", 1)).toBe("a");
  });
  it("optional vazio → null", () => {
    expect(sanitizeOptional(null, 10)).toBeNull();
    expect(sanitizeOptional("   ", 10)).toBeNull();
  });
});

describe("sanitizeUserHtml", () => {
  it("remove script", () => {
    expect(sanitizeUserHtml('<p>ok</p><script>x</script>')).not.toContain("script");
  });
});

describe("permissões AppSession", () => {
  it("staff write", () => {
    expect(canWriteOperations(session("COACH"))).toBe(true);
    expect(canWriteOperations(session("VIEWER"))).toBe(false);
  });
  it("grade admin", () => {
    expect(canManageGrades(session("ADMIN"))).toBe(true);
    expect(canManageGrades(session("COACH"))).toBe(false);
  });
  it("coach trio espelha canWriteOperations", () => {
    const s = session("COACH");
    expect(canEditGradeCoachNote(s)).toBe(canWriteOperations(s));
    expect(canReview(s)).toBe(canWriteOperations(s));
    expect(canDeleteImports(s)).toBe(canWriteOperations(s));
  });
  it("canViewPlayer", () => {
    const p = { id: "p1", coachId: "c1", driId: null };
    expect(canViewPlayer({ role: "ADMIN", coachId: null, playerId: null }, p)).toBe(true);
    expect(canViewPlayer({ role: "COACH", coachId: "c1", playerId: null }, p)).toBe(true);
    expect(canViewPlayer({ role: "COACH", coachId: "x", playerId: null }, p)).toBe(false);
    expect(canViewPlayer({ role: "PLAYER", coachId: null, playerId: "p1" }, p)).toBe(true);
  });
  it("canManagePlayerProfile", () => {
    const p = { coachId: "c1", driId: null };
    expect(canManagePlayerProfile(session("ADMIN"), p)).toBe(true);
    expect(canManagePlayerProfile(session("COACH", { coachId: "c1" }), p)).toBe(true);
    expect(canManagePlayerProfile(session("COACH", { coachId: "x" }), p)).toBe(false);
  });
});

describe("normalizeAuthEmail / isSuperAdminEmail", () => {
  it("lower trim", () => {
    expect(normalizeAuthEmail("  A@B.COM ")).toBe("a@b.com");
  });
  it("super admin", () => {
    expect(isSuperAdminEmail("admin@clteam.com")).toBe(true);
    expect(isSuperAdminEmail("other@x.com")).toBe(false);
  });
});

describe("isNextRedirectError", () => {
  it("detecta NEXT_REDIRECT", () => {
    const e = new Error("NEXT_REDIRECT");
    expect(isNextRedirectError(e)).toBe(true);
  });
  it("digest", () => {
    const e = new Error("x") as Error & { digest: string };
    e.digest = "NEXT_REDIRECT;something";
    expect(isNextRedirectError(e)).toBe(true);
  });
});

describe("severidade métricas", () => {
  it.each([
    [-50, "red"],
    [-30, "yellow"],
    [0, "green"],
  ] as const)("roi %s → %s", (v, sev) => {
    expect(roiSeverity(v)).toBe(sev);
  });
  it.each([
    [30, "red"],
    [20, "yellow"],
    [10, "green"],
  ] as const)("reentry %s → %s", (v, sev) => {
    expect(reentrySeverity(v)).toBe(sev);
  });
  it.each([
    [10, "red"],
    [7, "yellow"],
    [5, "green"],
  ] as const)("earlyFinish %s → %s", (v, sev) => {
    expect(earlyFinishSeverity(v)).toBe(sev);
  });
  it.each([
    [5, "red"],
    [9, "yellow"],
    [15, "green"],
  ] as const)("lateFinish %s → %s", (v, sev) => {
    expect(lateFinishSeverity(v)).toBe(sev);
  });
});

describe("barColor / labelColor", () => {
  it.each(["empty", "weak", "fair", "good", "strong"] as const)("nível %s retorna classe", (level) => {
    expect(barColor(level).length).toBeGreaterThan(2);
    expect(labelColor(level).length).toBeGreaterThan(2);
  });
});

describe("Lobbyze helpers", () => {
  const opt = (t: string) => ({ item_id: 1, item_text: t });

  it("mergeOptions dedup por texto normalizado", () => {
    const r = mergeOptions([opt("A")], [opt("a")]);
    expect(r).toHaveLength(1);
  });
  it("isTextSelected", () => {
    expect(isTextSelected([opt("X")], opt("x"))).toBe(true);
  });
  it("formatList", () => {
    expect(formatList(null)).toBe("Todos");
    expect(formatList(JSON.stringify([{ item_text: "A" }, { item_text: "B" }]))).toBe("A, B");
  });
});

describe("formatBuyIn", () => {
  it.each([
    [null, null, "Qualquer"],
    [10, null, "+$10"],
    [null, 20, "Até $20"],
    [1, 5, "$1 - $5"],
  ] as const)("%s,%s → %s", (a, b, out) => {
    expect(formatBuyIn(a, b)).toBe(out);
  });
});

describe("matchesExcludePattern / matchesSpeed", () => {
  it("exclude OR", () => {
    expect(matchesExcludePattern("Sunday Million", "million|bounty")).toBe(true);
    expect(matchesExcludePattern("Regular", "million")).toBe(false);
  });
  it("speed vazio na regra → true", () => {
    expect(matchesSpeed("Turbo", null)).toBe(true);
  });
  it("speed match", () => {
    expect(matchesSpeed("Turbo", [{ item_id: 1, item_text: "Turbo" }])).toBe(true);
  });
});

describe("normalizeSiteName", () => {
  it("remove ruído", () => {
    expect(normalizeSiteName("GG Network Poker!")).toContain("gg");
  });
});

describe("filterOption preview", () => {
  it("preview text", () => {
    expect(filterOptionPreviewText({ value: "longvalue", label: "short" })).toBe("longvalue");
  });
  it("needs hover", () => {
    expect(filterOptionNeedsHoverPreview({ value: "x".repeat(50), label: "y" })).toBe(true);
  });
});

describe("mapPrismaRuleToCard", () => {
  it("parseJson nos campos lobbyze", () => {
    const card = mapPrismaRuleToCard({
      id: "r1",
      filterName: "f",
      lobbyzeFilterId: 1,
      sites: '[{"item_id":1,"item_text":"GG"}]',
      buyInMin: 1,
      buyInMax: 2,
      speed: "[]",
      variant: "[]",
      tournamentType: "[]",
      gameType: "[]",
      playerCount: "[]",
      weekDay: "[]",
      prizePoolMin: null,
      prizePoolMax: null,
      minParticipants: null,
      fromTime: null,
      toTime: null,
      excludePattern: null,
      timezone: null,
      autoOnly: false,
      manualOnly: false,
    });
    expect(card.sites[0]?.item_text).toBe("GG");
    expect(card.speed).toEqual([]);
  });
});

describe("descriptionPick", () => {
  it("sem descrição", () => {
    const r = descriptionPick({ description: null } as import("@/lib/types").GradeListRow);
    expect(r.label).toContain("sem descrição");
  });
});

describe("progressLabel / statusLabel", () => {
  it("NUMERIC", () => {
    const row = {
      id: "1",
      status: "ON_TRACK",
      name: "",
      category: "",
      playerId: "",
      playerName: "",
      targetType: "NUMERIC",
      limitAction: null,
      numericValue: 10,
      numericCurrent: 3,
      textValue: null,
      textCurrent: null,
      unit: "k",
      coachNotes: null,
    } as import("@/lib/types").TargetListRow;
    expect(progressLabel(row)).toContain("3");
    expect(progressLabel(row)).toContain("10");
  });
  it("statusLabel", () => {
    expect(statusLabel("ON_TRACK")).toBeTruthy();
  });
});

describe("classifyTier", () => {
  it.each([
    [null, null],
    [10, "Low"],
    [30, "Mid"],
    [100, "High"],
  ] as const)("%s → %s", (stake, tier) => {
    expect(classifyTier(stake)).toBe(tier);
  });
});

describe("distinctOptions", () => {
  it("único por value e ordena label", () => {
    const o = distinctOptions(
      [
        { v: "b", l: "B" },
        { v: "a", l: "Á" },
        { v: "a", l: "ignorado" },
      ],
      (r) => ({ value: r.v, label: r.l }),
    );
    expect(o.map((x) => x.value)).toEqual(["a", "b"]);
  });
});

describe("getAppBaseUrl", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
  });
  it("NEXT_PUBLIC_APP_URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com/";
    expect(getAppBaseUrl()).toBe("https://app.example.com");
  });
  it("VERCEL_URL fallback", () => {
    process.env.VERCEL_URL = "x.vercel.app";
    expect(getAppBaseUrl()).toBe("https://x.vercel.app");
  });
});

describe("buildNetworkOptions", () => {
  it("uma opção por rede", () => {
    const o = buildNetworkOptions();
    expect(o.some((x) => x.value === "gg")).toBe(true);
    expect(o.length).toBeGreaterThan(3);
  });
});

describe("timeAgo / getInitials", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it("minutos", () => {
    const d = new Date("2025-01-10T11:30:00Z");
    expect(timeAgo(d)).toMatch(/min/);
  });
  it("getInitials email", () => {
    expect(getInitials("ab.cd@x.com")).toMatch(/^[A-Z]{2}$/);
  });
});

describe("SharkScope extract / scouting", () => {
  const statsPayload = {
    Response: {
      PlayerResponse: {
        PlayerResults: {
          PlayerResult: {
            Statistics: {
              Statistic: { "@name": "AvROI", $: "5.25" },
            },
          },
        },
      },
    },
  };

  it("extractStat", () => {
    expect(extractStat(statsPayload, "AvROI")).toBeCloseTo(5.25);
    expect(extractStat(statsPayload, "Missing")).toBeNull();
  });

  it("extractRemainingSearches", () => {
    expect(
      extractRemainingSearches({
        Response: { RemainingSearches: { $: "42" } },
      }),
    ).toBe(42);
  });

  it("parseScoutingSearchPayload", () => {
    expect(parseScoutingSearchPayload(null).roi).toBeNull();
    const nested = {
      Response: {
        PlayerResponse: {
          PlayerResults: {
            PlayerResult: {
              Statistics: [
                { "@name": "AvROI", $: "1" },
                { "@name": "TotalProfit", $: "2" },
                { "@name": "Count", $: "3" },
                { "@name": "AvStake", $: "4" },
                { "@name": "AvEntrants", $: "5" },
              ],
            },
          },
        },
      },
    };
    const s = parseScoutingSearchPayload(nested as unknown as Record<string, unknown>);
    expect(s.roi).toBe(1);
    expect(s.count).toBe(3);
    expect(s.abi).toBe(4);
  });
});

describe("encodeSharkScopePassword", () => {
  it("MD5 determinístico com env do vitest.setup", () => {
    expect(encodeSharkScopePassword()).toBe("9e4a5fe93e0973ae8349d823c0d7ef20");
  });
});

describe("sharkscope list helpers", () => {
  it("statsHasData", () => {
    expect(sharkscopeStatsHasData([{ roi: null, profit: null }] as import("@/lib/types").NetworkStat[])).toBe(false);
    expect(sharkscopeStatsHasData([{ roi: 1, profit: null }] as import("@/lib/types").NetworkStat[])).toBe(true);
  });
  it("pickSharkscopeStatsByPeriod", () => {
    const a = [{ roi: 1 }] as import("@/lib/types").NetworkStat[];
    const b = [{ roi: 2 }] as import("@/lib/types").NetworkStat[];
    expect(pickSharkscopeStatsByPeriod("30d", a, b)).toBe(a);
    expect(pickSharkscopeStatsByPeriod("90d", a, b)).toBe(b);
  });
});

describe("filterSharkscopeAlerts", () => {
  const row = (partial: Partial<SharkscopeAlertRow> & Pick<SharkscopeAlertRow, "id">): SharkscopeAlertRow =>
    ({
      id: partial.id,
      severity: "red",
      alertType: "roi_drop",
      acknowledged: false,
      ...partial,
    }) as SharkscopeAlertRow;

  it("filtros combinados", () => {
    const rows = [row({ id: "1", severity: "red", acknowledged: false }), row({ id: "2", severity: "green", acknowledged: true })];
    expect(filterSharkscopeAlerts(rows, { severity: "all", alertType: "all", ack: "all" })).toHaveLength(2);
    expect(filterSharkscopeAlerts(rows, { severity: "red", alertType: "all", ack: "all" })).toHaveLength(1);
    expect(filterSharkscopeAlerts(rows, { severity: "all", alertType: "all", ack: "unacknowledged" })).toHaveLength(1);
  });

  it("countUnacknowledgedAlerts", () => {
    expect(countUnacknowledgedAlerts([row({ id: "1" }), row({ id: "2", acknowledged: true })])).toBe(1);
  });
});

describe("logger helpers", () => {
  afterEach(() => {
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
  });

  it("minLevelFromEnv default test → debug", () => {
    process.env.NODE_ENV = "development";
    delete process.env.LOG_LEVEL;
    expect(minLevelFromEnv()).toBe("debug");
  });

  it("shouldEmit permite error em qualquer scope quando sem filtro de scopes", () => {
    expect(shouldEmit("qualquer-scope", "error")).toBe(true);
  });

  it("redactMeta", () => {
    expect(redactMeta({ password: "x", ok: 1 })).toEqual({ password: "[REDACTED]", ok: 1 });
  });

  it("formatMeta", () => {
    const s = formatMeta({ a: 1 });
    expect(s).toContain("a");
  });
});
