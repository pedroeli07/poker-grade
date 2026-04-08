import { z } from "zod";
import { PlayerStatus, ReviewStatus, UserRole } from "@prisma/client";
import {
  PASSWORD_MAX_LENGTH,
  passwordMeetsPolicy,
  PASSWORD_POLICY_MESSAGE,
} from "@/lib/auth/password-policy";
import { zodPokerNetwork } from "../sharkscope/schemas";

const cuid = z.cuid();

export const loginBodySchema = z.object({
  email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
  password: z.string().min(1).max(512),
});

export const registerBodySchema = z
  .object({
    email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
    password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
    confirmPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
    displayName: z.string().max(200).optional(),
    code: z.string().length(6, "Código deve ter exatos 6 dígitos"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })
  .superRefine((d, ctx) => {
    if (!passwordMeetsPolicy(d.password)) {
      ctx.addIssue({
        code: "custom",
        message: PASSWORD_POLICY_MESSAGE,
        path: ["password"],
      });
    }
  });

export const resetPasswordSchema = z
  .object({
    email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
    code: z.string().length(6, "Código deve ter exatos 6 dígitos"),
    newPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  })
  .superRefine((d, ctx) => {
    if (!passwordMeetsPolicy(d.newPassword)) {
      ctx.addIssue({
        code: "custom",
        message: PASSWORD_POLICY_MESSAGE,
        path: ["newPassword"],
      });
    }
  });

const inviteRoleSchema = z.enum(UserRole);

export const allowedInviteFormSchema = z.object({
  email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
  role: inviteRoleSchema,
});

export const updatePendingInviteFormSchema = z.object({
  id: z.cuid(),
  email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
  role: inviteRoleSchema,
});

export const updateAuthAccountFormSchema = z.object({
  id: z.cuid(),
  email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
  role: inviteRoleSchema,
});

export const idParamSchema = z.object({
  id: z.cuid(),
});

export const createPlayerFormSchema = z.object({
  name: z.string().min(1).max(200),
  nickname: z.string().max(120).optional().nullable(),
  email: z.union([z.email().max(320), z.literal("")]).optional(),
  coachId: z.union([cuid, z.literal("none"), z.literal("")]),
  mainGradeId: z.union([cuid, z.literal("none"), z.literal("")]),
  abiAlvoValue: z.string().max(40).optional().transform((s) => s ?? ""),
  abiAlvoUnit: z.string().max(30).optional().transform((s) => s ?? ""),
  playerGroup: z.string().max(120).optional().nullable(),
  nicksData: z.string().optional().nullable(),
});

export const updatePlayerFormSchema = z.object({
  id: cuid,
  name: z.string().min(1).max(200),
  nickname: z.string().max(120).optional().nullable(),
  email: z.union([z.email().max(320), z.literal("")]).optional(),
  coachId: z.union([cuid, z.literal("none"), z.literal("")]),
  mainGradeId: z.union([cuid, z.literal("none"), z.literal("")]),
  abiAlvoValue: z.string().max(40).optional().transform((s) => s ?? ""),
  abiAlvoUnit: z.string().max(30).optional().transform((s) => s ?? ""),
  status: z.nativeEnum(PlayerStatus),
  playerGroup: z.string().max(120).optional().nullable(),
  nicksData: z.string().optional().nullable(),
});

export const importGradeFormSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  jsonContent: z.string().min(2).max(5_000_000),
});

export const deleteGradeSchema = z.object({
  id: cuid,
});

export const updateGradeCoachNoteSchema = z.object({
  gradeId: cuid,
  description: z.string().max(2000).optional().nullable(),
});

export const updateGradeProfileSchema = z.object({
  gradeId: cuid,
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
});

const lobbyzeItemSchema = z.object({
  item_id: z.union([z.number(), z.string()]),
  item_text: z.string().min(1).max(200),
});

function emptyToNullUnknown(v: unknown) {
  if (v === "" || v === undefined) return null;
  return v;
}

export const updateGradeRuleSchema = z
  .object({
    ruleId: cuid,
    filterName: z.string().min(1).max(500),
    sites: z.array(lobbyzeItemSchema).min(1),
    buyInMin: z.number().nonnegative().nullable(),
    buyInMax: z.number().nonnegative().nullable(),
    speed: z.array(lobbyzeItemSchema),
    tournamentType: z.array(lobbyzeItemSchema),
    variant: z.array(lobbyzeItemSchema),
    gameType: z.array(lobbyzeItemSchema),
    playerCount: z.array(lobbyzeItemSchema),
    weekDay: z.array(lobbyzeItemSchema),
    prizePoolMin: z.number().nonnegative().nullable(),
    prizePoolMax: z.number().nonnegative().nullable(),
    minParticipants: z.number().int().nonnegative().nullable(),
    fromTime: z.preprocess(
      emptyToNullUnknown,
      z.union([z.string().max(8), z.null()])
    ),
    toTime: z.preprocess(
      emptyToNullUnknown,
      z.union([z.string().max(8), z.null()])
    ),
    excludePattern: z.preprocess(
      emptyToNullUnknown,
      z.union([z.string().max(2000), z.null()])
    ),
    timezone: z.number().int().min(-840).max(840).nullable(),
    autoOnly: z.boolean(),
    manualOnly: z.boolean(),
  })
  .refine(
    (d) => {
      if (d.buyInMin != null && d.buyInMax != null) {
        return d.buyInMin <= d.buyInMax;
      }
      return true;
    },
    { message: "Buy-in mínimo não pode ser maior que o máximo.", path: ["buyInMax"] }
  )
  .refine(
    (d) => {
      if (d.prizePoolMin != null && d.prizePoolMax != null) {
        return d.prizePoolMin <= d.prizePoolMax;
      }
      return true;
    },
    {
      message: "Garantido mínimo não pode ser maior que o máximo.",
      path: ["prizePoolMax"],
    }
  );

export const deleteGradeRuleSchema = z.object({
  ruleId: cuid,
});

export const processReviewSchema = z.object({
  reviewId: cuid,
  status: z.enum(ReviewStatus),
  notes: z.string().max(5000).optional().nullable(),
});

export const gradeIdParamSchema = z.object({
  id: cuid,
});

/** Arquivo de importação Excel — validação de metadados (bytes checados no handler) */
export const uploadTournamentsMetaSchema = z.object({
  fileName: z.string().max(512).optional(),
});

export const deleteImportIdsSchema = z
  .array(cuid)
  .min(1)
  .max(80);

export const notificationsPageParamsSchema = z.object({
  page: z.coerce.number().int().min(1).max(500),
  filter: z.enum(["all", "unread", "read"]),
});

export const notificationIdsDeleteSchema = z.array(cuid).min(1).max(100);

export const querySchema = z.object({
  severity: z.enum(["red", "yellow", "green"]).optional(),
  alertType: z.string().max(50).optional(),
  playerId: z.string().max(40).optional(),
  acknowledged: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
});

export const updateNickSchema = z.object({
  nick: z.string().min(1).max(120).trim().optional(),
  network: zodPokerNetwork.optional(),
  isActive: z.boolean().optional(),
});

export const addNickSchema = z.object({
  nick: z.string().min(1).max(120).trim(),
  network: zodPokerNetwork,
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

export const scoutBodySchema = z.object({
  nick: z.string().min(1).max(120).trim(),
  network: zodPokerNetwork,
  rawData: z.unknown(),
  nlqAnswer: z.unknown().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const scoutSearchQuerySchema = z.object({
  nick: z.string().min(1).max(120).trim(),
  network: zodPokerNetwork,
});