import { z } from "zod";
import { zodPokerNetwork } from "./primitives";

const nickNetworkSchema = z.object({
  nick: z.string().min(1).max(120).trim(),
  network: zodPokerNetwork,
});

export const querySchema = z.object({
  severity: z.enum(["red", "yellow", "green"]).optional(),
  alertType: z.string().max(50).optional(),
  playerId: z.string().max(40).optional(),
  acknowledged: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
});

export const bodySchema = z.object({
  playerNickId: z.string().min(1).max(40),
  question: z.string().min(3).max(500),
  timezone: z.string().max(60).optional().default("America/Sao_Paulo"),
});

export const playerQuerySchema = z.object({
  nickId: z.string().min(1),
  dataType: z.enum(["summary", "stats_10d", "stats_30d", "stats_90d", "insights"]),
  filter: z.string().max(200).optional(),
});

export const scoutBodySchema = nickNetworkSchema.extend({
  rawData: z.unknown(),
  nlqAnswer: z.unknown().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const scoutSearchQuerySchema = nickNetworkSchema;

export const bulkDeleteAlertsBodySchema = z.object({
  ids: z.array(z.string().min(1).max(40)).min(1).max(300),
});
