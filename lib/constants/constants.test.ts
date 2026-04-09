import { NotificationType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { ALERT_TYPE_LABEL, SEVERITY_UI } from "./alerts-messages";
import { FIELD_CONFIG, LIMIT_ACTION_CONFIG, LIMIT_ACTION_LABEL } from "./grade-rule-editor";
import { IMPORTS_COLUMN_IDS, IMPORTS_COLUMN_LABELS, IMPORTS_TABLE_COLUMN_ORDER } from "./imports-columns";
import { DATA_TYPE_CONFIG, TYPE_CONFIG, TYPE_LABELS } from "./notifications-config";
import { POKER_NETWORKS_UI, NETWORK_OPTS, POKER_NETWORKS } from "./poker-networks";
import { GAME_TYPE_PRESETS, SPEED_PRESETS, WEEKDAY_PRESETS } from "./presets";
import { ACTION_CONFIG } from "./roles-actions";
import { INVITE_ROLES, ROLE_OPTIONS, STATUS_OPTIONS } from "./session-rbac";
import { SHARKSCOPE_ANALYTICS_TAB_LABELS, TAB_ICONS, TAB_IDS } from "./sharkscope-analytics-labels";
import { CATEGORIES, LIMIT_ACTIONS } from "./target-forms";
import { SIDEBAR_NAV_ITEMS, SIDEBAR_SECONDARY_ITEMS, TOPBAR_PAGE_TITLES } from "./navigation";

describe("imports-columns derivados", () => {
  it("ordem, labels e ids alinhados", () => {
    expect(IMPORTS_TABLE_COLUMN_ORDER.length).toBe(7);
    for (const key of IMPORTS_TABLE_COLUMN_ORDER) {
      expect(IMPORTS_COLUMN_LABELS[key].length).toBeGreaterThan(0);
      expect(IMPORTS_COLUMN_IDS[key]).toMatch(/^imp-/);
    }
  });
});

describe("presets lobbyze", () => {
  it("ids sequenciais por bloco", () => {
    expect(SPEED_PRESETS[0]?.item_id).toBe(1001);
    expect(SPEED_PRESETS).toHaveLength(4);
    expect(GAME_TYPE_PRESETS[0]?.item_id).toBe(4001);
    expect(WEEKDAY_PRESETS).toHaveLength(7);
  });
});

describe("session-rbac roles", () => {
  it("INVITE_ROLES e ROLE_OPTIONS mesma referência", () => {
    expect(INVITE_ROLES).toBe(ROLE_OPTIONS);
    expect(INVITE_ROLES).toHaveLength(5);
    expect(INVITE_ROLES.map((r) => r.label)).toEqual(["Viewer", "Player", "Coach", "Manager", "Admin"]);
  });
  it("STATUS_OPTIONS cobre estados", () => {
    expect(STATUS_OPTIONS.map((s) => s.value)).toEqual(expect.arrayContaining(["ACTIVE", "INACTIVE"]));
  });
});

describe("notifications-config", () => {
  it("TYPE_LABELS bate com TYPE_CONFIG.label", () => {
    const types = Object.values(NotificationType);
    for (const t of types) {
      expect(TYPE_LABELS[t]).toBe(TYPE_CONFIG[t].label);
    }
  });
  it("DATA_TYPE_CONFIG chaves esperadas", () => {
    expect(DATA_TYPE_CONFIG.stats_10d?.ttlHours).toBe(24);
    expect(DATA_TYPE_CONFIG.insights?.pathSuffix).toBe("/insights");
  });
});

describe("alerts-messages", () => {
  it("ALERT_TYPE_LABEL cobre tipos conhecidos", () => {
    expect(ALERT_TYPE_LABEL.roi_drop).toBeTruthy();
    expect(ALERT_TYPE_LABEL.high_variance).toBeTruthy();
  });
  it("SEVERITY_UI três níveis", () => {
    for (const key of ["red", "yellow", "green"]) {
      expect(SEVERITY_UI[key]?.badge).toContain("500/10");
    }
  });
});

describe("poker-networks", () => {
  it("UI e POKER_NETWORKS alinhados", () => {
    expect(POKER_NETWORKS_UI.length).toBe(Object.keys(POKER_NETWORKS).length);
    expect(NETWORK_OPTS.length).toBe(POKER_NETWORKS_UI.length);
  });
});

describe("grade-rule-editor", () => {
  it("LIMIT_ACTION_LABEL deriva de LIMIT_ACTION_CONFIG", () => {
    for (const k of ["UPGRADE", "MAINTAIN", "DOWNGRADE"] as const) {
      expect(LIMIT_ACTION_LABEL[k].label).toBe(LIMIT_ACTION_CONFIG[k].label);
    }
  });
  it("FIELD_CONFIG cobre chaves de regra", () => {
    expect(FIELD_CONFIG.buyInMin.type).toBe("float");
    expect(FIELD_CONFIG.sites.type).toBe("array");
    expect(FIELD_CONFIG.autoOnly.type).toBe("boolean");
  });
});

describe("roles-actions", () => {
  it("ACTION_CONFIG três ações", () => {
    expect(Object.keys(ACTION_CONFIG).sort()).toEqual(["DOWNGRADE", "MAINTAIN", "UPGRADE"]);
  });
});

describe("sharkscope analytics tabs", () => {
  it("TAB_IDS e labels alinhados a TAB_ICONS", () => {
    expect(TAB_IDS.length).toBe(Object.keys(TAB_ICONS).length);
    for (const id of TAB_IDS) {
      expect(SHARKSCOPE_ANALYTICS_TAB_LABELS[id]).toBeTruthy();
      expect(TAB_ICONS[id]).toBeDefined();
    }
  });
});

describe("target-forms", () => {
  it("CATEGORIES e LIMIT_ACTIONS como value/label", () => {
    expect(CATEGORIES.every((c) => c.value && c.label)).toBe(true);
    expect(LIMIT_ACTIONS.some((x) => x.value === "none")).toBe(true);
  });
});

describe("navigation", () => {
  it("TOPBAR cobre hrefs do sidebar + secundários", () => {
    const hrefs: string[] = [];
    for (const e of SIDEBAR_NAV_ITEMS) {
      if (e.kind === "link") hrefs.push(e.href);
      else for (const s of e.items) hrefs.push(s.href);
    }
    for (const h of hrefs) {
      expect(TOPBAR_PAGE_TITLES[h]).toBe("");
    }
    for (const s of SIDEBAR_SECONDARY_ITEMS) {
      expect(TOPBAR_PAGE_TITLES[s.href]).toBe("");
    }
  });
});
